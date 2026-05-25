# Effect Editor Compare Versions / Recovery Plan

Status: recovery planning document.
Purpose: stop patching the broken Effect Editor blindly. Before reverting or rebuilding, preserve the UI/features that were added so they can be re-applied cleanly after returning to a stable render base.

## Current problem

The grid renders, but effect particles do not render. This started after the scale / resolution / snapshot zoom / snap-to-grid work.

Likely failure area:

- canvas CSS size vs real canvas pixel size
- devicePixelRatio scaling
- gridBounds / workspace bounds
- emitter position conversion
- particle spawn coordinates
- particle update bounds
- particle draw scale
- resizeCanvas / tick startup order
- render loop failing or drawing particles outside the clipped grid

Do not add more new features until this is fixed.

## Working-base strategy

Restore to the last version where these were true:

1. Grid appears.
2. Insert -> Base Layer -> Standard Particle creates visible particles.
3. Effects remain visible after side/bottom panel resize.
4. Emitter stays in the visible workspace.
5. Menus still open.
6. Layer sliders still update the active layer.

Candidate restore point to verify: the version immediately before the scale/resolution/snapshot-zoom/snap-grid pass. If that exact commit is uncertain, restore by behaviour, not by version number.

## Current UI/features that must be preserved or re-added after restore

### Header / top bar

Keep:

- Artifex logo image: `../../artifexlogo.png`
- Artifex title image: `../../artifextitle.png`
- top bar background image: `./charcolbg.jpg`
- vertical divider after logo/title block
- menu group shifted right from the logo area, not right-aligned
- visible version badge, currently `v2.3.10 ALPHA`

Top menu order should remain:

1. File
2. Edit
3. View
4. Insert
5. Help

### File menu contents

Keep / restore:

- New Effect Archetype
- Import FX JSON
- Import Effekseer Draft
- Export Archetype section
- Raw Layer Composition
- Editor Project
- Effect Archetype Asset
- Scene FX Instance
- Local Files section
- Save to Local Storage
- View Local Files
- Settings

Settings must include Scene / FX Resolution.

### Edit menu contents

Keep / restore:

- Duplicate Layer
- Delete Layer
- Bring Forward / Send Back if present in stable version
- Center / reset emitter actions
- any active-layer editing actions already present before the break

### View menu contents

Keep / restore:

- Dark Workspace
- White Workspace
- Reference Image / Video
- overlay/camera-bound related option if present
- Load reference image/video option
- Snap To Grid toggle
- Low Performance Mode toggle
- helper visibility toggle / hide helper guides

Important: Snap To Grid must affect dragging/moving objects, not particle rendering.

### Insert menu contents

Insert menu should not become a dumping ground.

Required final structure:

- Base Layer
  - Standard Particle
  - Electric Discharge
  - Projectile Core
  - Magic Trail / Ribbon
  - Shockwave Ring
  - Soft Smoke / Gas base
  - Heat Shimmer / Refraction draft if kept
  - Lens Flare / Optic
- Effect Archetype Assets
  - Open Effect Archetype LIBRARY

The Effect Archetype Library should contain built-in composite archetypes plus custom/local saved ones. User will decide which bad composite presets to delete later.

### Help menu contents

Keep / restore:

- Quick Start Guide
- terminology / guide links if present
- any relevant help/tutorial modal entries

## Side panel card order

Current desired card order:

1. Effect Archetype Assets
2. Quick Edit Presets
3. Effect Layer Appearance
4. Effect Layer Dynamics

Do not restore the old messy card set that split this into too many cards unless a function has not yet been moved.

Old separate cards that should stay merged or removed:

- Component / Composite Effect / Activate / Back Away / Bond Energy wording should not return.
- Visuals and Active Layer Settings should remain merged as Effect Layer Appearance.
- Middle Options, Motion Dynamics, and Timing should remain merged into Effect Layer Dynamics where possible.

## Effect Archetype Assets card

