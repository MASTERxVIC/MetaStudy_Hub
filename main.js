import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();

// Camera setup
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(7, 3.5, 4);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.background = new THREE.Color(0x87ceeb);

// Lighting setup
const light = new THREE.DirectionalLight(0xffffff, 5);
light.position.set(5, 10, 5);
scene.add(light);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
scene.add(hemiLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// GLTF Loader for models
const loader = new GLTFLoader();
let baseModel, originalModel, laptopModel;

// Load the base model
loader.load('./base.glb', (glb) => {
  baseModel = glb.scene;
  baseModel.scale.set(1, 1, 1);
  baseModel.position.set(0, -2, 0);
  scene.add(baseModel);

  loader.load('./metaroom.glb', (glb) => {
    originalModel = glb.scene;
    originalModel.scale.set(1, 1, 1);
    originalModel.position.set(0, 0, 0);
    baseModel.add(originalModel);
    laptopModel = originalModel.getObjectByName('laptop');
  });
});

// OrbitControls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Raycaster for detecting clicks
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
  if (!originalModel || !laptopModel) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(laptopModel, true);

  if (intersects.length > 0) {
    showLaptopDiv();
  }
}

window.addEventListener('click', onMouseClick);

// UI Interaction Logic
const startPage = document.getElementById('startPage');
const launchMeta = document.getElementById('launchMeta');
const laptopDiv = document.getElementById('laptop');
const closeLaptopButton = document.getElementById('closeLaptop');

// Launch Meta Button
launchMeta.addEventListener('click', () => {
  startPage.style.display = 'none';
  renderer.domElement.style.display = 'block';
  animateCameraAndModel();
  animate(); // Start rendering loop
});

// Show Laptop Div
function showLaptopDiv() {
  laptopDiv.style.display = 'block';
  renderer.domElement.style.display = 'none';
}

// Close Laptop Div
closeLaptopButton.addEventListener('click', () => {
  laptopDiv.style.display = 'none';
  renderer.domElement.style.display = 'block';
});

// Camera Animation
function animateCameraAndModel() {
  const startPosition = new THREE.Vector3(0, 1.5, 0);
  const endPosition = new THREE.Vector3(7, 3.5, 4);
  const startTime = performance.now();
  const duration = 3000;

  controls.enabled = false;

  function animate() {
    const elapsed = performance.now() - startTime;
    const t = Math.min(elapsed / duration, 1);

    camera.position.lerpVectors(startPosition, endPosition, t);
    camera.lookAt(0, 1, 0);

    if (originalModel) {
      originalModel.rotation.y = t * Math.PI * 2;
    }

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      if (originalModel) originalModel.rotation.y = 0;
      controls.enabled = true;
    }

    renderer.render(scene, camera);
  }

  animate();
}

// Resize Handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
