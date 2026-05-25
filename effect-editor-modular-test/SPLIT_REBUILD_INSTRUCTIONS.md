# Artifex Effect Editor — Safe Modular Rebuild Instructions

Status: updated after the successful `effect-editor-modular-test` rebuild.

This replaces the older split instructions that tried to split the live monolith directly. The working method was simpler and safer: create a separate modular test editor, keep the renderer alive, then restore feature parity in small versioned passes.

## Core rule

Do not split, rewrite, or replace the production Effect Editor in place.

Always work in an isolated test folder first:

```text
effect-editor-modular-test/
```

Only promote the modular editor after it has passed the visible browser checks.

## Why this method worked

The previous plan treated the split as one huge surgery: split the monolithic file and preserve every feature at the same time. That made failures hard to trace.

The successful method treated the editor as a living test build:

1. Build a small modular editor that renders particles.
2. Upload it separately.
3. Test it in the browser.
4. Add one feature group.
5. Bump the visible version.
6. Test again.
7. Continue only if particles still render.

If a pass breaks the editor, revert only that pass.

## Folder structure used

```text
effect-editor-modular-test/
  index.html
  styles.css
  README.md
  CHECKS.md
  SPLIT_REBUILD_INSTRUCTIONS.md
  src/
    editor-app.js
    editor-state.js
    editor-renderer.js
    editor-ui.js
    editor-library.js
    editor-io.js
    fx-runtime.js
    side-panel-parity.js
    appearance-parity.js
    dynamics-parity.js
    io-parity.js
    workspace-parity.js
    resolution-parity.js
    presets/
      base-effects.js
      composite-effects.js
```

## Module responsibilities

`index.html` should stay as the shell only. It contains layout markup, stylesheet links, and the module boot import.

`styles.css` owns the common Artifex look: dark/gold/purple palette, card styling, buttons, dropdowns, side/bottom panels, scrollbars, typography, and responsive layout.

`src/editor-app.js` is the boot file. It imports the modules, sets the visible version badge, starts renderer/UI/library/parity modules, inserts the default Standard Particle layer, and shows the boot toast.

`src/editor-state.js` is the single source of truth for composition state, active layer, design size, reference state, paused state, grid/helper state, zoom, render stats, layer normalization, and layer mutation.

`src/editor-renderer.js` owns the canvas, render loop, stage/grid, reference image rendering, design-to-screen scaling, pointer-to-world conversion, emitter helper, particle update, and snapshot capture.

`src/editor-ui.js` owns base menus, core buttons, side/bottom resizers, layer list, slider binding, quick presets currently present, engine select sync, and status text.

`src/editor-library.js` owns Insert menu population, base preset insertion, and composite/archetype library dialog.

`src/editor-io.js` owns JSON import/export, project export, archetype export, scene FX instance export, local storage, emergency backup, local file list, thumbnail payload capture, and local bundle export.

`src/fx-runtime.js` owns the Particle class, spawn logic, physics update, shape drawing, built-in brush drawing, custom texture drawing, tinting, and blend/blur/glow handling.

`src/side-panel-parity.js` restores side-panel extras: engine readout and thumbnail preview/capture/save.

`src/appearance-parity.js` restores appearance controls: mode, shape, brush, blend, tint, texture fit, texture alpha, custom texture upload, rotation, edge blur, and reverse colour direction.

`src/dynamics-parity.js` restores dynamics controls: emitter width/unit/rotation, target X/Y, point-to-target, friction, lifetime min/max, orbital force, noise grain, and reverse-near-target.

`src/io-parity.js` promotes the File menu placeholders into real export/backup actions.

`src/workspace-parity.js` restores workspace/reference controls: view cycle, helper toggle, reference load, reference on/off, opacity, frame buttons, and clear.

`src/resolution-parity.js` restores Scene / FX Resolution controls and stage-size presets.

`src/presets/base-effects.js` must contain base preset data only.

`src/presets/composite-effects.js` must contain composite/archetype preset data only.

Preset files must not contain DOM repair scripts, hidden bootstraps, renderer code, or menu patches.

## Actual successful rebuild order

Use this sequence again if the Effect Editor needs to be rebuilt or re-split.

### Step 0 — Isolated test package

Create the separate folder and do not touch production.

Acceptance check:

- page loads
- grid appears
- Standard Particle renders
- Insert opens
- sliders affect the active layer
- side/bottom resize does not kill particles

### Step 1 — UI parity only

Version used: `v2.3.2 UI-PARITY`

Match the Artifex visual language first: dark/gold/purple palette, card shapes, buttons, dropdowns, layer chips, scrollbars, inputs, topbar look, and Insert menu alignment.

