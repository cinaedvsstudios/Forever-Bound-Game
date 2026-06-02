# Archetype Object Creator

## Purpose

The Archetype Object Creator is the Artifex authoring module for reusable non-FX Object Archetypes: characters, animals, NPCs, enemies, props, doors, pickups, markers, searchable caches, throwable objects, hazards and interactable objects.

It is not the Asset Library. The Asset Library owns promoted/final media assets and registered generated audio resources. Object Creator links final `asset_` resources into reusable gameplay definitions with animation sets, behaviours, tags, defaults, collision boxes, interaction zones and runtime meaning.

It is not the Effect Editor. Effect Editor owns reusable FX definitions; Object Creator owns reusable non-FX object definitions.

## Current Implementation Status

Current `main` implementation: `V1.36`, merged from PR #38 on 2 June 2026 at merge commit `ef4f37ebe5850c6367db59e57c01e2bb89949384`.

V1.36 implements **Archetype Object Creator V1.36 — Step 5 ownership, staged-frame saves and ready/promotion lifecycle**.

Validation status: **the visible Step 5/toolbar fixes listed below were manually confirmed; project-save/finalisation lifecycle validation remains required on current `main` using a disposable project folder.**

V1.36 supersedes the provisional V1.35 runtime while preserving the V1.35 review as a historical record:

```text
artifex/apps/archetype-object-creator/docs/current-state-v1.35-review.md
```

The V1.36 lifecycle is browser recovery draft → in-progress project save → explicit `Finish / Mark Object Ready` finalisation.

### Manually confirmed during PR #38 acceptance — 2 June 2026

The following visible Step 5/toolbar repairs were checked by the creator in the PR preview before merge and accepted into `main`:

- Step 5 right-hand Action Behaviour layout no longer overlays text and fields.
- **Add Frame Event** visibly creates an editable frame-event row.
- **Add Empty Frame Slot** may be filled in place by clicking the empty thumbnail and choosing an image; the slot order is retained.
- The saved-wizard crystal-ball icon is enlarged and displayed without the circular button chrome.

These confirmed UI interactions do **not** validate the project-save or finalisation lifecycle.

### Post-merge validation still required

Test only in a disposable starter-project folder:

- **Save Project (In Progress)** writes staging references without browser `dataUrl` fields in the project record, while the open wizard retains visible/editable uploaded images.
- **File → Open Project Object** reopens an in-progress object and restores staged frame previews for continued Step 5 work.
- An invalid **Finish / Mark Object Ready** attempt writes no final asset media or ready records.
- A valid finalisation promotes/registers assets and maps final gameplay/portrait IDs into the top-level visual fields.
- Multiple images in a single primary Gameplay Sprite or Dialogue Portrait sheet task are refused before any overwriting final write.
- Sound Generator assignment continues to target the initiating requirement even after selection changes.
- Per-frame correction values remain canonical and independent between actions/frames.
- No duplicate Step 5 controls, console errors or module-load errors are present.

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

Active entry point:

```text
artifex/apps/archetype-object-creator/v1/src/editor-app.js
```

In current-main V1.36, the entry point initialises the base editor, project-folder storage, template icons, wizard flow, Step 5 behaviour binding, Reference panel styles and asset-package/ZIP behaviour. Step 5 layout and Frame Fix are rendered/bound through the checklist/frame-task ownership rather than the retired active layout/frame-correction installer imports.

## V1.36 Authoring Lifecycle — On Main, Pending Functional Validation

Object records and matching index entries may carry `authoringStatus`:

- `in_progress` — normal working state for new objects, browser drafts, JSON imports without status and any object still holding uploaded/staged/unregistered frame work.
- `ready` — finalised state written only by **Finish / Mark Object Ready** after validation, staged-media promotion and `assets/asset-index.json` registration.

Save meanings in current-main V1.36:

| Control | Intended meaning |
|---|---|
| Save Browser Draft | Browser recovery only. Preserves local draft data and does not write project files or final assets. |
| Save Project (In Progress) | Writes `archetypes/objects/archobj_<slug>.json`, updates `archetypes/object-index.json`, stages uploaded frames under `intake/objects/<archobj_id>/...`, and retains `authoringStatus: "in_progress"`. |
| Finish / Mark Object Ready | Validates required object media, promotes staged frames into final `assets/...` locations, registers final `asset_` records in `assets/asset-index.json`, strips preview/staging runtime dependencies and writes object/index entries with `authoringStatus: "ready"`. |
| Mark Task Ready | Marks only the selected Step 5 requirement; it cannot save/finalise the whole object. |

A ready object must not depend on `dataUrl`, `previewOnly`, `draftSourceName`, `intake/` staging paths, blank required asset IDs or unregistered media IDs.

## Canonical Data Ownership And Save Paths

```text
Object archetype file: archetypes/objects/archobj_<slug>.json
Object index:          archetypes/object-index.json
Authoring staging:     intake/objects/<archobj_id>/...
Final media/audio:     referenced by registered asset_ IDs only
```

Object Creator owns reusable non-FX object archetypes, referenced final asset IDs for object visual/action/audio behaviour, and its object-index entry when saving object records.

Object Creator does not own scene instances or scene layout, Quest/Puzzle internals, FX definitions, copied procedural sound recipes or permanent runtime references to unpromoted browser/staging files.

## Core Rule: Dialogue Is Not A Gameplay Sprite Action

Talk is not a gameplay sprite action. Dialogue/talking is handled by a separate close-up Dialogue Portrait system. Gameplay sprite sheets use full-body gameplay actions such as idle, walk, turn, pick up, hold, throw, use item, sing/cast, take damage, death, enter door or exit door.

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

## Gameplay Sprite Actions

Gameplay sprite actions are full-body actions used in scenes, travel, battle and interaction:

```text
idle; turn / face direction; walk; patrol / walk; move; jump; crouch / hide
pick up; hold / carry; throw; use item; gesture; give item; receive item
interact / assist; sing / magic cast; cast / ritual; channel; attack
special attack; take damage; stunned; phase change; death / disappear
enter door; exit door; open; close; locked; collect; searched / opened
activate; trigger; reset; land / break; possession overlay
```

## Dialogue Portrait Actions

```text
neutral; mouth loop; blink; happy; angry; worried; shocked; sad
green eye overlay; custom expression
```

## Object Data Fields

An Object Archetype may define schema version, `archobj_` ID, name, category, role/template, subtype, tags, linked gameplay sprite/portrait asset IDs, default dimensions/layer/anchor, collision/hitbox/interaction properties, runtime flags, gameplay/portrait actions, placement defaults, `productionAssets.requirements`, `productionAssets.requirementOrder`, export paths and notes.

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

## Ownership And Patch-Layer Rule

V1.35 exposed Step 5 ownership problems because several modules modified the final panel after render. PR #38 consolidated the touched ownership into existing named modules rather than introducing another overlay/patch file. Do not add a new patch, rescue, helper-overlay or MutationObserver installer to extend Step 5.

Before further feature implementation, complete the remaining V1.36 post-merge disposable-project tests and record any failed behaviour precisely.

## Historical/Stale Material

`APPLY_INSTRUCTIONS.txt` records older wizard history only. It is no longer a current implementation/install guide and must not be followed as if it describes the active runtime.