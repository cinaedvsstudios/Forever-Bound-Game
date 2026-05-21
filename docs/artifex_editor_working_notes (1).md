



# Artifex Editor Working Notes

## Purpose

Artifex is evolving into a standalone creator toolkit and hub application for Forever Bound and future projects.

The long-term architecture goal is:

- Forever Bound = the actual game
- Artifex = the creator toolkit / mini-app hub
- Scene Editor = one app inside Artifex

The game itself should not permanently contain editor logic.

---

# Current Situation

There are currently two editor systems inside the repository.

## Current Main System

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

This is the newer combined game/editor shell currently being modified.

This system currently contains:

- title screen
- editor mode
- scene editing
- settings
- JSON preview
- file controls
- right/left panels
- visual editing
- game shell logic

---

## Older Standalone Editor

Used by:

```text
editor.html
```

Loads:

```text
src/editor.js
src/editor.css
```

This appears to be the older standalone Scene Editor.

It may still contain useful working logic for:

- JSON import
- scene loading
- download/export
- drag logic
- editor rendering

DO NOT DELETE YET.

---

# Current Problems

## JSON Import Problem

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

---

## Appearance Patch Issue (FIXED)

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

---

# Current Appearance Features

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

---

# Planned Future Architecture

## Main Goal

Move Artifex into a standalone folder:

```text
artifex/
```

The game and editor should become fully separate systems.

---

# Planned Folder Structure

Example target structure:

```text
index.html
src/game.js
assets/
data/

artifex/
  index.html
  apps/
  templates/
  assets/
  settings/
```

---

# Artifex Hub Concept

Artifex should become a launcher/menu system.

Instead of immediately opening the Scene Editor, it should first open a hub page.

Example:

```text
ARTIFEX

[Scene Editor]
[Sprite Wizard]
[Font Packer]
[Frame Extractor]
[Asset Tools]
[Settings]
```

Only Scene Editor needs to function initially.

Other apps can begin as placeholders.

---

# Scene Editor Migration Plan

The current editor engine becomes:

```text
artifex/apps/scene-editor/
```

The existing Artifex editor UI and logic moves there.

Main challenge:

Fixing relative file paths.

Current paths assume repo root:

```text
assets/
data/
src/
```

After migration these may need:

```text
../assets/
../data/
```

or a proper path resolver system.

---

# Template System Plan

## Goal

Provide clean starter JSON templates for every major screen type.

---

## Planned Template Folder

```text
artifex/templates/
```

---

## Planned Template Files

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

These are NOT real game scenes.

They are starting points for creating new scenes.

---

# Placeholder Game Data Plan

The actual game should also contain example placeholder files.

Example:

```text
data/screens/title_screen_placeholder.json
data/map/map_placeholder.json
data/scenes/travel_placeholder.json
data/scenes/scene_mode_placeholder.json
data/scenes/battle_placeholder.json
data/ui/ui_layout_placeholder.json
```

These exist for:

- testing
- examples
- template references
- editor development

---

# Planned Scene Editor Workflow

Target workflow:

1. Open Artifex
2. Open Scene Editor
3. Choose New Template or Open JSON
4. Edit visually
5. Download JSON
6. Upload JSON into game repo
7. Reload/test game

---

# Planned Template Manifest

Planned file:

```text
artifex/templates/templates.json
```

Example structure:

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

# Planned Game Button Change

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

---

# Development Phase Plan

## Phase 1 — Current Status

Goal:

Separate the game/editor concept and establish Artifex as its own folder and portal.

Completed so far:

- `artifex/` folder exists.
- `artifex/index.html` exists.
- radial hub portal front screen exists.
- portal visual identity is established.
- portal audio works after browser audio unlock.
- portal fog and sparks are animated procedurally.
- wedge hover glow and bulge effects work.
- centre dial image bug has been fixed.
- Artifex now has a recognizable standalone landing screen.
- portal wedges now have functional actions/placeholders.
- `CINAEDVS` opens the external Cinaedvs Studios page in a new tab.
- `SCENE` opens the new Scene Editor route.
- `artifex/apps/scene-editor/` exists.
- `artifex/apps/scene-editor/index.html` exists and currently loads the existing standalone editor engine from the repo root.

