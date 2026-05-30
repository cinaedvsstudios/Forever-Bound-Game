# Artifex Canonical Starter File Schemas

Date: 2026-05-30
Status: Canonical companion to `docs/artifex/19-project-file-contracts.md`

## Purpose

`docs/artifex/19-project-file-contracts.md` defines ownership and folder paths. This companion document defines the minimum JSON shape for the files Creation Guide initially creates and Project Editor subsequently opens, validates and writes.

These shapes prevent Creation Guide and Project Editor from independently creating incompatible versions of the same project files.

## General Rules

1. Creation Guide creates the initial files in the connected project root.
2. Project Editor may later load and save its owned structure files without replacing the schema shape.
3. Every path in project data is relative to the connected project root.
4. Existing project files are not silently overwritten during initialisation.
5. IDs use the prefixes in `docs/artifex/19-project-file-contracts.md`.
6. Typed index collections are canonical; do not replace them with a generic `items` collection when writing the project file.

## `project.json`

```json
{
  "schemaVersion": "artifex.project.v1",
  "projectId": "project_forever_bound",
  "projectSlug": "forever-bound",
  "gameTitle": "Forever Bound",
  "creator": "Cinaedvs Studios",
  "version": "0.1.0",
  "createdBy": "creation-guide",
  "projectLogo": null,
  "startScreenId": "screen_title_main",
  "enabledModules": [],
  "roots": {
    "intake": "intake/",
    "assets": "assets/",
    "scenes": "scenes/",
    "screens": "screens/",
    "quests": "quests/",
    "sidequests": "sidequests/",
    "puzzles": "puzzles/",
    "archetypes": "archetypes/",
    "health": "health/",
    "build": "build/",
    "backups": "backups/",
    "todos": "todos/"
  },
  "fileRefs": {
    "logic": "logic.json",
    "layout": "layout.json",
    "registry": "registry.json",
    "libraryLinks": "library-links.json",
    "inputMap": "input-map.json",
    "sceneIndex": "scenes/scene-index.json",
    "screenIndex": "screens/screen-index.json",
    "questIndex": "quests/quest-index.json",
    "sidequestIndex": "sidequests/sidequest-index.json",
    "puzzleIndex": "puzzles/puzzle-index.json",
    "objectArchetypeIndex": "archetypes/object-index.json",
    "effectArchetypeIndex": "archetypes/effect-index.json",
    "assetIndex": "assets/asset-index.json",
    "healthReport": "health/latest-health-report.json"
  }
}
```

`projectLogo`, when supplied, must point to a final promoted asset under `assets/`, not an `intake/` source file.

## `logic.json`

```json
{
  "schemaVersion": "artifex.logic.v1",
  "projectId": "project_forever_bound",
  "nodes": [],
  "routes": [],
  "conditions": [],
  "startScreenId": "screen_title_main"
}
```

Project Editor owns the graph content after creation.

## `layout.json`

```json
{
  "schemaVersion": "artifex.layout.v1",
  "projectId": "project_forever_bound",
  "camera": {
    "zoom": 1,
    "panX": 0,
    "panY": 0
  },
  "nodes": [],
  "routes": [],
  "annotations": []
}
```

The camera fields are `panX` and `panY`, not `x` and `y`, because these are the Project Editor Flatplan viewport fields.

## `registry.json`

```json
{
  "schemaVersion": "artifex.registry.v1",
  "projectId": "project_forever_bound",
  "enabledModules": [],
  "indexes": {
    "sceneIndex": "scenes/scene-index.json",
    "screenIndex": "screens/screen-index.json",
    "questIndex": "quests/quest-index.json",
    "sidequestIndex": "sidequests/sidequest-index.json",
    "puzzleIndex": "puzzles/puzzle-index.json",
    "objectArchetypeIndex": "archetypes/object-index.json",
    "effectArchetypeIndex": "archetypes/effect-index.json",
    "assetIndex": "assets/asset-index.json"
  },
  "customMacros": []
}
```

