# Artifex Editor Working Notes — Clean Draft

## 1. Purpose

Artifex is evolving into a standalone creator toolkit and hub application for Forever Bound and future projects.

The long-term architecture goal is:

- Forever Bound = the actual game.
- Artifex = the creator toolkit / mini-app hub.
- Scene Editor = one app inside Artifex.

The game itself should not permanently contain editor logic. Artifex should become the production interface used to create, organize, and export the data the game engine reads.

In simple terms:

- The game plays the scene.
- Artifex builds and manages the scene.

---

## 2. Current Repo / Editor Situation

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

---

## 3. Artifex Folder / Portal Status

The Artifex split has begun.

Completed so far:

- `artifex/` folder exists.
- `artifex/index.html` exists.
- radial hub portal front screen exists.
- portal visual identity is established.
- portal audio works after browser audio unlock.
- portal fog and sparks are animated procedurally.
- wedge hover glow and bulge effects work.
- centre hub image bug has been fixed.
- portal wedges now have functional actions/placeholders.
- `CINAEDVS` opens the external Cinaedvs Studios page in a new tab.
- `SCENE` opens the new Scene Editor route.
- `artifex/apps/scene-editor/` exists.
- `artifex/apps/scene-editor/index.html` exists and currently loads the existing standalone editor engine from the repo root.

The portal now has a clear visual identity: hammered copper, carved icons, dark dungeon atmosphere, purple arcane energy, animated fog, and sparks.

The next portal work should focus on function, not further visual redesign.

---

## 4. Correct Portal Asset Map

Important corrected asset logic:

```text
menudial.png      = full large radial dial
artifexlogo.png   = centre hub image
menudialglow.png  = glow/electric overlay for the centre hub image
```

Gemini previously invented or assumed a separate file:

```text
centerhub.png
```

That caused the centre image of the dial not to appear.

Lesson:

Do not trust generated file names or architecture claims without checking the actual repository and asset folder.

---

## 5. Current Portal Button Behaviour

Current temporary wedge layout:

```text
ABOUT
HELP
CINAEDVS
SETTINGS
FONT
SCENE
```

Current behaviour:

```text
SCENE     → opens apps/scene-editor/
CINAEDVS  → opens https://cinaedvsstudios.github.io/cinaedvs/ in a new tab
ABOUT     → placeholder panel
HELP      → placeholder panel
SETTINGS  → placeholder panel
FONT      → placeholder panel
```

---

## 6. Planned Portal Layout Revision

The current six-wedge portal works as the first functional version, but the long-term information architecture should change.

Planned long-term wedge layout:

```text
SCENE EDITOR
UTILITIES
PROJECT MANAGER
SETTINGS
ABOUT / CINAEDVS
future major module
```

The Help function should move out of the main wheel and become a smaller corner button, probably in the bottom corner of the screen.

Reason:

Help is useful, but it should not take one of the main radial wedges. The main wedges should be reserved for major production tools.

---

## 7. Centre Hub / Active Project Selector

The centre hub should become functional later.

Purpose:

The centre hub controls the active Artifex project.

Behaviour:

```text
Click centre hub
Open Project Selector
Auto-load last active project from localStorage
If no project exists, prompt to create one
Selecting a project updates all tool defaults
Active project name appears subtly somewhere on the portal
```

The centre hub should not open a normal tool. It should behave like the project core / project switcher.

Example stored local state:

```json
{
  "activeProjectId": "forever_bound",
  "lastOpenedAt": "2026-05-20T00:00:00.000Z"
}
```

---

## 8. Project Settings / Project Profiles

Artifex should support multiple projects.

A Project Profile stores URLs, folder paths, save locations, defaults, and tool state for a specific game or creative project.

Purpose:

When a project is selected, every Artifex tool knows which files, folders, assets, effects, templates, and export locations belong to that project.

Example project profile:

