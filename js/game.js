import * as THREE from "three";
import { scene, camera, renderer } from "./scene.js";
import { updateCamera, zoomCamera, resetCamera } from "./camera.js";
import { solids, targets, destroyTarget, resetCastle, updateCastle } from "./castle.js";
import { bridge, updateDrawbridge, isBridgeOpen, bridgeState } from "./drawbridge.js";
import { updateSky } from "./sky.js";
import { updateWater } from "./water.js";
import { updateCannon, launchParameters, kickCannon } from "./cannon.js";
import { burst, updateEffects, clearEffects } from "./effects.js";
import { paperTexture } from "./textures.js";
import { ROUND_SECONDS, MAX_SHOTS, createRound, startRound, canFire, spendShot, hitTarget, resolveShot, advanceRound, togglePause, finalUnlocked, trajectoryPoint, segmentBox } from "./game-rules.js";

const $ = selector => document.querySelector(selector);
const canvas = renderer.domElement;
let round = createRound();
let angle = 0, aim = 0.5, pitch = 0.48, power = 0.65;
let charging = false, chargeAge = 0, activePointer = null, touchOrbit = 0;
let projectile = null, worldTime = 0, toastTime = 0, dialogMode = null;
let focusBeforeDialog = null;
const keys = new Set();
const raycaster = new THREE.Raycaster();
const direction = new THREE.Vector3();
const collisionEntries = [];
const shotGeometry = new THREE.IcosahedronGeometry(0.23, 1);
const shotMaterial = new THREE.MeshStandardMaterial({ map: paperTexture, roughness: 1, flatShading: true });
const dotGeometry = new THREE.SphereGeometry(0.055, 6, 5);
const dots = new THREE.InstancedMesh(dotGeometry, new THREE.MeshBasicMaterial({ map: paperTexture, color: 0xffefc3, transparent: true, opacity: 0.8 }), 85);
dots.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
dots.frustumCulled = false;
scene.add(dots);
const endpoint = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.035, 6, 24), new THREE.MeshBasicMaterial({ map: paperTexture, color: 0xecc477, depthTest: false }));
endpoint.renderOrder = 5; scene.add(endpoint);
const matrix = new THREE.Matrix4();
const scratchPoint = new THREE.Vector3();

