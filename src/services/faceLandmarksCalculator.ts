import { Vector3, Euler } from "three";

export interface FacePose {
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
const FACE_POINTS = [1, 33, 263, 61, 291, 199];
const MODEL_POINTS = [
  0, -1.126865, 7.475604, -4.445859, 2.663991, 3.173422, 4.445859, 2.663991,
  3.173422, -2.456206, -4.342621, 4.283884, 2.456206, -4.342621, 4.283884,
  0, -9.403378, 4.264492,
];

// Camera calibration parameters
const NORMALIZED_FOCAL_Y = 1.28;
const DISTORTION_COEFFS = [0.1318020374, -0.1550007612, -0.0071350401, -0.0096747708];

export class FaceLandmarksCalculator {
  private static instance: FaceLandmarksCalculator;
  private canvasDimensions = { width: 0, height: 0 };
  private cameraMatrix: any = null;
  private distortionMatrix: any = null;

  private constructor() {}

  static getInstance(): FaceLandmarksCalculator {
    if (!FaceLandmarksCalculator.instance) {
      FaceLandmarksCalculator.instance = new FaceLandmarksCalculator();
    }
    return FaceLandmarksCalculator.instance;
  }

  setCanvasDimensions(width: number, height: number) {
    this.canvasDimensions = { width, height };
    this.initializeCameraMatrices();
  }

  private initializeCameraMatrices() {
    if (!window.cv) {
      console.error('OpenCV is not loaded yet');
      return;
    }

    const { width, height } = this.canvasDimensions;
    const focalLength = height * NORMALIZED_FOCAL_Y;
    const cx = width / 2;
    const cy = height / 2;

    try {
      // Initialize camera matrix
      this.cameraMatrix = window.cv.matFromArray(3, 3, window.cv.CV_64FC1, [
        focalLength, 0, cx,
        0, focalLength, cy,
        0, 0, 1
      ]);

      // Initialize distortion matrix
      this.distortionMatrix = window.cv.matFromArray(4, 1, window.cv.CV_64FC1, DISTORTION_COEFFS);
      console.log("Camera matrix:", this.cameraMatrix);
    } catch (error) {
      console.error('Error initializing camera matrices:', error);
    }
  }

  private extract2DPoints(landmarks: any[]): number[] {
    const face2D: number[] = [];
    const { width, height } = this.canvasDimensions;

    for (const point of FACE_POINTS) {
      const landmark = landmarks[point];
      const x = landmark.x * width;
      const y = landmark.y * height;
      face2D.push(x, y);
    }

    return face2D;
  }

  private calculateRotationAngles(rmat: any): { pitch: number; yaw: number; roll: number } {
    const sy = Math.sqrt(
      rmat.data64F[0] * rmat.data64F[0] + rmat.data64F[3] * rmat.data64F[3]
    );

    const singular = sy < 1e-6;
    let x, y, z;

    if (!singular) {
      x = Math.atan2(rmat.data64F[7], rmat.data64F[8]);
      y = Math.atan2(-rmat.data64F[6], sy);
      z = Math.atan2(rmat.data64F[3], rmat.data64F[0]);
    } else {
      x = Math.atan2(-rmat.data64F[5], rmat.data64F[4]);
      y = Math.atan2(-rmat.data64F[6], sy);
      z = 0;
    }

    return {
      pitch: x,
      yaw: y,
      roll: z
    };
  }

  private tunePitch(input: number): number {
    let output = input;
    if (input > 0) {
      output -= 3;
    } else {
      output += 3;
    }
    return output / 2;
  }

  calculateFacePose(results: any, debugMode: boolean = false): FacePose | null {
    if (!results?.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      if (debugMode) {
        console.log('No face landmarks detected');
      }
      return null;
    }

    const landmarks = results.multiFaceLandmarks[0];
    const face2D = this.extract2DPoints(landmarks);

    if (face2D.length === 0) return null;

    try {
      const rvec = new window.cv.Mat();
      const tvec = new window.cv.Mat();
      const numRows = FACE_POINTS.length;

      const imagePoints = window.cv.matFromArray(numRows, 2, window.cv.CV_64FC1, face2D);
      const modelPoints = window.cv.matFromArray(6, 3, window.cv.CV_64FC1, MODEL_POINTS);

      const success = window.cv.solvePnP(
        modelPoints,
        imagePoints,
        this.cameraMatrix,
        this.distortionMatrix,
        rvec,
        tvec,
        false,
        window.cv.SOLVEPNP_ITERATIVE
      );

      if (success) {
        const rmat = window.cv.Mat.zeros(3, 3, window.cv.CV_64FC1);
        const jaco = new window.cv.Mat();

        window.cv.Rodrigues(rvec, rmat, jaco);
        const { pitch, yaw, roll } = this.calculateRotationAngles(rmat);

        // Convert to degrees and apply tuning
        const DEGREES_PER_RADIAN = 180 / Math.PI;
        const tunedPitch = this.tunePitch(pitch);

        const result = {
          position: {
            x: tvec.data64F[0],
            y: tvec.data64F[1],
            z: tvec.data64F[2]
          },
          rotation: {
            x: tunedPitch * DEGREES_PER_RADIAN,
            y: yaw * DEGREES_PER_RADIAN,
            z: roll * DEGREES_PER_RADIAN
          }
        };

        if (debugMode) {
          console.log('Calculated face pose:', result);
        }

        // Cleanup OpenCV matrices
        rvec.delete();
        tvec.delete();
        rmat.delete();
        jaco.delete();
        imagePoints.delete();
        modelPoints.delete();

        return result;
      }
    } catch (error) {
      console.error('Error calculating face pose:', error);
    }

    return null;
  }
}

// Export a singleton instance
export const faceLandmarksCalculator = FaceLandmarksCalculator.getInstance(); 