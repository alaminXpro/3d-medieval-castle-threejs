import * as THREE from "three";

const width = window.innerWidth;
const height = window.innerHeight;

// Main scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

// Perspective projection
const camera = new THREE.PerspectiveCamera(
  60,
  width / height,
  0.1,
  1000
);

camera.position.set(0, 9, 22);
camera.lookAt(0, 2, 0);

// WebGL renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

document.body.appendChild(renderer.domElement);

export {
  scene,
  camera,
  renderer
};
