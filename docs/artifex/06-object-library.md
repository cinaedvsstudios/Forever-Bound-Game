# Archetype Object Creator / Object Library

## Current Name And Implementation Status

The active authoring module is named **Archetype Object Creator** and lives at:

```text
artifex/apps/archetype-object-creator/
```

The concept may still be described generically as the **Object Library** when referring to the reusable collection of saved object definitions, but implementation work must use the active module name **Archetype Object Creator**.

Current visible app version: `V1.36`
Current status: Step 5 ownership and project-save lifecycle consolidation is implemented for review. V1.36 adds explicit in-progress vs ready object authoring status, staged uploaded-frame saves and final asset promotion on readiness.

Current app-specific handover:

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

- deliberate connected project-folder save for final object records;
- browser/local storage for draft/recovery only;
- JSON or ZIP download as backup/fallback rather than ordinary save.

V1.36 implements this model with explicit `authoringStatus` values. In-progress records may carry authoring-only staging metadata; ready records must reference only final registered `asset_` IDs.

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
- Asset Library file promotion;
- copied procedural-sound recipes.

## Archetype And Instance

An **Archetype** is a reusable definition of a game thing.

An **Instance** is a specific placed occurrence of that archetype in a scene.

Example: `archobj_bronze_key` is the reusable Bronze Key archetype. The actual key sitting on a table in a forest hut is a Scene Editor instance that references that archetype.

## Relationship To Scene Editor

Scene Editor places objects visually and should reference saved Object Archetypes by stable object-archetype ID rather than redefining the object each time.

Example:

- Archetype Object Creator defines `archobj_bronze_key`.
- Scene Editor places an instance of `archobj_bronze_key` in a scene.
- The placed instance may add scene-specific position/state while the reusable definition stays in the object archetype record.

Scene Editor integration that consumes object archetype IDs is separate work and must not be faked inside Object Creator.

## Relationship To Quest Builder And Puzzle Creator

Quest Builder and Puzzle Creator may reference stable object IDs where gameplay requires an item, enemy, marker, door or interactable object.

Examples:

- has item: Bronze Key;
- defeat enemy: Forest Wolf;
- talk to character: Merchant NPC;
- unlock object: Locked Door;
- activate marker: Save Marker.

They must not duplicate or author the reusable object internals owned by Archetype Object Creator.

## Relationship To Project Editor

Project Editor may reference Object Archetypes when structural route logic or world-level conditions need them.

Examples:

- Route requires item: Bronze Key.
- Station contains required character: Merchant NPC.
- Route opens after enemy defeated: Forest Wolf.
- Waypoint activates object: Save Marker.

Project Editor should not fully author object definitions. It references saved archetypes; Object Creator owns their content.

## Relationship To Procedural Sound Generator

Generated synth sounds are final registered Asset Library resources, not sound archetypes owned by Object Creator.

Expected flow:

```text
Create Synth Sound popup
→ saves recipe under assets/audio/sfx/synth_<slug>.json
→ registers asset_sfx_<slug> in assets/asset-index.json
→ Object Creator stores only that returned asset_ ID in the appropriate object behaviour/event field
```

V1.36 keeps the `🎛️` Sound Events hookup and captures the initiating requirement target before opening the shared popup, so the returned `asset_sfx_...` ID is written only to the requesting task.

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

V1.36 supersedes the provisional V1.35 save flow: Save Draft is browser recovery, Save Project writes in-progress project records and stages uploaded frames, and Finish / Mark Object Ready promotes staged media into final registered assets before writing a ready object/index entry. Do not add new patch/overlay/wrapper layers on top of this ownership model.

## Placeholder Assets

A **Placeholder** is a temporary asset, object, scene or setting used until the creator replaces it with final content. Placeholder or browser-preview content must not silently become a permanent final asset reference in a saved object archetype.
