# Effect Editor Current vs Stable UI Inventory

Status: working comparison document.
Purpose: compare the current broken UI (`main`, visible version `v2.3.10 ALPHA`) against the likely stable render base (`fed68ad0526bca288f6ba41f1bcc0413de5355d0`, visible version `v2.3.0 ALPHA`) so the render can be restored without losing all the newer UI and workflow changes.

This document is the reapply checklist after reverting/restoring the render base.

## Source versions being compared

### Current broken UI

- Branch/ref: `main`
- Visible title/version: `v2.3.10 ALPHA`
- Known issue: grid renders but inserted effects/particles do not render.
- Main value: contains the newer UI layout, naming, library workflow, thumbnail panel, local files/export flow, reference media, snap-to-grid, low-performance mode, quick edit presets, and merged card structure.

### Candidate stable render base

- Ref: `fed68ad0526bca288f6ba41f1bcc0413de5355d0`
- Visible title/version: `v2.3.0 ALPHA`
- Known value: likely before the scale/resolution/snapshot/snap-grid break.
- Main limitation: older UI language and card structure; does not include many later workflow improvements.

## Header / top bar comparison

### Stable base has

- Old generated icon in a square.
- Text title `ARTIFEX`.
- Header uses `justify-between`, so menus sit away from the title block.
- No `charcolbg.jpg` texture on header.
- Visible version `v2.3.0 ALPHA`.

### Current UI has

- Real Artifex logo image: `../../artifexlogo.png`.
- Real Artifex title image: `../../artifextitle.png`.
- Header background texture: `./charcolbg.jpg`.
- Vertical divider after logo/title block.
- Menu group moved right from the logo area using left offset/spacing.
- Visible version `v2.3.10 ALPHA`.

### Reapply after restore

Keep the current branding/header treatment, not the old generated icon/title.

## Top menu mechanics comparison

### Stable base has

- Dropdowns depend on `.dropdown-parent` hover/click style behaviour without explicit `data-menu-id` on top menu buttons.
- Help dropdown opens on the right side.

### Current UI has

- Explicit menu IDs: `menu-file`, `menu-edit`, `menu-view`, `menu-insert`, `menu-help`.
- Top menu buttons use `toggleTopMenu(event, id)`.
- Help menu is aligned with the same left dropdown pattern as the others.

### Reapply after restore

Use the current explicit `toggleTopMenu` pattern, but make sure the function is defined before clicks and does not depend on fragile startup order.

## File menu comparison

### Stable base has

- New Empty Composition
- Import JSON
- Export JSON (Save)
- Settings stub

### Current UI has

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
- Settings via `openSettingsModal()`

### Reapply after restore

Restore all current File menu items. The old File menu is too limited.

## Edit menu comparison

### Stable base has

- Clear All Particles
- Delete Active Layer

### Current UI has

- Clear All Particles
- Delete Active Layer

### Reapply after restore

No major difference confirmed from the snippets. Keep current wording and behaviour.

## View menu comparison

### Stable base has

- Workspace Profile section
- Default Mode
- Video Overlay
- Toggle Emitter HUD
- Lock Emitter to Mouse
- Toggle Physics Floor
- Reset Emitter Location

### Current UI has

- Workspace Profile section
- Default Mode
- Video Overlay
- Choose Reference Image / Video
- Clear Reference Plate
- Show Emitter Guide
- Emitter Follows Pointer
- Snap To Grid
- Preview Floor Collision
- Low Performance Mode
- Reset Emitter Location / `centerEmitterFromToolbar()`

### Reapply after restore

Keep the current View menu. The current View menu added important workflow controls:

- reference image/video loading
- reference clearing/status
- snap-to-grid
- low-performance mode
- clearer naming for emitter guide / pointer following / collision preview

Important implementation note: Snap-to-grid should modify click/drag placement only. It should not change particle render math.

## Insert menu comparison

### Stable base has

- Base Effect Layer
- Composite Effect
- Custom Effect

### Current UI has

- Base Layer
- Effect Archetype Assets
- Custom Archetypes still exists in markup, but the intended final UI is to hide/remove it from the top dropdown and put custom items inside the Effect Archetype Library.

### Required final insert menu

- Base Layer
  - Standard Particle
  - Electric Discharge
  - Projectile Core
  - Magic Trail / Ribbon
  - Shockwave Ring
  - Soft Smoke / Gas
  - Heat Shimmer / Refraction if kept as draft
  - Lens Flare / Optic
- Effect Archetype Assets
  - Open Effect Archetype LIBRARY

### Reapply after restore

Use current language: `Base Layer` and `Effect Archetype Assets`, not `Composite Effect` / `Custom Effect`.

Do not dump all composite presets in the Insert dropdown. The dropdown should only offer the library button.

## Help menu comparison

### Stable base has

- Quick Start Guide
- About Artifex Studio
- About toast says stable build.

### Current UI has

- Quick Start Guide
- About FX Editor
- About toast says `Particle Studio v2.3.10 ALPHA preset restore build.`

### Reapply after restore

Keep Quick Start Guide. Update About wording once the rebuild version is decided.

## Left panel / tabs comparison

### Stable base has

- Sidebar width 320px.
- Params tab 🎛️
- JSON tab 📜
- Boilerplate tab 📋
- No `charcolbg.jpg` background texture on the side panel.

### Current UI has

- Sidebar width 320px.
- Same three tabs.
- Side panel background texture using `./charcolbg.jpg`.

### Reapply after restore

Keep the textured current side panel. Preserve all three tabs.

## First card comparison

### Stable base card

Name: `Composite Effect`

