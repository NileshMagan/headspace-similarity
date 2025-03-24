import { SceneManager } from "./three/sceneManager";
import { FacePose } from "../services/faceLandmarksCalculator";

export const initializeThreeScene = (container: HTMLElement): SceneManager => {
  const sceneManager = new SceneManager(container);
  sceneManager.animate();
  return sceneManager;
};

export const updateThreeScene = (sceneManager: SceneManager, facePose: FacePose | null): void => {
  sceneManager.updateModels(facePose);
};

export const cleanupThreeScene = (sceneManager: SceneManager): void => {
  sceneManager.dispose();
};
