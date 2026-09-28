import * as THREE from "three";
import { scene } from "./scene.js";
import { waterTexture } from "./textures.js";
import vertexShader from "./shaders/waterVertex.glsl?raw";
import fragmentShader from "./shaders/waterFragment.glsl?raw";

const waterUniforms = {
  uTime: { value: 0 },
  uWaterTexture: { value: waterTexture }
};

const waterMaterial = new THREE.ShaderMaterial({
  uniforms: waterUniforms,
  vertexShader,
  fragmentShader,
  transparent: true,
  side: THREE.DoubleSide
});

const water = new THREE.Mesh(
  new THREE.PlaneGeometry(34, 34, 35, 35),
  waterMaterial
);

water.rotation.x = -Math.PI / 2;
water.position.y = -0.35;
scene.add(water);

export function updateWater(elapsedTime) {
  waterUniforms.uTime.value = elapsedTime;
}