Still required before Phase 1 is complete:

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

---

## Phase 2

- Create templates folder
- Create placeholder game scenes
- Add New/Open/Download workflow
- Add template manifest

---

## Phase 3

- Add placeholder mini-apps
- Standardize screen JSON structures
- Add example/demo scenes

---

## Phase 4

- Full workflow testing
- Remove old embedded editor logic
- Cleanup/refactor
- Turn Artifex into reusable toolkit

---

# Current Known Risks

## Path Risk

Moving Artifex into a subfolder may break:

- images
- audio
- JSON loading
- settings loading
- relative fetch calls

---

## Dual Editor Risk

Two editor systems currently exist:

```text
src/artifex_game.js
src/editor.js
```

Need to avoid deleting useful working logic accidentally.

---

## SD Card Risk

Current development is occurring on an SD card with intermittent overwrite corruption.

Symptoms:

- overwrite/save replacing occasionally fails
- 0-byte corrupted files appear
- some directory entries become unreadable
- delete/rename may fail with:

```text
0x80070570
The file or directory is corrupted and unreadable.
```

Temporary workaround:

- avoid overwriting existing files directly
- save as new filenames
- use new folders when corruption occurs
- avoid repair tools until backups exist

---

# Current Important Files

## Main Game/Editor

```text
index.html
src/artifex_game.js
src/style.css
src/artifex_theme.css
src/artifex_appearance_patch.css
src/artifex_appearance_patch.js
```

---

## Older Editor

```text
editor.html
src/editor.js
src/editor.css
```

---

## Data Files

```text
data/editor/editor_settings.json
data/screens/title_screen.json
data/scenes/ch00_q00_forest_route.json
```

---

# Current Immediate Priorities

1. Fix the portal centre dial image bug caused by the fake `centerhub.png` reference.
2. Keep the portal code otherwise unchanged unless something is actually broken.
3. Wire the radial wedges to real actions or placeholder pages.
4. Decide the Scene Editor destination folder inside Artifex.
5. Move/copy the current editor engine into Artifex as the Scene Editor.
6. Fix all relative paths after moving the editor.
7. Fix JSON import behaviour in the Scene Editor.
8. Create the first templates folder and template manifest.
9. Create matching placeholder game data files.
10. Update the main game title button to open `artifex/`.

---

# Status Update — Portal Built and Phase 1 Preparation

## What Has Been Done So Far

The Artifex split has begun.

Completed so far:

- `artifex/` folder exists.
- `artifex/index.html` exists.
- the Artifex portal landing screen exists.
- the radial copper hub menu is visually working.
- the dungeon background is in place.
- top-left Artifex branding is in place.
- top-right audio toggle is in place.
- six radial wedge buttons are visible.
- hover glow works.
- wedge bulge / outward movement works on mouseover.
- procedural fog is animated with Canvas math.
- procedural sparks / embers are animated with Canvas math.
- hover/click audio works after browser audio unlock.
- the centre dial/core image bug has been fixed.

The portal now has a clear visual identity: hammered copper, carved icons, dark dungeon atmosphere, purple arcane energy, animated fog, and sparks.

---

## Gemini Code Review Notes

Gemini made useful first-pass code, but some assumptions needed correction.

Important corrected issue:

Gemini invented or assumed this file:

```text
centerhub.png
```

That caused the centre image of the dial not to appear.

The real/current dial asset logic uses:

```text
menudial.png
```

Status:

Fixed by correcting the asset/code logic.

Lesson:

Do not trust Gemini-generated filenames or architecture claims unless checked against the actual repository and assets.

