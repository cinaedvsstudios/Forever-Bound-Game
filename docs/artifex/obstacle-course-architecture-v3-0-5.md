# Obstacle Course Architecture Contract V3.0.5

This document defines the intended ownership boundaries for the obstacle-course module. The purpose is to stop patch-on-patch drift by making each file responsible for one category of behavior only.

## Rule 1: one owner per responsibility

A function should live in the file that owns its responsibility. If another file needs it, that file imports the function instead of duplicating or partially reimplementing it.

No file should silently override another file's source of truth. Settings, asset paths, loading status, scene construction, movement, UI and debugging must remain separate.

## Runtime ownership map

### index.html
Owns only the static HTML shell for the standalone obstacle-course page.

Allowed: page title, static header shell, module script tag, basic shell CSS required before JavaScript loads.

Forbidden: gameplay logic, asset lists, settings, scene setup, loader logic, hardcoded course values other than visible shell version.

### src/js/main.js
Owns only bootstrapping.

Allowed: boot version, cache version, temporary loading card, importing the runtime module with the correct cache parameter, showing a boot import error.

Forbidden: scene creation, settings application, asset loading, UI controls, movement, path logic, GLB logic.

### obstacle-course-state.js
Owns constants and mutable runtime state only.

Allowed: VERSION, CACHE_VERSION, constants, the OC state object, empty maps/arrays/flags.

Forbidden: functions with behavior, DOM access, loading, path generation, scene construction, UI creation.

### obstacle-course-settings.js
Owns user-facing course configuration and settings application.

Allowed: DEFAULT_SETTINGS, applySettingsObject, applyDefaultSettings, getLayerDefault, getGlbDefault, config cloning and normalisation.

Forbidden: asset URLs, asset loading, scene creation, mesh creation, UI construction, renderer behavior.

### obstacle-course-assets.js
Owns asset registry only.

Allowed: ASSETS, GLB_ASSETS, TEMPLATES, requiredAssetList, optionalAssetList.

Forbidden: loading assets, mutating OC, creating meshes, UI, scene logic.

### obstacle-course-loader.js
Owns loading required and optional assets and reporting load status.

Allowed: image/json/audio/GLB load orchestration, required/optional status, ground tile preloading, failure arrays, optional status map.

Forbidden: building the scene, placing objects, creating UI markup, deciding movement, changing camera.

Display of loading status should eventually be delegated to hud/debug functions instead of direct DOM writes.

### obstacle-course-scene.js
Owns Three.js renderer and camera lifecycle.

Allowed: renderer, scene, camera, lights, resize, render loop, background plate, texture creation, select helpers.

Forbidden: course generation, asset registries, settings defaults, movement rules, UI controls, GLB asset registry.

### obstacle-course-ground-path.js
Owns path source resolution, path math, and ground tile mesh construction only.

Allowed: generatePathSequence, pathSegmentAt, pathCenterAt, pathHalfWidthAt, pathStatus, buildGroundAndPath, clearWorld if it is only clearing world layers for rebuild.

Forbidden: tree scatter, rock scatter, detail scatter, obstacle placement, collectible placement, GLB loading.

### obstacle-course-scenery.js
Owns environmental scenery placement.

Allowed: scatterScenery, fallbackTree, fallbackRock for background scenery, fallbackDetail, seeded random placement, tree screen-edge falloff, scenery distance from path edge.

Forbidden: path math source ownership, required asset loading, gameplay obstacles, collectibles, UI controls.

### obstacle-course-glb.js
Owns GLB loading, cloning, normalising, grounding, and instancing.

Allowed: loadGlbAsset, cloneGlbTemplate, normalizeObjectToHeight, settleObjectOnGround, makeGlbOrFallback, createInstancedAssetGroup, material visual application needed for GLB instances.

Forbidden: GLB picker UI, layer sliders, course scatter decisions, settings defaults.

### obstacle-course-glb-controls.js
Owns GLB control UI.

Allowed: GLB asset select, browse modal, GLB sliders, selection refresh.

