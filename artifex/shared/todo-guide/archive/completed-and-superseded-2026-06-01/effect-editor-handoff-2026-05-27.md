# Effect Editor handoff summary — 2026-05-27

This file is a continuation handoff for the Artifex / Forever Bound Effect Editor work. It records the recent V3 work, what changed, what remains, and the immediate next actions for a new chat.

## Current live app state

Live app path: `artifex/apps/effect-editor/index.html`

Public test URL pattern:

`https://cinaedvsstudios.github.io/Forever-Bound-Game/artifex/apps/effect-editor/index.html?fresh=322`

The last fully bumped public version is **V3.22**. It has version metadata in `index.html`, `editor-app.js`, CSS cache key, and JS module cache key.

Important: a **partial V3.23 text-runtime performance change** was started in `artifex/apps/effect-editor/v3/src/text-runtime.js`, but the app version/index were not fully bumped to V3.23 before this handoff. The next chat should first verify whether that partial change is present on `main`, then either complete the V3.23 version bump and testing, or revert/fix it if it caused issues.

## User’s latest feedback before handoff

The user reported that adding a Text effect makes the app very slow, even on low performance mode. They also reported:

- There are two ALL CAPS buttons.
- They cannot find the Text once/loop/continuous control.
- They want a sticky search bar at the top of the left panel with a search icon and a `>` icon inside the search bar.
- They want a My Settings icon next to search.
- My Settings should open a floating one-column panel.
- My Settings should have an Edit button.
- In edit mode, settings in My Settings have an `x` to remove them.
- In edit mode, clicking/changing a setting in the left panel should copy that setting into My Settings.
- My Settings should have Add Modifier.
- Add Modifier opens a modal asking how to change values.
- Modifier options: multiply, divide, add, subtract, overwrite.
- Modifier should allow a new value box so custom values can be applied when a normal setting range is not enough for a specific effect.

## Recently completed in the Effect Editor

### V3.14–V3.18 foundation and UI work

- Synced visible version metadata and cache keys after stale GitHub Pages/caching issues.
- Stabilised the modular V3 entrypoint after moving from patch/test branch to the real deploy path.
- Moved workspace controls out of the old top toolbar and into view/bottom areas.
- Added bottom panel sections for Layers, Display, View/Guides, Diagnostics, then iterated the Display layout.
- Added floating workspace controls: Pause/Snapshot at top-left of canvas area, zoom controls at top-right.
- Restored middle mouse / scroll-wheel workspace panning by adding viewport pan offsets in the renderer.

### V3.19 navigation

- Converted File > Module from a flat list into a flyout.
- The flyout lists only core modules: Hub, Creation Guide, Project Manager, Scene Editor, Quest Builder, Puzzle Creator, Effect Editor, Archetype Object Creator.
- Utility tools were removed from the core Module flyout.

### V3.20 File menu cleanup

- Simplified the File menu into grouped flyouts:
  - Module
  - New / Import
  - Export
  - Scene Resolution
  - Local
- User confirmed this structure is fine.

### V3.21 runtime physics rescale

- Added `physics-scale.js`.
- Speed is now mapped through runtime scaling so low values such as `0.1–0.3` should move slowly.
- Gravity UI now uses a readable scale:
  - `0` = neutral
  - `100` = earth/down
  - negative values = rise/up
  - positive values = fall/down
- Renderer maps readable gravity to the old tiny runtime physics values.
- User said this seems fine.

### V3.22 Text effect pass

- Added `text-runtime.js`.
- Routed Text layers through a dedicated text runtime in `editor-renderer.js`.
- Added runtime support for multiline text drawing, line spacing, block width/wrapping, safer font handling, letter spacing, text reveal modes, direction, scatter, lifetime bias, and keep-block-together.
- Added `v322-text-controls.js` for text-specific controls.
- Added controls for Direction, Reveal, Scatter, Lifetime Bias, Keep Block Together.
- User then reported performance problems when a text effect is added.

## Partial V3.23 work already started

A performance optimisation was started in `text-runtime.js` to throttle text spawning and reduce drawing cost. The partial change:

