// Initialize keys object for controls
const keys = { forward: false, backward: false, left: false, right: false };

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#canvas') });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Physics World
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0); // Gravity

// Ground in Physics and Three.js
const groundShape = new CANNON.Plane();
const groundBody = new CANNON.Body({ mass: 0, shape: groundShape });
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // Rotate to horizontal
world.addBody(groundBody);

const groundMesh = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), new THREE.MeshStandardMaterial({ color: 0x0032ff }));
groundMesh.rotation.x = -Math.PI / 2;
scene.add(groundMesh);

// Load Car Model
let carMesh = null, carBody = null;
const loader = new THREE.GLTFLoader();
loader.load('models/car.glb', function(gltf) {
  carMesh = gltf.scene;

  // Traverse the model and replace textures with a basic material
 // carMesh.traverse(function(node) {
   // if (node.isMesh) {
     // node.material = new THREE.MeshStandardMaterial({ color: 0x808080 });
    //}
  //});

  carMesh.scale.set(1, 1, 1);
  scene.add(carMesh);

  // Car Physics Body
  const carShape = new CANNON.Box(new CANNON.Vec3(1, 0.5, 2)); // Approx car shape
  carBody = new CANNON.Body({ mass: 1500, shape: carShape });
  carBody.position.set(0, 0.5, 0);
  world.addBody(carBody);
}, undefined, function(error) {
  console.error('An error occurred loading the model:', error);
});

// Controls (initialize after camera)
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.2;
camera.position.set(0, 3, 10);

// Keyboard Controls
document.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'ArrowUp': keys.forward = true; break;
    case 'ArrowDown': keys.backward = true; break;
    case 'ArrowLeft': keys.left = true; break;
    case 'ArrowRight': keys.right = true; break;
  }
});

document.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'ArrowUp': keys.forward = false; break;
    case 'ArrowDown': keys.backward = false; break;
    case 'ArrowLeft': keys.left = false; break;
    case 'ArrowRight': keys.right = false; break;
  }
});

// Update Physics and Render Loop
function animate() {
  requestAnimationFrame(animate);

  // Ensure carBody and carMesh are loaded before using them
  if (carBody && carMesh) {
    const force = 500;
    if (keys.forward) carBody.applyForce(new CANNON.Vec3(0, 0, -force), carBody.position);
    if (keys.backward) carBody.applyForce(new CANNON.Vec3(0, 0, force), carBody.position);
    if (keys.left) carBody.angularVelocity.set(0, 5, 0); // Turn left
    if (keys.right) carBody.angularVelocity.set(0, -5, 0); // Turn right

    carMesh.position.copy(carBody.position);
    carMesh.quaternion.copy(carBody.quaternion);
  }

  world.step(1 / 60);  // Update physics
  controls.update();   // Update controls
  renderer.render(scene, camera);  // Render scene
}
animate();

// Handle Window Resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