## `library-links.json`

```json
{
  "schemaVersion": "artifex.library-links.v1",
  "projectId": "project_forever_bound",
  "links": []
}
```

Use the hyphenated schema name exactly as written above.

## `input-map.json`

Creation Guide owns the initial starter map. Project Editor validates/displays it and must retain the same shape when packaging or saving.

```json
{
  "schemaVersion": "artifex.input-map.v1",
  "projectId": "project_forever_bound",
  "profileId": "input_default_gameplay",
  "label": "Default Gameplay Controls",
  "createdBy": "creation-guide",
  "actions": [
    {
      "actionId": "action_move",
      "label": "Move",
      "category": "movement",
      "defaultKeyboard": ["ArrowKeys", "WASD"],
      "defaultGamepad": ["DPad", "LeftStick"],
      "required": true
    },
    {
      "actionId": "action_invoke",
      "label": "Invoke / Interact",
      "category": "gameplay",
      "defaultKeyboard": ["E", "Enter"],
      "defaultGamepad": ["B"],
      "required": true
    },
    {
      "actionId": "action_use_active_item",
      "label": "Use Active Item",
      "category": "gameplay",
      "defaultKeyboard": ["Space"],
      "defaultGamepad": ["A"],
      "required": true
    },
    {
      "actionId": "action_item_scroll_mode",
      "label": "Item Scroll Mode",
      "category": "inventory",
      "defaultKeyboard": ["Tab"],
      "defaultGamepad": ["X"],
      "required": false
    },
    {
      "actionId": "action_reserved_special",
      "label": "Reserved Special",
      "category": "gameplay",
      "defaultKeyboard": [],
      "defaultGamepad": ["Y"],
      "required": false
    },
    {
      "actionId": "action_inventory",
      "label": "Kibisis Pouch",
      "category": "inventory",
      "defaultKeyboard": ["I"],
      "defaultGamepad": ["Select"],
      "required": true
    },
    {
      "actionId": "action_menu",
      "label": "Codice Cylinder of Yggdrasil",
      "category": "system",
      "defaultKeyboard": ["Escape"],
      "defaultGamepad": ["Start"],
      "required": true
    }
  ]
}
```

## Typed Index Files

The following are the canonical empty index shapes created during project initialisation. Other apps later add records to their own typed collection.

```json
{
  "schemaVersion": "artifex.scenes.index.v1",
  "projectId": "project_forever_bound",
  "scenes": []
}
```

```json
{
  "schemaVersion": "artifex.screens.index.v1",
  "projectId": "project_forever_bound",
  "screens": []
}
```

```json
{
  "schemaVersion": "artifex.quests.index.v1",
  "projectId": "project_forever_bound",
  "quests": []
}
```

```json
{
  "schemaVersion": "artifex.sidequests.index.v1",
  "projectId": "project_forever_bound",
  "sidequests": []
}
```

```json
{
  "schemaVersion": "artifex.puzzles.index.v1",
  "projectId": "project_forever_bound",
  "puzzles": []
}
```

```json
{
  "schemaVersion": "artifex.archetypes.objects.index.v1",
  "projectId": "project_forever_bound",
  "objects": []
}
```

```json
{
  "schemaVersion": "artifex.archetypes.effects.index.v1",
  "projectId": "project_forever_bound",
  "effects": []
}
```

```json
{
  "schemaVersion": "artifex.assets.index.v1",
  "projectId": "project_forever_bound",
  "assets": []
}
```

## Migration Note For Files Already Created During V1.1.11 Testing

Creation Guide intentionally does not overwrite files already present in a connected project folder. A folder initialised before this schema alignment may contain the earlier `input-map.json` object form or earlier `layout.json` camera form. It must later be validated/migrated explicitly rather than silently replaced. For a disposable test folder, deleting the earlier generated starter JSON files and running starter creation again is acceptable.