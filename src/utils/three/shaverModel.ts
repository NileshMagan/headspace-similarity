import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export function createShaverModel(): THREE.Group {
  const group = new THREE.Group();
  
  // Create a temporary geometry while the model loads
  const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  const material = new THREE.MeshStandardMaterial({ color: 0x808080 });
  const tempMesh = new THREE.Mesh(geometry, material);
  group.add(tempMesh);

  // Load the shaver model
  const loader = new GLTFLoader();
  loader.load(
    "/models/shaver.glb",
    (gltf) => {
      // Remove temporary mesh
      group.remove(tempMesh);
      
      // Add the loaded model
      const model = gltf.scene;
      
      // Scale the model appropriately
      model.scale.set(0.1, 0.1, 0.1);
      
      // Center the model
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);
      
      // Rotate to match head orientation
      model.rotation.x = -Math.PI / 2; // Rotate 90 degrees to align with head
      model.rotation.y = Math.PI; // Rotate 180 degrees to face the head
      
      group.add(model);
    },
    undefined,
    (error) => {
      console.error("Error loading shaver model:", error);
    }
  );

  return group;
}

export function updateShaverModel(
  shaverModel: THREE.Group,
  rotation: { x: number; y: number; z: number }
): void {
  // Update rotation to match head
  shaverModel.rotation.x = rotation.x;
  shaverModel.rotation.y = rotation.y;
  shaverModel.rotation.z = rotation.z;
} 