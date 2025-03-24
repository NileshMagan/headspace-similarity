import React, { useRef, useEffect, useState, useCallback } from "react";
import { initFaceMesh, startCamera } from "../services/faceMeshService";
import { setupDrawingUtils, drawFaceMesh } from "../services/faceMeshRenderer";
import { FacePose, faceLandmarksCalculator } from "../services/faceLandmarksCalculator";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { useOpenCV } from "@/hooks/useOpenCV";

interface CameraViewProps {
  onFaceLandmarksUpdate: (pose: FacePose | null) => void;
  showWireframe?: boolean;
  debugMode?: boolean;
}

const CameraView: React.FC<CameraViewProps> = ({ 
  onFaceLandmarksUpdate,
  showWireframe = true,
  debugMode = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { cv, loaded, loading: loadingOpenCV, error: errorOpenCV } = useOpenCV();
  
  const faceMeshRef = useRef<FaceMesh | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isInitializedRef = useRef(false);
  const debugModeRef = useRef(debugMode);

  // Update debugModeRef when debugMode changes
  useEffect(() => {
    debugModeRef.current = debugMode;
  }, [debugMode]);

  const [b, setB] = useState(false);


  useEffect(() => {
    // if (canvasRef.current && loaded && !loadingOpenCV && b) {
    if (canvasRef.current && loaded && !loadingOpenCV) {
      console.log("Canvas dimensions:", canvasSize.width, canvasSize.height);
      console.log("Loaded:", loaded);
      console.log("Loading OpenCV:", loadingOpenCV);
      console.log("b:", b);
      faceLandmarksCalculator.setCanvasDimensions(canvasSize.width, canvasSize.height);
    }
  }, [loaded, loadingOpenCV, canvasSize, b]);

  // Create a memoized callback for handling face mesh results
  const handleFaceMeshResults = useCallback((results: any) => {
    if (!canvasRef.current || !results || !canvasCtxRef.current) {
      console.log('Missing required elements:', {
        hasCanvas: !!canvasRef.current,
        hasResults: !!results,
        hasCanvasCtx: !!canvasCtxRef.current
      });
      return;
    }
    
    // Log if landmarks are detected
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      // Draw the face mesh wireframe if enabled
      if (showWireframe) {
        drawFaceMesh(results, canvasCtxRef.current, canvasRef.current, debugModeRef.current);
      }
      
      // Calculate face pose and pass to parent component
      const pose = faceLandmarksCalculator.calculateFacePose(results, debugMode);
      onFaceLandmarksUpdate(pose);
    } else {
      console.log('No face detected in frame');
      // Clear canvas if no face is detected
      canvasCtxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      onFaceLandmarksUpdate(null);
    }
  }, [showWireframe, onFaceLandmarksUpdate, debugMode]);

  // Add effect to handle video dimensions
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVideoMetadata = () => {
      if (debugModeRef.current) {
        console.log('Video metadata loaded:', {
          width: video.videoWidth,
          height: video.videoHeight
        });
      }
      
      if (canvasRef.current) {
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;
        if (debugModeRef.current) {
          console.log('Canvas dimensions updated:', {
            width: canvasRef.current.width,
            height: canvasRef.current.height
          });
        }
      }
    };

    video.addEventListener('loadedmetadata', handleVideoMetadata);
    return () => video.removeEventListener('loadedmetadata', handleVideoMetadata);
  }, []); // Remove debugMode from dependencies

  // Initialize MediaPipe
  useEffect(() => {
    let faceMesh: FaceMesh | null = null;
    let camera: Camera | null = null;
    let isActive = true;

    const initializeMediaPipe = async () => {
      try {
        if (!videoRef.current || !canvasRef.current) {
          console.error('Missing video or canvas elements');
          return;
        }
        
        if (debugModeRef.current) {
          console.log('Initializing FaceMesh...');
        }
        // Initialize FaceMesh
        faceMesh = initFaceMesh();
        faceMeshRef.current = faceMesh;
        
        // Setup canvas context for drawing
        canvasCtxRef.current = setupDrawingUtils(canvasRef.current);
        if (!canvasCtxRef.current) {
          throw new Error('Failed to initialize canvas context');
        }
        
        // Setup callback when FaceMesh detects results
        faceMesh.onResults(handleFaceMeshResults);

        if (debugModeRef.current) {
          console.log('Starting camera...');
        }
        // Initialize camera
        camera = startCamera(videoRef.current, faceMesh, () => {
          if (isActive && debugModeRef.current) {
            console.log('Camera frame sent to FaceMesh');
          }
        });
        
        if (!camera) {
          throw new Error('Failed to initialize camera');
        }
        
        cameraRef.current = camera;
        if (debugModeRef.current) {
          console.log('Camera initialized successfully');
        }
        
        setLoading(false);
        isInitializedRef.current = true;
      } catch (err) {
        console.error("Error initializing MediaPipe:", err);
        setError("Could not initialize face tracking. Please make sure camera permissions are granted.");
        setLoading(false);
      }
    };

    // Only initialize if not already initialized
    if (!isInitializedRef.current) {
      initializeMediaPipe();
    }

    return () => {
      if (debugModeRef.current) {
        console.log('Cleaning up...');
      }
      isActive = false;
      if (camera) {
        camera.stop();
      }
      if (faceMesh) {
        faceMesh.close();
      }
    };
  }, [handleFaceMeshResults]); // Remove debugMode from dependencies

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (debugModeRef.current) {
        console.log('Component unmounting, cleaning up resources...');
      }
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (faceMeshRef.current) {
        faceMeshRef.current.close();
      }
    };
  }, []); // Remove debugMode from dependencies


  const getCanvasSize = useCallback(() => {
    if (canvasRef.current) {
      const { width, height } = canvasRef.current.getBoundingClientRect();
      console.log("Canvas size:", width, height);
      return { width, height };
    }
    return { width: 0, height: 0 };
  }, []);

  useEffect(() => {
    const updateCanvasSize = () => {
      const size = getCanvasSize();
      setCanvasSize(size);
      console.log("Updated canvas size:", size);
    };
  
    window.addEventListener("resize", updateCanvasSize);
    updateCanvasSize(); // Get initial size
  
    return () => {
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, [getCanvasSize]);

  return (
    <div className="camera-container relative w-full h-full">
      <button onClick={() => setB(!b)}>Click me</button>
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
        style={{ 
          transform: 'scaleX(-1)', // Mirror the canvas to match video
          pointerEvents: 'none', // Ensure canvas doesn't interfere with video interaction
          zIndex: 10, // Ensure canvas is above video
          position: 'absolute',
          top: 0,
          left: 0,
          backgroundColor: 'transparent' // Ensure canvas is transparent
        }}
      />
    </div>
  );
};

export default CameraView;
