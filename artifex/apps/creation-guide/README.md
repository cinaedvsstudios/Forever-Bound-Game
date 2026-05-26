# Artifex Creation Guide V1

## Purpose

The Creation Guide is the Artifex wizard, milestone tracker, checklist surface, progress dashboard, and health-check module.

It helps a creator start a new Artifex Adventure project from the starter template, then track what still needs to be changed, confirmed, built, tested, or fixed.

## V1 Scope

This first version is intentionally practical and small. It adapts the Artifex Blank Module Boilerplate into a real Creation Guide module with:

- project setup fields
- enabled module selection
- starter production timeline
- editable milestones
- editable checklist items
- milestone completion percentage
- overall completion percentage
- project health check warnings
- JSON import/export
- browser local saves
- dashboard snapshot export
- links out to the Artifex Portal and Scene Editor

## What It Does Not Do Yet

V1 does not directly write to GitHub, create real project folders, edit Flatplans, open JSON files directly, or validate live asset paths from the repository.

Those features belong to later versions after the core workflow is proven.

## Relationship To Other Modules

Creation Guide points the creator to the correct tool. It does not replace them.

- Project Editor owns the Manifest, Flatplan, routes, catalog, Stitcher, and map projection.
- Scene Editor builds scene JSON and visual layout.
- Quest Builder handles quest and Calling structure.
- Object Library and Asset Library provide reusable runtime objects and files.

## Data Model

The module exports one Creation Guide JSON document:

```json
{
  "id": "creation_xxxxx",
  "name": "Artifex Adventure Creation Guide",
  "moduleKind": "creation-guide",
  "version": "V1.0",
  "setup": {},
  "milestones": [],
  "notes": "",
  "projectTree": []
}
```

Milestones contain status, stage, priority, notes, linked file/tool references, and checklist items.

## First Version Rule

This module should first prove one working guide document before it becomes a full project creation system.
