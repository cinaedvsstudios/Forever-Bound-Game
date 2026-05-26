# Artifex Effect Editor — Fast Real Split Instructions

## Purpose

This task is to finish the real split of `artifex/apps/effect-editor/index.html`.

The goal is **not** to add new features yet.
The goal is **not** to wrap the existing editor in an iframe.
The goal is **not** to create scaffolds that are not used.

The goal is:

> Take the last confirmed working monolithic Effect Editor, physically extract working code into smaller real files, wire those files into the live editor, and reduce `index.html` until it is a small page shell that directly loads modules.

The final result must still render effects, show the grid, populate Insert, allow layers to be added, and keep panel resizing working.

## Critical context

Repository:

`cinaedvsstudios/Forever-Bound-Game`

Confirmed working render branch:

`fb-effect-base`

Confirmed working source file:

`artifex/apps/effect-editor/index.html`

Known good base commit:

`fed68ad0526bca288f6ba41f1bcc0413de5355d0`

Confirmed working branch commit after tracker:

`c3957a875021e85a615bd64bf5906a100e75be01`

Do **not** use broken branches as source of truth.

Broken / unreliable branches include:

- `effect-editor-reapply-phase1b`
- `effect-editor-render-restore`
- `fb-effect-wire-debug`
- any branch where effects do not render
- any branch where Insert is blank
- any branch using iframe shell as the final solution

Useful scaffold branch:

`fb-effect-split1`

This branch has useful module files already created, but the real monolith split is not complete.

## Non-negotiable rule

Do not call the split complete while a giant monolithic `index.html` or `index-core.html` still contains most of the live editor logic.

A wrapper/iframe shell does **not** count as a real split.

A debug smoke test does **not** count as a real split.

Scaffold files that are not wired into the live editor do **not** count as a real split.

## Work method that must be used

Use a real local checkout or an environment with the full repository files available.

Do **not** try to rewrite the huge HTML through GitHub Contents API one small patch at a time.

Do **not** use GitHub Actions to patch the file indirectly.

Do **not** manually paste huge files through chat.

Use normal filesystem operations and local scripts.

Recommended setup:

```bash
git clone https://github.com/cinaedvsstudios/Forever-Bound-Game.git
cd Forever-Bound-Game
git fetch origin
git checkout -b effect-editor-real-split origin/fb-effect-base
```

If `fb-effect-base` is not available locally:

```bash
git checkout -b effect-editor-real-split fed68ad0526bca288f6ba41f1bcc0413de5355d0
```

## Branch naming

Use one branch only:

`effect-editor-real-split`

Do not create many experiment branches unless a rollback is required.

## Versioning

Each successful extraction step must update the visible badge in the editor header.

Use these labels:

- Step 1: `v2.3.1 SPLIT-PRESETS`
- Step 2: `v2.3.2 SPLIT-MENU`
- Step 3: `v2.3.3 SPLIT-STATE`
- Step 4: `v2.3.4 SPLIT-IO`
- Step 5: `v2.3.5 SPLIT-RUNTIME`
- Step 6: `v2.3.6 SPLIT-RENDERER`
- Step 7: `v2.3.7 SPLIT-UI`
- Step 8: `v2.3.8 SPLIT-CLEAN`

Every status report must include:

- current step number out of 8
- version label
- steps remaining
- commit SHA
- test URL
- changed files
- exact manual test checklist

## Final target structure

Create and wire this structure:

```text
artifex/apps/effect-editor/
  index.html
  src/
    editor-app.js
    editor-state.js
    editor-ui.js
    editor-io.js
    editor-renderer.js
    fx-runtime.js
    editor-debug.js
    presets/
      base-effects.js
      composite-effects.js
```

`index.html` should become mostly:

- HTML layout
- CSS/style references
- script imports

It should not contain large data registries, particle classes, render loops, import/export logic, menu logic, or UI controller functions by the end.

## Step 0 — safety backup

Before modifying the monolith, copy the working file to a backup file:

```bash
cp artifex/apps/effect-editor/index.html artifex/apps/effect-editor/index.monolith.backup.html
```