Forbidden: GLB loading, GLB normalisation, scenery placement, runtime orchestration.

### obstacle-course-layers.js
Owns layer registration and visual application.

Allowed: makeLayer, registerEntity, applyLayer, applyAllLayers, material visual shader helpers.

Forbidden: layer slider UI, DOM controls, GLB picker, course generation.

### obstacle-course-layer-controls.js
Owns layer control UI.

Allowed: populateLayerSelect, createLayerSliders, bindLayerButtons.

Forbidden: material shader implementation, scene construction, asset loading.

### obstacle-course-ui.js
Owns static app layout and generic reusable UI helpers.

Allowed: ensureHeader, injectStyles, mountLayout, mountLeftPanel, buildSliderRow, enhanceStaticRangeSteppers, setResult.

Forbidden: path decisions, GLB loading, asset status logic, movement, scene building.

### obstacle-course-hud.js
Owns state display only.

Allowed: updateHud, showSpinner, render loading text/status, off-path indicator rendering if supplied a status.

Forbidden: calculating pathStatus directly long-term, movement logic, loader decisions.

### obstacle-course-input.js
Owns keyboard/touch input state.

Allowed: bindKeyboard, mapping keys to OC.keys.

Forbidden: movement physics, scoring, scene logic.

### obstacle-course-movement.js
Owns run lifecycle and motion update.

Allowed: startRun, pauseRun, resetRun, completeRun, updateMovement, speed/steering/jump, calling collision and audio hooks.

Forbidden: loading assets, rebuilding scene, generating path, UI construction.

### obstacle-course-obstacles.js
Owns gameplay obstacle placement and obstacle collision.

Allowed: addObstacles, checkObstacles, obstacle fallback rock, obstacle hit effects.

Forbidden: background rock scenery, tree/detail scatter, path source generation.

### obstacle-course-collectibles.js
Owns collectible placement and collectible collision.

Allowed: addCollectibles, checkCollectibles, collectible fallback.

Forbidden: scenery scatter, general GLB loading, movement rules.

### obstacle-course-audio.js
Owns audio clips and audio playback.

Allowed: ensureAudio, updateAudio, playJumpSound, playLandSound, playCollectSound, playHitSound.

Forbidden: movement physics, loader status, UI layout.

### obstacle-course-overview.js
Owns overview map drawing.

Allowed: drawOverview, scheduleOverviewDraw, visualising path/entities from runtime state.

Forbidden: generating path/source data, gameplay placement.

### obstacle-course-export-import.js
Owns settings import/export only.

Allowed: exportJsonSettings, importJsonSettings, serialising/deserialising settings.

Forbidden: scene construction, asset loading, movement.

### obstacle-course-asset-debug.js
Owns debug visibility only.

Allowed: showing runtime version, active settings, required/optional asset status, ground tiles, GLB status, object/entity counts, UI element presence.

Forbidden: fixing runtime state, loading assets, rebuilding scene except manually triggered debug actions if added later.

## Refactor order

1. Freeze `main`; all architecture work happens on `refactor/obstacle-course-architecture-v3-0-5`.
2. Create new files only where boundaries are currently mixed: scenery, GLB controls, layer controls.
3. Move functions without changing behavior first.
4. Update imports.
5. Confirm runtime still loads.
6. Only then make behavior changes.

## First movement targets

The first functions to move are:

- `scatterScenery`, `fallbackTree`, `fallbackRock`, `fallbackDetail`, `scatterX`, seeded random helpers and tree falloff helpers from `obstacle-course-ground-path.js` to `obstacle-course-scenery.js`.
- GLB picker and slider UI from `obstacle-course-glb.js` to `obstacle-course-glb-controls.js`.
- Layer select and layer slider UI from `obstacle-course-layers.js` to `obstacle-course-layer-controls.js`.

These moves should not alter visual behavior. They are architecture cleanup only.

## Deployment rule

No refactor branch is merged to `main` until the normal GitHub Pages URL can be verified with the correct version and the runtime debug panel confirms the active files are the intended files.
