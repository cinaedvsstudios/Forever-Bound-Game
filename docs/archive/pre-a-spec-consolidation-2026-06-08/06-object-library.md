# Archetype Object Creator / Object Library

## Current Name And Implementation Status

The active authoring module is named **Archetype Object Creator** and lives at:

```text
artifex/apps/archetype-object-creator/
```

The concept may still be described generically as the **Object Library** when referring to the reusable collection of saved object definitions, but implementation work must use the active module name **Archetype Object Creator**.

Current-main version: `V1.36`, merged from PR #38 on 2 June 2026 at merge commit `ef4f37ebe5850c6367db59e57c01e2bb89949384`.  
Validation status: the repaired Step 5 layout, working **Add Frame Event**, click-to-fill empty frame slot behaviour and enlarged borderless saved-wizard icon were manually confirmed before merge. Project-save and finalisation lifecycle behaviour is implemented on `main` but still requires disposable-project post-merge validation before further Object Creator feature work.

Historical app-specific handover:

```text
artifex/apps/archetype-object-creator/docs/current-state-v1.35-review.md
```

## Purpose

The Archetype Object Creator defines reusable non-FX game things and their behaviours. It is separate from the Asset Library and from the Scene Editor:

- **Asset Library** owns promoted final media assets and registered generated audio assets.
- **Archetype Object Creator** owns reusable object archetype definitions and their final `asset_` references.
- **Scene Editor** places instances of saved archetypes into scenes.
- **Effect Editor** owns reusable FX definitions, not object archetypes.

The creator should define a game thing once, then reuse it wherever it appears.

Examples:

- Bronze Key
- Locked Door
- Forest Wolf
- Merchant NPC
- Save Marker
- Health Potion

## Canonical Project Storage Contract

The canonical object-archetype files are:

```text
archetypes/object-index.json
archetypes/objects/archobj_<slug>.json
```

Final visual and audio resources referenced by an object archetype must be registered final assets using stable `asset_` IDs. Browser-uploaded draft/preview files are not automatically final project assets.

The intended save model is:

- deliberate connected project-folder save for project-backed object records;
- browser/local storage for draft/recovery only;
- JSON or ZIP download as backup/fallback rather than ordinary save.

V1.36 implements this model on `main` using explicit `authoringStatus` values. In-progress records may carry authoring-only staging metadata; ready records must reference only final registered `asset_` IDs. The actual project-folder save/reopen/finalisation behaviour remains subject to the post-merge validation listed below.

## V1.36 Behaviour Confirmed So Far

Manually checked in the PR #38 preview before merge on 2 June 2026 and now accepted on `main`:

- the Step 5 Action Behaviour area no longer displays overlapping text/controls;
- **Add Frame Event** creates an editable event row;
- **Add Empty Frame Slot** can be filled in place by clicking an empty thumbnail and choosing an image, preserving sequence order;
- the saved-wizard crystal-ball icon is larger and does not carry unwanted circular button chrome.

Still requiring post-merge verification:

- in-progress save, live-preview retention and reopening staged images;
- refused finalisation writing no final asset files;
- successful final promotion/asset registration/top-level visual ID mapping;
- primary single-sheet overwrite refusal;
- Sound Generator stale-target assignment and per-frame correction persistence;
- absence of duplicate Step 5 controls, module-load errors and console errors.

## Module Boundary

Archetype Object Creator owns:

- characters and NPCs;
- enemies and creatures;
- items, keys and pickups;
- props, markers and doors;
- interactable/searchable/throwable/hazard objects;
- reusable object templates;
- object properties, behaviours, action definitions and metadata;
- final asset-ID references used by object behaviour and presentation.

It does not own:

- scene instance placement or scene visual layout;
- Quest or Puzzle internals;
- Project Editor route/flatplan authoring;
- Effect Editor FX archetypes;
- Asset Library file promotion outside its approved finalisation handoff;
- copied procedural-sound recipes.

## Archetype And Instance

An **Archetype** is a reusable definition of a game thing. An **Instance** is a specific placed occurrence of that archetype in a scene.

Example: `archobj_bronze_key` is the reusable Bronze Key archetype. The actual key sitting on a table in a forest hut is a Scene Editor instance that references that archetype.

## Relationship To Scene Editor

Scene Editor places objects visually and should reference saved Object Archetypes by stable object-archetype ID rather than redefining the object each time. Scene Editor integration that consumes object archetype IDs is separate work and must not be faked inside Object Creator.

## Relationship To Quest Builder And Puzzle Creator

Quest Builder and Puzzle Creator may reference stable object IDs where gameplay requires an item, enemy, marker, door or interactable object. They must not duplicate or author the reusable object internals owned by Archetype Object Creator.

## Relationship To Project Editor

Project Editor may reference Object Archetypes when structural route logic or world-level conditions need them, but it should not fully author object definitions.

## Relationship To Procedural Sound Generator

Generated synth sounds are final registered Asset Library resources, not sound archetypes owned by Object Creator.

Expected flow:

```text
Create Synth Sound popup
→ saves recipe under assets/audio/sfx/synth_<slug>.json
→ registers asset_sfx_<slug> in assets/asset-index.json
→ Object Creator stores only that returned asset_ ID in the originating object behaviour/event field
```

V1.36 includes an initiating-target capture fix for this flow. It remains to be verified on merged `main` using the stale-selection browser test.

## Object Categories

Supported/relevant object categories include:

- Character / Person Archetype
- NPC Archetype
- Enemy / Foe Archetype
- Creature / Animal Archetype
- Boss / Bellator Archetype
- Item / Pickup Archetype
- Door / Exit Archetype
- Marker Archetype
- Prop Archetype
- Searchable Cache Archetype
- Throwable Object Archetype
- Hazard Archetype
- Interactable Object Archetype

## Current Implementation Notes

V1.34 attempted to repair Step 5 task persistence and layout regressions by restoring canonical `productionAssets.requirements` / `productionAssets.requirementOrder` storage, initial asset-ID task ordering, clean left-list display and compact two-column behaviour.

V1.36 superseded the provisional V1.35 save flow when PR #38 was merged: Save Browser Draft is recovery only, Save Project (In Progress) writes project-backed in-progress records and stages uploaded frames, and Finish / Mark Object Ready promotes staged media into final registered assets before writing a ready object/index entry. This flow must still be functionally validated in a disposable project folder.

Do not add new patch, overlay, wrapper or MutationObserver installer layers on top of this ownership model.

## Placeholder Assets

A **Placeholder** is a temporary asset, object, scene or setting used until the creator replaces it with final content. Placeholder or browser-preview content must not silently become a permanent final asset reference in a saved object archetype.