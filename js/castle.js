import * as THREE from "three";
import { scene } from "./scene.js";
import { stoneTexture, grassTexture, roofTexture, woodTexture, flagTexture, paperTexture, targetTexture, signTexture } from "./textures.js";
import { TARGETS } from "./game-rules.js";
import flagVertex from "./shaders/flagVertex.glsl?raw";
import flagFragment from "./shaders/flagFragment.glsl?raw";

export const solids = [];
export const targets = [];
const roofs = [];
const stone = new THREE.MeshStandardMaterial({ map: stoneTexture, roughness: 0.94 });
const trim = new THREE.MeshStandardMaterial({ map: stoneTexture, color: 0xfce8bb, roughness: 0.9 });
const grass = new THREE.MeshStandardMaterial({ map: grassTexture, roughness: 1 });
const roof = new THREE.MeshStandardMaterial({ map: roofTexture, roughness: 0.85 });
const wood = new THREE.MeshStandardMaterial({ map: woodTexture, roughness: 0.9 });
const dark = new THREE.MeshStandardMaterial({ map: woodTexture, color: 0x343e36 });
const path = new THREE.MeshStandardMaterial({ map: stoneTexture, color: 0xc7b79a, roughness: 1 });

function mesh(geometry, material, x, y, z, solid = false, parent = scene) {
  const item = new THREE.Mesh(geometry, material);
  item.position.set(x, y, z); item.castShadow = true; item.receiveShadow = true;
  parent.add(item);
  if (solid) solids.push(item);
  return item;
}
function box(w, h, d, x, y, z, material = stone, solid = true, parent = scene) {
  return mesh(new THREE.BoxGeometry(w, h, d), material, x, y, z, solid, parent);
}

// A little island diorama, with a real gap between the inner lawn and outer bank.
mesh(new THREE.CylinderGeometry(24, 23, 1.3, 96), stone, 0, -1.25, 0);
mesh(new THREE.CylinderGeometry(10.2, 10.2, 0.9, 96), grass, 0, -0.4, 0, true);
const outer = mesh(new THREE.RingGeometry(13.75, 24, 96), grass, 0, 0.015, 0, true);
outer.rotation.x = -Math.PI / 2;
const road = mesh(new THREE.RingGeometry(15.7, 17.95, 96), path, 0, 0.035, 0);
road.rotation.x = -Math.PI / 2;
for (const radius of [10.3, 13.8]) {
  const rim = mesh(new THREE.TorusGeometry(radius, 0.13, 6, 96), trim, 0, -0.02, 0);
  rim.rotation.x = Math.PI / 2;
}
box(3, 0.16, 4.2, 0, 0.08, 7.55, path);
box(2.8, 0.08, 8, 0, 0.08, 1.9, path);

// Preserve the MVP's five wall sections and open central gate.
box(12, 4, 0.65, 0, 2, -6);
box(0.65, 4, 12, -6, 2, 0);
box(0.65, 4, 12, 6, 2, 0);
box(4.5, 4, 0.65, -3.75, 2, 6);
box(4.5, 4, 0.65, 3.75, 2, 6);
box(3, 1.4, 0.65, 0, 3.3, 6);
for (const x of [-1.65, 1.65]) box(0.3, 2.7, 0.9, x, 1.35, 6, trim);
box(3.5, 0.22, 1, 0, 2.7, 6, trim);
for (let n = -5.2; n <= 5.3; n += 1.15) {
  box(0.66, 0.65, 0.75, n, 4.25, -6, trim);
  if (Math.abs(n) > 1.65) box(0.66, 0.65, 0.75, n, 4.25, 6, trim);
  box(0.75, 0.65, 0.66, -6, 4.25, n, trim);
  box(0.75, 0.65, 0.66, 6, 4.25, n, trim);
}
function tower(x, z, id) {
  mesh(new THREE.CylinderGeometry(1.25, 1.42, 5.6, 12), stone, x, 2.8, z, true);
  mesh(new THREE.CylinderGeometry(1.42, 1.42, 0.25, 12), trim, x, 5.5, z, true);
  const top = mesh(new THREE.ConeGeometry(1.85, 2.15, 12), roof, x, 6.7, z, true);
  roofs.push({ id, mesh: top, home: top.position.clone(), age: -1 });
  mesh(new THREE.SphereGeometry(0.16, 8, 6), trim, x, 7.85, z);
  if (z < 0) {
    box(0.35, 1, 0.08, x, 3.7, z + 1.24, dark, false);
    box(0.45, 0.12, 0.13, x, 3.2, z + 1.28, trim, false);
  }
}
tower(-6, 6, "classes"); tower(6, 6, "quizzes"); tower(-6, -6); tower(6, -6);

// The university's main hall.
box(5.3, 5.6, 4.8, 0, 2.8, -1.5);
mesh(new THREE.ConeGeometry(4.05, 2.9, 4), roof, 0, 7, -1.5, true).rotation.y = Math.PI / 4;
for (const x of [-1.7, 0, 1.7]) {
  for (const y of [2.2, 4.35]) {
    box(0.55, 1, 0.09, x, y, 0.96, dark, false);
    box(0.72, 0.15, 0.2, x, y - 0.5, 1, trim, false);
  }
}
const crest = mesh(new THREE.PlaneGeometry(3.5, 1.05), new THREE.MeshStandardMaterial({
  map: signTexture("PROCRASTINATION", "UNIVERSITY  •  EST. 1404", "#3b6052"),
}), 0, 4.38, 6.42);
crest.castShadow = false;

