import * as THREE from "three";
import { camera } from "./scene.js";
let radius = 37;
let renderedAngle = 0;
let framing = 1;
export function zoomCamera(amount) { radius = THREE.MathUtils.clamp(radius + amount, 27, 43); }
export function resetCamera() { radius = 37; renderedAngle = 0; }
export function updateCamera(angle, delta, ready) {
  const targetAngle = ready ? 0.35 : angle;
  renderedAngle += (targetAngle - renderedAngle) * (1 - Math.exp(-delta * 6));
  // On narrow screens the wider framing keeps the castle inside the viewport.
  const responsiveRadius = radius + Math.max(0, 1.35 - camera.aspect) * 15;
  camera.position.set(Math.sin(renderedAngle) * responsiveRadius, responsiveRadius * 0.5, Math.cos(renderedAngle) * responsiveRadius);
  camera.lookAt(0, 0.5, 0);
  framing += ((ready ? 1 : 0) - framing) * (1 - Math.exp(-delta * 5));
  const narrow = camera.aspect < 1;
  camera.setViewOffset(innerWidth, innerHeight, -innerWidth * (narrow ? 0.12 : 0.18) * framing, -innerHeight * (narrow ? 0.19 : 0.015) * framing, innerWidth, innerHeight);
  camera.updateMatrixWorld();
}