This backup is only for recovery. It is not the final runtime file.

## Step 1 / 8 — Extract presets and composites

Version label:

`v2.3.1 SPLIT-PRESETS`

Move these out of `index.html`:

- `PRESETS_REGISTRY`
- `COMPOSITES_REGISTRY`

Create:

`src/presets/base-effects.js`

It must export:

```js
export const PRESETS_REGISTRY = { ... };
export const BASE_EFFECT_PRESETS = PRESETS_REGISTRY;
export function cloneBasePreset(category, id) { ... }
export function listBaseCategories() { ... }
```

Create:

`src/presets/composite-effects.js`

It must export:

```js
export const COMPOSITES_REGISTRY = [ ... ];
export const COMPOSITE_EFFECT_PRESETS = COMPOSITES_REGISTRY;
export function cloneCompositePreset(id) { ... }
```

Create or update:

`src/editor-app.js`

It should import the registries:

```js
import { PRESETS_REGISTRY } from './presets/base-effects.js';
import { COMPOSITES_REGISTRY } from './presets/composite-effects.js';

window.PRESETS_REGISTRY = PRESETS_REGISTRY;
window.COMPOSITES_REGISTRY = COMPOSITES_REGISTRY;
```

Then in `index.html`:

- Remove the inline registry declarations.
- Add `<script type="module" src="./src/editor-app.js"></script>` before the live editor script OR convert the editor script to a module.
- Ensure existing functions still read `PRESETS_REGISTRY` and `COMPOSITES_REGISTRY` from shared scope.

If converting the main script to `type="module"` is simpler, do that, but explicitly attach functions used by inline `onclick` to `window`.

Manual test:

1. Open RawGitHack URL.
2. Confirm version says `v2.3.1 SPLIT-PRESETS`.
3. Confirm grid appears.
4. Open Insert.
5. Confirm Base Effect Layer entries appear.
6. Click Basic Sparks / Standard Particle.
7. Confirm a layer appears in bottom layer list.
8. Confirm particles render.
9. Confirm Composite dropdown still lists bundled composites.
10. Load one composite.
11. Confirm particles render.
12. Resize side panel.
13. Resize bottom panel.
14. Confirm grid labels remain visible.

Commit message:

`Split Effect Editor preset registries`

## Step 2 / 8 — Extract menu and Insert logic

Version label:

`v2.3.2 SPLIT-MENU`

Move these functions into `src/editor-ui.js` or `src/editor-menu.js`:

- `setupDropdownInteractions`
- `closeAllDropdowns`
- `toggleDropdown`
- `toggleAccordion`
- `initPresetLists`
- `populateSubTypeDropdown`
- `populateCompLoaderDropdown`
- `loadCustomPresets`
- shape picker UI helpers if they are tightly menu/UI related

Keep behavior identical.

Inline `onclick` handlers still need global functions on `window`.

Required global exports after extraction:

```js
window.toggleAccordion = toggleAccordion;
window.closeAllDropdowns = closeAllDropdowns;
window.selectEngineCategory = selectEngineCategory;
window.loadCompositionById = loadCompositionById;
window.changeLayerSubType = changeLayerSubType;
window.changeLayerType = changeLayerType;
```

Manual test:

1. File / Edit / View / Insert / Help all open.
2. Shape picker opens.
3. Accordions open and close.
4. No menu appears behind panels.
5. Insert still adds effects.

Commit message:

`Split Effect Editor menu and Insert logic`

## Step 3 / 8 — Extract state and composition logic

Version label:

`v2.3.3 SPLIT-STATE`

Move these into `src/editor-state.js`:

- composition state creation
- layer selection state
- `newConfiguration`
- `loadComposition`
- `selectEngineCategory`
- `changeLayerType`
- `changeLayerSubType`
- `deleteActiveLayer`
- `duplicateLayer`
- `moveLayerUp`
- `moveLayerDown`
- `toggleLayerVis`
- `copyLayerData`
- `pasteLayerData`
- `generateHashID`
- JSON-safe clone helpers

The state module should expose a clear state object:

