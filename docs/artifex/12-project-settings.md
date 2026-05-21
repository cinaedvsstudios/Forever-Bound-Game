# Project Settings and Project Profiles

## Purpose

Artifex should support multiple projects.

A Project Profile stores URLs, folder paths, save locations, defaults, and tool state for a specific game or creative project.

When a project is selected, every Artifex tool knows which files, folders, assets, effects, templates, and export locations belong to that project.

## Centre Hub Relationship

The centre hub on the Artifex portal should eventually control the active project.

Expected behaviour:

```text
Click centre hub
Open Project Selector
Auto-load last active project from localStorage
If no project exists, prompt to create one
Selecting a project updates all tool defaults
Active project name appears subtly somewhere on the portal
```

## Example Project Profile

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

Earlier project profile fields also included:

```json
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

## Project Settings Should Include

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

## Selected Project Controls

The selected project controls:

```text
which files Artifex opens by default
where exports are intended to go
which assets appear in the Asset Library
which CG effects are available
which tasks appear in Project Manager / Creation Guide
which template set is used
which repo/upload URLs are shown
```

## Browser File Saving Limitation

A normal browser cannot silently save files directly into an arbitrary HDD folder just because a path is typed in Settings.

The user must grant file/folder access through browser APIs, such as the File System Access API, or use manual export/download.

The local save path should first work as a reference/default path. Later, direct save support may use the File System Access API or a desktop wrapper.

## Autosave / Backup Logic

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

## Relationship To Manifest

Project Settings and Project Manifest overlap but are not identical.

Project Settings are the tool/user workspace profile: URLs, default folders, active project, local references, and UI defaults.

Project Manifest is the game structure file that tells the Runtime/Project Editor what belongs to the actual game project.
