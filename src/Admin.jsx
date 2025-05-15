import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Webcam from 'react-webcam';
import * as handpose from '@tensorflow-models/handpose';
import { drawHand } from './utilities';
import { Finger, FingerCurl, FingerDirection, GestureDescription } from 'fingerpose';
import { saveGestureDataset, deleteGestureDataset, deleteAllGestureDatasets } from './gestureStorage';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 100px;
  padding: 30px;
  border: 1px solid #ccc;
  border-radius: 8px;
  width: 400px;
`;

const Input = styled.input`
  margin: 10px 0;
  padding: 10px;
  width: 100%;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const Button = styled.button`
  margin-top: 15px;
  padding: 10px 20px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  &:hover {
    background-color: #3367d6;
  }
`;

const DangerButton = styled(Button)`
  background-color: #f44336;
  &:hover {
    background-color: #d32f2f;
  }
`;

const Panel = styled.div`
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  width: 100%;
`;

const Tab = styled.button`
  padding: 10px 20px;
  margin-right: 10px;
  background-color: ${props => props.active ? '#4285f4' : '#f1f1f1'};
  color: ${props => props.active ? 'white' : 'black'};
  border: none;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  &:hover {
    background-color: ${props => props.active ? '#3367d6' : '#e0e0e0'};
  }
`;

const TabPanel = styled.div`
  display: ${props => props.active ? 'block' : 'none'};
  padding: 20px;
  border: 1px solid #ccc;
  border-top: none;
  width: 100%;
`;

const VideoContainer = styled.div`
  position: relative;
  margin: 20px 0;
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  width: 100%;
  margin-top: 20px;
`;

const Card = styled.div`
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatusMessage = styled.div`
  margin-top: 10px;
  padding: 10px;
  border-radius: 4px;
  font-weight: bold;
  color: white;
  background-color: ${props => props.type === 'success' ? '#4caf50' : props.type === 'error' ? '#f44336' : '#2196f3'};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 10px;
  background-color: #e0e0e0;
  border-radius: 5px;
  margin: 10px 0;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background-color: #4285f4;
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