```json
{
  "id": "forever_bound",
  "name": "Forever Bound",
  "repoUrl": "https://github.com/cinaedvsstudios/Forever-Bound-Game/",
  "liveUrl": "https://cinaedvsstudios.github.io/Forever-Bound-Game/",
  "artifexUrl": "https://cinaedvsstudios.github.io/Forever-Bound-Game/artifex/",
  "localRootPath": "E:/Forever Bound/Forever Bound GAME/Forever-Bound-Game/",
  "defaultSceneFolder": "data/scenes/",
  "defaultScreenFolder": "data/screens/",
  "defaultAssetFolder": "assets/",
  "defaultExportFolder": "data/scenes/",
  "assetLibraries": [],
  "effectsLibraries": [],
  "projectManager": {
    "chronicles": [],
    "tasks": []
  }
}
```

Project Settings should include:

```text
Create Project
Select Active Project
Edit Project URLs
Set Local HDD Save Location
Set Default Export Folder
Save Project Settings
Import Project Settings JSON
Export Project Settings JSON
```

The selected project controls:

```text
which files Artifex opens by default
where exports are intended to go
which assets appear in the Asset Library
which CG effects are available
which tasks appear in Project Manager
which template set is used
which repo/upload URLs are shown
```

---

## 9. Autosave / Backup Logic

Desired behaviour:

Every time the user enters or exits a screen/module, Artifex should save the current project state.

Use a two-layer save approach.

### Layer 1 — localStorage

Use browser `localStorage` for fast automatic recovery.

This stores:

```text
active project id
recent project list
current unsaved project JSON
last open module
last selected scene
UI preferences
```

Advantage:

Fast and automatic.

Risk:

Browser storage can be cleared, overwritten, or tied to one browser/device.

### Layer 2 — Project JSON Backup

The project should also be exportable to a project JSON file.

Desired future behaviour:

```text
Artifex asks the user to choose a local project file or folder
Artifex writes project changes back to that file when possible
This creates a real backup outside localStorage
```

Important limitation:

A normal browser cannot silently write to an arbitrary HDD path just because the path is typed in settings. The user must grant file/folder access through browser APIs, such as the File System Access API, or use manual export/download.

Practical first version:

```text
Auto-save to localStorage
Offer Export Project JSON button
Offer Import Project JSON button
Show preferred local HDD path as a reference
```

Better later version:

```text
Use File System Access API where supported
Let user choose a project JSON file
Keep a file handle with permission
Write changes back to that selected file
Fallback to manual download if browser permission is unavailable
```

---

## 10. Scene Editor

The current editor engine becomes:

```text
artifex/apps/scene-editor/
```

Current initial setup:

```text
artifex/apps/scene-editor/index.html
artifex/apps/scene-editor/README.md
```

The current Scene Editor route loads the existing standalone editor engine from the repo root.

Needs testing:

- confirm Scene wedge opens the editor.
- confirm editor CSS loads.
- confirm editor JS loads.
- confirm the editor can render.
- confirm JSON import/download still work.
- confirm image/asset paths inside the editor still resolve correctly.

Main challenge:

Fixing relative file paths. Current paths may assume repo root:

```text
assets/
data/
src/
```

After migration these may need path handling or a proper path resolver system.

---

## 11. Project Manager

Artifex should include a visual Project Manager for planning the game.

Purpose:

The Project Manager lets the creator see the whole game structure, plan scenes, track progress, and create tasks.

It should use collapsible nested boxes so the project can be viewed at different levels.

Possible sections:

```text
Project Overview
Chronicles
Quests / Callings
Scenes
Tasks
Asset Needs
Testing Checklist
Bugs / Blockers
Progress Dashboard
```

Example hierarchy:

```text
Forever Bound
  Chronicle 0
    Quest 0.0
      Scene: Tutorial Map
      Scene: Forest Travel Route
      Scene: First Stone Marker
      Tasks
    Quest 0.5
      Battle Test
      Officina Test
      Songspell Test
  Chronicle 1
    Quest 1.0
    Quest 1.1
```

Each collapsible item should be able to contain:

```text
Status
Checklist
Notes
Linked JSON file
Linked assets
Assigned tasks
Priority
Completion percentage
Last edited date
Open in Scene Editor
```

Example status values:

```text
Not Started
Planning
In Progress
Needs Review
Blocked
Ready for Test
Complete
```

The Project Manager should eventually connect directly to the Scene Editor, so clicking a scene/task can open the relevant JSON file or template.

Long-term idea:

Project Manager becomes the production dashboard for the entire game.

