<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interactive 3D Model Viewer</title>
    <style>
      body, html {
        margin: 0;
        padding: 0;
        overflow: hidden;
      }
      canvas {
        display: block;
      }
    </style>
  </head>
  <body>
    <!-- Load necessary libraries from CDNs -->
    <script src="https://cdn.jsdelivr.net/npm/three/build/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three/examples/js/loaders/GLTFLoader.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three/examples/js/controls/OrbitControls.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/cannon-es@0.18.0/dist/cannon-es.js"></script>

    <script>
      // Set up Three.js scene, camera, and renderer
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(renderer.domElement);

      // Add lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);

      // Create ground plane
      const planeGeometry = new THREE.PlaneGeometry(100, 100);
      const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xdddddd });
      const ground = new THREE.Mesh(planeGeometry, planeMaterial);
      ground.rotation.x = -Math.PI / 2;
      scene.add(ground);

      // Orbit Controls
      const controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.25;
      controls.enableZoom = true;

      // Load 3D model (e.g., car.glb)
      const loader = new THREE.GLTFLoader();
      loader.load('models/car.glb', function(gltf) {
        const car = gltf.scene;
        car.position.set(0, 0.5, 0);  // Adjust position
        car.scale.set(1, 1, 1);  // Adjust scale
        scene.add(car);
      }, undefined, function(error) {
        console.error('Error loading the model:', error);
      });

      // Cannon.js physics setup
      const world = new CANNON.World();
      world.gravity.set(0, -9.82, 0);  // Gravity strength and direction

      // Car physics body
      const carBody = new CANNON.Body({
        mass: 1,  // Car has mass
        shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),  // Box shape
      });
      carBody.position.set(0, 0.5, 0);
      world.addBody(carBody);

      // Ground physics body
      const groundBody = new CANNON.Body({
        mass: 0,  // Ground doesn't move
        shape: new CANNON.Plane(),
      });
      groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
      world.addBody(groundBody);

      // Physics update
      function updatePhysics() {
        world.step(1 / 60);  // Step physics world forward at 60 FPS

        // Sync Three.js car position with Cannon.js carBody position
        if (scene.children[2]) {
          scene.children[2].position.copy(carBody.position);
          scene.children[2].quaternion.copy(carBody.quaternion);
        }
      }

      // Animation loop
      function animate() {
        requestAnimationFrame(animate);
        updatePhysics();  // Update physics
        controls.update();  // Update OrbitControls
        renderer.render(scene, camera);  // Render scene
      }
      animate();

      // Handle window resize
      window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });
    </script>
  </body>
</html>