```js
export const editorState = {
  composition: null,
  customPresets: [],
  activeLayerIndex: -1,
  layerClipboard: null,
  lastSavedTime: null,
  isPaused: false,
  emitterPos: { x: 0, y: 0 },
  emitterRatio: { x: 0.5, y: 0.8 }
};
```

Do not leave duplicated state variables in both `index.html` and `editor-state.js`.

Manual test:

1. Add layer.
2. Select layer.
3. Rename layer.
4. Duplicate layer.
5. Hide/show layer.
6. Move layer up/down.
7. Delete layer.
8. Load composite.
9. Confirm render still works.

Commit message:

`Split Effect Editor state and layer logic`

## Step 4 / 8 — Extract import/export/localStorage/save logic

Version label:

`v2.3.4 SPLIT-IO`

Move into `src/editor-io.js`:

- `exportJSON`
- `handleFileImport`
- `openVariationModal`
- `closeVariationModal`
- `submitSaveVariation`
- `deletePreset`
- `copyToClipboard`
- `syncJSONOutput`
- `validateJSONString`
- `applyManualJSON`
- any localStorage custom preset helpers

Manual test:

1. Add effect.
2. Switch to JSON tab.
3. Confirm JSON appears.
4. Copy JSON.
5. Export JSON.
6. Save New Version.
7. Confirm custom preset appears in Custom Effect.
8. Delete custom preset.
9. Import a JSON file.
10. Confirm imported layers render.

Commit message:

`Split Effect Editor IO and persistence logic`

## Step 5 / 8 — Extract particle runtime

Version label:

`v2.3.5 SPLIT-RUNTIME`

Move into `src/fx-runtime.js`:

- `Particle` class
- `SHAPE_DEFS`
- `interpolateColorAlpha`
- `interpolateColorsMulti`
- any pure particle update/draw helpers

Important:

Renderer can still call runtime functions, but runtime should not know about DOM panels.

Allowed dependencies:

- runtime can receive `gridBounds`, `scaleFactor`, and config as arguments
- runtime should not directly read DOM

Manual test:

1. Add each base engine type.
2. Confirm each renders:
   - particles
   - ribbon
   - ring
   - lightning
   - projectile
   - gas
   - refraction
   - lensflare
3. Confirm visual shape picker still changes particle shape.
4. Confirm color controls still affect particles.
5. Confirm alpha changes still work.
6. Confirm no console errors.

Commit message:

`Split Effect Editor particle runtime`

## Step 6 / 8 — Extract renderer/canvas/grid/resize

Version label:

`v2.3.6 SPLIT-RENDERER`

Move into `src/editor-renderer.js`:

- canvas lookup and setup
- `resizeCanvas`
- `updateGridBounds`
- `drawGrid`
- `drawVideoOverlayHUD`
- `tick`
- `drawEmitterHud`
- `calculateFPS`
- `clampEmitterPosition`
- `updateEmitterFromRatio`
- `updateRatioFromEmitter`
- `clampPan`
- zoom/pan canvas coordinate helpers

This is the highest-risk step. Do not combine it with other changes.

Manual test:

1. Open page.
2. Grid appears immediately.
3. Add effect.
4. Particles render.
5. Resize side panel.
6. Resize bottom panel.
7. Grid labels remain visible.
8. Particles remain visible after resize.
9. Zoom in/out.
10. Reset zoom.
11. Drag emitter.
12. Toggle HUD Reticle.
13. Toggle Floor Bounce.
14. Toggle Mouse Lock.
15. Check Debug Console / browser console for errors.

Commit message:

`Split Effect Editor renderer and canvas loop`

## Step 7 / 8 — Extract remaining UI sync and controls

Version label:

`v2.3.7 SPLIT-UI`

Move into `src/editor-ui.js`:

- `syncUIFromConfig`
- `renderLayerList`
- `renderColorControls`
- `addColorStop`
- `deleteColorStop`
- `updateColorStop`
- `updateAlphaStop`
- drag/drop color stop handlers
- `switchTab`
- `showToast`
- `toggleCard`
- `syncViewportUI`
- `syncToolbarButton`
- `setWorkspaceMode`
- `setupCoordinatesInputs`
- `syncCoordinatesControls`
- `setupZoomControls`
- parameter binding helpers