---

## Current Portal Status

The portal front screen is now mostly working and should not be redesigned unless something is broken.

Keep:

- copper wheel
- dungeon background
- purple hover glow
- animated fog
- animated sparks
- audio toggle
- hover/click sounds
- centre magical dial/core

Next portal work should focus on function, not more visual redesign.

---

## Current Phase 1 Status

Phase 1 goal:

Separate the game/editor concept and establish Artifex as its own standalone folder and portal.

Phase 1 is partly complete.

Completed:

- Artifex folder created.
- Artifex portal front screen created.
- portal visuals mostly working.
- portal interaction effects working.
- centre image bug fixed.

Still required before Phase 1 is complete:

- wire portal wedges to real actions or placeholders.
- decide the Scene Editor destination folder.
- create the Scene Editor app folder.
- move/copy the current editor engine into Artifex.
- fix paths after moving the editor.
- update the game title button so it opens `artifex/` instead of embedded editor mode.
- confirm the root game still works after the split.

---

## Proposed Wedge Destinations

```text
SCENE     → Scene Editor
FONT      → Font Packer placeholder/app
SETTINGS  → Artifex Settings placeholder/panel
HELP      → Help / usage guide placeholder/panel
ABOUT     → About Artifex placeholder/panel
CINAEDVS  → Studio/about/repo link or placeholder/panel
```

The centre dial/core should stay decorative for now unless a clear function is needed later.

---

## Recommended Next Change Batches

### Batch 1 — Portal Function Wiring

Purpose:

Turn the portal from a visual mock-up into a functional hub.

Changes:

- add a clean button/action map in the portal JavaScript.
- make each wedge trigger a real action.
- Scene opens the Scene Editor destination.
- unfinished tools open placeholder panels/pages instead of doing nothing.
- keep hover/audio/particle logic unchanged.

Pause/test after this batch.

---

### Batch 2 — Scene Editor Folder Setup

Purpose:

Create the new home for the current editor tool.

Likely folder:

```text
artifex/apps/scene-editor/
```

Status:

Completed initial setup.

Changes made:

- created `artifex/apps/scene-editor/`.
- added `artifex/apps/scene-editor/README.md`.
- added `artifex/apps/scene-editor/index.html`.
- kept the old root editor files temporarily as fallback.
- updated the Scene wedge to open `apps/scene-editor/`.
- updated the Cinaedvs wedge to open `https://cinaedvsstudios.github.io/cinaedvs/` in a new tab.
- did not delete old editor systems.

Needs testing:

- confirm Scene wedge opens the editor.
- confirm editor CSS loads.
- confirm editor JS loads.
- confirm the editor can render.
- confirm JSON import/download still work.

Pause/test after this batch.

---

### Batch 3 — Path Fixing

Purpose:

Make the moved editor actually load assets and JSON correctly from its new folder.

Changes:

- fix asset paths.
- fix data paths.
- fix settings paths.
- check image previews.
- check audio previews.
- check JSON fetch/import/download.

Pause/test after this batch.

---

### Batch 4 — Templates

Purpose:

Start turning Scene Editor into a proper creator tool.

Changes:

- create `artifex/templates/`.
- create starter JSON templates.
- create `templates.json` manifest.
- later add New From Template UI.

Pause/test after this batch.

---

## Immediate Next Step

The next practical change should be Batch 1: portal function wiring.

Do not start moving the Scene Editor until the portal buttons have clean destinations/placeholders.





extra parts you said didnt get added:



\---



\# Expanded Artifex Tool Vision



Artifex should not only be a scene editor. It should become a reusable creator toolkit for Forever Bound and future projects.



The portal/hub is the front screen. Each wedge opens either a tool, a project-management area, or a utility module.



Core planned modules:



\`\`\`text

Scene Editor

Project Settings

Project Manager

CG Effects Library

Asset Library

Font Packer

Help / Guides

About / Studio Links





The clean structure is:

Artifex Portal = the front door.\
Scene Editor = build/edit screens and scenes.\
Project Settings = connect folders, URLs, exports, and active project context.\
Project Manager = plan the whole game visually with tasks/checklists.\
CG Effects Library = reusable animated fog/sparks/magic/swirl effects.\
Asset Library = searchable database of characters, props, backgrounds, UI, sounds, and animation groups.

I can’t write into the canvas directly from this response, but here is the cleaned section to paste into the Artifex Editor Working Notes.

````
---

# Expanded Artifex Tool Vision

Artifex should not only be a scene editor. It should become a reusable creator toolkit for Forever Bound and future projects.

The portal/hub is the front screen. Each wedge opens either a tool, a project-management area, or a utility module.

Core planned modules:

```text
Scene Editor
Project Settings
Project Manager
CG Effects Library
Asset Library
Font Packer
Help / Guides
About / Studio Links
````

---

# Project Settings / Project Profiles

Artifex should support multiple projects.

A project profile stores the URLs, folder paths, save locations, and default file destinations for a specific game or creative project.

Purpose:

When a project is selected, every Artifex tool knows which files, folders, assets, and export locations belong to that project.

Example project fields:

```
{
  "id": "forever_bound",
  "name": "Forever Bound",
  "repoUrl": "https://github.com/cinaedvsstudios/Forever-Bound-Game/",
  "liveGameUrl": "",
  "artifexUrl": "",
  "assetsUrl": "",
  "dataUrl": "",
  "screensUrl": "",
  "scenesUrl": "",
  "templatesUrl": "",
  "repoUploadUrl": "",
  "localSavePath": "E:/Forever Bound/Forever Bound GAME/Forever-Bound-Game/",
  "defaultExportFolder": "data/scenes/",
  "notes": ""
}
```

Project Settings should include:

```
Create Project
Select Active Project
Edit Project URLs
Set Local HDD Save Location
Set Default Export Folder
Save Project Settings
Import Project Settings JSON
Export Project Settings JSON
```

Important browser limitation:

A normal browser cannot silently save files directly into an arbitrary HDD folder without user permission. The local save path should first work as a reference/default path. Later, direct save support may use the File System Access API or a desktop wrapper.

---

# Project Manager

Artifex should include a visual Project Manager for planning the game.

Purpose:

The Project Manager lets the creator see the whole game structure, plan scenes, track progress, and create tasks.

It should use collapsible boxes so the project can be viewed at different levels.

Example hierarchy:

```
Forever Bound
  Chapter 00
    Calling 00
      Map Screen
      Travel Scene: Forest Route
      Scene: Mel Intro
      Dialogue Scene: First Encounter
      Battle Scene / Trial Scene
      Reward / Completion Screen
```

Each collapsible item should be able to contain:

```
Status
Checklist
Notes
Linked JSON file
Linked assets
Assigned tasks
Priority
Completion percentage
Last edited date
```

Example status values:

```
Not Started
Planning
In Progress
Needs Review
Blocked
Ready for Test
Complete
```

Example task checklist:

```
Write scene dialogue
Add background art
Place character sprites
Add fog effect
Add music
Test JSON import
Test in game
```

The Project Manager should eventually connect directly to the Scene Editor, so clicking a scene/task can open the relevant JSON file or template.

Long-term idea:

Project Manager becomes the production dashboard for the entire game.

---

# CG Effects Library

The portal proved that Artifex can generate atmospheric effects using browser code and math.

Examples already proven in the portal:

```
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

```
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

