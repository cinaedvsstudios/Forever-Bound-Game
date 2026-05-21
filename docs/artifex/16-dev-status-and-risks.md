# Development Status and Risks

## Purpose

This document preserves current implementation status, immediate priorities, known risks, and repo/file notes from the older working notes.

## Current Repo / Editor Situation

There are currently two editor systems in the repository.

### Current Main Combined System

Used by:

```text
index.html
```

Loads:

```text
src/artifex_game.js
src/style.css
src/artifex_theme.css
src/artifex_appearance_patch.css
src/artifex_appearance_patch.js
```

This is the newer combined game/editor shell that has been modified heavily.

It currently contains:

- title screen
- editor mode
- scene editing
- settings
- JSON preview
- file controls
- right/left panels
- visual editing
- game shell logic

### Older Standalone Editor

Used by:

```text
editor.html
```

Loads:

```text
src/editor.js
src/editor.css
```

This appears to be the older standalone Scene Editor. It may still contain useful working logic for:

- JSON import
- scene loading
- download/export
- drag logic
- editor rendering

Do not delete this yet.

## Current Known Problems

### JSON Import Problem

Current issue:

Uploading/importing JSON inside the current Artifex editor sometimes appears to do nothing.

Possible causes:

- importJson handler failing
- setCurrent failing
- render refresh not triggering
- malformed JSON structure
- path mismatch
- scene type detection failure

Needs investigation inside:

```text
src/artifex_game.js
```

### Appearance Patch Issue — Fixed

Problem that occurred:

The appearance patch JavaScript was accidentally placed into:

```text
src/artifex_appearance_patch.css
```

This caused:

- broken loading
- invalid CSS
- missing JS file

Fixed by:

- restoring CSS file
- creating real JS patch file

Current files:

```text
src/artifex_appearance_patch.css
src/artifex_appearance_patch.js
```

## Current Appearance Features

The appearance patch currently adds:

- custom editor colours
- custom panel colours
- custom button colours
- custom text colours
- custom guide/grid colours
- editor background image URLs
- panel background image URLs
- modal background image URLs
- card transparency sliders
- right panel hidden by default
- purple Artifex title
- borderless top-left branding
- Inter font support

## Development Phase Plan

### Phase 1 — Portal and Scene Editor Split

Goal:

Separate the game/editor concept and establish Artifex as its own folder and portal.

Completed:

- Artifex folder exists.
- Portal exists.
- Portal visuals work.
- Portal interactions work.
- Scene Editor route exists.
- Cinaedvs external link works.

Still required:

- test the new Scene Editor route in browser.
- verify `src/editor.css` and `src/editor.js` load correctly from the nested Scene Editor page.
- confirm image/asset paths inside the editor still resolve correctly.
- fix any relative path issues caused by running the editor from `artifex/apps/scene-editor/`.
- update the game title button so it opens `artifex/` instead of embedded editor mode.
- confirm the root game still works after the split.

Recommended next Phase 1 order:

1. Test portal wedge links.
2. Test Scene Editor route.
3. Fix path issues inside Scene Editor.
4. Test editor can open and render.
5. Test JSON import/export.
6. Update the game title button to open Artifex.

### Phase 2 — Templates and Placeholder Game Data

- create `artifex/templates/`.
- create starter JSON templates.
- create `templates.json` manifest.
- create matching placeholder game data files.
- add New/Open/Download workflow.

### Phase 3 — Mini-App Shells and Module Expansion

- add placeholder mini-app shells.
- begin Utilities submenu.
- begin Project Editor/Manager placeholder.
- begin Asset Library placeholder.
- begin CG Effects Library placeholder.
- standardize screen JSON structures.

### Phase 4 — Workflow Testing and Cleanup

- full workflow testing.
- remove old embedded editor logic only when safe.
- cleanup/refactor.
- turn Artifex into reusable toolkit.

## Known Risks

### Path Risk

Moving Artifex into a subfolder may break:

- images
- audio
- JSON loading
- settings loading
- relative fetch calls

### Dual Editor Risk

Two editor systems currently exist:

```text
src/artifex_game.js
src/editor.js
```

Need to avoid deleting useful working logic accidentally.

### Browser File Saving Risk

A browser cannot silently save to an arbitrary HDD path just because a path is typed in Settings. Direct file saving requires user permission through browser APIs or a desktop wrapper.

### SD Card Risk

Current development is occurring on an SD card with intermittent overwrite corruption.

Symptoms:

- overwrite/save replacing occasionally fails.
- 0-byte corrupted files appear.
- some directory entries become unreadable.
- delete/rename may fail with `0x80070570`.

Temporary workaround:

- avoid overwriting existing files directly.
- save as new filenames.
- use new folders when corruption occurs.
- avoid repair tools until backups exist.

## Current Important Files

### Main Game/Editor

```text
index.html
src/artifex_game.js
src/style.css
src/artifex_theme.css
src/artifex_appearance_patch.css
src/artifex_appearance_patch.js
```

### Older Editor

```text
editor.html
src/editor.js
src/editor.css
```

### Data Files

```text
data/editor/editor_settings.json
data/screens/title_screen.json
data/scenes/ch00_q00_forest_route.json
```

## Current Immediate Priorities

1. Test the current portal after Scene Editor folder setup.
2. Confirm `SCENE` opens `artifex/apps/scene-editor/`.
3. Confirm `CINAEDVS` opens `https://cinaedvsstudios.github.io/cinaedvs/` in a new tab.
4. Keep the current portal visuals unless something is broken.
5. Fix any path issues inside the new Scene Editor route.
6. Fix JSON import/export behaviour in the Scene Editor.
7. Update the main game title button to open `artifex/`.
8. Plan the centre hub active project selector.
9. Plan the future Utilities wedge.
10. Plan the future Project Editor/Manager wedge.

## Main Game Title Button Change

Current game title button launches embedded editor.

Planned future behaviour:

```json
{
  "id": "editor",
  "label": "Artifex",
  "action": "openUrl",
  "url": "artifex/"
}
```

## Gemini / AI Review Lesson

Do not trust generated file names or architecture claims unless checked against the actual repository and assets.

Example corrected issue:

Generated notes assumed `centerhub.png`, but the actual dial asset logic uses `menudial.png`, `artifexlogo.png`, and `menudialglow.png`.
