import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { createHeadModel, updateHeadModel } from "./headModel";
import { createShaverModel, updateShaverModel } from "./shaverModel";
import { FacePose } from "../../services/faceLandmarksCalculator";

export class SceneManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private headModel: THREE.Group;
  private shaverModel: THREE.Group;
  private animationFrameId: number | null = null;
  private shaverPosition: { x: number; y: number; z: number } = { x: 1.5, y: 0, z: 0 };
  private shaverRotation: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    
    // Initialize scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    // Add grid and axes helpers for debugging
    const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x444444);
    gridHelper.position.y = 0;
    this.scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);

    // Get container dimensions
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Initialize camera with wider field of view
    this.camera = new THREE.PerspectiveCamera(
      60, // Reduced from 75 for less distortion
      containerWidth / containerHeight,
      0.1,
      1000
    );

    // Position camera for a good view of the scene
    this.camera.position.set(0, 2, 5); // Position camera further back and higher
    this.camera.lookAt(0, 1.5, 0); // Look at the head's position

    // Initialize renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(containerWidth, containerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    // Initialize controls with more freedom
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = true; // Enable panning
    this.controls.minDistance = 3; // Minimum zoom distance
    this.controls.maxDistance = 10; // Maximum zoom distance
    this.controls.maxPolarAngle = Math.PI / 2; // Limit vertical rotation to prevent going below ground
    this.controls.target.set(0, 1.5, 0); // Set orbit target to head's position
    this.controls.enableZoom = true; // Explicitly enable zoom
    this.controls.enableRotate = true; // Explicitly enable rotation
    this.controls.enablePan = true; // Explicitly enable panning

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);

    // Create models
    this.headModel = createHeadModel();
    this.shaverModel = createShaverModel();
    
    // Position models
    this.headModel.position.set(0, 1.5, 0); // Position head slightly elevated
    this.shaverModel.position.set(1.5, 1.5, 0); // Position shaver at same height as head
    
    this.scene.add(this.headModel);
    this.scene.add(this.shaverModel);

    // Handle window resize
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  private handleResize(): void {
    // Get container dimensions
    const containerWidth = this.container.clientWidth;
    const containerHeight = this.container.clientHeight;

    // Update camera aspect ratio
    this.camera.aspect = containerWidth / containerHeight;
    this.camera.updateProjectionMatrix();

    // Update renderer size
    this.renderer.setSize(containerWidth, containerHeight, false); // false prevents style changes
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Update container style to ensure full viewport coverage
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.container.style.overflow = 'hidden';
  }

  public updateModels(facePose: FacePose | null): void {
    if (facePose) {
      // Only update rotation, keep position fixed
      this.headModel.rotation.x += (facePose.rotation.x - this.headModel.rotation.x) * 0.01;
      this.headModel.rotation.y += (facePose.rotation.y - this.headModel.rotation.y) * 0.01;
      this.headModel.rotation.z += (facePose.rotation.z - this.headModel.rotation.z) * 0.01;

      // Update shaver rotation to match head
      this.shaverModel.rotation.x = this.headModel.rotation.x;
      this.shaverModel.rotation.y = this.headModel.rotation.y;
      this.shaverModel.rotation.z = this.headModel.rotation.z;
    }
    
    // Update shaver position based on controls
    this.shaverModel.position.set(
      this.shaverPosition.x,
      this.shaverPosition.y + 1.5, // Maintain the elevated position
      this.shaverPosition.z
    );

    // Ensure camera always looks at the head's position
    this.camera.lookAt(0, 1.5, 0);
  }

  public setShaverPosition(position: { x: number; y: number; z: number }): void {
    this.shaverPosition = position;
  }

  public setShaverRotation(rotation: { x: number; y: number; z: number }): void {
    this.shaverRotation = rotation;
  }

  public animate(): void {
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    this.camera.lookAt(0, 1.5, 0); // Ensure camera always looks at head's position
    this.renderer.render(this.scene, this.camera);
  }

  public dispose(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    window.removeEventListener('resize', this.handleResize.bind(this));
    this.renderer.dispose();
  }
} 