import React, { useRef, useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';
import Webcam from 'react-webcam';
import { drawHand } from './utilities';
import { GestureEstimator } from 'fingerpose';
import styled from 'styled-components';
import { loadAllGestures } from './gestureStorage';
import { recognizeGesture } from './directGestureRecognition';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
`;

const VideoContainer = styled.div`
  position: relative;
`;

const StyledWebcam = styled(Webcam)`
  width: 640px;
  height: 480px;
`;

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 640px;
  height: 480px;
`;

const Results = styled.div`
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  width: 600px;
  text-align: center;
`;

const AdminLink = styled.a`
  position: fixed;
  bottom: 10px;
  right: 10px;
  color: #ccc;
  text-decoration: none;
  font-size: 12px;
  &:hover {
    color: #999;
  }
`;

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [recognizedGesture, setRecognizedGesture] = useState('');
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [history, setHistory] = useState([]);
  const [availableGestures, setAvailableGestures] = useState([]);
  const [debugMode, setDebugMode] = useState(false);
  const [confidenceScores, setConfidenceScores] = useState({});
  const [recognitionMethod, setRecognitionMethod] = useState('direct'); // 'direct' or 'fingerpose'
  const [lastSpokenGesture, setLastSpokenGesture] = useState('');

  // Load handpose model
  const runHandpose = async () => {
    const net = await handpose.load();
    console.log('Handpose model loaded.');
    // Loop and detect hands
    setInterval(() => {
      detect(net);
    }, 100);
  };

  // Initialize handpose on component mount
  useEffect(() => {
    runHandpose();
    // Initialize TensorFlow
    tf.ready().then(() => {
      console.log('TensorFlow.js is ready');
    });
    
    // Load all gestures (default + custom)
    const allGestures = loadAllGestures();
    console.log('Loaded gestures:', allGestures.map(g => g.name));
    setAvailableGestures(allGestures);
  }, []);

  // Reload gestures when the component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Reload gestures when returning to the tab
        const allGestures = loadAllGestures();
        setAvailableGestures(allGestures);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Speech synthesis setup
  useEffect(() => {
    if (recognizedGesture && 
        speechEnabled && 
        recognizedGesture !== 'No gesture detected' && 
        recognizedGesture !== lastSpokenGesture) {
      const utterance = new SpeechSynthesisUtterance(recognizedGesture);
      speechSynthesis.speak(utterance);
      setLastSpokenGesture(recognizedGesture);
    }
  }, [recognizedGesture, speechEnabled, lastSpokenGesture]);

  // Detect function
  const detect = async (net) => {
    if (
      webcamRef.current &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make Detections
      const hand = await net.estimateHands(video);

      // Draw mesh
      const ctx = canvasRef.current.getContext('2d');
      drawHand(hand, ctx);

      // Check if hand is detected
      if (hand.length > 0) {
        // Get landmarks
        const landmarks = hand[0].landmarks;

        let gestureResult = 'No gesture detected';
        
        // Use the selected recognition method
        if (recognitionMethod === 'direct') {
          // Use direct recognition method
          const result = recognizeGesture(landmarks);
          
          if (result) {
            gestureResult = result.name;
            setConfidenceScores({ [result.name]: result.score.toFixed(2) });
          } else {
            setConfidenceScores({});
          }
        } else {
          // Use fingerpose library (previous method)
          const gestureEstimator = new GestureEstimator(availableGestures);
          const gesture = await gestureEstimator.estimate(landmarks, 6.5);
          
          if (gesture.gestures && gesture.gestures.length > 0) {
            const confidences = gesture.gestures.map(g => g.score);
            const allConfidences = {};
            
            gesture.gestures.forEach(g => {
              allConfidences[g.name] = g.score.toFixed(2);
            });
            
            setConfidenceScores(allConfidences);
            
            const maxConfidenceIndex = confidences.indexOf(Math.max(...confidences));
            gestureResult = gesture.gestures[maxConfidenceIndex].name;
          }
        }

        // Update recognized gesture if it's different from previous
        if (gestureResult !== recognizedGesture) {
          console.log(`Recognized gesture: ${gestureResult}`);
          setRecognizedGesture(gestureResult);
          // Add to history only if different from last history item
          if (gestureResult !== 'No gesture detected' && 
              (history.length === 0 || gestureResult !== history[0])) {
            setHistory(prev => [gestureResult, ...prev].slice(0, 10));
          }
        }
      } else {
        if (recognizedGesture !== 'No gesture detected') {
          setRecognizedGesture('No gesture detected');
          setConfidenceScores({});
        }
      }
    }
  };

  const toggleSpeech = () => {
    setSpeechEnabled(!speechEnabled);
  };
  
  const toggleDebug = () => {
    setDebugMode(!debugMode);
  };
  
  const toggleRecognitionMethod = () => {
    setRecognitionMethod(prev => prev === 'direct' ? 'fingerpose' : 'direct');
  };

  return (
    <Container>
      <h1>Hand Sign Gesture Recognition</h1>
      
      <VideoContainer>
        <StyledWebcam
          ref={webcamRef}
          mirrored={true}
        />
        <Canvas
          ref={canvasRef}
        />
      </VideoContainer>
      
      <Results>
        <h2>Recognized Gesture</h2>
        <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{recognizedGesture}</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button onClick={toggleSpeech}>
            {speechEnabled ? 'Disable Speech' : 'Enable Speech'}
          </button>
          <button onClick={toggleDebug}>
            {debugMode ? 'Hide Debug Info' : 'Show Debug Info'}
          </button>
          <button onClick={toggleRecognitionMethod}>
            Method: {recognitionMethod === 'direct' ? 'Direct Compare' : 'Fingerpose'}
          </button>
        </div>
        
        {debugMode && (
          <div style={{ marginTop: '10px', textAlign: 'left' }}>
            <h3>Debug Information</h3>
            <p>Recognition Method: <strong>{recognitionMethod}</strong></p>
            <p>Loaded Gestures: {availableGestures.map(g => g.name).join(', ')}</p>
            <h4>Confidence Scores:</h4>
            <ul>
              {Object.entries(confidenceScores).map(([gesture, score]) => (
                <li key={gesture}>
                  {gesture}: {score}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Results>
      
      <Results>
        <h2>History</h2>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {history.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Results>
      
      <AdminLink href="/admin">Admin</AdminLink>
    </Container>
  );
}

export default App;