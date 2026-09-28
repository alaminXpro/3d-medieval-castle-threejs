import * as THREE from "three";
import { scene } from "./scene.js";
import { ambientLight, sunLight } from "./lights.js";

const dayColor = new THREE.Color(0x87ceeb);
const nightColor = new THREE.Color(0x08152e);

const targetColor = dayColor.clone();
let targetSun = 1.0;
let targetAmbient = 0.55;

const dayButton = document.getElementById("dayButton");
const nightButton = document.getElementById("nightButton");

dayButton.addEventListener("click", () => {
  targetColor.copy(dayColor);
  targetSun = 1.0;
  targetAmbient = 0.55;
});

nightButton.addEventListener("click", () => {
  targetColor.copy(nightColor);
  targetSun = 0.2;
  targetAmbient = 0.3;
});

export function updateSky() {
  // Smooth sky-color animation between day and night.
  scene.background.lerp(targetColor, 0.04);

  sunLight.intensity +=
    (targetSun - sunLight.intensity) * 0.04;

  ambientLight.intensity +=
    (targetAmbient - ambientLight.intensity) * 0.04;
}
