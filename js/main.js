// Set up scene, renderer, and isometric camera
const scene = new THREE.Scene();
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera(-5 * aspect, 5 * aspect, 5, -5, 0.1, 100);
camera.position.set(10, 10, 10);  // Position for isometric view

const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#canvas') });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting setup
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

// Cannon.js physics setup
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);  // Gravity

// Ground plane for physics
const groundBody = new CANNON.Body({ mass: 0 });
groundBody.addShape(new CANNON.Plane());
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(groundBody);

const groundMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshStandardMaterial({ color: 0x6666ff })
);
groundMesh.rotation.x = -Math.PI / 2;
scene.add(groundMesh);

// Car model loading and setup
let carMesh, carBody;
const loader = new THREE.GLTFLoader();
const wheels = [];  // Array to store wheel meshes

loader.load('models/car.glb', function(gltf) {
  carMesh = gltf.scene;
  scene.add(carMesh);

  // Focus the camera on the car once loaded
  camera.lookAt(carMesh.position);

  // Physics body for car
  carBody = new CANNON.Body({ mass: 1500 });
  carBody.addShape(new CANNON.Box(new CANNON.Vec3(1, 0.5, 2)));
  carBody.position.set(0, 0.5, 0);
  world.addBody(carBody);

  // Locate and store wheels
  carMesh.traverse((node) => {
    if (node.isMesh && node.name.includes("wheel")) {
      wheels.push(node);  // Assuming wheels have "wheel" in their names
    }
  });
}, undefined, function(error) {
  console.error('An error occurred loading the model:', error);
});

// Key input tracking
const keys = { forward: false, backward: false, left: false, right: false };
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

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Apply physics-based movement
  const force = 500;
  if (carBody) {
    if (keys.forward) carBody.applyForce(new CANNON.Vec3(0, 0, -force), carBody.position);
    if (keys.backward) carBody.applyForce(new CANNON.Vec3(0, 0, force), carBody.position);
    if (keys.left || keys.right) {
      wheels.forEach(wheel => {
        wheel.rotation.x += 0.1 * (keys.right ? -1 : 1);  // Rotate wheels left/right
      });
    }
    
    carMesh.position.copy(carBody.position);
    carMesh.quaternion.copy(carBody.quaternion);
  }

  // Render and update controls
  world.step(1 / 60);
  renderer.render(scene, camera);
}

animate();

// Window resizing
window.addEventListener('resize', () => {
  camera.left = -5 * aspect;
  camera.right = 5 * aspect;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
