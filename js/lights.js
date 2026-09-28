import * as THREE from "three";
import { scene } from "./scene.js";

// Soft light so every side of the castle is visible.
const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
scene.add(ambientLight);

// Main sunlight.
const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
sunLight.position.set(10, 18, 12);
scene.add(sunLight);

export {
  ambientLight,
  sunLight
};
