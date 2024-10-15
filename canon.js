// 1. Set up the physics world
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);  // Set gravity direction and strength

// 2. Create a physics body for the car
const carBody = new CANNON.Body({
  mass: 1,  // Car has a mass, so it moves and reacts to forces
  shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),  // Simple box shape for car's physics
});
carBody.position.set(0, 0.5, 0);  // Initial car position
world.addBody(carBody);

// 3. Create a physics body for the ground
const groundBody = new CANNON.Body({
  mass: 0,  // Mass 0 means it's static (doesn't move)
  shape: new CANNON.Plane(),
});
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);  // Align ground with physics plane
world.addBody(groundBody);

// 4. Physics update loop
function updatePhysics() {
  world.step(1 / 60);  // Step the physics world forward

  // Sync car's Three.js position with Cannon.js position
  if (scene.children[2]) {  // Assuming the car is the 3rd child in the scene
    scene.children[2].position.copy(carBody.position);
    scene.children[2].quaternion.copy(carBody.quaternion);
  }
}
