# Deadline Siege: learn the entire project from zero

This guide assumes you have never used Three.js or built a 3D scene. It teaches the necessary ideas, connects them to the actual source files, and gives you a path for explaining the project to your faculty.

Keep the game running and open the named source file beside each chapter. The excerpts are from this project unless a block is explicitly called a simplified example. You do not need to memorize every dimension or color. You should understand what each value controls and what would happen if you changed it.

**Version context:** this project currently installs Three.js **0.161.0**, also called **r161**, and Vite **5.4.21**. Explanations below follow the checked-in application and the installed library source. Newer online examples can use different APIs.

## Contents and learning order

1. [What the project does](#what-the-project-does)
2. [JavaScript and 3D fundamentals](#javascript-and-3d-fundamentals)
3. [The complete file structure](#the-complete-file-structure)
4. [Configuration and application startup](#configuration-and-application-startup)
5. [The HTML and CSS interface](#the-html-and-css-interface)
6. [The scene and renderer](#the-scene-and-renderer)
7. [Procedural textures](#procedural-textures)
8. [Lighting and the changing sky](#lighting-and-the-changing-sky)
9. [Building and animating the castle](#building-and-animating-the-castle)
10. [The orbiting camera](#the-orbiting-camera)
11. [The drawbridge and its chains](#the-drawbridge-and-its-chains)
12. [The cannon and student](#the-cannon-and-student)
13. [Custom shaders, line by line](#custom-shaders-line-by-line)
14. [Game rules, projectile motion, and collision mathematics](#game-rules-projectile-motion-and-collision-mathematics)
15. [The game controller, function by function](#the-game-controller-function-by-function)
16. [Particles and effects](#particles-and-effects)
17. [Tests and what they prove](#tests-and-what-they-prove)
18. [Trace one complete playthrough](#trace-one-complete-playthrough)
19. [Presenting the project to your faculty](#presenting-the-project-to-your-faculty)
20. [Viva questions and example answers](#viva-questions-and-example-answers)
21. [Practice changes and debugging](#practice-changes-and-debugging)
22. [Glossary and source references](#glossary-and-source-references)

**Suggested study sequence:** read chapters 1–6 first; explore the scene with chapters 7–13; study the game logic with chapters 14–18; then practice explaining it using chapters 19–22. Each chapter is useful independently after your first reading.

## What the project does

Deadline Siege turns a medieval castle into a fictional university. The player is a student with a cannon that launches crumpled assignments.

The player has 90 seconds and 10 shots. One hit cancels each of three targets:

1. **8 AM Classes** on the left front tower.
2. **Surprise Quizzes** on the right front tower.
3. **The Final Exam** inside the entrance.

The first two targets can be hit in either order. They unlock the final target and start the drawbridge cycle. The player must hit the final target while the bridge is open. The sky changes as the timer approaches sunset.

The student and cannon orbit together around the castle. The student is a small decorative model accompanying the cannon; this is not a walking-character game.

### How the assignment requirements appear in the game

| Requirement | What you can show | Where to find the code |
| --- | --- | --- |
| Custom shaders | Rippling water and a waving flag | [Shader files](js/shaders/), [water.js](js/water.js), [castle.js](js/castle.js) |
| Lighting | Lit surfaces, soft shadows, warmer and dimmer evening light | [lights.js](js/lights.js), [sky.js](js/sky.js) |
| Perspective projection | Near objects appear larger; distant objects appear smaller | [scene.js](js/scene.js) |
| Textures | Stone blocks, wood grain, roof tiles, grass, paper, signs, water | [textures.js](js/textures.js) and the materials in scene modules |
| Animation | Shots, bridge, flag, water, roofs, recoil, clouds, particles | Scene update functions called by [game.js](js/game.js) |
| Mouse and keyboard | Aiming, charging, orbiting, zooming, pausing, restarting | Input listeners in [game.js](js/game.js) |
| Castle walls and drawbridge | Textured primitive geometry | [castle.js](js/castle.js), [drawbridge.js](js/drawbridge.js) |
| Camera moves around the castle | A/D or left/right arrows | [camera.js](js/camera.js) |
| Drawbridge raises and lowers | Repeated timed rotation after unlocking | [drawbridge.js](js/drawbridge.js), [game-rules.js](js/game-rules.js) |
| Sky changes with time | Day becomes sunset and dusk during a round | [sky.js](js/sky.js) |

**A useful opening explanation:** “This is a browser-based 3D game built with Three.js. Its scene uses primitive geometry, procedural textures, lighting, perspective projection, and two custom shader effects. A separate game controller connects player input, projectile motion, collisions, and the interface.”

## JavaScript and 3D fundamentals

### 1. What Three.js does

The browser provides **WebGL**, a graphics API that can use the GPU to draw triangles. Working directly with WebGL requires substantial setup for buffers, shaders, matrices, textures, and drawing commands.

Three.js is a JavaScript library that handles much of that setup. We describe objects and their appearance; Three.js converts that description into rendering work.

Three.js does not automatically invent game rules, projectile behavior, collision rules, or the win condition. Those are implemented by this project's JavaScript.

### 2. The scene, camera, and renderer

Think of a miniature film set:

| Three.js concept | Meaning | Project example |
| --- | --- | --- |
| `Scene` | Container for the 3D world | Castle, terrain, cannon, water, lights |
| `Camera` | Viewpoint and projection used to see the world | Orbiting perspective camera |
| `WebGLRenderer` | Produces the image from that scene and camera | Draws into the browser canvas |

The central rendering call is:

```js
renderer.render(scene, camera);
```

Adding an object to a scene does not permanently paint it on the screen. The renderer draws the current scene when this call runs. Calling it repeatedly after changing object properties creates animation.

### 3. Coordinates and units

An object's position has three coordinates:

- **X:** sideways.
- **Y:** vertical; positive Y is up in this project.
- **Z:** the other horizontal direction, giving depth.

The origin is `(0, 0, 0)`. Here, the castle is near the origin, its entrance is on the positive-Z side, and the initial cannon position is farther out on that same side.

```js
object.position.set(-6, 4.1, 7.27);
```

This means 6 units in negative X, 4.1 units above the origin, and 7.27 units in positive Z. It is the left target's position.

“Left” and “right” here describe the initial front view. After you orbit, screen directions change while world coordinates remain the same.

World units are chosen by the application. They are not automatically pixels or real meters. A 12-unit wall and a 0.23-unit projectile have a meaningful relative size regardless of screen resolution.

Three.js uses a right-handed coordinate system. A camera's default viewing direction is its local negative Z direction, but this project uses `lookAt(...)` to orient the camera toward the castle.

### 4. Geometry, material, and mesh

```js
const geometry = new THREE.BoxGeometry(12, 4, 0.65);
const material = new THREE.MeshStandardMaterial({ map: stoneTexture });
const wall = new THREE.Mesh(geometry, material);
wall.position.set(0, 2, -6);
scene.add(wall);
```

This simplified wall example has five distinct jobs:

1. `BoxGeometry` defines the shape: width 12, height 4, depth 0.65.
2. `MeshStandardMaterial` defines how the surface looks and responds to lighting.
3. `Mesh` combines the geometry and material into a renderable object.
4. `position` moves the object.
5. `scene.add` puts it into the world.

Geometry is generally centered at its own origin. A box of height 4 extends from local Y = −2 to Y = +2. Placing its center at world Y = 2 makes its bottom lie at Y = 0.

### 5. Vertices, triangles, normals, and UV coordinates

A **vertex** is a point of a model. Triangles connect vertices to form surfaces. Even a curved-looking sphere is drawn using many small triangles.

Each vertex can have additional data:

| Data | Meaning | Used for |
| --- | --- | --- |
| Position | Where the vertex is | Shape and projection |
| Normal | Direction perpendicular to the surface | Lighting |
| UV | Two-dimensional location in a texture | Applying an image to geometry |

The built-in geometries supply these attributes. We do not manually type every triangle of a tower.

**Segments** control subdivision. A cylinder with 12 sides looks more angular than one with 64 sides. More subdivisions can improve smoothness but require more geometry processing. Water and flags need enough subdivisions for vertex displacement to produce a visible bend.

### 6. Translation, rotation, and scaling

| Operation | Example | Meaning |
| --- | --- | --- |
| Translation | `mesh.position.y = 3` | Move the object upward |
| Rotation | `mesh.rotation.x = -Math.PI / 2` | Rotate 90 degrees around X |
| Scaling | `mesh.scale.set(1.3, 0.55, 0.65)` | Stretch X and compress Y/Z |

Most Three.js rotation properties use **radians**, not degrees:

```text
180 degrees = π radians
90 degrees  = π / 2 radians
degrees     = radians × 180 / π
```

These are object transforms. They usually leave the original geometry vertex data unchanged. A vertex shader can additionally move individual vertices during rendering.

### 7. Local coordinates, world coordinates, and parent groups

**Local coordinates** describe a child relative to its parent. **World coordinates** describe its final location in the scene after all parent transforms.

A `Group` is a transformable parent that can contain meshes and other groups. It has no visible geometry of its own.

The drawbridge provides a useful example: its mesh is moved forward relative to a group at the hinge. Rotating that group rotates the bridge about the hinge. Rotating the mesh around its own center would produce a different movement.

The combined transform is stored in `matrixWorld`. `localToWorld(vector)` converts a local point into world space. Positions include translation; directions do not need translation. That distinction matters for launching a projectile from the cannon.

### 8. Vectors and matrices without the intimidating part

A `Vector3` stores three numbers. Those numbers can represent a position, velocity, or direction depending on how the code uses them.

| Operation | Meaning |
| --- | --- |
| `b.clone().sub(a)` | Vector from A to B, without changing B |
| `v.length()` | Length or magnitude |
| `v.normalize()` | Keep direction, change length to 1 |
| `v.multiplyScalar(20)` | Multiply all components by 20 |
| `position.addScaledVector(velocity, dt)` | Move by velocity × elapsed seconds |
| `a.clone().lerp(b, 0.5)` | Midpoint between A and B |

Many Three.js methods mutate the object on the left. For example, `v.normalize()` changes `v`; `v.clone().normalize()` changes a copy. The game uses copies when it must preserve a launch position or another object's stored coordinates.

A transformation matrix is a compact way to combine movements, rotations, and scales. You do not manually calculate every matrix entry here. Three.js constructs them from object properties.

The graphics pipeline conceptually follows:

```text
local vertex → model transform → world position
             → view transform → camera-space position
             → projection transform → clip-space position
             → perspective divide and viewport mapping → screen
```

The shader line `projectionMatrix * modelViewMatrix * vec4(p, 1.0)` performs the first major transformations. The GPU performs perspective division afterward. The fourth component, 1, marks the value as a position in homogeneous coordinates.

### 9. Perspective projection

Perspective makes nearby objects appear larger than otherwise identical distant objects. An orthographic camera instead keeps apparent size independent of depth.

A perspective camera needs a field of view, an aspect ratio, and near/far clipping distances. These define a truncated pyramid-shaped visible volume called the **view frustum**.

Objects outside the clipping range are not visible. The near distance must be positive. Moving the camera changes the viewpoint; changing field of view changes the projection. This project implements its “zoom” by moving the camera closer or farther away.

### 10. Texture versus material

A texture is image data. A material decides how to use image data, color, surface roughness, and lighting.

`map: stoneTexture` makes an image the material's base color map. UV coordinates decide which part of the image belongs to each part of a surface.

The project mainly uses:

| Material | Behavior | Project use |
| --- | --- | --- |
| `MeshStandardMaterial` | Built-in physically based surface lighting | Most models |
| `MeshBasicMaterial` | Unlit color/texture | Readable trajectory markers |
| `ShaderMaterial` | Our own vertex and fragment shader logic | Water and flag |

Three.js also uses shaders internally for built-in materials. The assignment's **custom shaders** are the GLSL programs explicitly written in this repository.

### 11. Animation and delta time

A frame is one image. An animation loop changes values and draws new images repeatedly.

**Delta time** is the number of seconds since the preceding frame. It allows movement to be expressed as units per second:

```js
angle += orbit * delta * 0.68;
```

At approximately 60 frames per second, delta is about `1 / 60`. Updating by a fixed amount per frame would make movement depend much more strongly on the display's frame rate.

Some animations are calculated from total time, such as `Math.sin(time)`. Others accumulate changes with delta. The projectile uses its total flight age in an equation, while the controller divides each movement interval into smaller collision checks.

### 12. JavaScript patterns you will see

| Syntax or method | Meaning in this project |
| --- | --- |
| `import * as THREE from "three"` | Access the library through the `THREE` namespace |
| `export function tick(...)` | Make a function available to another module |
| `import { scene } from "./scene.js"` | Import that module's exported scene instance |
| `const` / `let` | Binding that cannot / can be reassigned; a `const` object's properties can still change |
| `{ ...state, ammo: 9 }` | Copy an object's properties, overriding `ammo` |
| `[...state.destroyed, id]` | Create a new array containing previous entries plus the new ID |
| `condition ? a : b` | Choose one of two values |
| `object?.property` | Read a property only if the object is not null/undefined |
| `array.find(...)` | Find the first matching entry |
| `array.some(...)` | Check whether at least one entry matches |
| `array.includes(...)` | Check whether a value exists |
| `Set` | Collection of unique values; used for held keys |
| `addEventListener` | Register a function to run when an event happens |
| `async` / `await` | Wait for asynchronous work inside a function |

Module-level code normally runs once for a particular module URL. Creating meshes at the top of a module therefore constructs them during startup, rather than recreating them on every frame. Vite's `?raw` suffix imports a shader file as a string.

**Checkpoint:** explain the difference between a scene, geometry, material, mesh, and renderer before continuing.

## The complete file structure

```text
Medieval_Castle_NPM/
├── index.html                    Browser page and interface elements
├── index.js                      Starts the application and animation loop
├── package.json                  Scripts and dependency requirements
├── bun.lock                      Resolved dependencies recorded by Bun
├── vite.config.js                Development-server configuration
├── .gitignore                    Files Git should ignore
├── README.md                     Quick setup, controls, and project summary
├── IMPLEMENTATION_PLAN.md        Game scope, implementation plan, acceptance checks
├── PROJECT_LEARNING_GUIDE.md     This learning guide
├── css/
│   └── style.css                 Layout, typography, responsive interface, dialogs
├── js/
│   ├── scene.js                  Shared scene, camera, and renderer
│   ├── textures.js               Original textures drawn with Canvas 2D
│   ├── lights.js                 Sunlight and hemisphere fill
│   ├── sky.js                    Round progress → sky/light changes
│   ├── castle.js                 Island, castle, targets, flag, scenery, roof falls
│   ├── camera.js                 Camera orbit, zoom, and introductory framing
│   ├── drawbridge.js             Bridge model, hinge, chains, open/closed status
│   ├── cannon.js                 Cannon/student models and launch transform
│   ├── water.js                  Moat mesh and water shader uniforms
│   ├── game-rules.js             Pure rules, ballistics, bridge schedule, box test
│   ├── game.js                   Controller, input, collisions, UI, frame updates
│   ├── effects.js                Temporary particles and cleanup
│   └── shaders/
│       ├── waterVertex.glsl      Moves water vertices
│       ├── waterFragment.glsl    Samples/animates the water texture
│       ├── flagVertex.glsl       Bends flag vertices
│       └── flagFragment.glsl     Colors the flag
├── tests/
│   └── game-rules.test.js        Eleven rule and mathematics tests
├── models/
│   └── Textures/
│       ├── stone.png
│       ├── wood.png
│       ├── grass.png
│       ├── roof.png
│       ├── flag.png
│       └── water.png
├── node_modules/                 Installed libraries; generated by installation
├── dist/                         Deployable output; generated by the build
└── .playwright-mcp/              Local browser-check artifacts, when present
```

The PNG files are retained from the MVP. The current game does **not** load them: its active textures come from `textures.js`. Despite the directory name `models`, the game does not import a GLTF/GLB model. The visible models are assembled from primitive geometries.

`node_modules` contains dependency source, not additional project features you need to memorize. `dist` is generated, usually minified code: explain and edit the corresponding source modules instead. `.playwright-mcp` contains verification artifacts and is not required to play. A `.git` directory, when present, stores version-control metadata.

### How the files connect

```text
index.html loads index.js
index.js imports game.js and starts tick(delta)

game.js coordinates:
  game-rules.js          → rules and mathematics
  scene.js               → shared scene, camera, renderer
  castle/cannon/bridge   → models and transforms
  camera/sky/water       → changing view and environment
  effects.js             → temporary particles
  HTML elements          → controls, timer, objectives, dialogs

scene-building modules use textures.js
water.js and castle.js import GLSL shader strings
sky.js imports lights.js, whose initialization adds lights to the scene
```

The browser resolves the module dependencies before the controller finishes initializing. These arrows describe responsibility; they do not mean every module has its own animation loop. There is one application loop.

## Configuration and application startup

### `package.json`

[Open the file](package.json).

This file describes the JavaScript package. It is JSON data, not gameplay code.

| Field | What it means |
| --- | --- |
| `name` | Package identifier |
| `version` | Application package version |
| `private: true` | Helps prevent accidentally publishing the package to npm |
| `type: "module"` | Enables the ES-module import/export style for the project's JavaScript |
| `dependencies.three` | Library used by the application |
| `devDependencies.vite` | Development and build tool |
| `scripts` | Short names for terminal commands |

The four commands are:

```sh
npm run dev      # Serve source through Vite; use its printed local URL
npm run build    # Compile/bundle the application into dist/
npm run preview  # Serve the existing dist/ build locally
npm test         # Execute tests/game-rules.test.js with Node
```

Run `npm install` first when dependencies are missing. Use Node 18 or newer. `npm run preview` does not itself rebuild the project; run the build command after source changes before previewing the new result.

The browser runs the game. Node and Vite support development, building, and tests; this application has no gameplay backend or database.

### `bun.lock`

[Open the file](bun.lock).

This records concrete dependency versions, platform-specific packages, dependency relationships, and integrity hashes produced by Bun. For example, it records Three.js 0.161.0 and Vite 5.4.21.

`package.json` expresses allowed versions; the lockfile records a resolved installation. npm does not use `bun.lock` as its npm lockfile. An npm installation can generate `package-lock.json`. Do not claim that `bun.lock` guarantees the exact versions of every future npm installation.

You normally update a lockfile through the package manager, not by manually changing its hashes.

### `vite.config.js`

```js
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    open: false
  }
});
```

`defineConfig` is Vite's configuration helper. `open: false` means starting the development server does not automatically open a browser window. It does not disable the server. Vite also handles CSS imports, dependency resolution, shader-string imports, and production bundling through its normal functionality.

### `.gitignore`

It excludes `node_modules/`, `dist/`, `.playwright-mcp/`, and `.DS_Store` from ordinary Git tracking. These are dependencies, generated output, local browser artifacts, and macOS metadata. Ignoring a file does not prevent the running application from reading it, and does not automatically untrack a file already committed to Git.

### The existing Markdown files

`README.md` is the short operational guide. `IMPLEMENTATION_PLAN.md` records the intended game, implementation approach, and acceptance criteria. Neither executes in the browser. This learning guide supplies the detailed explanations behind them.

### `index.js`: booting and animating

[Open the file](index.js).

First, the CSS import lets Vite include the stylesheet. Then `boot()` imports the controller and shared renderer inside a `try/catch`:

```js
const { tick } = await import("./js/game.js");
const { camera, renderer } = await import("./js/scene.js");
```

Dynamic imports return promises. `await` waits for initialization. If startup fails, the catch block logs the error and reveals `#error-message`. That message mentions WebGL, but the catch can also catch other startup/import failures. It does not wrap every later animation-frame callback.

The loop is:

```js
let previous = performance.now();
function animate(now) {
  const delta = Math.min(Math.max((now - previous) / 1000, 0), 0.1);
  previous = now;
  tick(delta);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

Read it in order:

1. Remember a timestamp in milliseconds.
2. The browser supplies another timestamp for the next animation frame.
3. Subtract the timestamps and divide by 1000 to obtain seconds.
4. Clamp the result between zero and 0.1 seconds.
5. Update and draw the game using that delta.
6. Request another animation frame.

The 0.1-second cap avoids a huge simulation jump after a stall. Its tradeoff is that a severely overloaded browser can run simulation time slower than wall-clock time. The game is not a strict real-time stopwatch under every performance condition.

The resize listener updates four things:

| Update | Why |
| --- | --- |
| `camera.aspect = innerWidth / innerHeight` | Match the viewport shape |
| `camera.updateProjectionMatrix()` | Recalculate projection after changing the aspect |
| `renderer.setSize(...)` | Match the drawing canvas to the viewport |
| `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))` | Keep high-density screens sharp while limiting resolution cost |

**Explain it aloud:** “The entrypoint starts one animation loop. Each frame calculates elapsed seconds and calls the controller. Resizing changes both the camera projection and the drawing size.”

## The HTML and CSS interface

### `index.html`: the page around the world

[Open the file](index.html).

The castle is rendered into a WebGL canvas. The title, timer, objectives, buttons, and dialogs are ordinary HTML layered over that canvas. This keeps interface text crisp and makes browser controls easier to use.

The `<head>` sets the character encoding, mobile viewport behavior, page title, description, theme color, and a small embedded SVG favicon. The favicon is an encoded image inside a URL; it is unrelated to the 3D castle geometry.

`<body data-status="ready">` provides the initial interface state. JavaScript later changes this attribute, and CSS uses it to choose which panels are visible.

The body is organized as follows:

| Element or identifier | Purpose and code connection |
| --- | --- |
| `#scene` | Empty HTML container; `scene.js` appends the renderer's canvas here |
| `.vignette` | Transparent gradient overlay for the visual presentation |
| `.topbar` | Brand, help, pause, and restart buttons |
| `#intro` | Opening title, brief, and start button |
| `#start-button` | Disabled during startup; enabled after controller initialization |
| `#mission` | Three objective rows with `data-target` values matching target IDs |
| `#objective-count` | Displays cancelled targets, such as `2 / 3` |
| `#bridge-status`, `#bridge-dot` | Text and color for the bridge state |
| `.round-stats` | Timer, time bar, and remaining ammo |
| `#toast` | Temporary feedback such as a missed shot or cancelled class |
| `.aim-panel` | Shot state, elevation in degrees, power percentage, firing instructions |
| `.touch-controls` | Two orbit buttons and a charge/fire button |
| `.bottom-bar` | Short control reference |
| `#dialog-backdrop`, `#game-dialog` | Help, pause, win, and loss presentation |
| `#help-content` | Instructions shown only in help mode |
| `#result-stats` | Results inserted after winning or losing |
| `#dialog-primary`, `#dialog-secondary` | Resume, replay, or return actions, depending on dialog mode |
| `#error-message` | Startup failure message |
| `<script type="module" src="/index.js">` | Loads the application entrypoint |

An **ID** selects one particular element. A **class** can be shared by many elements. A **data attribute** stores application-specific values on an element.

For example, the target ID `classes` appears in both the rules and the corresponding HTML row. `updateHud()` joins those two parts by selecting `[data-target="classes"]`.

The interface uses `aria-label`, `aria-labelledby`, `role="dialog"`, and `aria-modal` to describe controls and dialogs to assistive technology. `#toast` has `role="status"` and `aria-live="polite"` so new feedback can be announced. These are useful accessibility provisions; they are not proof that the entire 3D game is fully accessible without vision.

### `css/style.css`: how the interface is arranged

[Open the file](css/style.css).

CSS affects the browser interface, not the physical dimensions of the castle. Increasing an HTML panel's `width` does not make a tower wider. Changing a mesh's geometry does not change the font size of the timer.

The stylesheet has several groups of responsibility:

| Rules | What they do |
| --- | --- |
| `:root` | Sets fonts, default colors, and reusable CSS variables such as `--accent` |
| `* { box-sizing: border-box; }` | Includes padding/borders within declared element dimensions |
| `body` | Removes default margin, fills the viewport, prevents page scrolling |
| `#scene, #game-canvas` | Cover the viewport with the 3D surface |
| `.topbar`, `.bottom-bar` | Position the persistent header and footer |
| `.intro`, `h1`, `.brief` | Style the opening screen |
| `.mission`, `.objective` | Format objectives; `.done` adds the cancelled appearance |
| `.round-stats`, `.timer`, `.time-track`, `.ammo` | Present round information |
| `.aim-panel`, `.power-track` | Position shot controls and visualize charging |
| `.toast` and `.toast.visible` | Fade short feedback in and out |
| `.dialog-backdrop`, `.game-dialog` | Dim/blur the background and center a dialog |
| Button rules | Hover appearance, focus outline, disabled appearance |

Important mechanisms:

- `position: absolute` places panels relative to their containing area.
- `z-index` controls which HTML layer is above another. It is unrelated to world-space Z coordinates.
- `pointer-events: none` lets pointer input pass through decorative panels to the canvas. Interactive buttons re-enable pointer events.
- `touch-action: none` tells the browser not to interpret canvas gestures as normal page panning/zooming.
- `[hidden] { display: none !important; }` makes the HTML `hidden` property reliably hide interface sections.
- Setting a progress bar's child width from JavaScript changes the visible amount of power/time.

The principal visibility rule is:

```css
body[data-status="ready"] .play-only { display: none; }
```

When the game leaves `ready`, the intro is hidden and gameplay panels are shown. The pause and result dialogs appear over these panels.

Responsive rules handle widths below 1150 and 760 pixels, desktop versus narrow placement of the power panel, coarse pointers, and shorter screens. On narrow screens the touch controls are shown. `100dvh` follows the browser's dynamic viewport height.

The reduced-motion media query disables **CSS transitions**. It does not disable the requestAnimationFrame loop or all 3D movement; do not describe it as a complete reduced-animation game mode.

**Explain it aloud:** “The game has a 3D canvas underneath a normal HTML interface. CSS arranges the panels, while JavaScript keeps their contents synchronized with the game state.”

## The scene and renderer

### `js/scene.js`

[Open the file](js/scene.js).

This module exports the shared `scene`, `camera`, and `renderer`. Other modules import those same instances, so they all contribute to the same world.

#### Scene background and fog

```js
scene.background = new THREE.Color(0xcbd5c3);
scene.fog = new THREE.Fog(0xcbd5c3, 48, 115);
```

The background is a color behind the scene. The fog blends supported materials toward that color over a distance range. It starts at 48 and reaches its full effect at 115 world units of view-space depth.

This is a visual depth cue, not a volumetric cloud or weather simulation. Built-in materials support the necessary fog shader code. The custom water/flag shaders do not add fog calculations, so setting `scene.fog` does not automatically give those shaders the same fog behavior.

#### Camera setup

```js
new THREE.PerspectiveCamera(43, innerWidth / innerHeight, 0.1, 180);
```

| Argument | Value | Meaning |
| --- | --- | --- |
| Field of view | 43 | Vertical field of view in degrees |
| Aspect ratio | Width / height | Viewport proportions |
| Near plane | 0.1 | Nearest clipping distance |
| Far plane | 180 | Farthest clipping distance |

The initial position and `lookAt(0, 2, 0)` provide a starting view. `camera.js` subsequently updates the position and look-at target every frame, so its values determine the ongoing view.

#### Renderer settings

| Setting | Meaning |
| --- | --- |
| `antialias: true` | Requests multisample anti-aliasing to reduce jagged geometry edges |
| `setSize` | Sets drawing dimensions |
| Pixel ratio capped at 2 | Limits the pixel workload on high-density displays |
| `outputColorSpace = SRGBColorSpace` | Produces display-oriented output colors |
| `ACESFilmicToneMapping` | Compresses bright rendered values into a displayable tonal range |
| `toneMappingExposure = 1.15` | Adjusts exposure used by tone mapping |
| `shadowMap.enabled = true` | Enables rendering shadow maps |
| `PCFSoftShadowMap` | Selects filtered shadow sampling for softer-looking edges |

**Tone mapping is not a light.** It changes the presentation of calculated colors; it does not add another lamp to the scene.

`renderer.domElement` is the `<canvas>` that WebGL draws into. Giving it an ID allows CSS and JavaScript to select it. `tabIndex = -1` allows the code to focus it programmatically without placing it in the normal Tab sequence. It is appended to the `#scene` HTML container.

## Procedural textures

### `js/textures.js`

[Open the file](js/textures.js).

The active textures are generated with the browser's Canvas 2D drawing API. A texture does not need to begin as a downloaded PNG: a canvas containing pixels can also supply image data to a GPU texture.

There are two different uses of canvas here:

1. The visible WebGL canvas renders the complete 3D world.
2. Small offscreen 2D canvases are drawn once to create surface textures.

#### `random()` and the seed

```js
seed = (1664525 * seed + 1013904223) >>> 0;
return seed / 4294967296;
```

This is a simple seeded pseudorandom generator. `>>> 0` converts the result to an unsigned 32-bit integer. Dividing by 2³² produces a number from zero up to, but not including, one.

Starting from seed 42 produces the same sequence when the same drawing operations occur in the same order. That gives the brick/grass patterns stable variation after reloading. It is not a cryptographic random generator, and changing the order of texture generation changes later patterns.

#### `canvasTexture(draw, width = 256, height = width)`

This helper:

1. Creates a canvas and sets its pixel dimensions.
2. Gets its 2D drawing context.
3. Calls the supplied drawing function with that context and dimensions.
4. Constructs `new THREE.CanvasTexture(canvas)`.
5. Marks it as an sRGB color texture and sets anisotropy to 4.
6. Returns the texture for use in materials or shader uniforms.

Anisotropic filtering can improve texture clarity at slanted viewing angles, such as the ground viewed from the camera. It does not add polygons.

#### `repeat(texture, x = 1, y = x)`

`wrapS` and `wrapT` choose horizontal and vertical wrapping. `RepeatWrapping` makes sampling outside the normal texture range wrap around. `texture.repeat.set(x, y)` describes the repeat transform used by built-in mapped materials.

**Important distinction:** a custom shader that directly calls `texture2D` with its own coordinates does not automatically apply the texture's repeat matrix. In this project's water shader, visible tiling comes from `position.xy * 0.13` plus repeat wrapping; the `repeat(..., 8)` property is not automatically an extra eightfold UV multiplier in that shader.

#### Every texture in this file

| Export | Drawing operations | Used for |
| --- | --- | --- |
| `stoneTexture` | Alternating rows of colored rectangles and highlights | Castle walls, trims, island base, paths, rocks |
| `woodTexture` | Brown background, plank gaps, curved grain strokes | Bridge, cannon carriage, trunks, poles |
| `grassTexture` | Green background and many small varied marks | Terrain, tree foliage, tinted student clothing |
| `roofTexture` | Offset tile rows with darker bottom edges | Roofs and some tinted student details |
| `metalTexture` | Dark background with fine light streaks | Cannon metal, wheels, chains, student details |
| `paperTexture` | Cream paper, ruled lines, and an `A+?` mark | Assignments, particles, guide dots, clouds, some tinted model parts |
| `waterTexture` | Teal background and short curved pale strokes | Moat shader and splash particles |
| `flagTexture` | Gold background, border, and letter U | University flag |
| `signTexture(title, subtitle, color)` | Draws text and a border on a 512 × 180 canvas | University sign and target captions |
| `targetTexture` | Five alternating red/cream concentric circles | Bullseyes |

Canvas operations are straightforward drawing commands: `fillRect` paints a rectangle, `strokeRect` outlines one, `arc` creates a circular path, `fillText` draws text, and Bézier/quadratic curves draw smooth strokes.

`row % 2` alternates between two row patterns, creating staggered bricks or tiles. `Math.floor(random() * 4)` chooses one of four palette entries.

Material `color` tints multiply the mapped color. That is why several objects can reuse one texture but appear different. Sharing a texture also avoids creating an unnecessary image for every mesh.

**Checkpoint:** explain why a generated canvas still fulfills the texture requirement, and why a texture image alone does not define how a surface responds to light.

## Lighting and the changing sky

### `js/lights.js`

[Open the file](js/lights.js).

Two lights are added to the shared scene during module initialization.

```js
export const ambientLight = new THREE.HemisphereLight(0xfff1d1, 0x51675d, 2.1);
export const sunLight = new THREE.DirectionalLight(0xffe4b5, 3.2);
```

Despite its variable name, `ambientLight` is a **HemisphereLight**, not an instance of `AmbientLight`. It provides a sky color and a ground color blended according to surface orientation. It supplies a soft fill so shadowed sides remain readable. It does not cast shadows.

The directional light represents the sun. Its rays behave as parallel rays across the scene rather than light spreading out from a nearby bulb. Its position relative to its target determines the light direction. The target remains at its default origin here.

#### The three requirements for ordinary mesh shadows

1. The renderer must enable shadow maps.
2. The light must have `castShadow = true`.
3. Relevant meshes must enable `castShadow` and/or `receiveShadow`.

The sun's shadow map is 2048 × 2048. Its shadow camera covers X/Y bounds from −27 to +27 and a depth interval from 1 to 75. A shadow map records which surfaces are closest to the light, then uses that information while shading the scene.

`normalBias` and `bias` are small offsets used to reduce surface self-shadow artifacts. Large values can detach shadows from objects; small or unsuitable values can leave speckled artifacts often called shadow acne.

### `js/sky.js`

[Open the file](js/sky.js).

This file stores named day, sunset, dusk, and sunlight colors. `updateSky(progress)` receives a value from zero to one:

```js
const progress = round.elapsed / ROUND_SECONDS;
```

It clamps that value, interpolates the scene background toward sunset, and adds a dusk color after 78% of the round. `copy(day)` resets the starting color each update before `lerp(...)`; this makes the result depend on round progress rather than on how many frames were rendered.

It also:

- Copies the background color to the fog color.
- Warms the sun's color.
- Reduces sunlight intensity from 3.2 toward 1.3.
- Lowers the sun's Y position from 24 toward 6.
- Reduces hemisphere intensity from 2.1 toward 1.35.

At halfway through the round, `t = 0.5`: sunlight intensity is `3.2 − 0.5 × 1.9 = 2.25`, and its height is `24 − 0.5 × 18 = 15`.

This is an artistic time-of-day simulation driven by game progress. It does not calculate a geographic sun position, real calendar time, or physically accurate atmospheric scattering.

The water and flag shaders receive their own daylight scalars in their respective update functions. They are not automatically illuminated by the scene's two lights.

## Building and animating the castle

### `js/castle.js`

[Open the file](js/castle.js).

This module creates the island, buildings, targets, flag, and decorative scenery. Most of its code runs once at startup. Only its update/reset functions repeatedly change the resulting objects.

#### Materials and tracking arrays

The stone, trim, grass, roof, wood, dark wood, and path materials use `MeshStandardMaterial`. High roughness values keep the scene's surfaces mostly matte.

Three arrays have different responsibilities:

| Array | Contents | Why it exists |
| --- | --- | --- |
| `solids` | Structural meshes used for projectile collisions | Collision queries should not test every decorative object |
| `targets` | Target definitions plus meshes, groups, size, and destroyed status | Links logical objectives to visible objects |
| `roofs` | Tower roofs, home positions, target IDs, and fall ages | Allows a roof to fall and later reset |

#### The `mesh(...)` and `box(...)` helpers

`mesh(geometry, material, x, y, z, solid, parent)` constructs a mesh, positions it, enables shadow flags, attaches it to a parent, optionally adds it to `solids`, and returns it.

`box(w, h, d, x, y, z, material, solid, parent)` creates `BoxGeometry` and delegates to `mesh`.

Their defaults differ: `mesh` defaults to non-solid; `box` defaults to solid. Here “solid” means “included in our collision list.” Three.js does not automatically make a mesh collidable because it looks solid.

#### The island and moat layout

The island base is a broad cylinder. The inner lawn is another cylinder with radius 10.2. An outer grass ring begins at radius 13.75 and extends to 24. The space between the inner and outer land is occupied by the moat from `water.js`.

The firing road is a ring from radius 15.7 to 17.95. The cannon moves at radius 16.8, inside that road. Torus geometries make thin stone rims around the banks. Rectangular path boxes connect the castle gate to the bridge area.

Rings begin in their local XY plane. Rotating them by `−π/2` around X lays them on the world's horizontal XZ plane.

#### Walls and gate

The code uses separate boxes for the back wall, two side walls, two front wall sections, and the lintel over the gate. There are **six primary wall boxes** in these calls, despite an older nearby comment referring to five sections.

The front is split so there is a real geometric opening between the two front sections. The opening is not a doorway painted onto a solid wall. The overhead box and trim define the upper boundary.

Loops place small battlement boxes along the wall tops. The front-wall loop skips positions near the middle so the gate remains readable.

#### `tower(x, z, id)`

Each tower is made from:

1. A slightly tapered cylinder for the body.
2. A short wider cylinder as trim.
3. A cone roof.
4. A small sphere at the roof tip.

The first two towers at Z = 6 receive target IDs `classes` and `quizzes`. Their roofs can therefore be matched to a cancelled objective. The rear towers have no game target ID. Rear decorative windows are dark boxes with lighter sills.

The roof record stores `home: top.position.clone()`. A copy is essential: keeping a direct reference to the moving position would also change the supposed “home” value during animation.

#### Main hall and campus sign

The keep is a tall box. A four-sided cone rotated by `π/4` forms its roof. Small dark boxes make windows, and trim boxes create sills. The university sign is a textured plane using `signTexture(...)`.

These are geometric approximations suited to a small lab scene. There is no modeled building interior.

#### Flag

A narrow wood box forms the pole. A plane of width 1.9 and height 1.08, subdivided into 18 × 6 segments, forms the cloth.

Its `ShaderMaterial` receives `uTime`, `uMap`, and `uDaylight`. The subdivisions let the vertex shader bend different parts of the cloth by different amounts. `DoubleSide` makes the plane visible from both directions.

#### Target construction

The loop over `TARGETS` creates one group per objective at its configured position. Tower targets have radius 1.03; the final has radius 0.85.

A short cylinder gives each target thickness. A slightly forward circle provides the clear front bullseye texture. Keeping the front circle slightly separated from the backing also avoids two surfaces competing at exactly the same depth, an artifact called **z-fighting**.

Each tower target includes a caption plane below the bullseye. The final has no caption plane. `userData.targetId` stores a useful identifier on its meshes, although the current collision system reads the `targets` array directly rather than relying on that metadata.

The complete target record combines its original definition with `group`, `face`, `circle`, `label`, `size`, and `destroyed` fields.

#### `tree(...)`, rocks, and clouds

`tree(x, z, scale)` groups a narrow cylinder trunk and three stacked cones. Parent scaling changes the entire tree together.

The scenery loops use sine/cosine and a changing angle to distribute trees and rocks without a square grid. Trees are skipped in part of the foreground to keep the initial view clearer. Rocks are low-detail dodecahedrons.

Clouds are groups of scaled spheres using the paper texture. They are solid meshes, not fog volumes or fluid simulations. Their group drifts gently along X.

#### The three exported behavior functions

| Function | Behavior |
| --- | --- |
| `destroyTarget(id)` | Marks the matching visual target destroyed, hides its group, and starts its roof's fall age at zero |
| `resetCastle()` | Shows targets/roofs, clears destroyed flags, restores roof home positions and rotations |
| `updateCastle(time, delta, progress, unlocked)` | Updates flag uniforms, cloud drift, final-target tint, and falling roofs |

A roof that is not falling has `age = -1`. Once triggered, age increases with delta. Its motion includes:

```js
top.mesh.position.y = top.home.y + top.age * 2.3 - top.age * top.age * 4;
```

The positive linear term gives an initial upward movement; the negative squared term pulls it downward more strongly as time passes. X movement and rotation make it tumble outward. At age greater than 1.7 seconds, it is hidden.

This is scripted destruction: walls do not fracture into simulated rigid bodies. While a falling roof remains visible in `solids`, it can still participate in collision checks; once hidden, the controller skips it.

**Explain it aloud:** “I can build a recognizable castle by combining boxes, cylinders, cones, and planes. Groups handle related parts, shared materials keep the style consistent, and tracking arrays let gameplay control selected models.”

## The orbiting camera

### `js/camera.js`

[Open the file](js/camera.js).

The module stores `radius`, `renderedAngle`, and `framing`.

- `radius` starts at 37 and controls the camera's base distance.
- `renderedAngle` follows the cannon's orbit angle smoothly.
- `framing` blends between the introductory composition and the centered gameplay view.

`zoomCamera(amount)` adds an amount to the base radius, clamped between 27 and 43. `resetCamera()` restores the radius and angle. Framing is eased toward the correct mode by `updateCamera`, rather than explicitly reset by `resetCamera`.

#### Circular movement

```js
x = Math.sin(renderedAngle) * responsiveRadius;
z = Math.cos(renderedAngle) * responsiveRadius;
```

Sine and cosine produce points on a circle. At angle 0, X is 0 and Z is positive radius. At `π/2`, X is positive radius and Z is 0. The camera's Y coordinate is half the responsive radius.

Its horizontal path is circular. Its actual distance from the look-at point also depends on that height; `radius` is not a promise of the exact three-dimensional distance to the castle.

#### Smooth following

```js
renderedAngle += (targetAngle - renderedAngle) * (1 - Math.exp(-delta * 6));
```

The camera moves some fraction of the remaining angular difference each update. The exponential factor uses elapsed time so the smoothing is approximately consistent across normal frame rates.

The cannon moves directly to its requested orbit position; the camera catches up smoothly. During the intro the requested angle is 0.35 radians to show the castle at a slight angle.

#### Responsive framing

When the aspect ratio becomes narrow, `responsiveRadius` increases to fit more of the scene. `camera.lookAt(0, 0.5, 0)` points toward the castle area.

`setViewOffset(...)` shifts the projection's framing. During the intro it makes room for text and adjusts the narrow-screen composition. During play, the framing value approaches zero, returning to the normal centered view.

This project implements its own simple camera controls; it does not use Three.js `OrbitControls`.

## The drawbridge and its chains

### `js/drawbridge.js`

[Open the file](js/drawbridge.js).

The bridge is a wood-textured box, 3 units wide, 0.24 high, and 4.85 long. A group called `pivot` is positioned at `(0, 0.18, 9.15)`.

```js
bridge.position.z = 2.425;
pivot.add(bridge);
```

Since 2.425 is half the bridge length, the bridge extends from the group's origin outward along positive local Z. This places the group's origin at the hinge end.

When the pivot rotates about X:

- Angle 0 leaves the bridge lowered.
- Angle `−π/2` raises it vertically.

If the box had remained centered on the pivot, half would rotate below/behind the hinge. That is why the local position offset is necessary.

Metal braces are attached to the pivot so they follow the bridge automatically. Wood posts are separate objects anchored to the ground. The “chains” are thin textured cylinders approximating straight chain segments, not linked-chain physics.

#### `updateDrawbridge(age, unlocked)`

Before unlocking, the pivot remains raised. After unlocking, its angle comes from `bridgeAngleAt(age)` in the rules module. Calling `pivot.updateMatrixWorld(true)` updates its transform and its children before calculating chain attachment positions.

For each chain:

```js
const end = pivot.localToWorld(new THREE.Vector3(chain.x, 0.12, 4.65));
const direction = end.clone().sub(chain.anchor);
chain.mesh.position.copy(end).add(chain.anchor).multiplyScalar(0.5);
chain.mesh.scale.y = direction.length();
chain.mesh.quaternion.setFromUnitVectors(up, direction.normalize());
```

Here is the geometry behind those lines:

1. Transform the attachment point near the bridge tip into world coordinates.
2. Subtract the fixed anchor to find the vector from anchor to tip.
3. Put the cylinder at the midpoint of those two points.
4. Stretch its original unit height to the distance between them.
5. Rotate its local upward axis to align with that direction.

A **quaternion** represents a rotation. `setFromUnitVectors` lets Three.js calculate the rotation from one normalized direction to another without us manually deriving three Euler angles.

#### Open and closed status

`isBridgeOpen()` returns true when the pivot's X angle is greater than −0.12 radians: nearly lowered. `bridgeState()` displays `OPEN`, `CLOSED` below −1.45, and `MOVING` otherwise.

These tolerance thresholds make the game/UI accept an almost-lowered bridge as open. They are separate from the exact hold intervals in the animation schedule.

## The cannon and student

### `js/cannon.js`

[Open the file](js/cannon.js).

This file builds the cannon from a box carriage, cylinder wheels, torus rims, sphere hubs, a cylinder barrel, and muzzle/breech pieces. A small student uses cylinders, spheres, boxes, and tinted shared textures.

`add(...)` is a local helper similar to the castle's mesh helper: create, position, enable shadows, attach to a parent, and return the mesh.

#### The transform hierarchy

```text
cannon                    moves around the castle and turns with its orbit
├── carriage and wheels
├── student               moves with the cannon
└── yaw                   turns the gun sideways
    └── elevation         tilts the gun up/down
        └── barrel        moves backward briefly for recoil
```

The wheels begin as cylinders along Y, then rotate about Z so their axles point sideways. Torus rims also rotate to face sideways. The barrel's cylinder rotates about X so its length runs along the gun's local Z axis.

`CylinderGeometry(..., true)` uses the `openEnded` option to omit its end caps. Additional geometry makes the visible muzzle and dark interior.

#### `updateCannon(angle, aim, pitch, delta, time)`

The root position follows a circle of radius `CANNON_RADIUS = 16.8`. Its root Y rotation matches the orbit angle.

The yaw group rotates by `Math.PI + aim`. Adding π turns the local forward direction inward toward the castle, while `aim` adds the player's sideways adjustment. The elevation group uses `rotation.x = -pitch` so a positive pitch points the barrel upward.

The student gently sways with a sine function. This is a decorative idle animation, not a walking or skeletal animation system.

Recoil begins at 0.45 when `kickCannon()` runs. Each update multiplies it by `exp(-delta * 10)`, bringing it smoothly back toward zero. The barrel's local Z position is the negative recoil value.

#### `launchParameters(power)`

```js
const origin = elevation.localToWorld(new THREE.Vector3(0, 0, 2.05));
const direction = new THREE.Vector3(0, 0, 1)
  .transformDirection(elevation.matrixWorld);
return { origin, velocity: direction.multiplyScalar(shotSpeed(power)) };
```

The first line converts a point just ahead of the barrel into the world-space launch origin. The second transforms the gun's forward direction into a normalized world direction. Multiplying by speed turns that direction into velocity in world units per second.

Using the elevation group's transform includes the parent's orbit and yaw rotations. The code does not have to separately rederive the full direction every time.

The launch transform belongs to `elevation`, while recoil moves the child `barrel`. Recoil is therefore a visual effect and does not unexpectedly change the next trajectory's mathematical launch origin.

**Checkpoint:** explain the difference between the cannon's orbit angle, its aim/yaw offset, and its elevation/pitch.
