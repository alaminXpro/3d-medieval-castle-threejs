// Pure game rules and kinematics; shared by the renderer and Node tests.
export const ROUND_SECONDS = 90;
export const MAX_SHOTS = 10;
export const GRAVITY = 14;
export const CANNON_RADIUS = 16.8;
export const TARGETS = [
  { id: "classes", name: "8 AM Classes", short: "8 AM CLASSES", x: -6, y: 4.1, z: 7.27 },
  { id: "quizzes", name: "Surprise Quizzes", short: "SURPRISE QUIZZES", x: 6, y: 4.1, z: 7.27 },
  { id: "final", name: "The Final Exam", short: "FINAL EXAM", x: 0, y: 1.38, z: 5.8 },
];
export function createRound() {
  return { status: "ready", elapsed: 0, ammo: MAX_SHOTS, destroyed: [], inFlight: false, bridgeStartedAt: null, reason: null };
}
export function startRound() { return { ...createRound(), status: "playing" }; }
export function finalUnlocked(state) {
  return state.destroyed.includes("classes") && state.destroyed.includes("quizzes");
}
export function canFire(state) {
  return state.status === "playing" && state.ammo > 0 && !state.inFlight;
}
export function spendShot(state) {
  return canFire(state) ? { ...state, ammo: state.ammo - 1, inFlight: true } : state;
}
export function hitTarget(state, id, bridgeOpen) {
  if (state.status !== "playing" || !state.inFlight || state.destroyed.includes(id)) return state;
  if (!TARGETS.some(target => target.id === id)) return state;
  if (id === "final" && (!finalUnlocked(state) || !bridgeOpen)) return state;
  const next = { ...state, destroyed: [...state.destroyed, id] };
  if (finalUnlocked(next) && next.bridgeStartedAt === null) next.bridgeStartedAt = next.elapsed;
  if (next.destroyed.length === 3) { next.status = "won"; next.inFlight = false; }
  return next;
}
export function resolveShot(state) {
  const next = { ...state, inFlight: false };
  if (next.status === "playing" && next.ammo === 0) { next.status = "lost"; next.reason = "ammo"; }
  return next;
}
export function advanceRound(state, delta) {
  if (state.status !== "playing") return state;
  const elapsed = Math.min(ROUND_SECONDS, state.elapsed + Math.max(0, delta));
  return elapsed >= ROUND_SECONDS
    ? { ...state, elapsed, status: "lost", inFlight: false, reason: "timeout" }
    : { ...state, elapsed };
}
export function togglePause(state) {
  if (state.status === "playing") return { ...state, status: "paused" };
  if (state.status === "paused") return { ...state, status: "playing" };
  return state;
}
export function bridgeAngleAt(age) {
  const phase = Math.max(0, age) % 10;
  const smooth = t => t * t * (3 - 2 * t);
  if (phase < 1.25) return -Math.PI / 2 * (1 - smooth(phase / 1.25));
  if (phase < 5.25) return 0;
  if (phase < 6.5) return -Math.PI / 2 * smooth((phase - 5.25) / 1.25);
  return -Math.PI / 2;
}
export function shotSpeed(power) { return 12 + Math.max(0, Math.min(1, power)) * 11; }
export function trajectoryPoint(origin, velocity, time) {
  return { x: origin.x + velocity.x * time, y: origin.y + velocity.y * time - GRAVITY * time * time / 2, z: origin.z + velocity.z * time };
}
// Segment/AABB intersection prevents fast shots skipping an entire target.
// Returns the first normalized contact (0..1), or null for a miss.
export function segmentBox(start, end, min, max) {
  let near = 0, far = 1;
  for (const axis of ["x", "y", "z"]) {
    const d = end[axis] - start[axis];
    if (Math.abs(d) < 1e-9) { if (start[axis] < min[axis] || start[axis] > max[axis]) return null; }
    else {
      let a = (min[axis] - start[axis]) / d, b = (max[axis] - start[axis]) / d;
      if (a > b) [a, b] = [b, a];
      near = Math.max(near, a); far = Math.min(far, b);
      if (near > far) return null;
    }
  }
  return near;
}
