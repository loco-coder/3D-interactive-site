// Main setup for Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Basic lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Ground plane
const planeGeometry = new THREE.PlaneGeometry(100, 100);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xdddddd });
const ground = new THREE.Mesh(planeGeometry, planeMaterial);
ground.rotation.x = - Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Camera settings
camera.position.set(0, 2, 10);

// Orbit Controls for mouse interaction
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

// Load a car model
const loader = new THREE.GLTFLoader();
loader.load('models/car.glb', function(gltf) {
  const car = gltf.scene;
  car.position.set(0, 0, 0);
  car.scale.set(1, 1, 1);
  scene.add(car);
}, undefined, function(error) {
  console.error('Error loading the model:', error);
});

// Physics engine (Cannon.js)
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);  // Set gravity

// Create car physics body
const carBody = new CANNON.Body({
  mass: 1,
  shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),  // Simple box shape
});
carBody.position.set(0, 0, 0);
world.addBody(carBody);

// Ground physics
const groundBody = new CANNON.Body({
  mass: 0,  // Static object
  shape: new CANNON.Plane(),
});
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);  // Align with ground
world.addBody(groundBody);

// Physics and rendering loop
function animate() {
  requestAnimationFrame(animate);

  // Update physics
  world.step(1 / 60);  // 60 times per second

  // Sync Three.js car position with physics
  if (scene.children[2]) {  // Assuming the car is the 3rd child
    scene.children[2].position.copy(carBody.position);
    scene.children[2].quaternion.copy(carBody.quaternion);
  }

  controls.update();  // Update OrbitControls
  renderer.render(scene, camera);  // Render the scene
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
