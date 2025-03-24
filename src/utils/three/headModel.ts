import * as THREE from "three";
import { FacePose } from "../../services/faceLandmarksCalculator";

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
  
  return headGroup;
};

export const updateHeadModel = (headModel: THREE.Group, facePose: FacePose | null): void => {
  if (facePose) {
    console.log('Updating head model rotation:', {
      currentRotation: {
        x: headModel.rotation.x,
        y: headModel.rotation.y,
        z: headModel.rotation.z
      },
      targetRotation: facePose.rotation
    });

    // Only update rotation, position remains fixed
    // Rotation updates:
    // - x: pitch (up/down)
    // - y: yaw (left/right)
    // - z: roll (tilt)
    // The *= 0.8 creates a smoothing effect - it only moves 80% of the way to the target
    headModel.rotation.x += (facePose.rotation.x - headModel.rotation.x) * 0.8;
    headModel.rotation.y += (facePose.rotation.y - headModel.rotation.y) * 0.8;
    headModel.rotation.z += (facePose.rotation.z - headModel.rotation.z) * 0.8;

    console.log('Updated head model rotation:', {
      newRotation: {
        x: headModel.rotation.x,
        y: headModel.rotation.y,
        z: headModel.rotation.z
      }
    });
  }
}; 