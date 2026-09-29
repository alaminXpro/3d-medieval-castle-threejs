# Deadline Siege

A small Three.js game built on the medieval-castle graphics-lab MVP. You are a sleepy student at **Procrastination University**. Launch crumpled assignments to cancel **8 AM Classes**, **Surprise Quizzes**, and finally **The Final Exam** before sunset.

## Run

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. No account, backend, API key, downloaded model, or physics library is needed. The game uses the existing Three.js and Vite dependencies. All active scene textures are drawn locally with Canvas; the MVP's PNG files are retained but are no longer loaded.

```sh
npm test          # gameplay rules and collision math, using Node's built-in test runner
npm run build    # production files in dist/
npm run preview  # serve the production build locally
```

Use Node 18 or newer. Serve the game through Vite or a static HTTP server; do not open index.html through file://.

## Play

- **Mouse movement:** steer the cannon. Move upward for a higher arc. The dots show the current shot path; a mint endpoint indicates a hittable target, gold an obstacle.
- **Hold and release the primary mouse button or Space:** charge and fire. Power rises from 35% to 100% over 1.3 seconds. Adjust aim while holding. Only one assignment can be airborne at a time.
- **A/D or left/right arrows:** move the cannon and camera around the castle. **W/S, up/down arrows, or the mouse wheel:** zoom.
- **Esc:** pause/resume. **R:** restart. The header also has help, pause, and restart buttons. Switching away from the window pauses play and cancels an unfinished charge.
- **Touch:** drag on the scene to aim. Hold the arrow buttons to orbit; hold and release **Hold to fire** to shoot.

You have **90 seconds and 10 shots**. Hit either tower bullseye first. Each target takes one hit and its roof tumbles away. After both towers are cancelled, the bridge begins a ten-second cycle: 1.25 seconds opening, 4 seconds open, 1.25 seconds closing, 3.5 seconds closed. Move back to the front, use a low arc, and shoot the final bullseye through the open gate. The guide samples the bridge's current position; account for its movement while your shot travels.

The last airborne shot can still win after ammo reaches zero. Sunset ends the round immediately. Restart restores the targets, roofs, bridge, timer, cannon, camera, ammo, and effects.

## Graphics lab explanation

| Requirement | Implementation |
| --- | --- |
| Custom shaders | `js/shaders/waterVertex.glsl` displaces moat vertices with two sine/cosine waves. Its fragment shader scrolls a water texture and brightens crests. The flag shaders deform a subdivided plane while keeping its pole edge fixed. |
| Lighting | A shadow-casting directional sunlight and hemisphere fill illuminate textured `MeshStandardMaterial` objects. Sun direction, intensity, color, ambient intensity, and shader daylight uniforms change through the round. |
| Perspective projection | `PerspectiveCamera` uses a 43-degree field of view; its aspect and projection matrix update on resize. |
| Textures for objects | Original Canvas textures cover stone, grass, roofs, wood, metal, paper, flags, water, target faces, and signs. Every visible mesh family, including particles and guide dots, has a map or shader texture sampler. |
| Animation | Projectiles, water, flags, clouds, the drawbridge and chains, cannon recoil, falling roofs, particles, and the changing sky. |
| Mouse and keyboard | Mouse aiming/charging, wheel zoom, keyboard orbit/zoom/fire/pause/restart, plus touch controls. |
| Castle walls and drawbridge | Textured primitive geometry; the bridge rotates about a hinge and its chains follow its endpoints. |
| Camera movement | Camera and cannon orbit the castle together; the cannon remains on the outer firing path. |
| Times of day | The timer drives a continuous daytime-to-sunset/dusk transition. Restart restores daylight. |

## How it works

`index.js` starts one requestAnimationFrame loop. `js/game.js` connects input, rendering, collision, UI, and the round state. The small scene modules still own their respective castle, bridge, camera, lighting, sky, and water responsibilities. `js/cannon.js` builds the cannon/student and converts its barrel transform to a world-space launch direction. `js/effects.js` owns temporary particles.

`js/game-rules.js` contains browser-independent rules and tunable constants: round length, shot count, gravity, cannon radius, target definitions, bridge timing, and shot speed. State progresses through `ready → playing ↔ paused → won/lost`. The final target unlocks only after the first two; no points are awarded twice.

Projectile motion uses:

```text
position(t) = origin + velocity × t + (0, -gravity × t² / 2, 0)
speed = 12 + 11 × charge
```

The trajectory guide and projectile share this equation. Each projectile update is subdivided into at most 1/120-second steps. A segment/box broad phase filters candidates, then Three.js raycasts find the nearest structural surface. Target faces use a swept box test and a round-face check. This prevents fast shots from skipping a wall or target between rendered frames. Paper balls are modeled as point projectiles with a small target tolerance, rather than rigid bodies.

Roofs follow scripted falls after a hit, so there is no expensive destructible-wall simulation. Decorative trees, signs, particles, and the cannon do not block shots; castle structures, the bridge, and terrain do. Mesh resources for shots and effects are shared, while removed objects are detached from the scene. Input listeners are registered once and are reused across restarts.

The renderer caps device pixel ratio at 2, uses a shared instanced mesh for guide dots, and limits a stalled frame's simulation step to 0.1 seconds. Hidden windows pause explicitly. On a severely overloaded machine, game time consequently runs slower than wall time.

## Verification

The Node suite checks win progression, prerequisite/bridge locks, duplicate hits, single-shot flight, last-shot success, ammo loss, timeout, pause/resume, clean state, bridge timing, ballistic motion, and swept collisions.

Verified locally: all 11 Node tests and the production build pass. Chromium playthroughs covered a three-shot win, closed-bridge rejection, ten-shot ammo loss, orbiting, charge cancellation, restart, and frozen time in pause/help. A timeout UI check advanced the simulation directly. The production build completed a full win with no browser errors or failed requests; a 390 × 844 touch-emulated browser also exercised orbit and firing without horizontal overflow. These checks do not substitute for testing on physical phones or every browser.

For a hands-on demonstration, start a round, cancel both tower targets, show the raising/lowering bridge, finish through the open gate, then restart. Also try a shot at the closed bridge, a miss into the moat, pause while charging, and a narrow viewport. The source is deliberately split into small modules so each graphics requirement can be explained independently.