Keep / restore:

- Archetype ID input
- Layer Name input
- Effect Engine dropdown
- Load Base Style / preset dropdown if still useful
- thumbnail panel
- capture instructions
- Save Thumbnail JPG button or equivalent final thumbnail download action
- thumbnail JPEG name must default to `[archetype-id].jpg`
- thumbnail destination: `assets/archetype-thumbnails/[archetype-id].jpg`

Important: thumbnail download logic belongs in IO/editor code, not inside preset data.

## Quick Edit Presets card

Keep / restore:

- Reset to Default
- Tight Trail
- Soft Glow / Glow style helpers if present
- Spark / Burst / Drift helpers if present
- Color Helpers:
  - Fire
  - Ice
  - Water
  - Dark Magic, mostly green variants
  - Good Magic, blue/purple variants
  - Evil, black/dark red variants
  - Smoke / soot smoke
  - White smoke if added separately

Quick edits should prefer brush/texture-based settings where possible and avoid expensive blur. Blur/edge blur should be capped.

## Effect Layer Appearance card

Keep / restore:

- Shape Mode: Shape / Brush / Custom
- Particle Shape selector
- Built-In Brush selector
- Custom PNG Texture upload
- Tint Mode
- Fit Mode
- Use Texture Alpha
- Composite Blend with more than three blend modes
- Reverse checkbox if used for trails / direction
- Color A / Color B / multiple color stops
- Start Alpha and End Alpha per color stop
- Rotate Shape slider
- Blur / Edge Blur: avoid duplicate controls. Keep only one final concept and cap it at 5.
- Glow
- Size Start / Size End
- all slider numeric values should also be editable by typing directly into the number field
- info icon or tooltip on each subsection title explaining what the setting does

Brush bug to fix after render is stable:

- Brush mode must use the PNG alpha mask correctly.
- The whole square block must not become colored.
- Only the visible brush shape should receive tint/color.

## Effect Layer Dynamics card

Keep / restore:

- emitter X / Y
- emitter width
- emitter width unit PX / %
- emitter rotation under X/Y axis controls
- Set Origin button: click button, then click workspace to move origin
- Point To Target button: click button, then click workspace to aim effect
- Reverse checkbox near target controls for trails whose visual front/back is reversed
- speed min / max
- direction angle
- spread
- gravity with gentler scale; UI value `1.0` should mean practical full gravity, not insane per-frame acceleration
- gravity increments around `0.05`
- friction
- orbital force
- lifetime min / max
- spawn rate
- Noise Grain section:
  - density
  - dot size
  - alpha
  - color A
  - color B

Noise should create microscopic dots/grain for fire, smoke, ash, magic dust, and glow texture. It should not be implemented as giant chunky particles.

## Workspace / preview controls

Keep / restore:

- Pause button
- Camera / thumbnail capture button
- View cycle button: dark -> white -> reference image/video
- helper visibility toggle near pause/camera/reference controls
- hide helper labels; use compact emoji/icons with mouseover titles
- zoom controls
- zoomed thumbnail capture: if workspace is zoomed in, snapshot should capture the zoomed view
- reference image/video controls
- if reference is video, show play/pause, forward frame, back frame controls
- grid letters/numbers should remain visible after panel resize
- panel resize should not kill particles

## Resolution / scale requirements

Final renderer must have one source of truth for scale.

Default design resolution:

- 1280 x 720

Resolution presets to include:

- 1280 x 720 default
- 1120 x 630 Scene Editor-ish preview
- 1920 x 1080 Full HD
- 1080 x 1080 Instagram square
- 720 x 720 square
- 1080 x 1920 Instagram Story / Reel
- Custom width / height

The renderer should convert between:

- design coordinates
- screen/workspace coordinates
- canvas pixel coordinates

Particles should be stored/spawned in design-space or workspace-relative coordinates consistently. Avoid mixing browser pixels, canvas pixels, and design pixels.

## Local storage / layout persistence

