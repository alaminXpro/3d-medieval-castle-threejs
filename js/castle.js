import * as THREE from "three";
import { scene } from "./scene.js";
import {
  stoneTexture,
  grassTexture,
  roofTexture,
  flagTexture,
  woodTexture
} from "./textures.js";

const stoneMaterial = new THREE.MeshLambertMaterial({
  map: stoneTexture
});

const grassMaterial = new THREE.MeshLambertMaterial({
  map: grassTexture
});

const roofMaterial = new THREE.MeshLambertMaterial({
  map: roofTexture
});

const flagMaterial = new THREE.MeshLambertMaterial({
  map: flagTexture,
  side: THREE.DoubleSide
});

// Ground inside and around the castle.
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(18, 18),
  grassMaterial
);

ground.rotation.x = -Math.PI / 2;
ground.position.y = 0;
scene.add(ground);

function createWall(width, height, depth, x, y, z) {
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    stoneMaterial
  );

  wall.position.set(x, y, z);
  scene.add(wall);

  return wall;
}

// Main castle walls.
createWall(12, 4, 0.6, 0, 2, -6);
createWall(0.6, 4, 12, -6, 2, 0);
createWall(0.6, 4, 12, 6, 2, 0);

// Front wall has a gap for the gate.
createWall(4.5, 4, 0.6, -3.75, 2, 6);
createWall(4.5, 4, 0.6, 3.75, 2, 6);
createWall(3, 1.4, 0.6, 0, 3.3, 6);

function createTower(x, z) {
  const tower = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.2, 5.5, 16),
    stoneMaterial
  );

  tower.position.set(x, 2.75, z);
  scene.add(tower);

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(1.5, 1.8, 16),
    roofMaterial
  );

  roof.position.set(x, 6.4, z);
  scene.add(roof);
}

createTower(-6, -6);
createTower(6, -6);
createTower(-6, 6);
createTower(6, 6);

// A simple keep in the center.
const keep = createWall(5, 4.8, 5, 0, 2.4, 0);

// Battlements are small stone blocks on top of the walls.
function addBattlements() {
  for (let x = -5.5; x <= 5.5; x += 1.3) {
    createWall(0.65, 0.75, 0.65, x, 4.35, -6);

    if (Math.abs(x) > 1.8) {
      createWall(0.65, 0.75, 0.65, x, 4.35, 6);
    }
  }

  for (let z = -4.8; z <= 4.8; z += 1.3) {
    createWall(0.65, 0.75, 0.65, -6, 4.35, z);
    createWall(0.65, 0.75, 0.65, 6, 4.35, z);
  }
}

addBattlements();

// Simple castle flag.
const flagGroup = new THREE.Group();
flagGroup.position.set(0, 5.2, 0);
scene.add(flagGroup);

const pole = new THREE.Mesh(
  new THREE.CylinderGeometry(0.05, 0.05, 3, 8),
  new THREE.MeshLambertMaterial({ map: woodTexture })
);
pole.position.y = 1.5;
flagGroup.add(pole);

const flag = new THREE.Mesh(
  new THREE.PlaneGeometry(1.8, 0.9),
  flagMaterial
);
flag.position.set(0.9, 2.3, 0);
flagGroup.add(flag);

export function updateCastle(elapsedTime) {
  // Small flag movement: easy extra animation.
  flag.rotation.y = Math.sin(elapsedTime * 2) * 0.15;
}

export {
  keep
};