Do not touch renderer logic in this step.

### Step 2 — Header and menu parity

Version used: `v2.3.3 HEADER-MENU`

Restore the header/menu structure: File, Edit, View, Insert, Help; Artifex logo/title treatment; divider; File export sections; View helpers; Help entries.

Use placeholders where old features are not wired yet, but do not fake behaviour.

### Step 3 — Side panel parity

Version used: `v2.3.4 SIDE-PANEL`

Restore the side-panel shell details: engine readout and thumbnail preview/capture/save panel.

Keep the card order:

1. Effect Archetype Assets
2. Quick Edit Presets
3. Effect Layer Appearance
4. Effect Layer Dynamics

### Step 4 — Insert menu parity

Version used: `v2.3.5 INSERT-PARITY`

Restore the Base Layer list:

- Standard Particle
- Electric Discharge
- Projectile Core
- Magic Trail / Ribbon
- Shockwave Ring
- Soft Smoke / Gas Base
- Heat Shimmer / Refraction
- Lens Flare / Optic

Add only enough runtime support so every inserted base layer visibly renders.

### Step 5 — Appearance controls parity

Version used: `v2.3.6 APPEARANCE`

Restore shape/brush/custom appearance state and basic renderer wiring.

Controls restored in this pass included mode, shape, blend mode, rotation, edge blur, texture alpha, custom texture upload, and reverse colour direction.

### Step 6 — Dynamics controls parity

Version used: `v2.3.7 DYNAMICS`

Restore emitter width/unit/rotation, target X/Y, point to target, friction, lifetime min/max, orbital force, noise grain, and reverse-near-target.

Wire the settings into runtime only after they are safely normalized in `editor-state.js`.

### Step 7 — IO / save / export parity

Version used: `v2.3.8 IO-PARITY`

Restore File menu exports and local storage:

- Raw Layer Composition
- Editor Project
- Effect Archetype Asset
- Scene FX Instance
- Save to Local Storage
- View Local Files
- Export All Local Effects
- Emergency Backup Save

Local saves should include metadata and thumbnail data where available.

### Step 8 — Workspace / reference parity

Version used: `v2.3.9 WORKSPACE`

Restore toolbar workspace controls:

- View mode cycle
- helper visibility
- load reference
- reference on/off
- reference opacity
- clear reference
- frame back/forward placeholders

Start with image reference rendering. Video reference rendering is a later detail.

### Step 9 — Resolution / scale parity

Version used: `v2.3.10 RESOLUTION`

Add design resolution controls only after the render path is stable.

The renderer must use one source of truth for design size. It must consistently convert between:

- design coordinates
- canvas pixels
- browser/workspace coordinates

Resolution changes must not kill particles.

### Step 10 — Texture render parity

Version used: `v2.3.11 TEXTURE-RENDER`

Restore custom PNG drawing and built-in brush drawing.

Controls restored:

- Built-in Brush
- Tint Mode
- Texture Fit
- Custom PNG texture rendering
- original/tint/alpha-mask texture modes
- contain/cover/stretch sizing

## Standard acceptance test after every pass

After each version bump, open the RawGitHack test URL and check:

1. version badge changed
2. page loads without a fatal console error
3. grid appears
4. Standard Particle renders
5. Insert opens and inserts a visible effect
6. selected layer appears in the layer list
7. sliders affect active layer
8. side resize does not kill render
9. bottom resize does not kill render
10. File menu still opens
11. no preset file contains DOM repair code

## Do not repeat the old mistake

Do not split the whole monolith and re-add every feature in one pass.

Do not edit production first.

Do not put renderer or DOM repair code into preset files.

Do not change resolution/scale before particles are visibly rendering.

Do not let a feature pass hide render failure. If particles disappear, stop and revert that pass.

## Remaining gaps compared with the old/current feature inventory

The modular test is now working and much closer to feature parity, but a few items from the old/current inventory are still incomplete or only partially restored.

### 1. Full Quick Edit Presets are not restored

Current modular test has the basic colour helpers: Fire, Ice, Good Magic, Dark Magic.

Still missing from the old/current plan:

- Reset Layer to Default
- Soft Glow
- Sharp Sparks
- Fade In/Out
- Bright Add
- White Fog
- Sooty Smoke
- Water
- Evil
- Smoke / soot / white smoke variants
- Tight Trail
- Spark / Burst / Drift motion helpers

### 2. Brush PNG folder workflow is not fully restored

The modular test can draw uploaded custom textures and procedural built-in brushes.

Still missing:

