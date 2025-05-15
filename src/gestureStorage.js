import { Finger, FingerCurl, FingerDirection, GestureDescription } from 'fingerpose';
import { gestures as defaultGestures } from './gestures';

// Local storage key for saved datasets
const STORAGE_KEY = 'gestureDatasets';

// Map finger joints to finger parts
const fingerJoints = {
  thumb: [0, 1, 2, 3, 4],
  indexFinger: [0, 5, 6, 7, 8],
  middleFinger: [0, 9, 10, 11, 12],
  ringFinger: [0, 13, 14, 15, 16],
  pinky: [0, 17, 18, 19, 20],
};

// Load all available gestures (default + custom)
export const loadAllGestures = () => {
  // Get custom gestures from localStorage
  const savedDatasetsJson = localStorage.getItem(STORAGE_KEY);
  
  if (!savedDatasetsJson) {
    return defaultGestures;
  }
  
  try {
    const savedDatasets = JSON.parse(savedDatasetsJson);
    
    // Convert saved datasets to GestureDescription objects
    const customGestures = savedDatasets.map(dataset => {
      const gesture = new GestureDescription(dataset.name);
      
      if (!dataset.frames || dataset.frames.length === 0) {
        console.warn(`No frames found for gesture: ${dataset.name}`);
        return gesture;
      }
      
      // Calculate average frame from all captured frames
      const avgFrame = calculateAverageFrame(dataset.frames);
      
      // Map from finger name to Finger enum
      const fingerMap = {
        thumb: Finger.Thumb,
        indexFinger: Finger.Index,
        middleFinger: Finger.Middle,
        ringFinger: Finger.Ring,
        pinky: Finger.Pinky
      };
      
      // Analyze each finger's position
      Object.entries(fingerJoints).forEach(([finger, joints]) => {
        const fingerPoints = joints.map(idx => avgFrame[idx]);
        const fingerCurl = estimateFingerCurl(fingerPoints);
        const fingerDirection = estimateFingerDirection(fingerPoints);
        
        // Add finger configuration to gesture
        gesture.addCurl(fingerMap[finger], fingerCurl.type, fingerCurl.confidence);
        gesture.addDirection(fingerMap[finger], fingerDirection.type, fingerDirection.confidence);
      });
      
      return gesture;
    });
    
    // Return combined gestures
    return [...defaultGestures, ...customGestures];
  } catch (error) {
    console.error('Error loading custom gestures:', error);
    return defaultGestures;
  }
};

// Calculate the average frame from a collection of frames
const calculateAverageFrame = (frames) => {
  // Initialize empty frame with 21 zero points
  const avgFrame = Array(21).fill().map(() => [0, 0, 0]);
  
  // Sum all points
  frames.forEach(frame => {
    frame.forEach((point, i) => {
      avgFrame[i][0] += point[0] / frames.length;
      avgFrame[i][1] += point[1] / frames.length;
      avgFrame[i][2] += point[2] / frames.length;
    });
  });
  
  return avgFrame;
};

// Estimate finger curl from finger points
const estimateFingerCurl = (points) => {
  // Simple curl estimation based on vertical position differences
  // In a real app, you would do more sophisticated vector calculations
  
  if (points.length < 2) return { type: FingerCurl.NoCurl, confidence: 1.0 };
  
  // Get the tip point and base point
  const tipPoint = points[points.length - 1];
  const basePoint = points[1]; // Using second point as base
  
  // Calculate y-difference (in screen coordinates, lower y is higher up)
  const yDiff = tipPoint[1] - basePoint[1];
  
  if (yDiff < -20) {
    // Finger is pointing up
    return { type: FingerCurl.NoCurl, confidence: 1.0 };
  } else if (yDiff > 30) {
    // Finger is curled down
    return { type: FingerCurl.FullCurl, confidence: 1.0 };
  } else {
    // Finger is partially curled
    return { type: FingerCurl.HalfCurl, confidence: 1.0 };
  }
};

// Estimate finger direction from finger points
const estimateFingerDirection = (points) => {
  // Simple direction estimation based on tip position relative to base
  // In a real app, you would calculate actual angles
  
  if (points.length < 2) return { type: FingerDirection.VerticalUp, confidence: 1.0 };
  
  // Get the tip point and base point
  const tipPoint = points[points.length - 1];
  const basePoint = points[1]; // Using second point as base
  
  // Calculate x and y differences
  const xDiff = tipPoint[0] - basePoint[0];
  const yDiff = tipPoint[1] - basePoint[1];
  
  // Determine direction based on which difference is greater
  if (Math.abs(yDiff) > Math.abs(xDiff)) {
    // Vertical direction is dominant
    if (yDiff < 0) {
      return { type: FingerDirection.VerticalUp, confidence: 1.0 };
    } else {
      return { type: FingerDirection.VerticalDown, confidence: 1.0 };
    }
  } else {
    // Horizontal direction is dominant
    if (xDiff > 0) {
      return { type: FingerDirection.HorizontalRight, confidence: 1.0 };
    } else {
      return { type: FingerDirection.HorizontalLeft, confidence: 1.0 };
    }
  }
};

// Save a dataset to localStorage
export const saveGestureDataset = (dataset) => {
  try {
    // Get existing datasets
    const savedDatasetsJson = localStorage.getItem(STORAGE_KEY);
    const savedDatasets = savedDatasetsJson ? JSON.parse(savedDatasetsJson) : [];
    
    // Add the new dataset
    savedDatasets.push(dataset);
    
    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedDatasets));
    
    return true;
  } catch (error) {
    console.error('Error saving gesture dataset:', error);
    return false;
  }
};

// Delete a dataset from localStorage
export const deleteGestureDataset = (index) => {
  try {
    // Get existing datasets
    const savedDatasetsJson = localStorage.getItem(STORAGE_KEY);
    if (!savedDatasetsJson) return false;
    
    const savedDatasets = JSON.parse(savedDatasetsJson);
    
    // Remove the dataset at the specified index
    savedDatasets.splice(index, 1);
    
    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedDatasets));
    
    return true;
  } catch (error) {
    console.error('Error deleting gesture dataset:', error);
    return false;
  }
};

// Delete all datasets
export const deleteAllGestureDatasets = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error deleting all gesture datasets:', error);
    return false;
  }
}; 