```
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

Example effect JSON:

```
{
  "id": "forest_mist_low",
  "type": "fog",
  "label": "Low Forest Mist",
  "enabled": true,
  "layer": 4,
  "settings": {
    "particleCount": 40,
    "colour": "rgba(200, 210, 230, 0.12)",
    "speedX": 0.8,
    "speedY": 0.05,
    "sizeMin": 80,
    "sizeMax": 220,
    "blendMode": "screen",
    "spawn": "left"
  }
}
```

The Scene Editor should eventually allow:

```
Add CG Effect
Choose from library
Preview live
Edit settings
Save into scene JSON
Export effect preset
Import effect preset
```

This turns visual atmosphere into reusable data, not one-off custom code.

---

# Asset Library

Artifex should include a searchable asset library.

Purpose:

The Asset Library stores all usable project assets and makes them searchable by type, tag, character, folder, scene, and usage.

Asset categories:

```
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

Example basic asset record:

```
{
  "id": "mel_idle_right",
  "name": "Mel Idle Right",
  "type": "character_sprite",
  "character": "Mel",
  "file": "assets/characters/mel/mel_idle_right.png",
  "tags": ["mel", "player", "idle", "right", "sprite"],
  "notes": "",
  "usedIn": []
}
```

A character should not just be one file. A character should be an asset group.

Example character asset group:

```
{
  "id": "mel",
  "name": "Mel",
  "type": "character",
  "folder": "assets/characters/mel/",
  "tags": ["main-character", "witch", "player"],
  "animations": {
    "idle_right": "mel_idle_right.png",
    "idle_left": "mel_idle_left.png",
    "walk_right": [
      "mel_walk_right_01.png",
      "mel_walk_right_02.png",
      "mel_walk_right_03.png"
    ],
    "walk_left": [
      "mel_walk_left_01.png",
      "mel_walk_left_02.png",
      "mel_walk_left_03.png"
    ],
    "jump": "mel_jump.png"
  },
  "portraits": {
    "neutral": "mel_portrait_neutral.png",
    "angry": "mel_portrait_angry.png",
    "sad": "mel_portrait_sad.png"
  },
  "notes": ""
}
```

The Asset Library should support:

```
Search by name
Search by tag
Filter by type
Filter by project
Filter by character
Filter by scene usage
Preview image/audio
Copy file path
Insert into Scene Editor
Add/edit tags
Group related files
```

The Scene Editor should eventually use the Asset Library directly, so when adding an object or character, the creator can pick from tagged assets instead of manually typing paths.

---

# How These Systems Work Together

The intended workflow:

1. Select active project in Project Settings.
2. Open Project Manager to see what needs to be built.
3. Open a scene task.
4. Launch Scene Editor.
5. Add backgrounds, characters, props, UI, and CG effects from libraries.
6. Save/export the scene JSON.
7. Mark checklist items complete in Project Manager.
8. Test in the game.

This makes Artifex a complete production hub rather than just a visual JSON editor.

---

# Updated Long-Term Artifex Modules

```
Portal Hub
Scene Editor
Project Settings
Project Manager
Asset Library
CG Effects Library
Font Packer
Sprite Wizard
Frame Extractor
Help / Guides
About / Studio Links
```

---

# Note About Document Size

This working document is getting larger, but it is still manageable for now.

When the next major section is added — especially once templates, project JSON schemas, and asset schemas are expanded — export/download the document so there is a safe backup outside the chat/canvas.

````

Also yes: the corrected portal asset logic should be recorded as:

```text
menudial.png      = full large radial dial
artifexlogo.png   = centre hub image
menudialglow.png  = glow/electric overlay for centre hub
````

This idea works because it gives Artifex a proper internal logic: projects contain plans, plans contain scenes, scenes use assets, scenes use effects, and everything exports back into game JSON.



\---



\# Updated Artifex Portal / Project System Plan



\## Portal Layout Revision



The current six-wedge portal works as the first functional version, but the long-term information architecture should change.



Current temporary wedge layout:



ABOUT

HELP

CINAEDVS

SETTINGS

FONT

SCENE



Planned long-term layout:

```
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

# Utilities Wedge / Expanding Sub-Wheel

The current Font wedge should become:

