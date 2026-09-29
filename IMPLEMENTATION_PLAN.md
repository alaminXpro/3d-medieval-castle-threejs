# Deadline Siege implementation plan

Status: implemented. The production build, 11 rule/math tests, a complete browser win, ammo loss, pause/restart, and emulated touch controls have been verified locally. See README.md for the controls and lab explanation.

## Game
An exhausted student launches crumpled assignments at a medieval university. Cancel 8 AM Classes and Surprise Quizzes, then hit the Final Exam through the gate before sunset. One arena, 90 seconds, 10 shots, one hit per target. The final target unlocks after the first two; the drawbridge opens and closes on a repeating schedule. No physics dependency or enemy AI.

## Implementation
1. Keep Three.js/Vite and the existing scene modules. Build a textured, stylized castle and moat, student cannon, target signs, original canvas textures, warm lighting, custom animated water, and shader-animated flags.
2. Add a pure rules/ballistics module and a game controller. Simulate gravity with swept segment collisions; check the nearest wall, bridge, ground, or target. Keep a single shot in flight. Preview the actual trajectory and stop it at collisions. Use delta time throughout.
3. A/D or arrows orbit the cannon and camera; mouse aims; hold/release the primary button or Space to shoot. W/S or wheel zoom. Add touch orbit/fire controls, pause/help, reset, and cancellation on focus loss. Freeze the timer while paused or hidden.
4. Add ready, playing, paused, won, and lost states; ammo, objective and timer HUDs; accessible HTML controls; shot feedback; falling roofs; confetti; and a repeatable clean restart. Drive the sky and lights from round progress.
5. Document controls, the lab requirement mapping, game logic, and adjustable constants. Verify pure gameplay rules with Node tests, run the production build, and exercise real controls and production assets in a browser.

## Acceptance
- All three targets are reachable; the final target requires both prerequisites and an open bridge. Closed geometry blocks shots. The last airborne shot resolves before an out-of-ammo loss.
- Win, timeout, out-of-ammo, pause/resume, pointer cancellation, and restart work without duplicate listeners or leftover effects.
- All visible mesh families have texture maps; custom GLSL, lighting, perspective, animations, and keyboard/mouse input remain identifiable in source.
- Desktop and narrow layouts remain usable, and the production build loads without missing textures or browser errors.
