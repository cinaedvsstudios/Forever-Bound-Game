# Archetype Object Creator

## Purpose

The Archetype Object Creator is the Artifex authoring module for reusable non-FX Object Archetypes: characters, animals, NPCs, enemies, props, doors, pickups, markers, searchable caches, throwable objects, hazards and interactable objects.

It is not the Asset Library. The Asset Library owns promoted/final media assets and registered generated audio resources. Object Creator links those final `asset_` resources into reusable gameplay definitions with animation sets, behaviours, tags, defaults, collision boxes, interaction zones and runtime meaning.

It is not the Effect Editor. Effect Editor owns reusable FX definitions; Object Creator owns reusable non-FX object definitions.

## Current Implementation Status

Current visible build: `V1.36`
Status: **approved implementation of Step 5 ownership and project-save lifecycle consolidation.**

V1.36 supersedes the provisional V1.35 runtime behaviour while preserving the V1.35 handover as a historical record:

```text
artifex/apps/archetype-object-creator/docs/current-state-v1.35-review.md
```

The active lifecycle is now browser recovery draft → in-progress project save → explicit `Finish / Mark Object Ready` finalisation.

## Required Contracts Before Editing

Read these before making changes:

```text
docs/artifex/18-color-and-display-rules.md
docs/artifex/19-project-file-contracts.md
docs/artifex/19a-project-starter-file-schemas.md
docs/artifex/20-asset-intake-workflow.md
docs/artifex/22-sound-archetype-generator.md
artifex/shared/todo-guide/README.md
artifex/apps/archetype-object-creator/docs/todo.md
artifex/apps/archetype-object-creator/docs/current-state-v1.35-review.md
```

## Current App Files

```text
artifex/apps/archetype-object-creator/index.html
artifex/apps/archetype-object-creator/v1/styles.css
artifex/apps/archetype-object-creator/v1/right-panel-layout.css
artifex/apps/archetype-object-creator/v1/object-wizard.css
artifex/apps/archetype-object-creator/v1/src/
```

Current active entry point:

```text
artifex/apps/archetype-object-creator/v1/src/editor-app.js
```

The active entry point currently initialises the base editor, project-folder storage, template icons, wizard flow, Step 5 behaviour binding, Reference panel styles and asset-package/ZIP behaviour. Step 5 layout and Frame Fix are now rendered by the checklist/frame-task owners rather than observer-installed modules.


## V1.36 Authoring Lifecycle

Object records carry `authoringStatus`:

- `in_progress` — normal working state for new objects, browser drafts, JSON imports without status, and any object that still has uploaded/staged/unregistered frame work.
- `ready` — finalised state written only by **Finish / Mark Object Ready** after validation, staged media promotion and `assets/asset-index.json` registration.

Save meanings:

| Control | Meaning |
|---|---|
| Save Browser Draft | Browser recovery only. Preserves local draft data and does not write project files or final assets. |
| Save Project (In Progress) | Writes `archetypes/objects/archobj_<slug>.json`, updates `archetypes/object-index.json`, stages uploaded frames under `intake/objects/<archobj_id>/...`, and keeps `authoringStatus: "in_progress"`. |
| Finish / Mark Object Ready | Validates required object media, promotes staged frames into `assets/objects/...`, registers final `asset_` records in `assets/asset-index.json`, strips preview/staging dependencies, and writes object/index entries with `authoringStatus: "ready"`. |
| Mark Task Ready | Marks only the selected Step 5 requirement; it cannot save/finalise the whole object. |

A ready object must not depend on `dataUrl`, `previewOnly`, `draftSourceName`, `intake/` staging paths, blank required asset IDs or unregistered media IDs.

## Canonical Data Ownership And Save Paths

The canonical contract is now:

```text
Object archetype file: archetypes/objects/archobj_<slug>.json
Object index:          archetypes/object-index.json
Final media/audio:     referenced by registered asset_ IDs only
```

Object Creator owns:

- reusable non-FX object archetypes;
- referenced final asset IDs for object visual/action/audio behaviour;
- its object-index entry when saving in-progress or ready object records.

Object Creator must not own:

- scene instances or scene layout;
- Quest or Puzzle internals;
- FX definitions;
- copied procedural sound recipes;
- permanent references to unpromoted browser preview/source files.

The intended workflow from the central contract is:

- connected project-folder save is the normal final save route once verified;
- browser/local storage is draft and recovery only;
- JSON/ZIP downloads are backup/fallback only.

## Core Rule: Dialogue Is Not A Gameplay Sprite Action

Talk is not a gameplay sprite action.

Dialogue/talking is handled by a separate close-up Dialogue Portrait system. Gameplay sprite sheets use full-body gameplay actions such as idle, walk, turn, pick up, hold, throw, use item, sing/cast, take damage, death, enter door or exit door.

A visible full-body dialogue moment should use gameplay actions such as gesture, give item, receive item or interact/assist, not a tiny body-sprite mouth-loop action.

