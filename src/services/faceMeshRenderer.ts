import * as drawingUtils from "@mediapipe/drawing_utils";
import {
  FACEMESH_TESSELATION,
  FACEMESH_RIGHT_EYE,
  FACEMESH_LEFT_EYE,
  FACEMESH_RIGHT_EYEBROW,
  FACEMESH_LEFT_EYEBROW,
  FACEMESH_FACE_OVAL,
  FACEMESH_LIPS,
} from "@mediapipe/face_mesh";

// Constants for tracking
const LEFT_EYE_INDICES = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
const RIGHT_EYE_INDICES = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];
const NOSE_TIP_INDEX = 1;
const NOSE_BOTTOM_INDEX = 2;
const CHIN_INDEX = 199;
const LEFT_EAR_INDEX = 234;
const RIGHT_EAR_INDEX = 454;

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