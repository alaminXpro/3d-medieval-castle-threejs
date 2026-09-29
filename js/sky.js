import * as THREE from "three";
import { scene } from "./scene.js";
import { ambientLight, sunLight } from "./lights.js";
const day = new THREE.Color(0xcbd5c3);
const sunset = new THREE.Color(0xd18c73);
const night = new THREE.Color(0x56577b);
const warmSun = new THREE.Color(0xffc481);
const noonSun = new THREE.Color(0xffe4b5);
export function updateSky(progress) {
  const t = THREE.MathUtils.clamp(progress, 0, 1);
  scene.background.copy(day).lerp(sunset, Math.min(t * 1.35, 1));
  if (t > 0.78) scene.background.lerp(night, (t - 0.78) / 0.22 * 0.65);
  scene.fog.color.copy(scene.background);
  sunLight.color.copy(noonSun).lerp(warmSun, t);
  sunLight.intensity = 3.2 - t * 1.9;
  sunLight.position.y = 24 - t * 18;
  ambientLight.intensity = 2.1 - t * 0.75;
}