## Object Archetype Types

```text
Character / Person
NPC
Enemy / Foe
Creature / Animal
Boss / Bellator
Prop
Door / Exit
Pickup
Marker / Stone Marker
Interactable Object
Searchable Cache
Throwable Object
Hazard
```

## Gameplay Sprite Archetype Categories

```text
Static Background Person
Basic NPC
Moving NPC
Vendor / Job NPC
Major NPC / Companion
Player / Mel-Type
Human Foe / Guard / Bandit
Possessed NPC / Thrall
Caster / Ritualist
Creature Foe
Boss / Bellator
Static Prop
Door / Exit
Pickup Item
Searchable Cache
Throwable Object
Stone Marker / Map Marker
Hazard
```

## Gameplay Sprite Actions

Gameplay sprite actions are full-body actions used in scenes, travel, battle and interaction.

```text
idle
turn / face direction
walk
patrol / walk
move
jump
crouch / hide
pick up
hold / carry
throw
use item
gesture
give item
receive item
interact / assist
sing / magic cast
cast / ritual
channel
attack
special attack
take damage
stunned
phase change
death / disappear
enter door
exit door
open
close
locked
collect
searched / opened
activate
trigger
reset
land / break
possession overlay
```

## Dialogue Portrait Actions

Dialogue portraits are separate close-up animation sets.

```text
neutral
mouth loop
blink
happy
angry
worried
shocked
sad
green eye overlay
custom expression
```

## Object Data Fields

An Object Archetype may define:

```text
schema version
archobj_ ID
name
category
role/template
subtype
tags
linked gameplay sprite asset ID
linked dialogue portrait asset ID
default width and height
default scene layer
anchor point
collision type
hitbox
interaction radius
runtime behaviour flags
gameplay sprite actions
portrait actions
placement defaults
productionAssets requirements and requirementOrder
export target / export paths
notes
```

## Implemented V1.34 Work Requiring Verification

V1.34 attempted the Step 5 regression repair and compact layout pass:

- Step 5 task state stores under `productionAssets.requirements[requirementId]`.
- Task order stores under `productionAssets.requirementOrder`.
- The first new-checklist tasks are `Gameplay Sprite Asset ID` and `Dialogue Portrait Asset ID`.
- The returned instruction line was removed.
- Left-list task labels and metadata were separated visually.
- Desktop Step 5 overflow/clipping was reduced.
- Frame Fix was retained with its two-column correction layout.

This requires persistence and browser verification before being regarded as safe.

## Provisional V1.35 Work Requiring Audit

V1.35 currently includes code for:

- equal-size Step 5 lower buttons and a `Backup ZIP` label;
- a renamed `Mark Task Ready` task-level checkbox;
- File menu project-folder actions;
- Step 5 `Save Draft`, `Save Project` and `Finish` controls;
- a new active `object-project-storage.js` module intended to write the canonical object file and update `archetypes/object-index.json`;
- a `🎛️` Sound Events control intended to open the shared Procedural Sound Generator and assign a registered `asset_sfx_...` ID.

These changes are **not accepted as complete**. The frame-upload/project-save handling is particularly provisional: current code removes browser image data from the project-save object and adds preview/draft handling fields. That must be audited against the approved Asset Library/promotion workflow before it becomes a settled data contract.

## Relationship To Other Modules

```text
Asset Library = owns promoted final assets and registered generated audio assets.
Archetype Object Creator = owns reusable non-FX Object Archetypes.
Scene Editor = places Object Instances that reference archetype IDs.
Quest Builder / Puzzle Creator = reference stable object IDs where needed; do not author object internals.
Effect Editor = owns reusable FX Archetypes, not Object Archetypes.
Shared Procedural Sound Generator = creates/registers synth audio assets; callers store asset_ IDs only.
Build Game / Health Guide = validate and package references; they do not author Object Creator data.
```

## Do Not Add More Patch Layers

The current V1.35 work already leaves Step 5 assembled across multiple modules. Before adding any feature or repair:

- do not add another overlay, patch or wrapper file;
- audit the active module ownership first;
- decide which existing owner should render/layout/save the relevant behaviour;
- integrate cleanly in that owner or revert the provisional change;
- do not report completion until syntax and browser/project-folder testing has actually passed.

## Verification Required Next

Before further feature work, verify:

- Step 5 readiness, frame and order persistence through task switches and saved-session resume;
- no desktop overflow or Frame Fix regression;
- project-folder save using only a disposable starter project;
- no unrelated object-index entries are lost on save;
- correct handling of uploaded preview frames and final registered Asset IDs;
- Sound Generator opening, recipe/index registration and ID assignment in a disposable project;
- console/network absence of failed or retired module requests.

## Historical/Stale Material

`APPLY_INSTRUCTIONS.txt` records older wizard history only. It is no longer a current implementation/install guide and must not be followed as if it describes V1.35.
