# Template System

## Purpose

Artifex should provide clean starter JSON templates for every major screen and scene type.

Templates are not real game scenes. They are starting points for creating new scenes/screens.

## Planned Template Folder

```text
artifex/templates/
```

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

## Template Manifest

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

The manifest prevents hardcoded template buttons.

## Placeholder Game Data

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

## Planned Scene Editor Workflow

Target workflow:

1. Open Artifex.
2. Centre hub loads or selects the active project.
3. Open Scene Editor.
4. Choose New Template or Open JSON.
5. Add backgrounds, characters, props, UI, and CG effects from libraries.
6. Edit visually.
7. Save/export the scene JSON.
8. Mark checklist items complete in Creation Guide.
9. Upload/test in the game.

Earlier workflow version:

1. Open Artifex.
2. Open Scene Editor.
3. Choose New Template or Open JSON.
4. Edit visually.
5. Download JSON.
6. Upload JSON into game repo.
7. Reload/test game.

## Relationship To Artifex Adventures

Artifex Adventures is the working starter game.

The template files are smaller reusable starter files used by the editor.

Artifex Adventures can be built from a set of templates plus starter assets and starter project data.