```
UTILITIES
```

When clicked, it should open a secondary wedge, sub-wheel, or radial fan coming out of that wedge.

Possible Utilities submenu items:

```
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

The Utilities wedge becomes the home for tools that prepare, organize, convert, or manage assets rather than directly editing game scenes.

---

# Project Manager Wedge

The current Help wedge should eventually become:

```
PROJECT MANAGER
```

The Help function moves to a corner button.

Project Manager should open a visual planning dashboard with collapsible nested boxes for the whole project.

Possible Project Manager sections:

```
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

```
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

Each level should support:

```
Checklist
Status
Priority
Notes
Linked JSON file
Linked assets
Open in Scene Editor
Completion percentage
Last edited date
```

This becomes the production dashboard for the game.

---

# Centre Hub / Active Project Selector

The centre hub should become functional later.

Purpose:

The centre hub controls the active Artifex project.

Behaviour:

```
Click centre hub
Open Project Selector
Auto-load last active project from localStorage
If no project exists, prompt to create one
Selecting a project updates all tool defaults
Active project name appears subtly somewhere on the portal
```

The centre hub should not open a normal tool. It should behave like the project core / project switcher.

Example stored local state:

```
{
  "activeProjectId": "forever_bound",
  "lastOpenedAt": "2026-05-20T00:00:00.000Z"
}
```

---

# Project Profiles and Project JSON

A Project Profile stores all file paths, URLs, defaults, and tool state for one project.

Example:

```
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

The selected project controls:

```
which files Artifex opens by default
where exports are intended to go
which assets appear in the Asset Library
which CG effects are available
which tasks appear in Project Manager
which template set is used
which repo/upload URLs are shown
```

---

# Autosave / Backup Logic

Desired behaviour:

Every time the user enters or exits a screen/module, Artifex should save the current project state.

Two-layer save approach:

## Layer 1 — localStorage

Use browser `localStorage` for fast automatic recovery.

This stores:

```
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

## Layer 2 — Project JSON Backup

The project should also be exportable to a project JSON file.

Desired future behaviour:

```
Artifex asks the user to choose a local project file or folder
Artifex writes project changes back to that file when possible
This creates a real backup outside localStorage
```

Important limitation:

A normal browser cannot silently write to an arbitrary HDD path just because the path is typed in settings. The user must grant file/folder access through browser APIs, such as the File System Access API, or use manual export/download.

Practical first version:

```
Auto-save to localStorage
Offer Export Project JSON button
Offer Import Project JSON button
Show preferred local HDD path as a reference
```

Better later version:

```
Use File System Access API where supported
Let user choose a project JSON file
Keep a file handle with permission
Write changes back to that selected file
Fallback to manual download if browser permission is unavailable
```

---

# CG Effects Architecture

The CG Effects Library should be built as reusable effect modules.

The portal proves that effects like fog, sparks, firelight flicker, glow, and particles can be created with JavaScript and Canvas math.

Recommended architecture:

```
artifex/apps/effects-library/
artifex/effects/
```

Possible reusable effect files:

```
artifex/effects/fx_fog.js
artifex/effects/fx_sparks.js
artifex/effects/fx_magic_swirl.js
artifex/effects/fx_firelight.js
artifex/effects/fx_portal_glow.js
artifex/effects/fx_rain.js
artifex/effects/fx_snow.js
artifex/effects/fx_dust.js
```

Each effect module should expose a predictable interface.

Example conceptual interface:

```
export function createEffect(config) {
  return {
    update(deltaTime) {},
    draw(ctx) {},
    destroy() {}
  };
}
```

Scene JSON controls which effect appears, where it appears, and how it behaves.

Example scene JSON effect block:

```
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

The game engine loads the effect module and passes in the JSON settings.

The Scene Editor should eventually allow:

