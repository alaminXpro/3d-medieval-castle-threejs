import * as THREE from "three";
import { scene } from "./scene.js";
import { CANNON_RADIUS, shotSpeed } from "./game-rules.js";
import { woodTexture, metalTexture, paperTexture, grassTexture, roofTexture } from "./textures.js";
const wood = new THREE.MeshStandardMaterial({ map: woodTexture, roughness: 0.8 });
const metal = new THREE.MeshStandardMaterial({ map: metalTexture, metalness: 0.35, roughness: 0.55 });
const brass = new THREE.MeshStandardMaterial({ map: metalTexture, color: 0xdcb66d, metalness: 0.3 });
const cannon = new THREE.Group(); scene.add(cannon);
function add(geometry, material, x, y, z, parent = cannon) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
add(new THREE.BoxGeometry(1.6, 0.45, 1.7), wood, 0, 0.6, 0);
for (const x of [-0.94, 0.94]) {
  const wheel = add(new THREE.CylinderGeometry(0.55, 0.55, 0.2, 16), wood, x, 0.53, 0.15);
  wheel.rotation.z = Math.PI / 2;
  const rim = add(new THREE.TorusGeometry(0.46, 0.06, 6, 16), metal, x * 1.13, 0.53, 0.15);
  rim.rotation.y = Math.PI / 2;
  add(new THREE.SphereGeometry(0.13, 8, 8), brass, x * 1.15, 0.53, 0.15);
}
const yaw = new THREE.Group(); yaw.position.y = 1.16; cannon.add(yaw);
const elevation = new THREE.Group(); yaw.add(elevation);
const barrel = new THREE.Group(); elevation.add(barrel);
add(new THREE.CylinderGeometry(0.32, 0.43, 2.1, 16, 1, true), metal, 0, 0, 0.76, barrel).rotation.x = Math.PI / 2;
add(new THREE.TorusGeometry(0.34, 0.075, 8, 20), brass, 0, 0, 1.8, barrel);
add(new THREE.CircleGeometry(0.29, 16), new THREE.MeshStandardMaterial({ map: metalTexture, color: 0x111719, side: THREE.DoubleSide }), 0, 0, 1.69, barrel);
add(new THREE.SphereGeometry(0.42, 12, 8), metal, 0, 0, -0.25, barrel);
const student = new THREE.Group(); student.position.set(1.48, 0, 0.35); cannon.add(student);
const jacket = new THREE.MeshStandardMaterial({ map: grassTexture, color: 0x3d7971 });
const skin = new THREE.MeshStandardMaterial({ map: paperTexture, color: 0xdca873 });
const hat = new THREE.MeshStandardMaterial({ map: roofTexture, color: 0xfbc46b });
const trousers = new THREE.MeshStandardMaterial({ map: metalTexture });
add(new THREE.CylinderGeometry(0.24, 0.32, 0.6, 8), jacket, 0, 0.91, 0, student);
add(new THREE.SphereGeometry(0.27, 12, 8), skin, 0, 1.43, 0, student);
add(new THREE.SphereGeometry(0.29, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), hat, 0, 1.48, 0, student);
for (const x of [-0.14, 0.14]) {
  add(new THREE.BoxGeometry(0.19, 0.48, 0.23), trousers, x, 0.36, 0, student);
  add(new THREE.BoxGeometry(0.22, 0.16, 0.34), trousers, x, 0.13, -0.07, student);
  add(new THREE.SphereGeometry(0.035, 6, 6), metal, x * 0.65, 1.47, -0.24, student);
}
add(new THREE.BoxGeometry(0.4, 0.45, 0.22), hat, 0, 0.98, 0.24, student);
add(new THREE.CylinderGeometry(0.09, 0.1, 0.5, 8), jacket, -0.34, 0.93, -0.04, student).rotation.z = -0.4;
add(new THREE.CylinderGeometry(0.09, 0.1, 0.5, 8), jacket, 0.34, 0.93, -0.04, student).rotation.z = 0.4;
let recoil = 0;
export function updateCannon(angle, aim, pitch, delta, time) {
  cannon.position.set(Math.sin(angle) * CANNON_RADIUS, 0.06, Math.cos(angle) * CANNON_RADIUS);
  cannon.rotation.y = angle;
  yaw.rotation.y = Math.PI + aim;
  elevation.rotation.x = -pitch;
  recoil *= Math.exp(-delta * 10);
  barrel.position.z = -recoil;
  student.rotation.z = Math.sin(time * 2) * 0.025;
  cannon.updateMatrixWorld(true);
}
export function launchParameters(power) {
  const origin = elevation.localToWorld(new THREE.Vector3(0, 0, 2.05));
  const direction = new THREE.Vector3(0, 0, 1).transformDirection(elevation.matrixWorld);
  return { origin, velocity: direction.multiplyScalar(shotSpeed(power)) };
}
export function kickCannon() { recoil = 0.45; }
