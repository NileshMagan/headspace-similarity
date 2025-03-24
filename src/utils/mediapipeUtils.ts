import {
  FaceMesh,
  FACEMESH_TESSELATION,
  FACEMESH_RIGHT_EYE,
  FACEMESH_LEFT_EYE,
  FACEMESH_RIGHT_EYEBROW,
  FACEMESH_LEFT_EYEBROW,
  FACEMESH_FACE_OVAL,
  FACEMESH_LIPS,
} from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import * as drawingUtils from "@mediapipe/drawing_utils";
import { Vector3, Euler } from "three";

export interface FaceLandmarks {
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
}

// Constants for tracking
const LEFT_EYE_INDICES = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
const RIGHT_EYE_INDICES = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];
const NOSE_TIP_INDEX = 1;
const NOSE_BOTTOM_INDEX = 2;
const CHIN_INDEX = 199;
const LEFT_EAR_INDEX = 234;
const RIGHT_EAR_INDEX = 454;

export const initFaceMesh = (): FaceMesh => {
  const faceMesh = new FaceMesh({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
    },
  });

  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.1,
    minTrackingConfidence: 0.1,
  });

  return faceMesh;
};

export const startCamera = (
  videoElement: HTMLVideoElement,
  faceMesh: FaceMesh,
  onResults: (results: any) => void
): Camera => {
  if (!videoElement) {
    console.error('No video element provided');
    return null;
  }

  const camera = new Camera(videoElement, {
    onFrame: async () => {
      try {
        // Check if faceMesh is still valid before sending frame
        if (faceMesh) {
          await faceMesh.send({ image: videoElement });
        }
      } catch (error) {
        // Only log if it's not a deleted object error
        if (!error.message?.includes('deleted object')) {
          console.error('Error sending frame to FaceMesh:', error);
        }
      }
    },
    width: 640,
    height: 480,
  });

  try {
    camera.start();
    return camera;
  } catch (error) {
    console.error('Error starting camera:', error);
    return null;
  }
};

export const setupDrawingUtils = (canvas: HTMLCanvasElement): CanvasRenderingContext2D | null => {
  const canvasCtx = canvas.getContext("2d");
  if (!canvasCtx) {
    console.error('Failed to get canvas context');
    return null;
  }
  console.log('Canvas context initialized successfully');
  return canvasCtx;
};

export const drawFaceMesh = (
  results: any,
  canvasCtx: CanvasRenderingContext2D,
  canvasElement: HTMLCanvasElement,
  debugMode: boolean = false
): void => {
  if (!results?.multiFaceLandmarks || !canvasElement || !canvasCtx) {
    return;
  }

  try {
    if (debugMode) {
      console.log('Starting to draw face mesh...', {
        canvasWidth: canvasElement.width,
        canvasHeight: canvasElement.height,
        numFaces: results.multiFaceLandmarks.length
      });
    }

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Draw the face mesh
    for (const landmarks of results.multiFaceLandmarks) {
      if (!landmarks || landmarks.length === 0) continue;

      if (debugMode) {
        console.log('Drawing landmarks for face:', {
          numLandmarks: landmarks.length,
          canvasWidth: canvasElement.width,
          canvasHeight: canvasElement.height,
          firstLandmark: landmarks[0]
        });
      }

      // Draw face mesh with more visible lines
      drawingUtils.drawConnectors(
        canvasCtx,
        landmarks,
        FACEMESH_TESSELATION,
        { color: "#00FF0080", lineWidth: 1 }
      );
      
      // Draw eyes with brighter color
      drawingUtils.drawConnectors(
        canvasCtx,
        landmarks,
        FACEMESH_RIGHT_EYE,
        { color: "#00FF00", lineWidth: 2 }
      );
      drawingUtils.drawConnectors(
        canvasCtx,
        landmarks,
        FACEMESH_LEFT_EYE,
        { color: "#00FF00", lineWidth: 2 }
      );
      
      // Draw eyebrows with different color
      drawingUtils.drawConnectors(
        canvasCtx,
        landmarks,
        FACEMESH_RIGHT_EYEBROW,
        { color: "#FF0000", lineWidth: 2 }
      );
      drawingUtils.drawConnectors(
        canvasCtx,
        landmarks,
        FACEMESH_LEFT_EYEBROW,
        { color: "#FF0000", lineWidth: 2 }
      );
      
      // Draw face oval with thicker lines
      drawingUtils.drawConnectors(
        canvasCtx,
        landmarks,
        FACEMESH_FACE_OVAL,
        { color: "#00FFFF", lineWidth: 3 }
      );
      
      // Draw lips with different color
      drawingUtils.drawConnectors(
        canvasCtx,
        landmarks,
        FACEMESH_LIPS,
        { color: "#FF00FF", lineWidth: 2 }
      );

      // Draw key points for debugging
      const keyPoints = [
        { index: NOSE_TIP_INDEX, color: "#FF0000" },
        { index: NOSE_BOTTOM_INDEX, color: "#00FF00" },
        { index: CHIN_INDEX, color: "#0000FF" },
        { index: LEFT_EAR_INDEX, color: "#FFFF00" },
        { index: RIGHT_EAR_INDEX, color: "#00FFFF" }
      ];

      keyPoints.forEach(({ index, color }) => {
        const point = landmarks[index];
        if (point) {
          const x = point.x * canvasElement.width;
          const y = point.y * canvasElement.height;
          if (debugMode) {
            console.log(`Drawing key point ${index}:`, { x, y, color });
          }
          
          canvasCtx.beginPath();
          canvasCtx.arc(x, y, 3, 0, 2 * Math.PI);
          canvasCtx.fillStyle = color;
          canvasCtx.fill();
        }
      });
    }

    canvasCtx.restore();
    if (debugMode) {
      console.log('Finished drawing face mesh');
    }
  } catch (error) {
    console.error('Error drawing face mesh:', error);
    // Clear canvas on error
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  }
};

