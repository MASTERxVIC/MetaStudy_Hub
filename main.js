import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

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
    onLaptopClick(); // Trigger stream selection functionality when laptop is clicked
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
  floating_icon.style.display = floating_icon.style.display === 'none' || floating_icon.style.display === '' ? 'flex' : 'none';
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

// Laptop Stream and Subject Dropdown Logic
function onLaptopClick() {
  // Show stream dropdown and subjects container
  const streamDropdown = document.getElementById('stream-dropdown');
  const subjectsContainer = document.getElementById('subjects-container');
  
  streamDropdown.style.display = 'block';
  subjectsContainer.style.display = 'block';

  // Add event listener to the stream dropdown
  streamDropdown.addEventListener('change', function() {
    const selectedStream = this.value;
    // Clear previous subjects
    subjectsContainer.innerHTML = '';

    // Define the subjects for each stream
    const streamSubjects = {
      'BE/BTech': ['Mathematics', 'Physics', 'Computer Science'],
      'BCA': ['Mathematics', 'Programming', 'Database Systems'],
      'BSc-CS': ['Computer Science', 'Mathematics', 'Physics'],
      'Bpharma': ['Pharmacology', 'Chemistry', 'Biology'],
      'DPharma': ['Pharmacy', 'Biochemistry', 'Microbiology'],
      'Polytechnic Diploma': ['Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering'],
      'BBA': ['Management', 'Marketing', 'Finance'],
      'BSc(PCM or PCB)': ['Physics', 'Chemistry', 'Mathematics'],
      'BA': ['History', 'Political Science', 'English Literature'],
      'BCOM': ['Economics', 'Accountancy', 'Business Studies'],
      'BALLB': ['Law', 'Legal Studies', 'Constitutional Law']
    };

    // Create a dropdown for the subjects of the selected stream
    const selectSubject = document.createElement('select');
    selectSubject.classList.add('subjects-dropdown');

    // Add an option for each subject based on the selected stream
    const subjects = streamSubjects[selectedStream];
    subjects.forEach(subject => {
      const option = document.createElement('option');
      option.value = subject;
      option.textContent = subject;
      selectSubject.appendChild(option);
    });

    // Append the subjects dropdown to the container
    subjectsContainer.appendChild(selectSubject);
  });
}



// Function to add the team member's name
const textGroup = new THREE.Group(); // Create a group to hold all text meshes

function addTeamMemberName(name, offsetX, offsetY, offsetZ) {
  const fontLoader = new FontLoader();

  fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
    const textGeometry = new TextGeometry(name, {
      font: font,
      size: 0.3,
      height: 0.06,
    });

    const textMaterial = new THREE.MeshBasicMaterial({ color: 0xbfe0e2 });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);

    // Center the geometry
    textGeometry.center();

    // Calculate text height
    const textHeight = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y;

    // Position the text on the ground
    textMesh.position.set(offsetX, offsetY, offsetZ); // Adjust the position here

    // Apply a 180-degree rotation around the X-axis
    textMesh.rotation.x = Math.PI / -2; // 180 degrees in radians (rotate to sleep on the ground)

    // Add textMesh to the group
    textGroup.add(textMesh);
  });
}

// Adjusted vertical positions for reduced gap
addTeamMemberName("Dev Bhardwaj", 2, 0, -6);
addTeamMemberName("Raj Bhardwaj", 2, 0, -5.3);  // Reduced gap
addTeamMemberName("Ashutosh Yadav", 2, 0, -4.5);
addTeamMemberName("Mohd Saalim", 2, 0, -3.8);  // Reduced gap
addTeamMemberName("Ankit Sharma", 2, 0, -3.1);
addTeamMemberName("Atul Kumar", 2, 0, -2.4);  // Reduced gap

// After all names are added, you can position the entire group
textGroup.position.set(2, -0.35, 6);  // Move the whole group
textGroup.rotation.y = Math.PI / 2;  // Rotate the whole group
scene.add(textGroup);


const floatingIcon = document.getElementById('floating_icon'); // Floating chat icon
const chatBox = document.getElementById('chat-box'); // Chat box container
const sendBtn = document.getElementById('send-btn'); // Send button
const chatMessages = document.getElementById('chat-messages'); // Chat messages container
const chatInput = document.getElementById('chat-input'); // Input for user messages

// Socket.IO setup
const socket = io(); // Connect to the server

let username = null; // Username placeholder
let color = null; // Color for the user

// Function to initialize user on clicking the floating icon
floatingIcon.addEventListener('click', () => {
    if (!username) {
        // Prompt for username if not already set
        username = prompt("Enter your username:");
        while (!username || username.trim() === "") {
            username = prompt("Username cannot be empty. Enter your username:");
        }
        username = username.trim();

        // Assign a random color for the user
        color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

        // Notify the server about the new user
        socket.emit('join', { username, color });

        alert(`Welcome, ${username}! You can start chatting now.`);
    }

    // Toggle chat box visibility
    chatBox.style.display = chatBox.style.display === 'none' || chatBox.style.display === '' ? 'flex' : 'none';
});

// Send a message when the send button is clicked
sendBtn.addEventListener('click', () => {
    const message = chatInput.value.trim();
    if (message !== '') {
        // Emit the message to the server
        socket.emit('send-message', { message, username, color });

        chatInput.value = ''; // Clear input
    }
});

// Send message on "Enter" key press
chatInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendBtn.click();
    }
});

// Display incoming messages
socket.on('chat-message', (data) => {
    const { user, message, color } = data;

    const messageDiv = document.createElement('div');
    messageDiv.innerHTML = `<strong style="color: ${color}">${user}:</strong> ${message}`;
    chatMessages.appendChild(messageDiv);

    // Auto-scroll to the latest message
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Log connected players when updated
socket.on('update-players', (players) => {
    console.log('Connected Players:', players);
});
