
declare namespace cv {
    // Basic types
    class Mat {
      constructor();
      constructor(rows: number, cols: number, type: number);
      constructor(rows: number, cols: number, type: number, data: ArrayLike<number>, step?: number);
      
      rows: number;
      cols: number;
      data: Uint8Array;
      step: number;
      type(): number;
      size(): Size;
      
      // Add methods for accessing matrix elements
      ucharPtr(row: number, col: number): Uint8Array;
      ucharAt(row: number, col: number): number;
      doubleAt(row: number, col?: number): number;
      floatAt(row: number, col?: number): number;
      intAt(row: number, col?: number): number;
      shortAt(row: number, col?: number): number;
      
      // Add methods for setting matrix elements
      setTo(value: Scalar): Mat;
      
      // Data conversion methods
      convertTo(dst: Mat, type: number, alpha?: number, beta?: number): void;
      
      // Deep copy method
      clone(): Mat;
      
      // Delete the matrix
      delete(): void;
    }
    
    class Size {
      constructor(width: number, height: number);
      width: number;
      height: number;
    }
    
    class Point {
      constructor(x: number, y: number);
      x: number;
      y: number;
    }
    
    class Scalar {
      constructor(v0: number, v1: number, v2: number, v3: number);
    }
    
    // Constants for Mat types
    const CV_8U: number;
    const CV_8UC1: number;
    const CV_8UC2: number;
    const CV_8UC3: number;
    const CV_8UC4: number;
    const CV_16U: number;
    const CV_16UC1: number;
    const CV_16UC2: number;
    const CV_16UC3: number;
    const CV_16UC4: number;
    const CV_32F: number;
    const CV_32FC1: number;
    const CV_32FC2: number;
    const CV_32FC3: number;
    const CV_32FC4: number;
    const CV_64F: number;
    const CV_64FC1: number;
    const CV_64FC2: number;
    const CV_64FC3: number;
    const CV_64FC4: number;
    
    // Factory functions for creating Mat objects
    function matFromArray(rows: number, cols: number, type: number, array: ArrayLike<number>): Mat;
    function ones(rows: number, cols: number, type: number): Mat;
    function zeros(rows: number, cols: number, type: number): Mat;
    function eye(rows: number, cols: number, type: number): Mat;
    
    // Functions that help with OpenCV loading status
    function onRuntimeInitialized(): void;
  }
  
  declare global {
    interface Window {
      cv: typeof cv;
    }
  }
  
  export { cv };
  