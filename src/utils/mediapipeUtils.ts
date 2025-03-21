
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
import { DrawingUtils } from "@mediapipe/drawing_utils";
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
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  return faceMesh;
};

export const startCamera = (
  videoElement: HTMLVideoElement,
  faceMesh: FaceMesh,
  onResults: (results: any) => void
): Camera => {
  if (!videoElement) return null;

  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await faceMesh.send({ image: videoElement });
    },
    width: 640,
    height: 480,
  });

  faceMesh.onResults(onResults);
  camera.start();

  return camera;
};

export const setupDrawingUtils = (canvas: HTMLCanvasElement): DrawingUtils => {
  const canvasCtx = canvas.getContext("2d");
  return new DrawingUtils(canvasCtx);
};

export const drawFaceMesh = (
  results: any,
  drawingUtils: DrawingUtils,
  canvasElement: HTMLCanvasElement
): void => {
  if (!results.multiFaceLandmarks || !canvasElement) return;

  const canvasCtx = canvasElement.getContext("2d");
  if (!canvasCtx) return;

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  // Draw the face mesh
  for (const landmarks of results.multiFaceLandmarks) {
    drawingUtils.drawConnectors(
      landmarks,
      FACEMESH_TESSELATION,
      { color: "#C0C0C070", lineWidth: 0.5 }
    );
    drawingUtils.drawConnectors(
      landmarks,
      FACEMESH_RIGHT_EYE,
      { color: "#30FF30", lineWidth: 1 }
    );
    drawingUtils.drawConnectors(
      landmarks,
      FACEMESH_LEFT_EYE,
      { color: "#30FF30", lineWidth: 1 }
    );
    drawingUtils.drawConnectors(
      landmarks,
      FACEMESH_RIGHT_EYEBROW,
      { color: "#30FF30", lineWidth: 1 }
    );
    drawingUtils.drawConnectors(
      landmarks,
      FACEMESH_LEFT_EYEBROW,
      { color: "#30FF30", lineWidth: 1 }
    );
    drawingUtils.drawConnectors(
      landmarks,
      FACEMESH_FACE_OVAL,
      { color: "#E0E0E0", lineWidth: 1.5 }
    );
    drawingUtils.drawConnectors(
      landmarks,
      FACEMESH_LIPS,
      { color: "#E0E0E0", lineWidth: 1 }
    );
  }

  canvasCtx.restore();
};

export const extractFaceLandmarks = (results: any): FaceLandmarks | null => {
  if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
    return null;
  }

  const landmarks = results.multiFaceLandmarks[0];
  
  // Calculate face position (using nose tip as reference)
  const noseTip = landmarks[NOSE_TIP_INDEX];
  const position = new Vector3(
    (noseTip.x - 0.5) * -2,  // Convert from 0-1 range to -1 to 1, flip x
    (noseTip.y - 0.5) * -2,  // Convert from 0-1 range to -1 to 1, flip y
    noseTip.z * -5           // Scale z for better responsiveness
  );

  // Calculate face rotation
  // Get key landmarks for rotation calculation
  const noseBottom = landmarks[NOSE_BOTTOM_INDEX];
  const chin = landmarks[CHIN_INDEX];
  const leftEar = landmarks[LEFT_EAR_INDEX];
  const rightEar = landmarks[RIGHT_EAR_INDEX];
  
  // Calculate angles based on the relative positions of landmarks
  // Yaw (left/right) based on horizontal nose displacement and ear positions
  const yaw = Math.atan2(
    rightEar.z - leftEar.z,
    rightEar.x - leftEar.x
  );
  
  // Pitch (up/down) based on vertical position of nose relative to chin
  const pitch = Math.atan2(
    noseBottom.y - chin.y,
    noseBottom.z - chin.z
  );
  
  // Roll (tilt) based on the angle between eyes
  const leftEyeCenter = landmarks[LEFT_EYE_INDICES[0]];
  const rightEyeCenter = landmarks[RIGHT_EYE_INDICES[0]];
  const roll = Math.atan2(
    rightEyeCenter.y - leftEyeCenter.y,
    rightEyeCenter.x - leftEyeCenter.x
  );

  // Create rotation object with smoothing for stability
  const rotation = new Euler(
    pitch * 2,  // Scale for better responsiveness
    yaw * 2,    // Scale for better responsiveness
    roll,
    'XYZ'
  );

  return {
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
};