function toast(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("visible");
  toastTime = 3.3;
}
function clearInput() {
  charging = false; chargeAge = 0; power = 0.65; keys.clear(); touchOrbit = 0;
  if (activePointer !== null && canvas.hasPointerCapture(activePointer)) canvas.releasePointerCapture(activePointer);
  activePointer = null;
}
function removeProjectile() {
  if (projectile) scene.remove(projectile.mesh);
  projectile = null;
}
function setDialog(mode) {
  dialogMode = mode;
  const backdrop = $("#dialog-backdrop");
  const visible = mode !== null;
  if (visible && backdrop.hidden) focusBeforeDialog = document.activeElement;
  backdrop.hidden = !visible;
  for (const element of document.querySelectorAll("body > :not(#dialog-backdrop):not(script)")) element.inert = visible;
  if (!visible) {
    if (focusBeforeDialog?.isConnected) focusBeforeDialog.focus({ preventScroll: true });
    return;
  }
  $("#help-content").hidden = mode !== "help";
  $("#result-stats").hidden = !["won", "lost"].includes(mode);
  $("#dialog-secondary").hidden = mode === "help" && round.status === "ready";
  const content = {
    help: ["FIELD GUIDE", "?", "A very short syllabus.", "Your assignments finally have a purpose.", round.status === "ready" ? "Got it. Let’s rebel." : "Back to the rebellion"],
    paused: ["A WELL-EARNED BREAK", "Ⅱ", "Rebellion on pause.", "Even revolutions deserve a tea break. Your timer is paused.", "Back to the rebellion"],
    won: ["MISSION ACCOMPLISHED", "⚑", "Finals cancelled.", "CGPA protected. The entire campus owes you a nap.", "One more rebellion"],
    lost: ["ACADEMICALLY OUTMANEUVERED", "⌛", "See you next semester.", round.reason === "timeout" ? "The sun set. The deadlines didn’t. Try a little less procrastination." : "Out of assignments. Unfortunately, the university has plenty more.", "Try again"],
  }[mode];
  $("#dialog-eyebrow").textContent = content[0];
  $("#dialog-icon").textContent = content[1];
  $("#dialog-title").textContent = content[2];
  $("#dialog-description").textContent = content[3];
  $("#dialog-primary").innerHTML = content[4] + ' <span aria-hidden="true">↗</span>';
  $("#dialog-secondary").textContent = mode === "won" || mode === "lost" ? "Back to campus" : "Start over";
  $("#result-stats").innerHTML = '<span><b>' + round.destroyed.length + '/3</b>cancelled</span><span><b>' + (MAX_SHOTS - round.ammo) + '</b>shots fired</span><span><b>' + Math.ceil(ROUND_SECONDS - round.elapsed) + 's</b>to sunset</span>';
  $("#dialog-primary").focus({ preventScroll: true });
}
function reset(ready = false) {
  clearInput(); removeProjectile(); clearEffects(); resetCastle(); resetCamera();
  round = ready ? createRound() : startRound();
  angle = 0; aim = 0.5; pitch = 0.48; worldTime = 0; toastTime = 0;
  $("#toast").classList.remove("visible");
  setDialog(null); updateHud();
  if (!ready) canvas.focus({ preventScroll: true });
  if (!ready) toast("Aim for the tower bullseyes. Make your assignments count.");
}
function pause(help = false) {
  if (round.status === "playing") round = togglePause(round);
  clearInput();
  setDialog(help ? "help" : "paused");
  updateHud();
}
function resume() {
  if (round.status === "paused") round = togglePause(round);
  setDialog(null); updateHud();
  if (round.status === "playing") canvas.focus({ preventScroll: true });
}
function beginCharge() {
  if (!canFire(round) || dialogMode || charging) return;
  charging = true; chargeAge = 0; power = 0.35;
}
function fire() {
  if (!charging) return;
  charging = false;
  if (!canFire(round)) return;
  const launch = launchParameters(power);
  const mesh = new THREE.Mesh(shotGeometry, shotMaterial);
  mesh.position.copy(launch.origin); mesh.castShadow = true; scene.add(mesh);
  projectile = { mesh, origin: launch.origin.clone(), velocity: launch.velocity.clone(), age: 0 };
  round = spendShot(round); kickCannon(); power = 0.65;
  updateHud();
}

