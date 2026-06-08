# Archetype Object Creator Specification

Status: Active module specification draft during documentation consolidation  
Owning module: Archetype Object Creator  
Active route: `artifex/apps/archetype-object-creator/index.html`  
Current verified implementation baseline: `Artifex Archetype Object Creator V1.36`  
Accepted implementation evidence: merged PR #38  
Validation qualification: visible Step 5 repairs were accepted before merge; project-save/finalisation lifecycle remains implemented but requires disposable-project post-merge functional validation before further feature development  
Governing universal contract: `docs/artifex/01A-project-file-contracts.md`  
Subordinate exact starter/index schema reference: `docs/artifex/19A-project-starter-schemas.md`  
Outstanding work source: `docs/artifex/02A-global-to-do.md`

## Purpose

Archetype Object Creator is the Artifex authoring surface for reusable non-FX game object definitions. It defines a game thing once so Scene Editor, Quest Builder, Puzzle Creator and project/runtime systems can refer to that stable archetype wherever it is used.

Object archetypes cover characters, NPCs, enemies, creatures, bosses, items, pickups, doors, exits, props, markers, searchable caches, throwable objects, hazards and interactable objects. An object archetype records gameplay and portrait presentation references, behaviours/actions, collision and interaction properties, runtime flags, defaults and object metadata.

This specification owns permanent information unique to Archetype Object Creator. Universal project-file, connected-folder, registered-asset, branding, save-state and documentation-control rules remain owned by the master contract and any confirmed shared-service specifications.

## Ownership Boundary

Archetype Object Creator owns:

- reusable non-FX Object Archetype records identified by stable `archobj_` IDs;
- object identity, category, role/template, subtype and tags;
- object visual/action reference fields, default size/layer/anchor and runtime presentation metadata;
- gameplay sprite action definitions and dialogue portrait action definitions for an object;
- object collision, hitbox, interaction radius, runtime behaviour flags and object-specific metadata;
- the Object Creator production/checklist data needed to prepare an archetype for completion;
- connected-project object records and Object Creator index entries once saved through the implemented project workflow:

```text
archetypes/object-index.json
archetypes/objects/archobj_<slug>.json
```

- the object-finalisation handoff that stages object-owned uploaded media while in progress and, on explicit successful readiness, promotes/registers the media required by that object so the final archetype stores stable registered `asset_` references.

Archetype Object Creator must not:

- place object instances in scenes or author scene layout owned by Scene Editor;
- author Quest or Puzzle internal progression/content merely because those systems use an object;
- author project-level Flatplan/routes or route gates owned by Project Editor;
- author reusable FX definitions owned by Effect Editor;
- become a general-purpose Asset Library/import module: its permitted final-asset writes are the bounded promotion/registration handoff required to finalise the object currently being authored;
- store copied procedural-sound recipes or create a separate object-owned sound-archetype system;
- treat browser previews, staging paths or browser drafts as final ready-object asset references;
- reintroduce patch/overlay/MutationObserver installer stacking over Step 5 instead of extending permanent named owners.

## Archetype Versus Instance

An **Object Archetype** is the reusable definition of a game thing. An **Object Instance** is a particular occurrence of that reusable thing placed in a scene.

For example, `archobj_bronze_key` defines the reusable Bronze Key and its interaction behaviour. A particular Bronze Key placed on a table in a hut is a Scene Editor instance referencing `archobj_bronze_key`; it is not a second definition written by Object Creator.

## Active Baseline

The live route identifies itself as **Artifex Archetype Object Creator V1.36** and loads `v1/src/editor-app.js` as its entry point. PR #38 established V1.36 as the accepted current runtime and replaced the provisional V1.35 state with Step 5 ownership consolidation plus an `in_progress` / `ready` object lifecycle.

The baseline must distinguish **present in code** from **functionally validated**. The visible Step 5/toolbar repairs were manually accepted before merge. The connected-project save, staged-media reopen and finalisation lifecycle is present in the merged code but remains subject to the disposable-project validation tracked in `02A`.