- loading named brush PNGs from `brushes/`
- expected brush filenames such as `Fog001.png`, `Spark002.png`, `Line01.png`, `Burst01.png`, `Wind.png`, etc.
- runtime conversion of black-background brush PNGs into alpha masks
- Texture Contrast slider
- full black-square-removal workflow for non-transparent brush PNGs

### 3. Video reference rendering is incomplete

The modular test stores reference video files and shows frame controls as UI placeholders.

Still missing:

- actual video element/frame drawing into the canvas
- play/pause for reference video
- previous-frame and next-frame stepping
- making sure exports remain effect-only and exclude the reference plate

### 4. View menu workflow controls are only partially restored

Restored:

- dark/white/reference view cycle
- helper visibility
- image reference loading

Still missing or simplified:

- Snap To Grid
- Low Performance Mode
- Emitter Follows Pointer
- Preview Floor Collision
- Clear Reference Plate as a View menu item
- separate Show Emitter Guide vs helper/grid toggles

### 5. Set Origin / Point To Target workflow is simplified

Current modular test has Set Origin Center and Point To Target based on existing target coordinates.

Still missing:

- click button, then click workspace to set origin
- click button, then click workspace to choose/aim target
- clear visual workflow state for those modes

### 6. Thumbnail/save rules are not strict enough yet

Current modular test can capture and save a JPG and local saves include a thumbnail payload where available.

Still missing:

- normal save requiring a thumbnail before saving
- exact user-facing message if no thumbnail exists
- automatic intended destination workflow for `assets/archetype-thumbnails/[archetype-id].jpg`
- proper separation between thumbnail download and archetype save confirmation

### 7. Local storage/file browser is useful but not final

Restored:

- Save to Local Storage
- View Local Files
- Load/Export/Delete one saved item
- Export All Local Effects as a bundle

Still missing:

- selecting several local files and exporting/downloading them together as proper separate files
- layout persistence for side panel width and bottom panel height
- expanded/collapsed card state persistence
- safe clamped restoration of panel sizes on reload

### 8. Old tabs are not restored

The old inventory mentions the Params / JSON / Boilerplate tab structure.

The modular test currently focuses on the visual editor panels and does not restore:

- JSON tab
- Boilerplate tab
- live JSON view/editor
- boilerplate/export text panel

### 9. Appearance controls are still missing some advanced details

Restored:

- Shape / Brush / Custom
- Particle Shape
- Built-in Brush
- Custom Texture upload
- Tint Mode
- Texture Fit
- Blend Mode
- Reverse
- Rotate
- Edge Blur
- Glow
- Size Start / End
- Alpha Start / End

Still missing:

- multiple colour stops
- start/end alpha per colour stop
- editable number fields beside every slider, not only output values
- info icons/tooltips on subsections
- capped blur should be reviewed; old plan wanted cap around 5, current cap is larger

### 10. Noise Grain is still simplified

Current modular test has one Noise Grain intensity control.

Still missing the full noise section:

- density
- dot size
- alpha
- colour A
- colour B
- microscopic grain render separate from normal particles

### 11. Effect Archetype Library is not final

The library exists, but the old plan expected it to contain built-in composite archetypes plus custom/local saved ones in a proper browser.

Still missing:

- custom/local saved archetypes appearing inside the Effect Archetype Library
- thumbnail cards for built-in archetypes
- final delete/hide decisions for bad composite presets
- proper thumbnail path use for built-ins

### 12. Effekseer import is still a placeholder

The File menu has Import Effekseer Draft, but it is not a real importer yet.

### 13. Resolution preset list is not complete

Current modular test has:

- 1280×720
- 1920×1080
- 1024×1024
- 1080×1920

Still missing from the old plan:

- 1120×630 Scene Editor-ish preview
- 1080×1080 Instagram square
- 720×720 square

### 14. Runtime/render quality still needs a polish pass

Still worth reviewing:

- gravity UI scaling so `1.0` means practical full gravity, not insane acceleration
- fine particle sizing for very small dust/spark particles
- texture contrast/threshold
- smoke/ash/magic dust grain quality
- expensive blur avoidance
- better built-in brush visuals using real PNG assets

## Current conclusion

The modular rebuild method is the correct approach.

The editor is no longer a fragile monolith-repair problem. It is now a versioned modular test build where missing features can be restored one contained module at a time.

Next recommended work should be a post-parity polish phase, not another split phase:

1. Quick Edit full restoration
2. real brush PNG folder integration
3. video reference drawing
4. snap/grid/follow-pointer/floor/low-performance controls
5. local layout persistence
6. noise grain detail controls
7. final Effect Archetype Library browser
