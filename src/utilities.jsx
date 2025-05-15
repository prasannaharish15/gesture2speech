// Drawing function for hand landmarks
export const drawHand = (predictions, ctx) => {
    if (predictions.length > 0) {
      // Loop through each prediction
      predictions.forEach((prediction) => {
        // Grab landmarks
        const landmarks = prediction.landmarks;
        
        // Loop through fingers
        for (let i = 0; i < landmarks.length; i++) {
          // Get x point
          const x = landmarks[i][0];
          // Get y point
          const y = landmarks[i][1];
          
          // Start drawing
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, 3 * Math.PI);
          
          // Set line color
          ctx.fillStyle = "indigo";
          ctx.fill();
        }
        
        // Draw lines between landmarks
        const fingers = [
          [0, 1, 2, 3, 4],             // thumb
          [0, 5, 6, 7, 8],             // index finger
          [0, 9, 10, 11, 12],          // middle finger
          [0, 13, 14, 15, 16],         // ring finger
          [0, 17, 18, 19, 20]          // pinky
        ];
        
        // Draw fingers
        for (let i = 0; i < fingers.length; i++) {
          const finger = fingers[i];
          
          for (let j = 0; j < finger.length - 1; j++) {
            const firstJointIndex = finger[j];
            const secondJointIndex = finger[j + 1];
            
            // Draw path
            ctx.beginPath();
            ctx.moveTo(
              landmarks[firstJointIndex][0],
              landmarks[firstJointIndex][1]
            );
            ctx.lineTo(
              landmarks[secondJointIndex][0],
              landmarks[secondJointIndex][1]
            );
            
            // Set line color and thickness
            ctx.strokeStyle = "plum";
            ctx.lineWidth = 4;
            ctx.stroke();
          }
        }
      });
    }
  };