```
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

The CG Effects Library stores reusable presets so the same fog, sparks, or magic swirl can be reused across multiple scenes.

---

# Asset Library Architecture

The Asset Library should become a searchable database of project assets.

It should include characters, props, backgrounds, UI, audio, effects, and grouped animation sets.

Assets need metadata and tags.

Basic asset record:

```
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

Character group record:

```
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

```
search by name
tag search
filter by type
filter by status
filter by project
preview image/audio
copy file path
insert into Scene Editor
add/edit tags
group files into characters/animation sets
track usage across scenes
```

---

# How The Modules Work Together

The intended Artifex workflow:

```
Open Artifex portal
Centre hub auto-loads the last active project from localStorage
User can click centre hub to change project
Project Settings stores URLs, local paths, file groups, and save/export preferences
Project Manager shows the visual project plan and task checklist
Scene Editor edits screen/scene JSON files
Asset Library provides tagged assets to insert into scenes
CG Effects Library provides reusable effect modules and presets
Utilities contains helper tools like Font Packer, Sprite Wizard, and Frame Extractor
Artifex autosaves project state to localStorage and offers project JSON export/import
Where browser permission allows, Artifex writes the project JSON back to the selected local file
```

This makes Artifex a production hub, not only an editor.

---

# Document Size Warning

This working document is now getting large.

It is still usable, but it should be exported or copied out soon, especially before adding full schemas for:

```
Project Profile JSON
Project Manager JSON
Asset Library JSON
CG Effects Preset JSON
Scene JSON effect blocks
Template manifest JSON
```

Once those schemas are added, the document may become too big to comfortably manage in chat/canvas alone.

```

And yes, your CG effects assumption is right: the cleanest architecture is separate reusable JS effect modules, with the scene JSON deciding which effect appears, where it appears, which layer it draws on, and what settings it uses.
```

\


## Artifex Editor Working Notes



---

# Scene Editor v0.05 Working Baseline

The current working Scene Editor baseline is now:

```text
artifex/apps/scene-editor/scene-editor-v2.js
```

The Scene Editor page now loads the v2 build directly from:

```text
artifex/apps/scene-editor/index.html
```

The old chained patch approach should be treated as legacy/problematic and should not be used as the active base for new work:

```text
scene-editor.js
dropdown-fix.js
context-fix.js
```

Confirmed working in v0.05:

```text
Template import works
Right-click object menu works
Duplicate works
Delete works
Right-click zoom reset works
Set default zoom works
Zoom in / reset / out works
Download JSON works
Re-import downloaded JSON works
```

The v2 build should be the base for future Scene Editor work.

---

# Scene Editor v0.05 Follow-Up UI Polish List

Do not forget these requested UI/UX changes for the next Scene Editor pass:

```text
Remove the active file name from the Title Bar.
Add a black fixed-width pill in the Title Bar/status area for mouseover help text.
Put the mouseover/status text inside that black pill.
Make the status pill small enough to support two lines of text.
Put a grey vertical divider after the Artifex title image.
Add a solid coloured pill at the top of the Control Panel for the current file name.
Add the extra gridlines in the Work Area.
Make every 5th grid line bolder.
Add numbers along the horizontal axis.
Add letters along the vertical/depth axis.
Use X and Z axis labels, not X and Y, for the Work Area grid.
Clicking/dragging the Work Area scroll control should pan the visible Work Area around the screen.
Emoji buttons should use real colour emoji glyphs where possible.
The extra small action icons should be placed in the Elements card title/header area, not only inside the Elements body.
```

Current preferred terminology:

```text
Title Bar = top bar
Control Panel = left sidebar
Work Area = main editable stage/canvas
```

Next recommended pass:

```text
Scene Editor v0.06 UI polish pass
```

Suggested v0.06 scope:

```text
1. Title Bar cleanup
2. Control Panel file pill
3. Status/mouseover black pill
4. Work Area grid upgrade
5. Elements header action icons
6. Work Area panning behaviour
```