- Adds `textEmissionMode` handling: `once`, `loop`, `continuous`.
- Adds throttling via `textSpawnDelay`.
- Limits text burst size.
- Caps text particle lifetime.
- Adds line measurement caching.
- Caps max lines and max characters drawn.
- Skips expensive glow/stroke work when text performance mode is enabled.

But it was not completed as a full release because `editor-app.js` and `index.html` were not bumped to V3.23 before the handoff. The next chat should verify repo state before making more edits.

## Remaining open Effect Editor tasks

### Immediate next pass

1. Verify current repo state:
   - `index.html` likely says V3.22.
   - `editor-app.js` likely says V3.22.
   - `text-runtime.js` may already contain partial V3.23 optimisation.
   - Decide whether to complete V3.23 or adjust/revert text runtime.

2. Finish Text performance fix:
   - Reduce text particle count further if still slow.
   - Add a clear text performance mode toggle.
   - Make text default to a safe, low-density, delayed emission pattern.
   - Keep line wrapping and multiline rendering, but avoid per-frame expensive measurement.
   - Test on low performance mode.

3. Remove duplicate ALL CAPS button.

4. Add visible Text emission controls:
   - Once
   - Loop with count
   - Continuous
   - Delay between pulses/spawns

5. Add sticky search bar to the top of the left panel:
   - Search icon inside the bar.
   - `>` icon inside the bar.
   - My Settings icon next to the search bar.

6. Add My Settings floating panel:
   - One-column layout.
   - Edit button.
   - Edit mode adds `x` remove buttons to copied settings.
   - In edit mode, interacting with a left-panel setting copies that control into My Settings.

7. Add Modifier modal:
   - Triggered by Add Modifier emoji/button in My Settings.
   - Lets user add a custom value field.
   - Operation modes: multiply, divide, add, subtract, overwrite.
   - Applies the modifier to the selected/copied setting so values can exceed or transform the normal control range for special effects.

### Other open backlog

- Final Display panel QA: make sure it stays 3 columns, icon-only, and does not overlap Diagnostics.
- Built-in preset visual quality pass: Electric Arc, Shockwave/Radial Burst, Heat Distortion, Optic Glint, True Lens Flare.
- Real FX engines still needed:
  - volumetric smoke/cloud engine
  - spark/ember engine
  - proper electric arc/lightning engine
  - ribbon/trail engine
  - tornado/vortex/swirl engine
  - beam/laser engine
  - projectile/fireball engine
  - real lens flare compositor with overlay/ring/streak layers
  - true heat distortion that warps image/video underlay
  - liquid/blob/black-oil engine
  - weather/rain/snow/ash/embers engine
  - shockwave/radial burst pulse engine
  - sprite-sheet/flipbook FX engine
- Finish brush, overlay, and icon asset loaders:
  - brushes from `artifex/apps/effect-editor/brushes`
  - overlays from `artifex/apps/effect-editor/overlays`
  - insert icons from `artifex/apps/effect-editor/effect-icons`
- Integrate patch/polish layers into normal named modules after behaviour stabilises.

## Important files changed recently

- `artifex/apps/effect-editor/index.html`
- `artifex/apps/effect-editor/v3/src/editor-app.js`
- `artifex/apps/effect-editor/v3/src/editor-renderer.js`
- `artifex/apps/effect-editor/v3/src/text-runtime.js`
- `artifex/apps/effect-editor/v3/src/v322-text-controls.js`
- `artifex/apps/effect-editor/v3/src/physics-scale.js`
- `artifex/apps/effect-editor/v3/src/dynamics-parity.js`
- `artifex/apps/effect-editor/v3/src/v320-file-menu.js`
- `artifex/apps/effect-editor/v3/src/v317-polish.js`
- `artifex/shared/todo-guide/all-apps-todos.json`

## Suggested first prompt for the next chat

“Please read `artifex/shared/todo-guide/all-apps-todos.json` and `artifex/shared/todo-guide/effect-editor-handoff-2026-05-27.md`, then verify the current Effect Editor repo state. Check whether V3.23 was only partially applied to `text-runtime.js`, confirm the live app version, and continue with the text performance fix, duplicate ALL CAPS removal, and visible text Once/Loop/Continuous controls before starting the My Settings panel.”
