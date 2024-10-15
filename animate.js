// Main animation loop
function animate() {
  requestAnimationFrame(animate);

  // 1. Update physics
  updatePhysics();

  // 2. Render the scene with the camera
  controls.update();  // OrbitControls for mouse interaction
  renderer.render(scene, camera);
}

animate();
