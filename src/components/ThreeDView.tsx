
import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { FaceLandmarks } from "../utils/mediapipeUtils";
import { initScene, animate } from "../utils/threeUtils";

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
  
  // References to Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const headModelRef = useRef<THREE.Group | null>(null);
  const shaverModelRef = useRef<THREE.Group | null>(null);
  
  // Set up Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Initialize the 3D scene
    const { scene, camera, renderer, headModel, shaverModel } = initScene(containerRef.current);
    
    // Store references
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    headModelRef.current = headModel;
    shaverModelRef.current = shaverModel;
    
    setSceneLoaded(true);
    
    // Animation loop
    const animationLoop = () => {
      if (
        !sceneRef.current ||
        !cameraRef.current ||
        !rendererRef.current ||
        !headModelRef.current ||
        !shaverModelRef.current
      ) {
        return;
      }
      
      animate(
        sceneRef.current,
        cameraRef.current,
        rendererRef.current,
        headModelRef.current,
        shaverModelRef.current,
        faceLandmarks,
        shaverPosition,
        shaverRotation
      );
      
      requestAnimationFrame(animationLoop);
    };
    
    // Start animation
    animationLoop();
    
    // Cleanup
    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (containerRef.current?.contains(rendererRef.current.domElement)) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
      }
      
      // Dispose of geometries and materials
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
    };
  }, []);
  
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
