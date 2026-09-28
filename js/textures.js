import * as THREE from "three";

const loader = new THREE.TextureLoader();

function loadTexture(path, repeatX = 1, repeatY = 1) {
  const texture = loader.load(path);

  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
}

const stoneTexture = loadTexture("/models/Textures/stone.png", 3, 2);
const woodTexture = loadTexture("/models/Textures/wood.png", 2, 4);
const grassTexture = loadTexture("/models/Textures/grass.png", 8, 8);
const roofTexture = loadTexture("/models/Textures/roof.png", 2, 2);
const flagTexture = loadTexture("/models/Textures/flag.png", 1, 1);
const waterTexture = loadTexture("/models/Textures/water.png", 5, 5);

export {
  stoneTexture,
  woodTexture,
  grassTexture,
  roofTexture,
  flagTexture,
  waterTexture
};
