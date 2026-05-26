# Artifex Blank Module Boilerplate

## Purpose

This folder is a neutral starting point for future Artifex modules.

It is intentionally not specific to FX, sprites, objects, scenes, fonts, palettes, audio, or project management. It provides the reusable shell only: top menu, side panel, workspace, bottom record list, import/export JSON, local browser save, and a simple canvas preview.

## Intended Use

Copy this folder, rename it, and adapt it into a specific module such as:

```text
sprite-wizard
font-packer
palette-maker
archetype-object-creator
asset-intake
dialogue-portrait-editor
audio-cue-editor
map-node-editor
```

## Basic Architecture

```text
index.html
v1/styles.css
v1/src/module-config.js
v1/src/module-app.js
v1/src/module-state.js
v1/src/module-ui.js
v1/src/module-renderer.js
v1/src/module-io.js
v1/src/module-library.js
docs/EXTENSION_NOTES.md
```

## Data Model

The boilerplate exports one neutral JSON document:

```json
{
  "id": "module_xxxxx",
  "name": "Untitled Module Data",
  "moduleKind": "blank-module",
  "version": "1.0",
  "createdAt": "...",
  "updatedAt": "...",
  "settings": {},
  "records": []
}
```

Each record is generic:

```json
{
  "id": "record_xxxxx",
  "name": "New Record",
  "type": "generic",
  "category": "uncategorised",
  "tags": [],
  "notes": "",
  "properties": {}
}
```

Replace this schema with the real module schema when the module becomes specific.

## Relationship To Other Artifex Modules

```text
Project Hub = launches modules.
Asset Library = stores raw files and metadata.
Scene Editor = places scene instances.
FX Editor = creates FX archetypes.
Archetype Object Creator = creates reusable object archetypes.
Blank Module Boilerplate = starting structure for new modules only.
```

## First Version Rule

The copied module should first prove its workflow with one working JSON object before adding advanced functionality.
