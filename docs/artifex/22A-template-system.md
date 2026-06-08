# Template System Specification

Status: Active shared-service/reference specification during documentation consolidation  
Owning area: Template System  
Source evidence: `docs/artifex/15-template-system.md`  
Current implementation status: planned / not confirmed as complete standalone service  
Related modules: Creation Guide, Scene Editor, Asset Library, Template Game, Runtime/Playtest

## Purpose

The Template System provides clean reusable starter JSON templates for major screen and scene types.

Templates are not real game scenes. They are starting points for creating new scenes/screens.

The Template System is separate from the populated Template Game reference project.

## Planned Template Folder

```text
artifex/templates/
```

## Planned Template Files

Potential starter templates include:

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

Planned manifest:

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

The actual game may also contain example placeholder files for testing, examples, template references and editor development.

Example older placeholder paths:

```text
data/screens/title_screen_placeholder.json
data/map/map_placeholder.json
data/scenes/travel_placeholder.json
data/scenes/scene_mode_placeholder.json
data/scenes/battle_placeholder.json
data/ui/ui_layout_placeholder.json
```

These older paths are historical examples. Any current implementation must align with the canonical connected-project contract and project-relative paths.

## Scene Editor Workflow Target

Target workflow:

1. Open Artifex.
2. Hub loads or selects the active project.
3. Open Scene Editor.
4. Choose New Template or Open JSON.
5. Add backgrounds, characters, props, UI and effects from registered libraries.
6. Edit visually.
7. Save/export the scene JSON.
8. Mark checklist items complete in Creation Guide where appropriate.
9. Test through preview/runtime when supported.

Older workflow versions that required manual download/upload are fallback/history only once connected-folder saving exists.

## Relationship to Creation Guide

Creation Guide may offer starter choices or recommended templates during setup, but Template System owns reusable template definitions if this remains a maintained shared service.

## Relationship to Scene Editor

Scene Editor may use templates as starting points for new scenes/screens. Once a template is used to create a project scene/screen, Scene Editor owns the resulting project record.

## Relationship to Template Game

Template files are small reusable starter files.

Template Game is a populated connected reference project with real registered records.

Artifex Adventures / Forever Bound is the real production project.


## Blank Module Boilerplate Evidence

The archived `artifex/apps/module-boilerplate/` README and extension notes describe a neutral authoring-app shell with a top menu, side panel, workspace, bottom record list, import/export JSON, local browser save and simple canvas preview. It may be used as implementation evidence when creating future Artifex tools, but it is not itself an active module specification and must not create a second documentation source of truth.

## Required Future Work

The active backlog should decide:

- whether Template System remains a maintained shared service or becomes a Creation Guide/Scene Editor feature;
- whether `artifex/templates/` and `templates.json` are still the desired paths;
- which templates are required for the first usable release;
- how templates create canonical `scenes/` or `screens/` project records;
- how template-created records interact with Creation Guide checklists and Health;
- how template assets/placeholders are resolved through Asset Library.

## Source Classification

`docs/artifex/15-template-system.md` is consolidated into this reference. After this file is accepted, the old document can become archive/source evidence.
