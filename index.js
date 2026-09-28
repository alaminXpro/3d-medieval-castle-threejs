import { camera, renderer } from "./js/scene.js";
import { updateCamera } from "./js/camera.js";
import "./js/lights.js";
import { updateCastle } from "./js/castle.js";
import { updateDrawbridge } from "./js/drawbridge.js";
import { updateSky } from "./js/sky.js";
import { updateWater } from "./js/water.js";
import "./css/style.css";

import { scene } from "./js/scene.js";
import * as THREE from "three";

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  updateCamera();
  updateDrawbridge();
  updateSky();
  updateWater(elapsedTime);
  updateCastle(elapsedTime);

  renderer.render(scene, camera);
}

animate();

function handleWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}

window.addEventListener("resize", handleWindowResize);
