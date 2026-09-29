import * as THREE from "three";
import { scene } from "./scene.js";
import { woodTexture, metalTexture } from "./textures.js";
import { bridgeAngleAt } from "./game-rules.js";
const wood = new THREE.MeshStandardMaterial({ map: woodTexture, roughness: 0.9, side: THREE.DoubleSide });
const metal = new THREE.MeshStandardMaterial({ map: metalTexture, roughness: 0.75 });
const pivot = new THREE.Group();
pivot.position.set(0, 0.18, 9.15); scene.add(pivot);
export const bridge = new THREE.Mesh(new THREE.BoxGeometry(3, 0.24, 4.85), wood);
bridge.position.z = 2.425; bridge.castShadow = bridge.receiveShadow = true; bridge.userData.bridge = true;
pivot.add(bridge);
for (const x of [-1.35, 1.35]) {
  const brace = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 4.7), metal);
  brace.position.set(x, 0.145, 2.425); pivot.add(brace);
}
const chains = [-1.3, 1.3].map(x => {
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.24, 3.4, 0.24), wood);
  post.position.set(x * 1.28, 1.7, 9.12); post.castShadow = true; scene.add(post);
  const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1, 6), metal);
  scene.add(chain);
  return { x, mesh: chain, anchor: new THREE.Vector3(x * 1.28, 3.25, 9.12) };
});
const up = new THREE.Vector3(0, 1, 0);
export function updateDrawbridge(age, unlocked) {
  pivot.rotation.x = unlocked ? bridgeAngleAt(age) : -Math.PI / 2;
  pivot.updateMatrixWorld(true);
  for (const chain of chains) {
    const end = pivot.localToWorld(new THREE.Vector3(chain.x, 0.12, 4.65));
    const direction = end.clone().sub(chain.anchor);
    chain.mesh.position.copy(end).add(chain.anchor).multiplyScalar(0.5);
    chain.mesh.scale.y = direction.length();
    chain.mesh.quaternion.setFromUnitVectors(up, direction.normalize());
  }
}
export function isBridgeOpen() { return pivot.rotation.x > -0.12; }
export function bridgeState() {
  if (isBridgeOpen()) return "OPEN";
  return pivot.rotation.x < -1.45 ? "CLOSED" : "MOVING";
}
