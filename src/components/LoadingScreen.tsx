
import React from "react";

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Initializing Camera and Models" 
}) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50 animate-fade-in">
      <div className="relative w-20 h-20 mb-6">
        <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-rotate opacity-75"></div>
        <div className="absolute inset-0 rounded-full border-r-2 border-transparent animate-pulse-subtle"></div>
      </div>
      <h2 className="text-xl font-medium mb-2 animate-pulse-subtle">{message}</h2>
      <p className="text-muted-foreground text-sm max-w-md text-center px-4">
        Please allow camera access when prompted
      </p>
    </div>
  );
};

export default LoadingScreen;