Manual test:

1. All tabs work.
2. All sliders work.
3. Color stop add/delete/reorder works.
4. Alpha sliders work.
5. Layer list updates.
6. Toasts appear.
7. Cards collapse/expand.
8. View buttons sync top menu + bottom panel.
9. No broken inline onclick handlers.

Commit message:

`Split Effect Editor UI controls`

## Step 8 / 8 — Cleanup and remove monolith leftovers

Version label:

`v2.3.8 SPLIT-CLEAN`

Remove dead duplicate code from `index.html`.

At the end, `index.html` should contain:

- HTML layout
- Tailwind/fonts/style
- minimal script imports
- no giant registries
- no Particle class
- no render loop
- no save/load logic
- no menu population logic
- no state management logic

If a temporary `index-core.html` or `index.monolith.backup.html` exists, do not keep it as part of the runtime path. Either delete it or move it to docs/archive if required.

Create:

`artifex/apps/effect-editor/docs/real-split-completion-report.md`

Include:

- final branch
- final commit SHA
- list of modules
- what each module owns
- manual test results
- known remaining issues
- explicit confirmation that this is no longer an iframe/wrapper solution
- explicit confirmation that the old monolith is not the active runtime

Manual final acceptance:

1. Open RawGitHack URL.
2. Version says `v2.3.8 SPLIT-CLEAN`.
3. Grid appears.
4. File menu opens.
5. Edit menu opens.
6. View menu opens.
7. Insert menu opens.
8. Help menu opens.
9. Insert base layer.
10. Particles render.
11. Load composite.
12. Composite renders.
13. Change sliders.
14. Visual changes apply.
15. Add/delete/reorder color stops.
16. Save custom effect.
17. Reload page.
18. Custom effect persists.
19. Export JSON.
20. Import JSON.
21. Resize side panel.
22. Resize bottom panel.
23. Grid labels stay visible.
24. Particles stay visible.
25. Browser console has no fatal errors.
26. Debug Console, if included, reports canvas found and errors 0.

Commit message:

`Complete Effect Editor real module split`

## Do not do these things

Do not add new features during the split.

Do not change resolution behavior.

Do not change particle math except where required to move the exact same code.

Do not change canvas scale/devicePixelRatio behavior.

Do not alter brush rendering yet.

Do not add emitter target controls yet.

Do not add thumbnail save flow yet.

Do not add local-storage export browser yet.

Do not rename menus except version labels.

Do not rewrite the UI design.

Do not rely on iframe shell as the final result.

Do not say the split is done while the old monolith is still the runtime.

## Fastest safe execution order

The fastest way is:

1. Use local script extraction.
2. Commit after each working extraction.
3. Test in browser after each commit.
4. Do not hand-edit huge files in GitHub UI.
5. Do not use GitHub Contents API for the huge file.
6. Use `git diff --stat` and `git diff --check` after every step.
7. Keep each extraction isolated.

Recommended local checks:

```bash
git diff --check
git status --short
python3 -m http.server 8080
```

Then open:

`http://localhost:8080/artifex/apps/effect-editor/index.html`

For RawGitHack test after pushing:

`https://raw.githack.com/cinaedvsstudios/Forever-Bound-Game/effect-editor-real-split/artifex/apps/effect-editor/index.html`

## Required final response format after every step

Use this format exactly:

```text
Step: X / 8
Version: v2.3.X SPLIT-...
Steps left: Y
Branch: effect-editor-real-split
Commit: <sha>

Changed files:
- ...

What changed:
- ...

What was not changed:
- rendering math
- canvas scale
- particle behavior
- resolution behavior

Test URL:
...

Manual checks:
1. ...
2. ...

Result:
PASS / FAIL / NEEDS USER TEST
```

## Main success condition

The work is successful only when:

- `index.html` is genuinely small
- the old monolith is no longer the runtime
- modules own the editor logic
- effects render
- Insert works
- grid works
- resize works
- save/load still works
- future changes can be made in small files without editing a giant `index.html`
