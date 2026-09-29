import "./css/style.css";

// Dynamic import lets us show a useful message if WebGL is unavailable.
async function boot() {
  try {
    const { tick } = await import("./js/game.js");
    const { camera, renderer } = await import("./js/scene.js");
    let previous = performance.now();
    function animate(now) {
      const delta = Math.min(Math.max((now - previous) / 1000, 0), 0.1);
      previous = now;
      tick(delta);
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
    window.addEventListener("resize", () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    });
  } catch (error) {
    console.error("Deadline Siege could not start:", error);
    document.querySelector("#error-message").hidden = false;
  }
}
boot();
