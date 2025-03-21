
import * as THREE from "three";
import { FaceLandmarks } from "./mediapipeUtils";

export const initScene = (container: HTMLDivElement): {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  headModel: THREE.Group;
  shaverModel: THREE.Group;
} => {
  // Create the scene
  const scene = new THREE.Scene();
  scene.background = null; // Transparent background

  // Create the camera
  const camera = new THREE.PerspectiveCamera(
    50,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  // Create the renderer
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true, // Enable transparency
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  // Add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(0, 1, 2);
  scene.add(directionalLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
  fillLight.position.set(0, 0, -2);
  scene.add(fillLight);

  // Create a simple head model (placeholder)
  const headModel = createHeadModel();
  scene.add(headModel);

  // Create a shaver model
  const shaverModel = createShaverModel();
  shaverModel.position.set(1.5, 0, 0);
  scene.add(shaverModel);

  // Handle window resize
  window.addEventListener("resize", () => {
    if (!container) return;
    
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  return { scene, camera, renderer, headModel, shaverModel };
};

export const createHeadModel = (): THREE.Group => {
  const headGroup = new THREE.Group();
  
  // Head (slightly elongated sphere)
  const headGeometry = new THREE.SphereGeometry(1, 32, 32);
  const headMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xf0f0f0,
    flatShading: false,
    transparent: true,
    opacity: 0.9,
  });
  const headMesh = new THREE.Mesh(headGeometry, headMaterial);
  headMesh.scale.set(0.75, 1, 0.8);
  headGroup.add(headMesh);

  // Eyes (simplified)
  const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
  const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x303030 });
  
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEye.position.set(-0.25, 0.15, 0.65);
  headGroup.add(leftEye);
  
  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  rightEye.position.set(0.25, 0.15, 0.65);
  headGroup.add(rightEye);

  // Nose (simple cone)
  const noseGeometry = new THREE.ConeGeometry(0.1, 0.3, 4);
  const noseMaterial = new THREE.MeshPhongMaterial({ color: 0xdfdfdf });
  const nose = new THREE.Mesh(noseGeometry, noseMaterial);
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, -0.1, 0.8);
  headGroup.add(nose);

  // Mouth (simple curved line)
  const mouthGeometry = new THREE.TorusGeometry(0.2, 0.02, 16, 16, Math.PI);
  const mouthMaterial = new THREE.MeshPhongMaterial({ color: 0x505050 });
  const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
  mouth.rotation.x = Math.PI / 2;
  mouth.rotation.z = Math.PI;
  mouth.position.set(0, -0.35, 0.65);
  headGroup.add(mouth);

  // Position the head slightly back to match natural head position
  headGroup.position.z = -0.5;
  
  return headGroup;
};

export const createShaverModel = (): THREE.Group => {
  const shaverGroup = new THREE.Group();

  // Shaver body
  const bodyGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.7, 32);
  const bodyMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x303030,
    metalness: 0.8,
    roughness: 0.2
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.rotation.x = Math.PI / 2;
  shaverGroup.add(body);

  // Shaver head
  const headGeometry = new THREE.CylinderGeometry(0.22, 0.22, 0.15, 32);
  const headMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x505050,
    metalness: 0.9,
    roughness: 0.1
  });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.rotation.x = Math.PI / 2;
  head.position.y = 0.4;
  shaverGroup.add(head);

  // Shaver blades
  const bladeGeometry = new THREE.BoxGeometry(0.35, 0.02, 0.15);
  const bladeMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x909090,
    metalness: 1,
    roughness: 0
  });
  const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
  blade.position.y = 0.4;
  blade.position.z = 0.07;
  shaverGroup.add(blade);

  // Shaver button
  const buttonGeometry = new THREE.BoxGeometry(0.1, 0.05, 0.1);
  const buttonMaterial = new THREE.MeshPhongMaterial({ color: 0xE74C3C });
  const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
  button.position.z = 0.15;
  button.position.y = -0.15;
  shaverGroup.add(button);

  // Scale and position the entire shaver
  shaverGroup.scale.set(0.8, 0.8, 0.8);
  shaverGroup.rotation.set(0, 0, 0);
  
  return shaverGroup;
};

export const updateModels = (
  headModel: THREE.Group,
  shaverModel: THREE.Group,
  faceLandmarks: FaceLandmarks | null,
  shaverPosition: { x: number; y: number; z: number },
  shaverRotation: { x: number; y: number; z: number }
): void => {
  // Update head model based on facial landmarks
  if (faceLandmarks) {
    // Apply smoothing to reduce jitter
    headModel.position.x += (faceLandmarks.position.x - headModel.position.x) * 0.1;
    headModel.position.y += (faceLandmarks.position.y - headModel.position.y) * 0.1;
    headModel.position.z += (faceLandmarks.position.z - headModel.position.z) * 0.1;

    headModel.rotation.x += (faceLandmarks.rotation.x - headModel.rotation.x) * 0.1;
    headModel.rotation.y += (faceLandmarks.rotation.y - headModel.rotation.y) * 0.1;
    headModel.rotation.z += (faceLandmarks.rotation.z - headModel.rotation.z) * 0.1;
  }

  // Update shaver model based on user controls
  shaverModel.position.set(
    shaverPosition.x,
    shaverPosition.y,
    shaverPosition.z
  );
  
  shaverModel.rotation.set(
    shaverRotation.x,
    shaverRotation.y,
    shaverRotation.z
  );
};

export const animate = (
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  headModel: THREE.Group,
  shaverModel: THREE.Group,
  faceLandmarks: FaceLandmarks | null,
  shaverPosition: { x: number; y: number; z: number },
  shaverRotation: { x: number; y: number; z: number }
): void => {
  updateModels(
    headModel,
    shaverModel,
    faceLandmarks,
    shaverPosition,
    shaverRotation
  );
  renderer.render(scene, camera);
};