| Current area | Baseline status | Current implementation fact |
|---|---|---|
| Live modular route | Implemented | `index.html` loads V1.36 styles and `v1/src/editor-app.js`, which initialises the editor, renderer, project storage, template icons, wizard flow, Step 5, Reference panel and asset-package behaviour. |
| Object identity and base controls | Implemented | Live shell exposes ID, name, category, role/template, subtype, tags, visual references, dimensions/layer/anchor and collision/interaction controls. |
| Action/behaviour authoring panels | Implemented | Live shell separates Gameplay Sprite Actions, Dialogue Portrait Actions, Runtime Behaviour Flags and Validation. |
| Quick Start / reusable object library workflow | Implemented | Quick Start Wizard, new archetype, library/open/clone/template actions, import, export backup and browser-draft controls exist. |
| Visible Step 5 repair acceptance | Accepted before merge | Action Behaviour no longer visibly overlaps, Add Frame Event works, empty frame slots can be filled in place without changing order, and the saved-wizard crystal-ball icon presentation was accepted. |
| Browser draft workflow | Implemented | **Save Browser Draft** is present as local recovery behaviour rather than the final project save. |
| Connected project folder controls | Implemented in code; validation still required | Live UI exposes connect folder, save object to project and dynamically added Open Project Object controls with visible project-folder/save-status text. |
| `authoringStatus` lifecycle | Implemented in code; validation still required | Object save/finalisation code recognises `in_progress` and `ready`. |
| In-progress media staging | Implemented in code; validation still required | Save Project stages uploaded frames under `intake/objects/<archobj_id>/...`, strips project-record `dataUrl` payloads and intends to retain active-session previews. |
| Reopen staged object media | Implemented in code; validation still required | Open Project Object reads object records and hydrates staged image bytes back into visible editor previews. |
| Finish / Mark Object Ready finalisation | Implemented in code; validation still required | Finalisation plans frame promotion, validates readiness before normal final writes, writes registered assets/index entries, writes ready object/index entries and maps primary visual asset IDs. |
| Primary asset overwrite prevention | Implemented in code; validation still required | Gameplay Sprite and Dialogue Portrait primary requirements reject multiple images before fixed-path final output. |
| Frame-correction ownership | Implemented in code; validation still required | Save handling normalises per-frame `frameCorrections` and migrates legacy requirement-level correction data. |
| Sound event target capture | Implemented in merged scope; validation still required | Initiating-target assignment must still be tested with selection changed before sound return. |
| Real external-reference listing | Not complete | Reference panel exists, but real scene/quest/reference results depend on shared project-reference infrastructure. |

## Current Implemented Interfaces

### Object authoring model

The current Object Creator supports object data including:

```text
id / name / category / role / subtype / tags
visual.spriteAssetId / visual.portraitAssetId
visual default dimensions, layer and anchor
collision / hitbox / interaction values
runtime flags and object behaviours
gameplay actions and portrait actions
productionAssets.requirements
productionAssets.requirementOrder
authoringStatus
```

The live baseline distinguishes two presentation/action systems:

```text
Gameplay Sprite Actions   = full-body actions used in scenes/gameplay
Dialogue Portrait Actions = close-up expression and mouth-loop portrait presentation
```

Dialogue/talking is not treated as a tiny full-body gameplay sprite action. A visible full-body dialogue moment uses an appropriate gameplay action such as gesture, give item, receive item or interact/assist; close-up speaking loops belong to Dialogue Portrait Actions.

### Object save and lifecycle contract

V1.36 defines this authoring lifecycle:

| Control/state | Object Creator meaning |
|---|---|
| **Save Browser Draft** | Local recovery only; it does not create ready project content or final registered assets. |
| **Save Project / Save Object to Project** with `authoringStatus: "in_progress"` | Writes the working object record/index entry to the connected project and may stage uploaded frame media under `intake/objects/<archobj_id>/...`. It does not declare the object finished. |
| **Finish / Mark Object Ready** with `authoringStatus: "ready"` | After successful validation, promotes required object media into final media locations, registers resulting `asset_` records and writes the final ready object/index entry. |
| **Mark Task Ready** | Marks the selected production requirement only; it does not save or finalise the complete object by itself. |

A ready object must use stable registered final `asset_` references for required final media. It must not depend on browser-only `dataUrl` payloads, `previewOnly` fields, `draftSourceName` values or `intake/` staging paths.

### Connected-project paths and service dependencies

Object Creator's owned final project records are:

```text
archetypes/object-index.json
archetypes/objects/archobj_<slug>.json
```

Its V1.36 authoring/finalisation workflow also depends on these bounded external locations:

```text
intake/objects/<archobj_id>/...   staged uploaded object media while in progress
assets/asset-index.json           registration of final promoted media during readiness
assets/...                        final media files referenced by registered asset_ IDs
```

The live implementation loads the shared project-folder client and the registered-content reader. It validates the expected object-index and asset-index shapes before object/index or final asset registration operations. Object Creator may perform these final-asset writes only as the explicit finalisation handoff for the object being authored; broader asset intake, browsing and ownership remain Asset Library responsibilities.

### Finalisation safety contract

The current code expresses the following required readiness behaviour:

- normal readiness refusal must be detected before ordinary final media writes;
- final Gameplay Sprite and Dialogue Portrait references map back to the object's top-level visual asset-ID fields;
- primary Gameplay Sprite and Dialogue Portrait tasks accept only one primary image/sprite sheet each for their fixed final output path;
- ready requirements and final visual fields must reference assets registered in `assets/asset-index.json`;
- sound-event fields in a ready object must reference registered final assets;
- per-frame corrections are canonicalised as `frameCorrections` rather than maintained through parallel active correction paths.

This safety contract is implemented in V1.36 code but remains to be proven through the post-merge functional validation listed in `02A`.

## Module-Specific Fixed Contracts and Dependencies

### Object categories and reusable roles

The module covers reusable definitions for:

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

### Scene Editor relationship

Scene Editor places visual instances that reference saved `archobj_` definitions. Object Creator defines the reusable object and its expected visual/behaviour metadata; it does not place that object into a specific scene or duplicate scene layout records.

### Quest Builder and Puzzle Creator relationship

Quest Builder and Puzzle Creator may refer to stable object archetype IDs for required items, NPCs, enemies, markers, hazards, doors or interactions. They do not redefine object behaviours or visuals that belong to the reusable Object Archetype.

### Project Editor relationship

Project Editor may inspect/reference stable object outputs where project-level structure or route conditions require them. It does not edit Object Creator's archetype internals.

### Effect Editor relationship

Effect Editor owns reusable effect archetypes. Object Creator may later reference registered effect outputs where an object's behaviour needs them; it does not author those reusable effects.

### Audio and Sound Library relationship

Object Creator stores registered `asset_` IDs for object sounds or action-linked cues. A shared Sound Generator/Sound Library may create or return a registered final audio asset, but Object Creator must not copy procedural sound recipes into object records or create `archsound_` records/folders.

V1.36 contains the initiating-target capture behaviour for a sound assignment opened from an object production task. That behaviour remains unaccepted as functionally complete until the stale-selection test in `2A` has passed.

### Reference panel dependency

The Object Creator Reference panel may show where a reusable object is used only when backed by real shared project-reference data. It must not present placeholder/demo links as actual Scene, Quest or Puzzle usage. The shared reference-index work remains an external dependency recorded in `2A`.

## Current Compatibility and Transition Notes

`docs/artifex/06-object-library.md` and `artifex/apps/archetype-object-creator/README.md` contain useful current V1.36 purpose, boundary and lifecycle facts, but they overlap as active module descriptions. Their enduring Object Creator-specific rules are consolidated into this specification.

`artifex/apps/archetype-object-creator/docs/todo.md` currently duplicates active task ownership; all still-live Object Creator work is represented in `02A` so this app-specific task file can later become archive evidence rather than a competing backlog.

`artifex/apps/archetype-object-creator/docs/current-state-v1.35-review.md` is historical evidence of the V1.35 problems and the V1.36 follow-up, not the current module specification. `APPLY_INSTRUCTIONS.txt` is older wizard history and must not be treated as a current implementation guide.

PR #38 consolidated touched Step 5 ownership into named implementation owners after earlier layering problems. No future work should add another patch, rescue, compatibility-overlay or MutationObserver installer module over Step 5. A later split of the large `editor-ui.js` owner is implementation work only after lifecycle validation passes and must not be combined with repairing a failed validation result.

## Remaining Work

All current and future Archetype Object Creator tasks are owned by `docs/artifex/02A-global-to-do.md`. This specification must not accumulate task checklists.