function Admin() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Tab management
  const [activeTab, setActiveTab] = useState('datasets');
  
  // Dataset management
  const [gestureName, setGestureName] = useState('');
  const [gestureDatasets, setGestureDatasets] = useState([]);
  const [recordingGesture, setRecordingGesture] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState(null);
  
  // Webcam and handpose
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [handposeModel, setHandposeModel] = useState(null);
  const [capturedFrames, setCapturedFrames] = useState([]);
  
  // Add new state for feedback
  const [status, setStatus] = useState({ message: '', type: '' });
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [handDetected, setHandDetected] = useState(false);
  
  // Load saved datasets on initial load
  useEffect(() => {
    const savedDatasets = localStorage.getItem('gestureDatasets');
    if (savedDatasets) {
      setGestureDatasets(JSON.parse(savedDatasets));
    }
  }, []);
  
  // Save datasets when updated
  useEffect(() => {
    if (gestureDatasets.length > 0) {
      localStorage.setItem('gestureDatasets', JSON.stringify(gestureDatasets));
    }
  }, [gestureDatasets]);
  
  // Initialize handpose model
  useEffect(() => {
    const loadHandpose = async () => {
      const model = await handpose.load();
      setHandposeModel(model);
      console.log('Handpose model loaded in admin');
    };
    
    if (isAuthenticated) {
      loadHandpose();
    }
  }, [isAuthenticated]);
  
  // Update the recording effect to provide better feedback
  useEffect(() => {
    if (recordingGesture && handposeModel && webcamRef.current && canvasRef.current) {
      setStatus({ message: 'Getting ready...', type: 'info' });
      
      const interval = setInterval(async () => {
        if (webcamRef.current && webcamRef.current.video.readyState === 4) {
          const video = webcamRef.current.video;
          const videoWidth = webcamRef.current.video.videoWidth;
          const videoHeight = webcamRef.current.video.videoHeight;
          
          webcamRef.current.video.width = videoWidth;
          webcamRef.current.video.height = videoHeight;
          
          canvasRef.current.width = videoWidth;
          canvasRef.current.height = videoHeight;
          
          const hand = await handposeModel.estimateHands(video);
          
          const ctx = canvasRef.current.getContext('2d');
          drawHand(hand, ctx);
          
          if (hand.length > 0) {
            // Save landmarks for training
            setCapturedFrames(prev => [...prev, hand[0].landmarks]);
            setHandDetected(true);
            
            // Update progress (cap at 100%)
            const newProgress = Math.min(Math.floor(capturedFrames.length / 30 * 100), 100);
            setTrainingProgress(newProgress);
            
            if (!handDetected) {
              setStatus({ message: 'Hand detected! Recording gesture...', type: 'success' });
            }
          } else {
            setHandDetected(false);
            if (capturedFrames.length === 0) {
              setStatus({ message: 'No hand detected. Please show your hand in the camera.', type: 'error' });
            }
          }
        }
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [recordingGesture, handposeModel, handDetected, capturedFrames.length]);
  
  // Handle login
  const handleLogin = () => {
    // In a real application, you would validate against a server
    // For demonstration, using hardcoded credentials
    if (username === 'admin' && password === 'admin123') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid username or password');
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };
  
  // Start recording a new gesture
  const startRecording = () => {
    if (!gestureName) {
      setStatus({ message: 'Please enter a gesture name', type: 'error' });
      return;
    }
    
    setRecordingGesture(true);
    setCapturedFrames([]);
    setTrainingProgress(0);
    setStatus({ message: 'Getting ready for recording...', type: 'info' });
  };
  
  // Stop recording and create dataset
  const stopRecording = () => {
    setRecordingGesture(false);
    
    if (capturedFrames.length === 0) {
      setStatus({ message: 'No frames captured. Please try again.', type: 'error' });
      return;
    }
    
    if (capturedFrames.length < 10) {
      setStatus({ message: 'Too few frames captured. Please try again for longer.', type: 'error' });
      return;
    }
    
    // Create new gesture description
    const newGesture = {
      name: gestureName,
      frames: capturedFrames,
      createdAt: new Date().toISOString()
    };
    
    // Add to datasets
    setGestureDatasets(prev => [...prev, newGesture]);
    
    // Save to storage
    saveGestureDataset(newGesture);
    
    // Reset form
    setGestureName('');
    setCapturedFrames([]);
    setTrainingProgress(0);
    setStatus({ 
      message: `Success! Gesture "${gestureName}" recorded with ${capturedFrames.length} frames.`, 
      type: 'success' 
    });
  };
  
  // Delete a dataset
  const deleteDataset = (index) => {
    if (confirm('Are you sure you want to delete this dataset?')) {
      const newDatasets = [...gestureDatasets];
      newDatasets.splice(index, 1);
      setGestureDatasets(newDatasets);
      
      // Delete from storage
      deleteGestureDataset(index);
    }
  };
  
  // Delete all datasets
  const deleteAllDatasets = () => {
    if (confirm('Are you sure you want to delete ALL datasets? This cannot be undone.')) {
      setGestureDatasets([]);
      deleteAllGestureDatasets();
    }
  };
  
  // Export dataset configuration for the app
  const exportGestureConfig = () => {
    // Convert the datasets to fingerpose configuration
    const exportedGestures = gestureDatasets.map(dataset => {
      // Create a new GestureDescription
      const gesture = new GestureDescription(dataset.name);
      
      // We'll use the average of frames to create the gesture
      const avgFrame = dataset.frames.reduce((acc, frame, i, arr) => {
        frame.forEach((point, p) => {
          if (!acc[p]) acc[p] = [0, 0, 0];
          acc[p][0] += point[0] / arr.length;
          acc[p][1] += point[1] / arr.length;
          acc[p][2] += point[2] / arr.length;
        });
        return acc;
      }, []);
      
      // Create simplified configuration
      // This is a placeholder - in a real app you'd need more sophisticated analysis
      // of the landmarks to properly configure finger poses
      
      // For now just create a demo config that shows the export functionality
      const fingerMap = [
        Finger.Thumb,
        Finger.Index,
        Finger.Middle,
        Finger.Ring,
        Finger.Pinky
      ];
      
      // Add some basic configuration
      for(let i = 0; i < 5; i++) {
        const finger = fingerMap[i];
        gesture.addCurl(finger, FingerCurl.NoCurl, 1.0);
        gesture.addDirection(finger, FingerDirection.VerticalUp, 1.0);
      }
      
      return gesture;
    });
    
    // Create export code that could be copied
    const configCode = `
// Generated gesture configurations
import { Finger, FingerCurl, FingerDirection, GestureDescription } from 'fingerpose';

// Define gestures
${exportedGestures.map((gesture, i) => `const ${gesture.name.replace(/\s+/g, '')}Gesture = new GestureDescription('${gesture.name}');`).join('\n')}

// Add gesture configurations
// ... Configuration code would be generated here ...

// Export all gestures
export const gestures = [
  ${exportedGestures.map(gesture => gesture.name.replace(/\s+/g, '') + 'Gesture').join(',\n  ')}
];`;
    
    // In a real app, you might download this as a file or display it for copying
    console.log(configCode);
    alert('Gesture configurations exported to console. In a real app, you would save this to a file.');
  };
  
  // View dataset details
  const viewDataset = (index) => {
    setSelectedDataset(index);
    setActiveTab('details');
  };
  
  if (!isAuthenticated) {
    return (
      <Container>
        <LoginContainer>
          <h1>Admin Login</h1>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <Input 
            type="text" 
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input 
            type="password" 
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button onClick={handleLogin}>Login</Button>
        </LoginContainer>
      </Container>
    );
  }
  
  return (
    <Container>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <h1>Hand Gesture Admin Panel</h1>
        <Button onClick={handleLogout}>Logout</Button>
      </div>
      
      <div style={{ display: 'flex', width: '100%', marginTop: '20px' }}>
        <Tab 
          active={activeTab === 'datasets'} 
          onClick={() => setActiveTab('datasets')}
        >
          Datasets
        </Tab>
        <Tab 
          active={activeTab === 'train'} 
          onClick={() => setActiveTab('train')}
        >
          Train New Gesture
        </Tab>
        <Tab 
          active={activeTab === 'details' && selectedDataset !== null} 
          onClick={() => selectedDataset !== null && setActiveTab('details')}
          disabled={selectedDataset === null}
        >
          Dataset Details
        </Tab>
      </div>
      
      <TabPanel active={activeTab === 'datasets'}>
        <Panel>
          <h2>Gesture Datasets</h2>
          {gestureDatasets.length === 0 ? (
            <p>No datasets available. Train a new gesture to get started.</p>
          ) : (
            <>
              <Grid>
                {gestureDatasets.map((dataset, index) => (
                  <Card key={index}>
                    <h3>{dataset.name}</h3>
                    <p>Frames: {dataset.frames.length}</p>
                    <p>Created: {new Date(dataset.createdAt).toLocaleDateString()}</p>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <Button onClick={() => viewDataset(index)}>View</Button>
                      <DangerButton onClick={() => deleteDataset(index)}>Delete</DangerButton>
                    </div>
                  </Card>
                ))}
              </Grid>
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <Button onClick={exportGestureConfig}>Export Configurations</Button>
                <DangerButton onClick={deleteAllDatasets}>Delete All Datasets</DangerButton>
              </div>
            </>
          )}
        </Panel>
      </TabPanel>
      
      <TabPanel active={activeTab === 'train'}>
        <Panel>
          <h2>Train New Gesture</h2>
          <div>
            <Input
              type="text"
              placeholder="Gesture Name"
              value={gestureName}
              onChange={(e) => setGestureName(e.target.value)}
              disabled={recordingGesture}
            />
            
            {!recordingGesture ? (
              <Button onClick={startRecording}>Start Recording</Button>
            ) : (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <DangerButton onClick={stopRecording}>Stop Recording</DangerButton>
                <p>Recording... {capturedFrames.length} frames captured</p>
              </div>
            )}
            
            {status.message && (
              <StatusMessage type={status.type}>{status.message}</StatusMessage>
            )}
            
            {recordingGesture && (
              <>
                <ProgressBar>
                  <ProgressFill progress={trainingProgress} />
                </ProgressBar>
                <p>Training progress: {trainingProgress}% (We recommend at least 30 frames)</p>
              </>
            )}
          </div>
          
          {recordingGesture && (
            <VideoContainer>
              <StyledWebcam
                ref={webcamRef}
                mirrored={true}
              />
              <Canvas
                ref={canvasRef}
              />
            </VideoContainer>
          )}
          
          <div style={{ marginTop: '20px' }}>
            <h3>Instructions:</h3>
            <ol>
              <li>Enter a name for your new gesture</li>
              <li>Click "Start Recording"</li>
              <li>Perform the gesture repeatedly for a few seconds</li>
              <li>Make sure your hand is clearly visible in the camera</li>
              <li>Try to maintain consistent hand position for best results</li>
              <li>Click "Stop Recording" when done</li>
              <li>Your gesture will be saved automatically</li>
              <li>Aim for at least 30 frames for reliable recognition</li>
            </ol>
          </div>
        </Panel>
      </TabPanel>
      
      <TabPanel active={activeTab === 'details' && selectedDataset !== null}>
        {selectedDataset !== null && gestureDatasets[selectedDataset] && (
          <Panel>
            <h2>Dataset: {gestureDatasets[selectedDataset].name}</h2>
            <p>Created: {new Date(gestureDatasets[selectedDataset].createdAt).toLocaleString()}</p>
            <p>Total Frames: {gestureDatasets[selectedDataset].frames.length}</p>
            
            <div style={{ marginTop: '20px' }}>
              <h3>Actions:</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <DangerButton onClick={() => deleteDataset(selectedDataset)}>Delete Dataset</DangerButton>
                <Button onClick={() => setActiveTab('datasets')}>Back to Datasets</Button>
              </div>
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <h3>Technical Details:</h3>
              <pre style={{ 
                background: '#f5f5f5', 
                padding: '10px', 
                borderRadius: '4px',
                maxHeight: '200px',
                overflow: 'auto' 
              }}>
                {JSON.stringify(gestureDatasets[selectedDataset], null, 2)}
              </pre>
            </div>
          </Panel>
        )}
      </TabPanel>
    </Container>
  );
}

export default Admin; 