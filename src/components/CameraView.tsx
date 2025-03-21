
import React, { useRef, useEffect, useState } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { FaceLandmarks, initFaceMesh, startCamera, setupDrawingUtils, drawFaceMesh, extractFaceLandmarks } from "../utils/mediapipeUtils";

interface CameraViewProps {
  onFaceLandmarksUpdate: (landmarks: FaceLandmarks | null) => void;
  showWireframe?: boolean;
}

const CameraView: React.FC<CameraViewProps> = ({ 
  onFaceLandmarksUpdate,
  showWireframe = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const faceMeshRef = useRef<FaceMesh | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    let faceMesh: FaceMesh | null = null;
    let camera: Camera | null = null;

    const initializeMediaPipe = async () => {
      try {
        if (!videoRef.current || !canvasRef.current) return;
        
        // Initialize FaceMesh
        faceMesh = initFaceMesh();
        faceMeshRef.current = faceMesh;
        
        // Setup canvas context for drawing
        canvasCtxRef.current = setupDrawingUtils(canvasRef.current);
        
        // Setup callback when FaceMesh detects results
        faceMesh.onResults((results) => {
          if (!canvasRef.current || !results || !canvasCtxRef.current) return;
          
          // Resize canvas to match video dimensions
          const videoElement = videoRef.current;
          if (videoElement) {
            canvasRef.current.width = videoElement.videoWidth;
            canvasRef.current.height = videoElement.videoHeight;
          }
          
          // Draw the face mesh wireframe if enabled
          if (showWireframe) {
            drawFaceMesh(results, canvasCtxRef.current, canvasRef.current);
          } else {
            // Clear canvas if wireframe is disabled
            const canvasCtx = canvasRef.current.getContext('2d');
            if (canvasCtx) {
              canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
          }
          
          // Extract facial landmarks and pass to parent component
          const landmarks = extractFaceLandmarks(results);
          onFaceLandmarksUpdate(landmarks);
        });

        // Initialize camera
        camera = startCamera(videoRef.current, faceMesh, () => {});
        cameraRef.current = camera;
        
        setLoading(false);
      } catch (err) {
        console.error("Error initializing MediaPipe:", err);
        setError("Could not initialize face tracking. Please make sure camera permissions are granted.");
        setLoading(false);
      }
    };

    initializeMediaPipe();

    return () => {
      // Cleanup
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (faceMeshRef.current) {
        faceMeshRef.current.close();
      }
    };
  }, [onFaceLandmarksUpdate, showWireframe]);

  return (
    <div className="camera-container relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <div className="animate-pulse text-center">
            <p className="text-sm text-muted-foreground">Initializing camera...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <div className="text-center p-4">
            <p className="text-destructive mb-2">{error}</p>
            <button 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      )}
      
      <video 
        ref={videoRef} 
        className="w-full h-full object-cover" 
        playsInline 
        style={{ transform: 'scaleX(-1)' }} // Mirror the camera
      />
      
      <canvas 
        ref={canvasRef} 
        className="camera-overlay absolute top-0 left-0 w-full h-full"
        style={{ transform: 'scaleX(-1)' }} // Mirror the canvas to match video
      />
    </div>
  );
};

export default CameraView;