// A broad-phase box test avoids raycasting every triangle in the island for every guide dot.
function prepareCollisions() {
  scene.updateMatrixWorld(true);
  collisionEntries.length = 0;
  for (const mesh of [...solids, bridge]) {
    if (!mesh.visible) continue;
    if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
    collisionEntries.push({ mesh, box: mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld) });
  }
}
function collision(start, end) {
  const length = direction.subVectors(end, start).length();
  if (length < 1e-8) return null;
  let nearest = null;
  raycaster.set(start, direction.normalize()); raycaster.near = 0; raycaster.far = length;
  for (const entry of collisionEntries) {
    const { min, max } = entry.box;
    if (segmentBox(start, end, min, max) === null) continue;
    const hit = raycaster.intersectObject(entry.mesh, false)[0];
    if (hit && (!nearest || hit.distance < nearest.distance)) nearest = {
      distance: hit.distance, point: hit.point, type: entry.mesh === bridge ? "bridge" : "wall",
    };
  }
  for (const target of targets) {
    if (target.destroyed) continue;
    const radius = target.size + 0.07;
    const t = segmentBox(start, end,
      { x: target.x - radius, y: target.y - radius, z: target.z - 0.12 },
      { x: target.x + radius, y: target.y + radius, z: target.z + 0.2 });
    if (t === null) continue;
    const point = start.clone().lerp(end, t);
    // Rounded face; reject the empty corners of the target's bounding box.
    if ((point.x - target.x) ** 2 + (point.y - target.y) ** 2 > radius ** 2) continue;
    const distance = length * t;
    if (!nearest || distance < nearest.distance) nearest = { distance, point, type: "target", id: target.id };
  }
  if (end.y <= -0.14 && start.y > -0.14) {
    const t = (start.y + 0.14) / (start.y - end.y);
    const point = start.clone().lerp(end, t), radius = Math.hypot(point.x, point.z);
    const distance = length * t;
    if (!nearest || distance < nearest.distance) nearest = { distance, point, type: radius > 10.1 && radius < 13.9 ? "water" : "ground" };
  }
  return nearest;
}
function updateGuide() {
  const visible = canFire(round) && !dialogMode;
  dots.visible = endpoint.visible = visible;
  if (!visible) return;
  const launch = launchParameters(power);
  let previous = launch.origin.clone(), last = previous, impact = null, count = 0;
  for (let i = 1; i <= 85; i++) {
    const p = trajectoryPoint(launch.origin, launch.velocity, i * 0.045);
    const next = new THREE.Vector3(p.x, p.y, p.z);
    impact = collision(previous, next);
    last = impact ? impact.point : next;
    matrix.makeTranslation(last.x, last.y, last.z); dots.setMatrixAt(count++, matrix);
    if (impact || next.y < -2) break;
    previous = next;
  }
  dots.count = count; dots.instanceMatrix.needsUpdate = true;
  endpoint.position.copy(last); endpoint.quaternion.copy(camera.quaternion);
  const validTarget = impact?.type === "target" && (impact.id !== "final" || (finalUnlocked(round) && isBridgeOpen()));
  endpoint.material.color.set(validTarget ? 0x6bcf9e : 0xeac37b);
  dots.material.color.set(validTarget ? 0xa6dfb9 : 0xffefc3);
}
function impactShot(hit) {
  if (hit.type === "target") {
    const before = round;
    round = hitTarget(round, hit.id, isBridgeOpen());
    if (round !== before) {
      destroyTarget(hit.id); burst(hit.point, "hit", 38);
      if (hit.id === "final") { burst(new THREE.Vector3(0, 7, 5), "win", 100); toast("Finals cancelled. CGPA protected."); }
      else if (finalUnlocked(round)) toast("Final exam unlocked! Move to the front. Wait for the bridge.");
      else toast(hit.id === "classes" ? "8 AM classes cancelled. Sleep wins." : "Surprise quiz cancelled. Surprise!");
    } else {
      burst(hit.point);
      toast(finalUnlocked(round) ? "Wait for the drawbridge to open!" : "Final exam is locked. Cancel both tower targets first.");
    }
  } else {
    burst(hit.point, hit.type === "water" ? "water" : "hit", 20);
    toast(hit.type === "water" ? "Assignment rejected. By a moat." : hit.type === "bridge" ? "Office hours are over. Wait for the bridge!" : "A solid argument. Unfortunately, also a solid wall.");
  }
  removeProjectile(); round = resolveShot(round); updateHud();
}
function updateProjectile(delta) {
  if (!projectile) return;
  // Small swept steps follow the parabola even on a slower machine.
  let remaining = delta;
  while (remaining > 0 && projectile && round.status === "playing") {
    const step = Math.min(remaining, 1 / 120); remaining -= step;
    const start = projectile.mesh.position.clone();
    projectile.age += step;
    const p = trajectoryPoint(projectile.origin, projectile.velocity, projectile.age);
    scratchPoint.set(p.x, p.y, p.z);
    const hit = collision(start, scratchPoint);
    if (hit) { impactShot(hit); break; }
    projectile.mesh.position.copy(scratchPoint); projectile.mesh.rotation.x += step * 7; projectile.mesh.rotation.z += step * 4;
    if (projectile.age > 5 || scratchPoint.y < -3) {
      removeProjectile(); round = resolveShot(round); toast("That assignment went a little off syllabus."); updateHud();
    }
  }
}
function updateHud() {
  document.body.dataset.status = round.status;
  const seconds = Math.max(0, Math.ceil(ROUND_SECONDS - round.elapsed));
  $("#timer").textContent = String(Math.floor(seconds / 60)).padStart(2, "0") + ":" + String(seconds % 60).padStart(2, "0");
  $("#timer").classList.toggle("urgent", seconds <= 20);
  $("#time-progress").style.width = (100 * (1 - round.elapsed / ROUND_SECONDS)) + "%";
  $("#ammo").textContent = round.ammo;
  $("#objective-count").textContent = round.destroyed.length + " / 3";
  for (const target of targets) {
    const row = $('[data-target="' + target.id + '"]'), done = round.destroyed.includes(target.id);
    const locked = target.id === "final" && !finalUnlocked(round);
    row.classList.toggle("done", done); row.classList.toggle("locked", locked);
    row.querySelector(".objective-status").textContent = done ? "✓" : locked ? "◇" : "○";
    row.querySelector(".objective-status").setAttribute("aria-label", done ? "Cancelled" : locked ? "Locked" : "Not cancelled");
  }
  $("#final-hint").textContent = finalUnlocked(round) ? "Aim through the open gate." : "Cancel the other two to unlock.";
  const bridgeLabel = finalUnlocked(round) ? bridgeState() : "LOCKED";
  $("#bridge-status").textContent = bridgeLabel;
  $("#bridge-dot").style.background = bridgeLabel === "OPEN" ? "#447562" : "#b58a59";
  $("#power-fill").style.width = Math.round(power * 100) + "%";
  $("#power-value").textContent = Math.round(power * 100) + "%";
  $("#pitch-label").textContent = Math.round(pitch * 180 / Math.PI) + "°";
  $("#shot-status").textContent = projectile ? "ASSIGNMENT IN TRANSIT" : charging ? "RELEASE TO SUBMIT" : "READY TO REBEL";
  $("#aim-tip").textContent = projectile ? "One submission at a time. The suspense." : charging ? "Adjust your aim while charging. Release to fire." : "Move mouse to aim · Hold & release to fire";
  $("#fire-button").disabled = !canFire(round);
}
function aimFromPointer(event) {
  if (round.status !== "playing" || dialogMode) return;
  const rect = canvas.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width, y = (event.clientY - rect.top) / rect.height;
  aim = THREE.MathUtils.clamp((0.5 - x) * 2.2, -1.1, 1.1);
  pitch = THREE.MathUtils.clamp((0.76 - y) * 1.2, -0.06, 0.91);
}
canvas.addEventListener("pointermove", aimFromPointer);
canvas.addEventListener("pointerdown", event => {
  if (event.button !== 0 || !canFire(round) || dialogMode) return;
  canvas.focus({ preventScroll: true });
  aimFromPointer(event); activePointer = event.pointerId; canvas.setPointerCapture(event.pointerId);
  // Touch uses drag-to-aim plus the dedicated fire button.
  if (event.pointerType !== "touch") beginCharge();
});
canvas.addEventListener("pointerup", event => {
  if (event.pointerId !== activePointer) return;
  activePointer = null;
  if (event.pointerType !== "touch") fire();
  if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
});
canvas.addEventListener("pointercancel", clearInput);
canvas.addEventListener("lostpointercapture", () => { if (activePointer !== null) clearInput(); });
canvas.addEventListener("wheel", event => {
  event.preventDefault();
  if (round.status === "playing") zoomCamera(event.deltaY * 0.009);
}, { passive: false });
canvas.addEventListener("contextmenu", event => event.preventDefault());
window.addEventListener("keydown", event => {
  if (event.code === "Escape") {
    event.preventDefault();
    if (dialogMode === "help" || round.status === "paused") resume();
    else if (round.status === "playing") pause();
    return;
  }
  if (event.code === "Tab" && dialogMode) {
    const buttons = [...$("#game-dialog").querySelectorAll("button")].filter(button => !button.hidden);
    if (event.shiftKey && document.activeElement === buttons[0]) { event.preventDefault(); buttons.at(-1).focus(); }
    else if (!event.shiftKey && document.activeElement === buttons.at(-1)) { event.preventDefault(); buttons[0].focus(); }
    return;
  }
  if (event.code === "KeyR" && !event.repeat) { event.preventDefault(); reset(); return; }
  if (event.target.closest("button, a, input")) return;
  if (round.status !== "playing" || dialogMode) return;
  if (["Space", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.code)) event.preventDefault();
  keys.add(event.code);
  if (event.code === "Space" && !event.repeat) beginCharge();
});
window.addEventListener("keyup", event => {
  keys.delete(event.code);
  if (event.code === "Space") fire();
});
window.addEventListener("blur", () => { if (round.status === "playing") pause(); else clearInput(); });
document.addEventListener("visibilitychange", () => { if (document.hidden && round.status === "playing") pause(); });
$("#start-button").addEventListener("click", () => { reset(); document.activeElement?.blur(); });
$("#restart-button").addEventListener("click", () => { reset(); document.activeElement?.blur(); });
$("#pause-button").addEventListener("click", () => { if (round.status === "playing") pause(); });
$("#help-button").addEventListener("click", () => {
  if (round.status === "playing" || round.status === "paused") pause(true);
  else if (round.status === "ready") setDialog("help");
});
$("#dialog-primary").addEventListener("click", () => {
  if (round.status === "won" || round.status === "lost") reset();
  else resume();
  document.activeElement?.blur();
});
$("#dialog-secondary").addEventListener("click", () => {
  reset(round.status === "won" || round.status === "lost");
  document.activeElement?.blur();
});
for (const [id, value] of [["orbit-left", -1], ["orbit-right", 1]]) {
  const button = $("#" + id);
  button.addEventListener("pointerdown", event => { event.preventDefault(); button.setPointerCapture(event.pointerId); touchOrbit = value; });
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) button.addEventListener(type, () => { touchOrbit = 0; });
}
$("#fire-button").addEventListener("pointerdown", event => {
  event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); beginCharge();
});
$("#fire-button").addEventListener("pointerup", fire);
$("#fire-button").addEventListener("pointercancel", clearInput);