---

## 12. Utilities Wedge / Expanding Sub-Wheel

The current Font wedge should probably become:

```text
UTILITIES
```

When clicked, it should open a secondary wedge, sub-wheel, or radial fan coming out of that section.

Possible Utilities submenu items:

```text
CG Effects Library
Asset Library
Font Packer
Sprite Wizard
Frame Extractor
Audio/SFX Utility
Palette / Theme Utility
JSON Validator / Cleaner
Sprite Sheet / Atlas Builder
Image Optimizer / Resizer
```

The Utilities wedge should become the home for tools that help prepare, convert, or organize assets rather than editing game scenes directly.

Design idea:

- click Utilities.
- current wheel either rotates/opens a sub-wheel, or a smaller radial fan expands from that wedge.
- selecting a utility opens the matching module or placeholder panel.
- Back returns to the main Artifex portal.

Do not build this immediately until the Scene Editor route is tested.

---

## 13. CG Effects Library

The portal proved that Artifex can generate atmospheric effects using browser code and math.

Examples already proven in the portal:

```text
Fog / mist particles
Sparks / embers
Firelight flicker
Hover glow
Magic pulse
Procedural audio effects
```

Artifex should include a CG Effects Library where reusable visual effects can be created, previewed, configured, and exported into scenes.

Purpose:

Instead of manually coding fog, sparks, magic swirls, glowing particles, rain, smoke, etc. every time, the creator can choose an effect from a library and attach it to a scene.

Possible effects:

```text
Fog
Mist
Sparks
Embers
Magic Swirls
Purple Arcane Glow
Firelight Flicker
Rain
Snow
Dust
Floating Pollen
Smoke
Lightning Pulse
Portal Glow
Water Shimmer
Heat Haze
```

Each effect should have editable settings:

```text
Particle count
Speed
Direction
Colour
Opacity
Size range
Spawn area
Blend mode
Loop behaviour
Layer/depth
Trigger condition
Preview on/off
```

Recommended architecture:

```text
artifex/apps/effects-library/
artifex/effects/
```

Possible reusable effect files:

```text
artifex/effects/fx_fog.js
artifex/effects/fx_sparks.js
artifex/effects/fx_magic_swirl.js
artifex/effects/fx_firelight.js
artifex/effects/fx_portal_glow.js
artifex/effects/fx_rain.js
artifex/effects/fx_snow.js
artifex/effects/fx_dust.js
```

Each effect module should expose a predictable interface:

```js
export function createEffect(config) {
  return {
    update(deltaTime) {},
    draw(ctx) {},
    destroy() {}
  };
}
```

Scene JSON controls which effect appears, where it appears, which layer it draws on, and how it behaves.

Example scene JSON effect block:

```json
{
  "effects": [
    {
      "id": "forest_low_mist",
      "type": "fog",
      "module": "fx_fog",
      "layer": 6,
      "enabled": true,
      "bounds": { "x": 0, "y": 420, "width": 1280, "height": 300 },
      "settings": {
        "particleCount": 40,
        "speedX": 0.8,
        "speedY": 0.05,
        "opacity": 0.12,
        "sizeMin": 80,
        "sizeMax": 220,
        "colour": "rgba(200, 210, 230, 0.12)",
        "blendMode": "screen"
      }
    }
  ]
}
```

The Scene Editor should eventually allow:

```text
Add Effect
Choose effect type
Preview effect live
Edit settings sliders
Set layer
Set spawn bounds
Save effect config into scene JSON
Export effect preset
Import effect preset
```

The CG Effects Library should store reusable presets so the same fog, sparks, or magic swirl can be reused across multiple scenes.

---

## 14. Asset Library

Artifex should include a searchable asset library.

Purpose:

The Asset Library stores all usable project assets and makes them searchable by type, tag, character, folder, scene, and usage.

Asset categories:

```text
Characters
Character Animations
Props
Backgrounds
UI Elements
Buttons
Frames
Logos
Icons
Audio
Music
Sound Effects
CG Effects
Templates
```

Each asset should have metadata.

Basic asset record:

```json
{
  "id": "barrel_wood_01",
  "name": "Wooden Barrel 01",
  "type": "prop",
  "file": "assets/props/barrel_wood_01.png",
  "tags": ["barrel", "wood", "town", "searchable"],
  "status": "draft",
  "notes": "Reusable searchable object."
}
```

A character should not just be one file. A character should be an asset group.

Character group record:

```json
{
  "id": "mel",
  "name": "Mel",
  "type": "character",
  "folder": "assets/characters/mel/",
  "tags": ["player", "witch", "main-character"],
  "animations": {
    "idle": ["mel_idle_01.png"],
    "walk_right": ["mel_walk_right_01.png", "mel_walk_right_02.png"],
    "walk_left": ["mel_walk_left_01.png", "mel_walk_left_02.png"],
    "jump": ["mel_jump_01.png"]
  },
  "portraits": {
    "neutral": "mel_portrait_neutral.png",
    "angry": "mel_portrait_angry.png"
  }
}
```

Asset Library should support:

```text
Search by name
Search by tag
Filter by type
Filter by status
Filter by project
Filter by character
Filter by scene usage
Preview image/audio
Copy file path
Insert into Scene Editor
Add/edit tags
Group related files into characters/animation sets
Track usage across scenes
```

The Scene Editor should eventually use the Asset Library directly, so when adding an object or character, the creator can pick from tagged assets instead of manually typing paths.

---

## 15. Template System Plan

Goal:

Provide clean starter JSON templates for every major screen type.

Planned folder:

```text
artifex/templates/
```

Planned template files:

```text
title_screen_template.json
map_screen_template.json
travel_scene_template.json
scene_mode_template.json
battle_scene_template.json
ui_layout_template.json
dialogue_scene_template.json
codice_screen_template.json
```

These are not real game scenes. They are starting points for creating new scenes.

Planned manifest:

```text
artifex/templates/templates.json
```

Example manifest:

```json
{
  "templates": [
    {
      "id": "travel_scene",
      "label": "Travel Mode Scene",
      "file": "travel_scene_template.json",
      "defaultSaveFolder": "data/scenes/"
    }
  ]
}
```

This prevents hardcoded template buttons.

---

## 16. Planned Scene Editor Workflow

Target workflow:

1. Open Artifex.
2. Centre hub loads or selects the active project.
3. Open Scene Editor.
4. Choose New Template or Open JSON.
5. Add backgrounds, characters, props, UI, and CG effects from libraries.
6. Edit visually.
7. Save/export the scene JSON.
8. Mark checklist items complete in Project Manager.
9. Upload/test in the game.

---

## 17. Development Phase Plan

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

### Phase 2 — Templates and Placeholder Game Data

- create `artifex/templates/`.
- create starter JSON templates.
- create `templates.json` manifest.
- create matching placeholder game data files.
- add New/Open/Download workflow.

### Phase 3 — Mini-App Shells and Module Expansion

- add placeholder mini-app shells.
- begin Utilities submenu.
- begin Project Manager placeholder.
- begin Asset Library placeholder.
- begin CG Effects Library placeholder.
- standardize screen JSON structures.

### Phase 4 — Workflow Testing and Cleanup

- full workflow testing.
- remove old embedded editor logic only when safe.
- cleanup/refactor.
- turn Artifex into reusable toolkit.

---

## 18. Known Risks

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

---

## 19. Current Immediate Priorities

1. Test the current portal after Batch 2.
2. Confirm `SCENE` opens `artifex/apps/scene-editor/`.
3. Confirm `CINAEDVS` opens `https://cinaedvsstudios.github.io/cinaedvs/` in a new tab.
4. Keep the current portal visuals unless something is broken.
5. Fix any path issues inside the new Scene Editor route.
6. Fix JSON import/export behaviour in the Scene Editor.
7. Update the main game title button to open `artifex/`.
8. Plan the centre hub active project selector.
9. Plan the future Utilities wedge.
10. Plan the future Project Manager wedge.

---

## 20. Document Size Warning

This working document is now large enough that it should be periodically exported or copied out before adding full schemas for:

```text
Project Profile JSON
Project Manager JSON
Asset Library JSON
CG Effects Preset JSON
Scene JSON effect blocks
Template manifest JSON
```

Once those schemas are added, the document may become too big to comfortably manage in chat/canvas alone.

