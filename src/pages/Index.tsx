
import React, { useState, useEffect } from "react";
import { FaceLandmarks } from "../utils/mediapipeUtils";
import CameraView from "../components/CameraView";
import ThreeDView from "../components/ThreeDView";
import ControlPanel from "../components/ControlPanel";
import LoadingScreen from "../components/LoadingScreen";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [faceLandmarks, setFaceLandmarks] = useState<FaceLandmarks | null>(null);
  const [wireframeVisible, setWireframeVisible] = useState(true);
  const [shaverPosition, setShaverPosition] = useState({ x: 1.5, y: 0, z: 0 });
  const [shaverRotation, setShaverRotation] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    // Simulate loading time for initialization
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleFaceLandmarksUpdate = (landmarks: FaceLandmarks | null) => {
    setFaceLandmarks(landmarks);
  };

  const handleShaverPositionChange = (position: { x: number; y: number; z: number }) => {
    setShaverPosition(position);
  };

  const handleShaverRotationChange = (rotation: { x: number; y: number; z: number }) => {
    setShaverRotation(rotation);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="container px-4 py-8 mx-auto max-w-7xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-medium tracking-tight mb-2 animate-fade-in">
            3D Face Tracking Demo
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto animate-fade-in opacity-75">
            Track your face movements and see them mirrored on a 3D model. Position the virtual shaver using the controls below.
          </p>
        </header>

        <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-2 gap-8'} mb-8`}>
          <div className="glass-panel rounded-xl overflow-hidden shadow-lg h-[400px] animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <CameraView 
              onFaceLandmarksUpdate={handleFaceLandmarksUpdate} 
              showWireframe={wireframeVisible}
            />
          </div>
          
          <div className="glass-panel rounded-xl overflow-hidden shadow-lg h-[400px] animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <ThreeDView 
              faceLandmarks={faceLandmarks}
              shaverPosition={shaverPosition}
              shaverRotation={shaverRotation}
            />
          </div>
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <ControlPanel 
            onShaverPositionChange={handleShaverPositionChange}
            onShaverRotationChange={handleShaverRotationChange}
            wireframeVisible={wireframeVisible}
            onWireframeToggle={setWireframeVisible}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
