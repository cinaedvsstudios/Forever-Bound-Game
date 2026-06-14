# Obstacle Course File Dependencies README

This document is the local file-dependency map for the obstacle-course module. It defines what each file is allowed to control so the module does not become another stack of overlapping patches.

## Branch rule

Architecture cleanup happens on:

`refactor/obstacle-course-architecture-v3-0-5`

Do not refactor this module directly on `main`. `main` should only receive a tested version after the branch is verified.

## Version rule

Every code change must bump the obstacle-course app version/cache before testing or merging. The current branch version is `V3.0.10` with cache `3.0.10`.

The version must stay aligned in:

- `index.html` title, version badge, and `src/js/main.js?v=...` script URL
- `src/js/main.js` boot version and boot cache version
- `obstacle-course-state.js` `VERSION` and `CACHE_VERSION`
- `obstacle-course-settings.js` default settings version
- runtime cache-busted dynamic imports such as asset debug
- debug checks that mark the expected version as good/bad

## Runtime flow

The intended load order is:

1. `index.html` loads `src/js/main.js`.
2. `src/js/main.js` imports `obstacle-course-runtime.js` with the matching cache version.
3. `obstacle-course-runtime.js` applies defaults from `obstacle-course-settings.js`.
4. Runtime mounts static UI using `obstacle-course-ui.js`.
5. Runtime binds controls using `obstacle-course-controls.js`.
6. Runtime initialises Three.js using `obstacle-course-scene.js`.
7. Runtime loads required assets using `obstacle-course-loader.js`.
8. Runtime builds ground/path using `obstacle-course-ground-path.js`.
9. Runtime scatters environmental scenery using `obstacle-course-scenery.js`.
10. Runtime adds gameplay obstacles and collectibles using `obstacle-course-obstacles.js` and `obstacle-course-collectibles.js`.
11. Runtime unlocks controls.
12. Runtime loads optional GLB/audio assets.
13. Runtime rebuilds scenery once with loaded GLBs.

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
Environmental scenery only. It owns tree, fern/detail scatter, fallback scenery geometry, seeded placement, scenery distance from path, tree screen-edge falloff, and tree asset banding rules. Most trees should sit on or just beside the two path-edge lines to frame the rideable lane; sparse outer trees can sit beyond them only as background depth. Decorative rocks outside the path should not be generated. Trees close to the ride lane must be scale-capped so large trunk assets do not block the horse route. It must not own path source generation, movement, collision, or asset loading.

### obstacle-course-glb.js
GLB mechanics only. It owns loading, cloning, normalising, grounding, instancing, and applying GLB material visuals. It must not own GLB picker UI, layer UI, or scenery placement decisions.

### obstacle-course-glb-controls.js
GLB UI controls only. It owns GLB picker UI, GLB asset selector, GLB sliders, and GLB selection refresh. It must not load GLBs, normalise GLBs, or place scenery.

### obstacle-course-layers.js
Layer mechanics only. It owns `makeLayer`, `registerEntity`, layer transform/visibility application, child render ordering, and layer material visual application. It must not own layer dropdowns, sliders, or buttons.

### obstacle-course-layer-controls.js
Layer UI controls only. It owns layer select, layer sliders, visible/solo/all/above/below buttons, and layer-control refresh. It must not implement layer material rendering.

### obstacle-course-controls.js
Runtime control binding only. It owns Start/Pause/Reset button binding, template/difficulty/distance/scenery sliders, view helper toggles, vanishing-point sliders, and global visual sliders. It must not build the scene, load assets, generate paths, scatter scenery, or run movement physics.

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
Overview map only. It owns drawing and scheduling the overview. The brown/orange centre line is the path centre; the translucent gold band is the rideable path width.

### obstacle-course-export-import.js
Settings import/export only.

### obstacle-course-asset-debug.js
Debug visibility only. It reports version, cache, required/optional asset status, ground tiles, path sequence count, GLB loaded/used counts, scene object counts, entity counts, and UI presence. It must not silently fix runtime state.

## Current refactor status

Phase 1 is complete: scenery, GLB controls, and layer controls have been split into owned files.

Phase 2 is complete: `obstacle-course-runtime.js` is reduced to orchestration flow, with runtime control binding moved into `obstacle-course-controls.js`.

Phase 3 is complete: `obstacle-course-asset-debug.js` now has verification output for loaded version/cache, required/optional assets, ground tiles, GLB usage, entity counts, and UI element presence.

The shader crash fix is now a permanent code-path correction: layer visuals no longer use shader injection or cleanup fallbacks.

V3.0.10 scale-caps path-edge trees: trees close to the ride lane are pushed just outside the path line and get much smaller placement scales, with additional reduction for trees close to the camera. Outer trees can still be larger, but remain sparse.

This is architecture cleanup plus targeted visual correction only. It should not intentionally change gameplay rules.