export function tick(delta) {
  const previousStatus = round.status;
  if (round.status === "playing") {
    const orbit = Number(keys.has("KeyD") || keys.has("ArrowRight")) - Number(keys.has("KeyA") || keys.has("ArrowLeft")) + touchOrbit;
    angle += orbit * delta * 0.68;
    const zoom = Number(keys.has("KeyS") || keys.has("ArrowDown")) - Number(keys.has("KeyW") || keys.has("ArrowUp"));
    if (zoom) zoomCamera(zoom * delta * 8);
    if (charging) { chargeAge += delta; power = Math.min(1, 0.35 + chargeAge / 1.3 * 0.65); }
    round = advanceRound(round, delta);
  }
  const animationDelta = round.status === "paused" || dialogMode === "help" ? 0 : delta;
  worldTime += animationDelta;
  const progress = round.elapsed / ROUND_SECONDS, unlocked = finalUnlocked(round);
  updateDrawbridge(unlocked ? round.elapsed - round.bridgeStartedAt : 0, unlocked);
  updateCastle(worldTime, animationDelta, progress, unlocked);
  updateCamera(angle, delta, round.status === "ready");
  updateCannon(angle, aim, pitch, animationDelta, worldTime);
  updateSky(progress); updateWater(worldTime, progress);
  prepareCollisions();
  if (round.status === "playing") updateProjectile(delta);
  updateGuide(); updateEffects(animationDelta);
  if (toastTime > 0 && animationDelta > 0) { toastTime -= animationDelta; if (toastTime <= 0) $("#toast").classList.remove("visible"); }
  if (previousStatus === "playing" && (round.status === "won" || round.status === "lost")) {
    clearInput(); removeProjectile(); setDialog(round.status);
  }
  updateHud();
  renderer.render(scene, camera);
}

// Read-only diagnostics also make the game's state easy to inspect during a lab demo.
export function getGameSnapshot() {
  return { ...round, destroyed: [...round.destroyed], angle, aim, pitch, power, charging, bridge: bridgeState(), projectile: projectile ? { age: projectile.age, position: projectile.mesh.position.toArray() } : null, drawCalls: renderer.info.render.calls };
}
updateHud();
$("#start-button").disabled = false;
$("#start-button").innerHTML = 'Cancel the finals <span aria-hidden="true">↗</span>';
$("#help-button").disabled = false;
