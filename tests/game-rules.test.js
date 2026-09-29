import test from "node:test";
import assert from "node:assert/strict";
import { startRound, createRound, canFire, spendShot, hitTarget, resolveShot, advanceRound, togglePause, finalUnlocked, bridgeAngleAt, trajectoryPoint, segmentBox, shotSpeed, MAX_SHOTS, ROUND_SECONDS } from "../js/game-rules.js";

function cancel(state, id, open = false) {
  return resolveShot(hitTarget(spendShot(state), id, open));
}

test("a full three-target round wins with three shots, and cannot fire after winning", () => {
  let state = startRound();
  assert.equal(finalUnlocked(state), false);
  state = cancel(state, "classes");
  state = advanceRound(state, 5);
  state = cancel(state, "quizzes");
  assert.equal(finalUnlocked(state), true);
  assert.equal(state.bridgeStartedAt, 5);
  state = cancel(state, "final", true);
  assert.equal(state.status, "won");
  assert.equal(state.ammo, 7);
  assert.equal(canFire(state), false);
});

test("the final needs both prerequisite targets and an open bridge", () => {
  let state = spendShot(startRound());
  assert.strictEqual(hitTarget(state, "final", true), state);
  state = resolveShot(state);
  state = cancel(state, "classes");
  state = spendShot(state);
  assert.strictEqual(hitTarget(state, "final", true), state);
  state = cancel(resolveShot(state), "quizzes");
  state = spendShot(state);
  assert.strictEqual(hitTarget(state, "final", false), state);
  assert.equal(hitTarget(state, "final", true).status, "won");
});

test("a target cannot score twice, without a shot, or after the round ends", () => {
  let state = startRound();
  assert.strictEqual(hitTarget(state, "classes", true), state);
  state = cancel(state, "classes");
  state = spendShot(state);
  assert.strictEqual(hitTarget(state, "classes", true), state);
  assert.strictEqual(hitTarget(state, "unknown", true), state);
  const expired = advanceRound(state, ROUND_SECONDS);
  assert.strictEqual(hitTarget(expired, "quizzes", true), expired);
});

test("one projectile at a time; the tenth shot resolves before ammo loss", () => {
  let state = startRound();
  for (let i = 0; i < MAX_SHOTS - 1; i++) state = resolveShot(spendShot(state));
  state = spendShot(state);
  assert.equal(state.ammo, 0);
  assert.equal(state.status, "playing");
  assert.equal(state.inFlight, true);
  assert.strictEqual(spendShot(state), state);
  state = resolveShot(state);
  assert.equal(state.status, "lost");
  assert.equal(state.reason, "ammo");
});

test("the last assignment can still win", () => {
  let state = startRound();
  for (let i = 0; i < 7; i++) state = resolveShot(spendShot(state));
  state = cancel(cancel(state, "classes"), "quizzes");
  state = cancel(state, "final", true);
  assert.equal(state.status, "won");
  assert.equal(state.ammo, 0);
});

test("sunset ends a round even when a shot is still airborne", () => {
  let state = spendShot(advanceRound(startRound(), ROUND_SECONDS - 0.1));
  state = advanceRound(state, 0.2);
  assert.equal(state.elapsed, ROUND_SECONDS);
  assert.equal(state.status, "lost");
  assert.equal(state.reason, "timeout");
  assert.equal(state.inFlight, false);
});

test("pause freezes time and shooting; resume preserves ammo and progress", () => {
  let state = advanceRound(cancel(startRound(), "classes"), 12);
  state = togglePause(state);
  assert.strictEqual(advanceRound(state, 200), state);
  assert.strictEqual(spendShot(state), state);
  state = togglePause(state);
  assert.equal(state.status, "playing");
  assert.equal(state.elapsed, 12);
  assert.equal(state.ammo, 9);
  assert.deepEqual(state.destroyed, ["classes"]);
});

test("restart creates independent fresh state; ready state never counts down", () => {
  const ready = createRound();
  assert.strictEqual(advanceRound(ready, 100), ready);
  assert.equal(canFire(ready), false);
  const previous = cancel(startRound(), "classes");
  const fresh = startRound();
  assert.equal(fresh.ammo, 10);
  assert.equal(fresh.elapsed, 0);
  assert.equal(fresh.bridgeStartedAt, null);
  assert.deepEqual(fresh.destroyed, []);
  assert.notStrictEqual(fresh.destroyed, previous.destroyed);
});

test("bridge eases open, holds, closes, and repeats without a discontinuity", () => {
  assert.equal(bridgeAngleAt(0), -Math.PI / 2);
  assert.equal(bridgeAngleAt(2), 0);
  assert.equal(bridgeAngleAt(5), 0);
  assert.equal(bridgeAngleAt(8), -Math.PI / 2);
  assert.equal(bridgeAngleAt(12), bridgeAngleAt(2));
  for (const time of [1.25, 5.25, 6.5, 10]) assert.ok(Math.abs(bridgeAngleAt(time - 0.0001) - bridgeAngleAt(time + 0.0001)) < 0.00001);
});

test("projectile follows gravity and power is clamped to the cannon's range", () => {
  const origin = { x: 0, y: 2, z: 10 }, velocity = { x: 4, y: 10, z: -12 };
  assert.deepEqual(trajectoryPoint(origin, velocity, 0), origin);
  assert.deepEqual(trajectoryPoint(origin, velocity, 1), { x: 4, y: 5, z: -2 });
  assert.equal(shotSpeed(-5), 12);
  assert.equal(shotSpeed(5), 23);
});

test("swept collision catches fast crossings, rejects parallel misses, and starts inside", () => {
  const min = { x: -1, y: -1, z: -1 }, max = { x: 1, y: 1, z: 1 };
  assert.equal(segmentBox({ x: 0, y: 0, z: 20 }, { x: 0, y: 0, z: -20 }, min, max), 0.475);
  assert.equal(segmentBox({ x: 3, y: 0, z: 20 }, { x: 3, y: 0, z: -20 }, min, max), null);
  assert.equal(segmentBox({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, min, max), 0);
  assert.equal(segmentBox({ x: 3, y: 0, z: 0 }, { x: 3, y: 0, z: 0 }, min, max), null);
});