export const extractFaceLandmarks = (results: any, debugMode: boolean = false): FaceLandmarks | null => {
  if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
    if (debugMode) {
      console.log('No face landmarks detected');
    }
    return null;
  }

  const landmarks = results.multiFaceLandmarks[0];
  
  // Calculate face position (using nose tip as reference)
  const noseTip = landmarks[NOSE_TIP_INDEX];
  const position = new Vector3(
    (noseTip.x - 0.5) * 2,  // Scale to -1 to 1 range
    (noseTip.y - 0.5) * 2,  // Scale to -1 to 1 range
    (noseTip.z - 0.5) * 2   // Scale to -1 to 1 range
  );

  if (debugMode) {
    console.log('Raw nose tip coordinates:', {
      x: noseTip.x,
      y: noseTip.y,
      z: noseTip.z
    });
    console.log('Calculated face position:', {
      x: position.x,
      y: position.y,
      z: position.z
    });
  }

  // Calculate face rotation using key landmarks
  const noseBottom = landmarks[NOSE_BOTTOM_INDEX];
  const chin = landmarks[CHIN_INDEX];
  const leftEar = landmarks[LEFT_EAR_INDEX];
  const rightEar = landmarks[RIGHT_EAR_INDEX];
  
  if (debugMode) {
    console.log('Key landmark positions:', {
      noseBottom: { x: noseBottom.x, y: noseBottom.y, z: noseBottom.z },
      chin: { x: chin.x, y: chin.y, z: chin.z },
      leftEar: { x: leftEar.x, y: leftEar.y, z: leftEar.z },
      rightEar: { x: rightEar.x, y: rightEar.y, z: rightEar.z }
    });
  }
  
  // Calculate yaw (left/right) using ear positions
  const yaw = Math.atan2(
    rightEar.x - leftEar.x,
    rightEar.z - leftEar.z
  ); // Remove inversion to match natural head movement
  
  // Calculate pitch (up/down) using nose and chin
  const pitch = Math.atan2(
    noseBottom.y - chin.y,
    noseBottom.z - chin.z
  ); // Remove inversion to match natural head movement
  
  // Calculate roll (tilt) using eye positions
  const leftEyeCenter = landmarks[LEFT_EYE_INDICES[0]];
  const rightEyeCenter = landmarks[RIGHT_EYE_INDICES[0]];
  const roll = Math.atan2(
    rightEyeCenter.y - leftEyeCenter.y,
    rightEyeCenter.x - leftEyeCenter.x
  ); // Remove inversion to match natural head movement

  if (debugMode) {
    console.log('Raw rotation angles (radians):', {
      pitch: pitch,
      yaw: yaw,
      roll: roll
    });
    console.log('Rotation angles (degrees):', {
      pitch: pitch * (180 / Math.PI),
      yaw: yaw * (180 / Math.PI),
      roll: roll * (180 / Math.PI)
    });
  }

  // Create rotation object with adjusted orientation
  const rotation = new Euler(
    pitch,
    yaw, // Remove Math.PI addition since we're not inverting the yaw
    roll,
    'XYZ'
  );

  const result = {
    position: {
      x: position.x,
      y: position.y,
      z: position.z,
    },
    rotation: {
      x: rotation.x,
      y: rotation.y,
      z: rotation.z,
    },
  };

  if (debugMode) {
    console.log('Final face landmarks:', result);
  }

  return result;
};
