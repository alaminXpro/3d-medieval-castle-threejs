import { camera } from "./scene.js";

let cameraAngle = 0;
let cameraRadius = 22;
const cameraHeight = 9;

const keys = {};

window.addEventListener("keydown", (event) => {
  keys[event.code] = true;

  if (
    event.code === "ArrowLeft" ||
    event.code === "ArrowRight" ||
    event.code === "ArrowUp" ||
    event.code === "ArrowDown"
  ) {
    event.preventDefault();
  }
});

window.addEventListener("keyup", (event) => {
  keys[event.code] = false;
});

export function updateCamera() {
  const rotateSpeed = 0.025;
  const zoomSpeed = 0.12;

  if (keys["ArrowLeft"] || keys["KeyA"]) {
    cameraAngle -= rotateSpeed;
  }

  if (keys["ArrowRight"] || keys["KeyD"]) {
    cameraAngle += rotateSpeed;
  }

  if (keys["ArrowUp"] || keys["KeyW"]) {
    cameraRadius -= zoomSpeed;
  }

  if (keys["ArrowDown"] || keys["KeyS"]) {
    cameraRadius += zoomSpeed;
  }

  cameraRadius = Math.max(13, Math.min(32, cameraRadius));

  camera.position.x = Math.sin(cameraAngle) * cameraRadius;
  camera.position.z = Math.cos(cameraAngle) * cameraRadius;
  camera.position.y = cameraHeight;

  camera.lookAt(0, 2.2, 0);
}