const flagUniforms = { uTime: { value: 0 }, uMap: { value: flagTexture }, uDaylight: { value: 1 } };
box(0.08, 2.65, 0.08, 0, 9.2, -1.5, wood, false);
mesh(new THREE.PlaneGeometry(1.9, 1.08, 18, 6), new THREE.ShaderMaterial({
  uniforms: flagUniforms, vertexShader: flagVertex, fragmentShader: flagFragment, side: THREE.DoubleSide,
}), 0.97, 9.75, -1.5);

// Bullseyes sit ahead of the tower surface, so the nearest hit is the target.
for (const definition of TARGETS) {
  const group = new THREE.Group();
  group.position.set(definition.x, definition.y, definition.z);
  scene.add(group);
  const size = definition.id === "final" ? 0.85 : 1.03;
  const face = mesh(new THREE.CylinderGeometry(size, size, 0.16, 32), new THREE.MeshStandardMaterial({ map: targetTexture, roughness: 0.8 }), 0, 0, 0, false, group);
  face.rotation.x = Math.PI / 2;
  face.userData.targetId = definition.id;
  // A separate mapped circle keeps the bullseye UVs correct.
  const circle = mesh(new THREE.CircleGeometry(size * 0.96, 32), new THREE.MeshStandardMaterial({ map: targetTexture, side: THREE.DoubleSide }), 0, 0, 0.095, false, group);
  circle.userData.targetId = definition.id;
  let label = null;
  if (definition.id !== "final") {
    label = mesh(new THREE.PlaneGeometry(3.35, 1.18), new THREE.MeshStandardMaterial({
      map: signTexture(definition.id === "classes" ? "8 AM CLASSES" : "SURPRISE QUIZ", "ONE HIT TO CANCEL"),
      side: THREE.DoubleSide,
    }), 0, -1.62, 0.1, false, group);
  }
  targets.push({ ...definition, group, face, circle, label, size, destroyed: false });
}

// Low-poly landscaping, generated from geometry and our own textures.
function tree(x, z, scale = 1) {
  const group = new THREE.Group(); scene.add(group); group.position.set(x, 0, z); group.scale.setScalar(scale);
  mesh(new THREE.CylinderGeometry(0.13, 0.2, 1.3, 6), wood, 0, 0.65, 0, false, group);
  for (let i = 0; i < 3; i++) mesh(new THREE.ConeGeometry(0.95 - i * 0.18, 1.6, 7), grass, 0, 1.7 + i * 0.6, 0, false, group);
}
for (let i = 0; i < 22; i++) {
  const angle = i * 2.39996;
  const radius = 19.9 + Math.sin(i * 12.4) * 1.5;
  // Keep the firing ring clear and the front camera sightline open.
  if (Math.cos(angle) > 0.7) continue;
  tree(Math.sin(angle) * radius, Math.cos(angle) * radius, 0.75 + (i % 4) * 0.13);
}
for (const [x, z] of [[-8, -1], [8.2, -2], [-3, -8], [3, -8]]) tree(x, z, 0.65);
for (let i = 0; i < 32; i++) {
  const angle = i * 2.39996, radius = 18.8 + Math.sin(i * 7) * 3;
  mesh(new THREE.DodecahedronGeometry(0.18 + (i % 3) * 0.08, 0), stone, Math.sin(angle) * radius, 0.12, Math.cos(angle) * radius);
}

// Soft geometric clouds use a mapped paper material.
const clouds = new THREE.Group(); scene.add(clouds);
const cloudMaterial = new THREE.MeshStandardMaterial({ map: paperTexture, color: 0xffffff, roughness: 1 });
for (const [x, y, z] of [[-23, 17, -22], [20, 20, -28], [-7, 21, -32]]) {
  for (let i = 0; i < 3; i++) {
    const puff = mesh(new THREE.SphereGeometry(1.6, 10, 8), cloudMaterial, x + i * 1.7, y + (i % 2) * 0.6, z, false, clouds);
    puff.scale.set(1.3, 0.55, 0.65); puff.castShadow = false;
  }
}

export function destroyTarget(id) {
  const target = targets.find(item => item.id === id);
  if (target) { target.destroyed = true; target.group.visible = false; }
  const top = roofs.find(item => item.id === id);
  if (top) top.age = 0;
}
export function resetCastle() {
  for (const target of targets) { target.destroyed = false; target.group.visible = true; }
  for (const top of roofs) { top.age = -1; top.mesh.visible = true; top.mesh.position.copy(top.home); top.mesh.rotation.set(0, 0, 0); }
}
export function updateCastle(time, delta, progress, unlocked) {
  flagUniforms.uTime.value = time;
  flagUniforms.uDaylight.value = 1 - progress * 0.35;
  clouds.position.x = Math.sin(time * 0.035) * 1.7;
  const final = targets[2];
  final.face.material.color.set(unlocked ? 0xffffff : 0x777b6c);
  final.circle.material.color.set(unlocked ? 0xffffff : 0x777b6c);
  for (const top of roofs) {
    if (top.age < 0) continue;
    top.age += delta;
    top.mesh.position.x = top.home.x + Math.sign(top.home.x) * top.age * 2.2;
    top.mesh.position.y = top.home.y + top.age * 2.3 - top.age * top.age * 4;
    top.mesh.rotation.z = Math.sign(top.home.x) * top.age * 1.5;
    top.mesh.rotation.x = top.age * 0.8;
    if (top.age > 1.7) top.mesh.visible = false;
  }
}
