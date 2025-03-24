import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";

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