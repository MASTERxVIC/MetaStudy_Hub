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
///------------------------------------------------------------------------------------///

///------------------------------------------------------------------------------------///

// UI Interaction Logic
// const startPage = document.getElementById('startPage');
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


//--------------------------------------------------------------------//

// 
function onLaptopClick() {
  // Show stream dropdown and subjects container
  const streamDropdown = document.getElementById('stream-dropdown');
  const subjectsContainer = document.getElementById('subjects-container');

  streamDropdown.style.display = 'block';

  // Add event listener to the stream dropdown
  streamDropdown.addEventListener('change', function () {
    const selectedStream = this.value;

    // Clear previous content in the subjects container
    renderSubjectsContainer(selectedStream);
  });

  function renderSubjectsContainer(selectedStream) {
    const streamSubjects = {
      'BE/BTech': {
        subjects: ['Mathematics', 'Physics', 'Computer Science'],
        syllabus: {
          Mathematics: ['Calculus', 'Linear Algebra', 'Probability', 'Differential Equations'],
          Physics: ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Modern Physics'],
          'Computer Science': ['Data Structures', 'Algorithms', 'Operating Systems', 'Networking'],
        },
      },
      'BCA': {
        subjects: ['Mathematics', 'Programming', 'Database Systems'],
        syllabus: {
          Mathematics: ['Discrete Mathematics', 'Probability', 'Statistics'],
          Programming: ['C++', 'Java', 'Python', 'Web Development'],
          'Database Systems': ['SQL', 'Database Design', 'Normalization', 'Transactions'],
        },
      },
        'BSc-CS': {
          subjects: ['Computer Science', 'Mathematics', 'Physics'],
          syllabus: {
            'Computer Science': ['Programming in C', 'Data Structures', 'Operating Systems', 'Software Engineering'],
            Mathematics: ['Linear Algebra', 'Calculus', 'Statistics', 'Discrete Mathematics'],
            Physics: ['Mechanics', 'Electronics', 'Quantum Physics', 'Thermodynamics'],
          },
        },
        'Bpharma': {
          subjects: ['Pharmaceutics', 'Pharmacology', 'Pharmaceutical Chemistry', 'Pharmacognosy'],
          syllabus: {
            Pharmaceutics: ['Pharmaceutical Formulations', 'Biopharmaceutics', 'Drug Delivery Systems', 'Pharmaceutical Technology'],
            Pharmacology: ['Pathophysiology', 'Pharmacokinetics', 'Drug Interactions', 'Toxicology'],
            'Pharmaceutical Chemistry': ['Medicinal Chemistry', 'Analytical Techniques', 'Organic Chemistry', 'Biochemistry'],
            Pharmacognosy: ['Herbal Medicine', 'Plant Identification', 'Phytochemistry', 'Natural Products'],
          },
        },
        'DPharma': {
          subjects: ['Pharmacy Practice', 'Pharmaceutical Chemistry', 'Pharmacognosy', 'Human Anatomy and Physiology'],
          syllabus: {
            'Pharmacy Practice': ['Dispensing Pharmacy', 'Pharmaceutical Jurisprudence', 'Hospital Pharmacy', 'Community Pharmacy'],
            'Pharmaceutical Chemistry': ['Inorganic Chemistry', 'Organic Chemistry', 'Physical Chemistry', 'Medicinal Chemistry'],
            Pharmacognosy: ['Basic Pharmacognosy', 'Natural Sources of Drugs', 'Herbal Products', 'Plant-Based Medicine'],
            'Human Anatomy and Physiology': ['Cell Structure', 'Body Systems', 'Physiology of Organs', 'Basic Pathology'],
          },
        },
        'Polytechnic Diploma': {
          subjects: ['Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering'],
          syllabus: {
            'Mechanical Engineering': ['Engineering Mechanics', 'Thermodynamics', 'Machine Design', 'Manufacturing Processes'],
            'Electrical Engineering': ['Circuit Theory', 'Electrical Machines', 'Power Systems', 'Control Systems'],
            'Civil Engineering': ['Surveying', 'Building Materials', 'Structural Analysis', 'Transportation Engineering'],
          },
        },
        'BBA': {
          subjects: ['Management', 'Marketing', 'Finance'],
          syllabus: {
            Management: ['Principles of Management', 'Organizational Behavior', 'Business Ethics', 'Strategic Management'],
            Marketing: ['Market Research', 'Digital Marketing', 'Consumer Behavior', 'Brand Management'],
            Finance: ['Financial Accounting', 'Corporate Finance', 'Investment Analysis', 'Financial Markets'],
          },
        },
        'BSc(PCM or PCB)': {
          subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
          syllabus: {
            Physics: ['Mechanics', 'Optics', 'Electromagnetism', 'Nuclear Physics'],
            Chemistry: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Analytical Techniques'],
            Mathematics: ['Calculus', 'Linear Algebra', 'Probability', 'Differential Equations'],
            Biology: ['Cell Biology', 'Genetics', 'Human Anatomy', 'Ecology'],
          },
        },
        'BA': {
          subjects: ['History', 'Political Science', 'English Literature'],
          syllabus: {
            History: ['Ancient History', 'Medieval History', 'Modern History', 'World History'],
            'Political Science': ['Political Theory', 'Indian Constitution', 'International Relations', 'Public Administration'],
            'English Literature': ['Shakespeare', 'Romantic Poetry', 'Modern Prose', 'Literary Criticism'],
          },
        },
        'BCOM': {
          subjects: ['Accountancy', 'Economics', 'Business Studies'],
          syllabus: {
            Accountancy: ['Financial Accounting', 'Cost Accounting', 'Auditing', 'Taxation'],
            Economics: ['Microeconomics', 'Macroeconomics', 'Econometrics', 'Development Economics'],
            'Business Studies': ['Business Communication', 'Corporate Governance', 'Entrepreneurship', 'International Business'],
          },
        },
        'BALLB': {
          subjects: ['Law', 'Legal Studies', 'Constitutional Law'],
          syllabus: {
            Law: ['Contract Law', 'Criminal Law', 'Tort Law', 'Family Law'],
            'Legal Studies': ['Jurisprudence', 'Legal Research', 'Human Rights Law', 'Environmental Law'],
            'Constitutional Law': ['Indian Constitution', 'Fundamental Rights', 'Judicial Review', 'Separation of Powers'],
          },
        },
      
      // Add other streams and their syllabus here...
    };

    const selectedStreamData = streamSubjects[selectedStream];
    subjectsContainer.innerHTML = '';

    if (selectedStreamData) {
      // Create a back button to return to stream selection
      const backButton = document.createElement('img');
      backButton.src = './back-left.png';
      backButton.alt = 'back';
      backButton.classList.add('backButton'); // Add CSS class

      backButton.addEventListener('click', () => {
        subjectsContainer.style.display = 'none';
        streamDropdown.value = ''; // Reset dropdown
        streamDropdown.style.display = 'block';
      });

      subjectsContainer.appendChild(backButton);

      // Display subjects as clickable options
      selectedStreamData.subjects.forEach(subject => {
        const subjectButton = document.createElement('button');
        subjectButton.textContent = subject;
        subjectButton.style.display = 'block' ;
        subjectButton.style.margin = '10px 0';
        subjectButton.style.padding = '10px';
        subjectButton.style.border = '1px solid #ccc';
        subjectButton.style.background = '#f9f9f9';
        subjectButton.style.cursor = 'pointer';
        subjectButton.style.borderRadius = '5px';

        // Add click event to display syllabus for the selected subject
        subjectButton.addEventListener('click', () => {
          renderSyllabusContainer(selectedStream, subject, streamSubjects);
        });

        subjectsContainer.appendChild(subjectButton);
      });
    } else {
      const noSubjects = document.createElement('p');
      noSubjects.textContent = 'No subjects available for this stream.';
      subjectsContainer.appendChild(noSubjects);
    }

    subjectsContainer.style.display = 'block';
  }

  function renderSyllabusContainer(selectedStream, subject, streamSubjects) {
    subjectsContainer.innerHTML = '';

    // Create a back button to return to the subjects list
    const backButton = document.createElement('img');
    backButton.src = './back-left.png';
    backButton.alt = 'back';
    backButton.classList.add('backButton'); // Add CSS class

    backButton.addEventListener('click', () => {
      renderSubjectsContainer(selectedStream);
    });

    subjectsContainer.appendChild(backButton);

    // Display syllabus
    const syllabusList = document.createElement('div');
    syllabusList.innerHTML = `
      <h3>${subject} Syllabus</h3>
      <ul>
        ${streamSubjects[selectedStream].syllabus[subject]
          .map(topic => `<li>${topic}</li>`)
          .join('')}
      </ul>
    `;

    subjectsContainer.appendChild(syllabusList);
 
    subjectsContainer.style.display = 'block';
  }
 
}
//---------------------------------------------------------------------//