Contains:

- Load Composition dropdown
- Composition ID
- hidden composition name/tags inputs
- Last Saved
- Save New Version

### Current UI card

Name: `Effect Archetype Assets`

Contains:

- Open Effect Archetype Assets button
- Archetype ID
- hidden name/tags inputs
- Last Saved
- Archetype Thumbnail panel
- Thumbnail preview square
- Capture button
- Clear button
- Save Archetype Version

### Reapply after restore

Use the current `Effect Archetype Assets` card. It replaces the old composition loader pattern with a clearer library-first workflow.

Also keep the thumbnail panel, but add/restore final download behaviour:

- captured thumbnail JPEG filename should be `[archetype-id].jpg`
- destination folder should be `assets/archetype-thumbnails/`
- thumbnail download/save logic belongs in IO/editor module, not in preset files

## Quick Edit Presets comparison

### Stable base

No Quick Edit Presets card in the inspected stable snippet.

### Current UI

Has `Quick Edit Presets` card containing:

- Reset Layer to Default
- Appearance Helpers
  - Soft Glow
  - Sharp Sparks
  - Fade In/Out
  - Bright Add
  - White Fog
  - Sooty Smoke
- Colour Helpers
  - Fire
  - Ice
  - Water
  - Dark Magic
  - Good Magic
  - Evil
- Motion helpers continue below this section in current UI and need a full follow-up extraction during rebuild.

### Reapply after restore

Keep Quick Edit Presets. It should sit under Effect Archetype Assets.

Important: Quick edits must avoid expensive blur where possible and should prefer brush/texture improvements later.

## Card structure comparison

### Stable base card structure

The older structure begins as:

1. Composite Effect
2. Active Layer Settings
3. Emitter Options
4. Dynamics
5. additional older cards below

This is the old too-many-cards model.

### Current desired card structure

1. Effect Archetype Assets
2. Quick Edit Presets
3. Effect Layer Appearance
4. Effect Layer Dynamics

### Reapply after restore

Do not keep the stable card structure long-term. Use the stable render code only, then reapply the newer merged card structure.

## Active layer / engine controls comparison

### Stable base has

Inside `Active Layer Settings`:

- Layer Identifier Name
- Engine Architecture
- Load Base Style (Overwrites Layer)

### Current desired placement

These belong inside either:

- Effect Archetype Assets if they identify the selected layer/archetype, or
- Effect Layer Appearance if they change the active layer type/style.

### Reapply after restore

Keep the controls, but use newer wording:

- Layer Name
- Effect Engine
- Load Base Style / Base Layer Style

Avoid the old `Active Layer Settings` card name.

## Emitter controls comparison

### Stable base has

`Emitter Options` card with:

- Global Anchor Coords
- X Axis number field
- Y Axis number field
- Center H
- Center V
- Layer Emission Rate slider
- Layer Emit Width slider
- PX/% badge toggle

### Current requested additions

- emitter rotation under X/Y controls
- Set Origin button
- Point To Target button
- reverse checkbox for trail direction
- save panel state and panel size to local storage
- snap-to-grid on/off for movement

### Reapply after restore

Use stable emitter coordinate behaviour as the render base, then add current/requested controls carefully. Do not mix design resolution conversion into this until the particle render acceptance test passes.

## Renderer / resolution comparison

### Stable base likely behaviour

- Uses direct canvas/workspace coordinates.
- Effects render visibly.
- Resize likely calls old `resizeCanvas()` / `tick()` path without the broken design-resolution conversions.

### Current broken behaviour

- Grid renders.
- Effects do not render.
- Break likely introduced by scale/resolution work.

### Reapply after restore

Do not immediately re-add full resolution conversion.

Order must be:

1. restore visible particles with old coordinate model
2. modularise renderer without changing behaviour
3. add design resolution as a single contained renderer feature
4. test each resolution preset separately

## Specific current features to keep after render restore

These were added after the older stable base and must not be lost:

- Artifex logo/title images
- `charcolbg.jpg` header/sidebar texture
- vertical divider after title
- shifted menu position
- explicit top menu IDs/click handling
- File menu export groups
- local storage save and View Local Files
- Effekseer import draft
- Effect Archetype Asset export
- Scene FX Instance export
- Settings modal with resolution presets
- View reference image/video controls
- Snap To Grid
- Low Performance Mode
- helper visibility toggle
- Insert menu language: Base Layer / Effect Archetype Assets
- Effect Archetype Library button
- thumbnail panel and capture flow
- thumbnail filename rule `[archetype-id].jpg`
- Quick Edit Presets card
- merged card structure
- Shape / Brush / Custom mode
- brush texture controls
- alpha start/end per colour
- rotate shape slider
- expanded blend options
- info icons/tooltips on subsections
- noise grain controls
- emitter rotation
- set origin / point to target workflow
- local-storage layout persistence

## Comparison conclusion

The stable base is useful for restoring rendering, but it is not the desired UI.

The rebuild should not simply revert and stop. It should:

1. restore the stable render behaviour,
2. keep the current UI inventory from this document,
3. split the monolith into modules,
4. reapply the newer UI/feature groups in tested batches.

## Next required action

Create a restore package based on the stable render version, then reapply only the minimum safe UI fixes first:

1. current header branding,
2. current top menu click structure,
3. current Insert menu labels,
4. keep base preset files data-only,
5. no resolution conversion changes yet.

After that, run the first acceptance test:

- grid appears
- Insert -> Base Layer -> Standard Particle renders visible particles
- resize side/bottom panels
- grid letters/numbers stay visible
- particles remain visible
