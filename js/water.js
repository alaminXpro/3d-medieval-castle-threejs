import * as THREE from "three";
import { scene } from "./scene.js";
import { waterTexture } from "./textures.js";
import vertexShader from "./shaders/waterVertex.glsl?raw";
import fragmentShader from "./shaders/waterFragment.glsl?raw";
const uniforms = { uTime: { value: 0 }, uDaylight: { value: 1 }, uWaterTexture: { value: waterTexture } };
const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, side: THREE.DoubleSide });
const water = new THREE.Mesh(new THREE.RingGeometry(10.15, 13.8, 128, 10), material);
water.rotation.x = -Math.PI / 2;
water.position.y = -0.16;
scene.add(water);
export function updateWater(time, progress) {
  uniforms.uTime.value = time;
  uniforms.uDaylight.value = 1 - progress * 0.4;
}
