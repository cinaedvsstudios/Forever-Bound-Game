# Artifex Scene Editor Changelog — 2026-05-24

## Major direction change

The Scene Editor patch strategy changed today. Temporary helpers were useful for quick testing, but the helper stack became too large and started causing regressions. The editor is now in consolidation mode before new upgrades continue.

## Runtime/game structure work

- Separated the root Forever Bound game from the older Artifex/game hybrid script.
- Added a new root game runtime under `game/runtime/`.
- Added root game data files under `game/data/`.
- Added `game/data/game_manifest.json`.
- Added `game/data/screens/startup_screen.json`.
- Added `game/data/scenes/ch00_q00_first_scene.json`.
- Updated root `index.html` to load the Forever Bound runtime instead of the old hybrid editor/game script.
- Added Artifex Adventures as a sample/template game under `artifex/artifex-adventures/`.
- Artifex Adventures has its own manifest, startup screen, first scene, runtime CSS, runtime JS, and entry page.

## Scene Editor work completed or attempted

### Object movement and transform

- Moved more drag/move behaviour toward the main editor flow.
- Fixed the centre-handle drag issue where selecting another object could move the previous one.
- Added/improved offscreen placement so objects can be dragged partly outside the 16:9 frame.
- Added resize/transform support work through later helpers.
- Added rotation value improvements.
- Added rotate handle/tail and later reduced its size.
- Added rotation origin support work.
- Added flip horizontal and flip vertical via context/menu work.
- Added aspect-ratio lock/unlock controls.
- Added Wrap Bounding Box to Image behaviour.

### Cards and panel behaviour

- Split selected object editing into separate cards: details, transform, visual, animation, and audio.
- Fixed card collapse behaviour more than once because some cards were being treated as one large card.
- Added card styling passes for brown collapsed state and purple open state.
- Planned stable label changes: Scene, Background, Object Layers, Selected Details, Transform Selected.
- Attempted label/background-card changes through v26, but that helper caused instability and has now been paused.

### Visual controls

- Added live Visual Adjustments controls: blend mode, opacity, brightness, contrast, saturation, hue, vibrance, exposure, shadow strength, and glow strength.
- Strengthened Glow Strength so it is more visible.
- Shadow Strength still needs another stronger/darker pass.
- Vibrance was boosted but still needs checking.
- Added red-dot vertical sliders for numeric fields.
- Added right-click Reset menu for red-dot sliders.

### Selected-object preview

- Added eye button for clean selected-object preview.
- Moved eye button to the left side of the Work Area so it does not overlap zoom controls.
- Added preview popup with black, white, and green background options.
- Added live preview update behaviour.
- Added preview zoom slider.
- Added middle-mouse drag panning inside the preview popup.
- Preview matching still needs refinement so it matches stage rendering exactly.

### Top menu and styling

- Added compact top menu concept: File, Edit, View, Effects, Help.
- File menu target items: New Blank Scene, New from Template, Download JSON, Settings.
- Styled menu buttons brown by default and purple when open.
- Removed menu arrows.
- Raised menu layer so dropdowns should sit above stage controls.
- Standardised small utility button shape toward a shared brown/purple style.

### Save/local backup

- Confirmed the core autosave debounce is very short after edit events, around 80 ms.
- Attempted manual save-to-local disk button.
- v26 polish helper interfered with the blank/resume screen and Open Local Backup, so v26 has been paused.
- Local backup restore must be retested after the v26 pause.

## Regression found

Open Local Backup on the blank/front screen stopped responding after the v26/v27 label and polish helper chain. Cause is likely repeated DOM patching over the blank/resume screen. v26 has now been reduced to an inert status marker so the original core resume behaviour can run again.

## New files added today for process control

- `future-updates-and-helper-consolidation.md` preserves the planned fixes and the helper rule.
- `changelog-2026-05-24.md` records this working session.

## New helper policy

Temporary helpers must not remain in place for more than two update cycles. After one or two test passes they must be merged into the real code, converted into a proper permanent module, or removed.

No more helper-on-helper stacking for routine UI changes.

## Next required work

1. Hard refresh and confirm the Scene Editor front screen loads.
2. Confirm Open Local Backup works again.
3. Inventory every helper/style file loaded by the Scene Editor.
4. Merge stable UI changes into the real core files instead of patching after render.
5. Remove or pause risky helpers.
6. Only then continue new upgrades such as Glow Colour, better shadow, and final preview matching.
