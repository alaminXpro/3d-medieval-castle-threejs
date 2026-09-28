import * as THREE from "three";
import { scene, renderer } from "./scene.js";
import { woodTexture } from "./textures.js";

const woodMaterial = new THREE.MeshLambertMaterial({
  map: woodTexture
});

// Group is placed at the hinge of the drawbridge.
const bridgePivot = new THREE.Group();
bridgePivot.position.set(0, 0.2, 6.3);
scene.add(bridgePivot);

const bridge = new THREE.Mesh(
  new THREE.BoxGeometry(3, 0.25, 4.5),
  woodMaterial
);

// Move the bridge forward from the hinge.
bridge.position.z = 2.25;
bridgePivot.add(bridge);

let targetAngle = 0;

// Mouse interaction: click the 3D scene to raise or lower the bridge.
renderer.domElement.addEventListener("click", () => {
  if (targetAngle === 0) {
    targetAngle = -Math.PI / 2;
  } else {
    targetAngle = 0;
  }
});

export function updateDrawbridge() {
  bridgePivot.rotation.x +=
    (targetAngle - bridgePivot.rotation.x) * 0.08;
}
