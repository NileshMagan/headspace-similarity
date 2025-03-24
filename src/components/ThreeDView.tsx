import React, { useRef, useEffect, useState } from "react";
import { FaceLandmarks } from "../utils/mediapipeUtils";
import { initializeThreeScene, updateThreeScene, cleanupThreeScene } from "../utils/threeUtils";
import { SceneManager } from "../utils/three/sceneManager";

interface ThreeDViewProps {
  faceLandmarks: FaceLandmarks | null;
  shaverPosition: { x: number; y: number; z: number };
  shaverRotation: { x: number; y: number; z: number };
}

const ThreeDView: React.FC<ThreeDViewProps> = ({ 
  faceLandmarks, 
  shaverPosition,
  shaverRotation
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sceneLoaded, setSceneLoaded] = useState(false);
  const sceneManagerRef = useRef<SceneManager | null>(null);
  
  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Initialize the 3D scene
    sceneManagerRef.current = initializeThreeScene(containerRef.current);
    setSceneLoaded(true);
    
    // Cleanup
    return () => {
      if (sceneManagerRef.current) {
        cleanupThreeScene(sceneManagerRef.current);
      }
    };
  }, []);

  // Update models when face landmarks change
  useEffect(() => {
    if (sceneManagerRef.current && faceLandmarks) {
      updateThreeScene(sceneManagerRef.current, faceLandmarks);
    }
  }, [faceLandmarks]);

  // Update shaver position and rotation
  useEffect(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setShaverPosition(shaverPosition);
      sceneManagerRef.current.setShaverRotation(shaverRotation);
      // updateThreeScene(sceneManagerRef.current, faceLandmarks); // TODO: Uncomment for head model movement
    }
  }, [shaverPosition, shaverRotation, faceLandmarks]);
  
  return (
    <div 
      ref={containerRef} 
      className="canvas-container w-full h-full relative"
    >
      {!sceneLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-muted-foreground animate-pulse">
            Loading 3D scene...
          </p>
        </div>
      )}
    </div>
  );
};

export default ThreeDView;