Keep / restore:

- expanded/collapsed card state persists
- side panel width persists
- bottom panel height persists
- panel sizes must be clamped to safe ranges so the workspace cannot collapse
- export to local storage
- View Local Files option
- select several local files and download/export them together as proper files

Saving an effect:

- require thumbnail before normal save
- if no thumbnail, show message: cannot save without a thumbnail; create one first
- include an Emergency Backup button so the user can save anyway if needed

## Built-in preset/library rules

Base presets live in:

- `src/presets/base-effects.js`

Composite/archetype presets live in:

- `src/presets/composite-effects.js`

Preset files must contain data only. They must not contain hidden repair scripts, bootstrap patches, DOM patches, menu rebuilders, or renderer code.

Built-in thumbnail JPEGs live in:

- `assets/archetype-thumbnails/`

Thumbnail filename rule:

- `[effect-archetype-id].jpg`

## Modular split plan

The current `index.html` is too large and fragile. Split it without adding new features during the split.

Target structure:

- `index.html` — layout shell, script imports, minimal boot call
- `src/editor-state.js` — composition, selected layer, settings, persistence
- `src/editor-renderer.js` — canvas, grid, design resolution, zoom/pan, emitter, render loop
- `src/editor-ui.js` — menus, cards, sliders, panels, modals, tooltips
- `src/editor-library.js` — insert menu, base layer library, archetype browser, local/custom archetypes
- `src/editor-io.js` — import/export, save, local files, thumbnail capture/download
- `src/fx-runtime.js` — Particle class, shape drawing, brush/texture rendering
- `src/presets/base-effects.js` — base preset data only
- `src/presets/composite-effects.js` — composite/archetype preset data only

## Repair order

Do this in order. Do not skip ahead.

### Phase 1 — Restore render base

Goal: return to last working render behaviour.

Acceptance test:

- grid appears
- Insert -> Base Layer -> Standard Particle creates visible particles
- resize side panel and bottom panel; grid letters/numbers remain visible
- particles remain visible after resize
- no hidden repair scripts

### Phase 2 — Compare current UI against restored base

Goal: document what disappeared after the revert.

Checklist:

- top menu order and positions
- File menu entries
- Edit menu entries
- View menu entries
- Insert menu structure
- Help menu entries
- side panel card order
- all sliders and number inputs
- thumbnail panel
- local storage/file browser
- resolution settings
- quick edit presets
- brush controls
- alpha start/end controls
- noise controls
- helper visibility and reference media controls

### Phase 3 — Modular split with no behaviour changes

Goal: move code out of `index.html` while preserving restored behaviour.

Acceptance test:

- same as Phase 1
- index loads modules directly
- preset files are data-only
- no hidden emergency bootstraps

### Phase 4 — Reapply UI/features from this document

Goal: add back the features from current/broken version one group at a time.

Order:

1. top bar/menu layout
2. side panel card order
3. insert menu/library split
4. thumbnail file naming and save flow
5. local files/export flow
6. appearance controls
7. dynamics controls
8. quick edit presets
9. helper visibility/reference media controls
10. resolution presets and scale conversion

### Phase 5 — Fix brush/render quality

Goal: make effects actually useful.

Tasks:

- PNG alpha masking fixed
- texture contrast / threshold usable
- shape/brush/custom modes clean
- solid shapes improved or deprioritised
- blur capped and expensive options avoided
- gravity scaling corrected
- fine particle sizing supported
- noise grain implemented cleanly

## Do-not-do list

- Do not add emergency render code inside preset files.
- Do not make `base-effects.js` alter DOM or menus.
- Do not add another hidden repair script.
- Do not keep adding new features before particles render.
- Do not change scale/resolution and rendering in the same step without a test.
- Do not overwrite the file without preserving current UI/features in this document.

## Immediate next action

Create or restore a stable render build from the last working version, then compare it against the current `v2.3.10 ALPHA` UI using this document as the checklist.