//--------------------------------------------------------------------//

// Function to add the team member's name
const textGroup = new THREE.Group(); // Create a group to hold all text meshes

function addTeamMemberName(name, offsetX, offsetY, offsetZ) {
  const fontLoader = new FontLoader();

  fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
    const textGeometry = new TextGeometry(name, {
      font: font,
      size: 0.2,
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
    textMesh.rotation.x = Math.PI / -3; // 180 degrees in radians (rotate to sleep on the ground)

    // Add textMesh to the group
    textGroup.add(textMesh);
  });
}

// Adjusted vertical positions for reduced gap
addTeamMemberName("Dev Bhardwaj", 2, 0, -6);
addTeamMemberName("Raj Bhardwaj", 2, 0, -5);  // Reduced gap
addTeamMemberName("Ashutosh Yadav", 2, 0, -4);
addTeamMemberName("Mohd Saalim", 2, 0, -3);  // Reduced gap
addTeamMemberName("Ankit Sharma", 2, 0, -2);
addTeamMemberName("Atul Kumar", 2, 0, -1);  // Reduced gap

// After all names are added, you can position the entire group
textGroup.position.set(2, -0.35, 6);  // Move the whole group
textGroup.rotation.y = Math.PI / 2;  // Rotate the whole group
scene.add(textGroup);


