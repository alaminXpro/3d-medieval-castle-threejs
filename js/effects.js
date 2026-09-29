import * as THREE from "three";
import { scene } from "./scene.js";
import { paperTexture, waterTexture } from "./textures.js";
const geometry = new THREE.BoxGeometry(0.12, 0.08, 0.16);
const paper = new THREE.MeshStandardMaterial({ map: paperTexture, roughness: 1 });
const mint = new THREE.MeshStandardMaterial({ map: paperTexture, color: 0x73bca3 });
const gold = new THREE.MeshStandardMaterial({ map: paperTexture, color: 0xe7ba52 });
const coral = new THREE.MeshStandardMaterial({ map: paperTexture, color: 0xcc6146 });
const water = new THREE.MeshStandardMaterial({ map: waterTexture, roughness: 0.45 });
const pieces = [];
export function burst(position, type = "hit", count = 28) {
  const materials = type === "water" ? [water] : type === "win" ? [paper, mint, gold, coral] : [paper, gold];
  for (let i = 0; i < count; i++) {
    const mesh = new THREE.Mesh(geometry, materials[i % materials.length]);
    mesh.position.copy(position); mesh.scale.setScalar(0.7 + Math.random() * 1.8); scene.add(mesh);
    pieces.push({ mesh, velocity: new THREE.Vector3((Math.random() - 0.5) * 5, 2 + Math.random() * 5, (Math.random() - 0.5) * 5), age: 0, life: 1.1 + Math.random() * 1.1 });
  }
}
export function updateEffects(delta) {
  for (let i = pieces.length - 1; i >= 0; i--) {
    const piece = pieces[i]; piece.age += delta; piece.velocity.y -= delta * 7;
    piece.mesh.position.addScaledVector(piece.velocity, delta);
    piece.mesh.rotation.x += delta * 5; piece.mesh.rotation.z += delta * 3;
    if (piece.age > piece.life) { scene.remove(piece.mesh); pieces.splice(i, 1); }
  }
}
export function clearEffects() { for (const piece of pieces) scene.remove(piece.mesh); pieces.length = 0; }
