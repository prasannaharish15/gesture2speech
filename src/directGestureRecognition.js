// A simpler, more direct approach to hand gesture recognition
// that doesn't rely on the complex fingerpose library processing

// Get saved gesture datasets
const getSavedGestures = () => {
  try {
    const savedDatasets = localStorage.getItem('gestureDatasets');
    if (!savedDatasets) {
      return [];
    }
    return JSON.parse(savedDatasets);
  } catch (error) {
    console.error('Error loading saved gestures:', error);
    return [];
  }
};

// Calculate similarity between two hand landmark sets
const calculateSimilarity = (landmarks1, landmarks2) => {
  if (!landmarks1 || !landmarks2 || landmarks1.length !== landmarks2.length) {
    return 0;
  }

  // Sum of squared distances (lower is more similar)
  let sumDistances = 0;
  
  // We focus on the positions of fingertips (landmarks 4,8,12,16,20)
  // These are the most distinctive features for a gesture
  const keyPoints = [4, 8, 12, 16, 20]; 
  
  for (const point of keyPoints) {
    const dx = landmarks1[point][0] - landmarks2[point][0];
    const dy = landmarks1[point][1] - landmarks2[point][1];
    sumDistances += dx*dx + dy*dy;
  }
  
  // Convert to a similarity score (higher is more similar)
  // The maxDistance is a tunable parameter
  const maxDistance = 50000; 
  const similarity = Math.max(0, 1 - sumDistances / maxDistance);
  
  return similarity;
};

// Calculate the average landmarks from a set of frames
const calculateAverageLandmarks = (frames) => {
  if (!frames || frames.length === 0) {
    return null;
  }
  
  const numPoints = frames[0].length;
  const avgLandmarks = Array(numPoints).fill().map(() => [0, 0, 0]);
  
  for (const frame of frames) {
    for (let i = 0; i < numPoints; i++) {
      avgLandmarks[i][0] += frame[i][0] / frames.length;
      avgLandmarks[i][1] += frame[i][1] / frames.length;
      avgLandmarks[i][2] += frame[i][2] / frames.length;
    }
  }
  
  return avgLandmarks;
};

// Normalize landmarks to be relative to the position of the wrist
// This makes the gesture recognition more position-invariant
const normalizeLandmarks = (landmarks) => {
  if (!landmarks || landmarks.length === 0) {
    return null;
  }
  
  // The wrist is landmark 0
  const wristX = landmarks[0][0];
  const wristY = landmarks[0][1];
  
  const normalizedLandmarks = landmarks.map(point => {
    return [
      point[0] - wristX,  // x relative to wrist
      point[1] - wristY,  // y relative to wrist
      point[2]            // z unchanged
    ];
  });
  
  return normalizedLandmarks;
};

// Find the best matching gesture for a given hand landmark
export const recognizeGesture = (currentLandmarks) => {
  if (!currentLandmarks || currentLandmarks.length === 0) {
    return null;
  }
  
  const savedGestures = getSavedGestures();
  if (savedGestures.length === 0) {
    return null;
  }
  
  // Normalize the current landmarks
  const normalizedLandmarks = normalizeLandmarks(currentLandmarks);
  
  let bestMatch = null;
  let highestSimilarity = 0;
  
  // Compare with each saved gesture
  for (const gesture of savedGestures) {
    if (!gesture.frames || gesture.frames.length === 0) {
      continue;
    }
    
    // Calculate average landmarks for this gesture
    const gestureAvgLandmarks = calculateAverageLandmarks(gesture.frames);
    const normalizedGestureLandmarks = normalizeLandmarks(gestureAvgLandmarks);
    
    // Calculate similarity
    const similarity = calculateSimilarity(normalizedLandmarks, normalizedGestureLandmarks);
    
    console.log(`Gesture ${gesture.name} similarity: ${similarity.toFixed(3)}`);
    
    // If this is the best match so far, record it
    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      bestMatch = {
        name: gesture.name,
        score: similarity
      };
    }
  }
  
  // Only return a match if similarity is above threshold
  const SIMILARITY_THRESHOLD = 0.5; // Adjust as needed (0-1)
  
  if (bestMatch && bestMatch.score >= SIMILARITY_THRESHOLD) {
    return bestMatch;
  }
  
  return null;
}; 