//--------------------------------------------------------------------//
  
// // Connect to the Socket.IO server
// const socket = io();
//   // UI Elements
//   const floatingIcon = document.getElementById('floating-icon');
//   const chatContainer = document.getElementById('chat-box');
//   const chatMessages = document.getElementById('chat-messages');
//   const chatInput = document.getElementById('chat-input');
//   const sendBtn = document.getElementById('send-btn');

//   // Store username and color
//   let username = null;
//   let color = null;

//   // Show chat container on floating icon click
//   floatingIcon.addEventListener('click', () => {
//       chatContainer.style.display = 'block';
//       floatingIcon.style.display = 'none';

//       // Ask for username once when chat opens
//       if (!username) {
//           username = prompt("Enter your username:");
//           while (!username || username.trim() === "") {
//               username = prompt("Enter your username:");
//           }
//           username = username.trim();
//           color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

//           // Notify the server of the new user
//           socket.emit('join', { username, color });
//       }
//   });

//   // Send a message
//   sendBtn.addEventListener('click', () => {
//       const message = chatInput.value.trim();
//       if (message) {
//           socket.emit('send-message', { message, username, color });
//           chatInput.value = ''; // Clear input field
//       }
//   });

//   // Send message on Enter key
//   chatInput.addEventListener('keypress', (event) => {
//       if (event.key === 'Enter') sendBtn.click();
//   });

//   // Display chat messages
//   socket.on('chat-message', ({ user, message, color }) => {
//       const messageDiv = document.createElement('div');
//       messageDiv.innerHTML = `<strong style="color: ${color}">${user}:</strong> ${message}`;
//       chatMessages.appendChild(messageDiv);
//       chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll
//   });


