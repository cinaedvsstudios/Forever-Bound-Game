# Obstacle Course File Dependencies README

This document is the local file-dependency map for the obstacle-course module. It defines what each file is allowed to control so the module does not become another stack of overlapping patches.

## Branch rule

Architecture cleanup happens on:

`refactor/obstacle-course-architecture-v3-0-5`

Do not refactor this module directly on `main`. `main` should only receive a tested version after the branch is verified.

## Runtime flow

The intended load order is:

1. `index.html` loads `src/js/main.js`.
2. `src/js/main.js` imports `obstacle-course-runtime.js` with the matching cache version.
3. `obstacle-course-runtime.js` applies defaults from `obstacle-course-settings.js`.
4. Runtime mounts UI using `obstacle-course-ui.js`.
5. Runtime initialises Three.js using `obstacle-course-scene.js`.
6. Runtime loads required assets using `obstacle-course-loader.js`.
7. Runtime builds ground/path using `obstacle-course-ground-path.js`.
8. Runtime scatters environmental scenery using `obstacle-course-scenery.js`.
9. Runtime adds gameplay obstacles and collectibles using `obstacle-course-obstacles.js` and `obstacle-course-collectibles.js`.
10. Runtime unlocks controls.
11. Runtime loads optional GLB/audio assets.
12. Runtime rebuilds scenery once with loaded GLBs.

## File ownership

### index.html
Static page shell only. It owns the initial page container, visible title/version, shell CSS, and the script tag. It must not contain gameplay logic, asset loading, settings, movement, GLB logic, or scene building.

### src/js/main.js
Boot file only. It owns the temporary loading card and imports the runtime with the correct cache version. It must not contain gameplay, scene, loader, settings, path, GLB, audio, or UI-control logic.

### obstacle-course-state.js
Runtime state and constants only. It owns `VERSION`, `CACHE_VERSION`, constants, and the `OC` object. It must not access the DOM or contain behavior functions.

### obstacle-course-settings.js
User-facing course configuration only. It owns `DEFAULT_SETTINGS`, imported/exported setting shape, layer defaults, GLB defaults, and applying settings into `OC`. It must not own asset URLs, loading, scene building, movement, or UI markup.

### obstacle-course-assets.js
Asset registry only. It owns `ASSETS`, `GLB_ASSETS`, `TEMPLATES`, `requiredAssetList`, and `optionalAssetList`. It must not load files, mutate runtime state, or build scene objects.

### obstacle-course-loader.js
Asset loading only. It owns required/optional asset loading, ground tile preloading, JSON loading, and load/failure status. It must not build meshes, place objects, move the horse, or create UI layout.

### obstacle-course-scene.js
Three.js scene lifecycle only. It owns renderer, scene, camera, lights, render loop, resizing, textures, background plate, and selection helpers. It must not own course generation, path math, or GLB asset registry.

### obstacle-course-ground-path.js
Ground/path only. It owns path sequence resolution, path centre/width math, path status, clearing world layers for rebuild, and building visible ground/path tile meshes. It must not scatter trees, decorative rocks, ferns, obstacles, or collectibles.

### obstacle-course-scenery.js
Environmental scenery only. It owns tree, decorative rock, fern/detail scatter, fallback scenery geometry, seeded placement, scenery distance from path, and tree screen-edge falloff. It must not own path source generation, movement, collision, or asset loading.

### obstacle-course-glb.js
GLB mechanics only. It owns loading, cloning, normalising, grounding, instancing, and applying GLB material visuals. It must not own GLB picker UI, layer UI, or scenery placement decisions.

### obstacle-course-glb-controls.js
Future split target. It should own GLB picker UI, GLB asset selector, GLB sliders, and GLB selection refresh.

### obstacle-course-layers.js
Layer mechanics only. It owns `makeLayer`, `registerEntity`, layer transform/visibility application, and layer material visual application. It must not own layer slider UI after refactor.

### obstacle-course-layer-controls.js
Future split target. It should own layer select, layer sliders, visible/solo/all/above/below buttons, and layer-control refresh.

### obstacle-course-ui.js
Static layout and generic UI helpers only. It owns header injection, style injection, layout mounting, left panel mounting, generic slider rows, and result text. It must not make gameplay decisions.

### obstacle-course-hud.js
Runtime display only. It owns distance, score, status, loading display, speed badge, and off-path warning display.

### obstacle-course-input.js
Input mapping only. It owns mapping keyboard/touch input into `OC.keys`.

### obstacle-course-movement.js
Movement and run lifecycle only. It owns Start, Pause, Reset, movement update, steering, jumping, speed, completion, and calling collision/audio hooks.

### obstacle-course-obstacles.js
Gameplay obstacles only. It owns obstacle placement and obstacle collision. It must not own decorative background rocks.

### obstacle-course-collectibles.js
Collectibles only. It owns collectible placement and collection checks.

### obstacle-course-audio.js
Audio only. It owns audio unlock, loops, clips, and jump/land/hit/collect sounds.

### obstacle-course-overview.js
Overview map only. It owns drawing and scheduling the overview.

### obstacle-course-export-import.js
Settings import/export only.

### obstacle-course-asset-debug.js
Debug visibility only. It may report version, active settings, asset status, ground tiles, GLB status, object/entity counts, and UI presence. It must not silently fix runtime state.

## Current first refactor move

The first active move is to split environmental scenery out of `obstacle-course-ground-path.js` and into `obstacle-course-scenery.js`.

This is an architecture-only move. It should not intentionally change visuals or gameplay.
