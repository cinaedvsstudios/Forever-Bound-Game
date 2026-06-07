# Puzzle Creator Specification

Status: Active module specification during documentation consolidation  
Owning module: Puzzle Creator  
Active route: `artifex/apps/puzzle-creator/index.html`  
Current verified implementation baseline: `Artifex Puzzle Creator V1.35` on current `main`  
Accepted implementation evidence: merged PR #48 / merge `f707beb781a63165da29e145f5b8c4deeeada6ec`  
Protected workstream note: Puzzle Creator has been active recently; do not overwrite its current truth from older V1.34 documentation or open status-refresh PRs  
Governing universal contract: `docs/artifex/1A-project-file-contracts.md`  
Related module specification: `docs/artifex/7A-quest-builder.md`  
Related shared-service specifications: `docs/artifex/13A-registered-content-service-picker.md`, `docs/artifex/10A-asset-library.md`, `docs/artifex/11A-shared-connected-project-folder-service.md`  
Outstanding work source: `docs/artifex/2A-global-to-do.md`

## Purpose

Puzzle Creator is the Artifex authoring module for self-contained playable challenges.

A puzzle is a contained interactive challenge with its own internal rules, layout, feedback and completion logic. A completed puzzle may later be referenced by Quest Builder as one meaningful Quest flow step, but Quest Builder must not absorb or duplicate the puzzle's internal authored mechanics.

Puzzle Creator owns how the challenge works. Quest Builder owns why the challenge happens in a Quest and what story/progression outcomes follow.

## Ownership Boundary

Puzzle Creator owns:

- puzzle definition and internal playable configuration;
- puzzle-engine type and engine-specific settings;
- puzzle layout, cells, pieces, features, start/exit, internal doors, local portals, hazards, collectibles and local transfer rules where supported by the selected engine;
- puzzle-local feedback required during the challenge;
- puzzle-local completion rules and internal evaluation;
- final referenced assets, archetypes, effects and audio IDs used inside the puzzle;
- canonical puzzle index/content-file registration once connected-project saving is implemented.

Puzzle Creator must not own:

- whole Quest chains, Calling flow, Quest rewards or Quest-level dialogue;
- Quest-level Capra narration around the puzzle unless it is purely immediate internal puzzle feedback;
- Project Editor route/Flatplan structure;
- reusable object or effect definitions owned by their authoring modules;
- final media ownership or Asset Library promotion except through approved registered references;
- copied media files, raw intake files, procedural audio recipes or browser-only uploads as permanent puzzle content;
- general runtime/build packaging.

## Canonical Future Project Files

When connected-project saving is implemented, Puzzle Creator must save and register puzzle content under:

```text
puzzles/puzzle-index.json
puzzles/puzzle_<slug>.json
```

The canonical empty puzzle index shape is:

```json
{
  "schemaVersion": "artifex.puzzles.index.v1",
  "projectId": "project_forever_bound",
  "puzzles": []
}
```

Quest Builder should select a stable `puzzle_` ID from `puzzles/puzzle-index.json`. It must not copy a puzzle's grid, symbol board, internal feature list, rule set or full JSON into a Quest block.

## Active Baseline

The current live route identifies itself as:

```text
Artifex Puzzle Creator V1.35
```

V1.35 was introduced by merged PR #48. It changed the launcher/content layer by replacing the generic engine names with the recovered Forever Bound module names, while preserving the accepted Labyrinth Maze workflow.

The six current launcher modules are:

| User-facing module | Underlying engine ID / label | Current status |
|---|---|---|
| Labyrinth Maze | `maze-labyrinth` / Maze-Labyrinth | Current implemented playable authoring workflow |
| Boxing Ring | `arena-trial` / Arena Trial | Planning placeholder, not completed gameplay engine |
| Flying Practice | `obstacle-course` / Obstacle Course | Planning placeholder, not completed gameplay engine |
| Pattern Lock Puzzle | `symbol-assembly` / Symbol Assembly | Planning placeholder, not completed gameplay engine |
| Potion Match | `item-order-puzzle` / Item Order Puzzle | Planning placeholder, not completed gameplay engine |
| Underworld Black Oil | `hazard-puzzle` / Hazard Puzzle | Planning placeholder, not completed gameplay engine |

This distinction is protected. The launcher may surface all six choices, but only Labyrinth Maze is currently the accepted playable workflow. The other pages are readable planning placeholders and must not be described as finished editors.

## Current Implemented Labyrinth Maze Baseline

Labyrinth Maze is the current developed workflow.

Current implemented Maze behaviour includes:

- puzzle-type launcher that can open Labyrinth Maze;
- labelled workflow rail: Setup, Display, Logic and Colors;
- retained accepted Maze authoring behaviour from earlier V1.33/V1.34 work;
- random/blank/reference/import setup actions;
- maze size, shape, warp, stretch, edge style, wall height and block-spacing controls;
- 2D overview, diorama/playable preview and Walk Test where supported;
- Game Logic fields such as Puzzle Type, Integration Context, Difficulty, Completion Flag and Calling Text;
- JSON import/export/download workflow;
- local Door and Portal transfer behaviour in Walk Test where already implemented;
- registered-content linking where implemented for Collect objects, Door visuals and Scatter visual references;
- Surface + Edit workflow where Walls, Scatter and Colours remain distinct;
- Scatter marker authoring as decoration-only, not objective/collision/completion logic.

The Maze workflow must remain stable while additional engines or connected saving are added.

## Current Implemented Registered-Content Links

Puzzle Creator already uses the shared registered-content reader/picker in some Maze workflows.

Implemented retained linking behaviour includes:

- Collect rows can link to valid registered `archobj_` Archetype Object records.
- A selected Door can store a registered final `asset_` visual reference as `visualAssetId`, `visualAssetLabel` and `visualAssetReferenceSource`.
- Scatter decoration/light slots can optionally link to registered final `asset_` records.
- The shared picker must reject intake files, browser-only paths, external URLs, legacy unpromoted catalogue paths and invalid IDs.

These links are stored/exported references. Not every selected visual is rendered in the playable preview yet.

## Current Planning Placeholder Modules

### Boxing Ring / Arena Trial

The current Boxing Ring page describes a future contained combat-training puzzle using Battle Mode rules, opponent selection, loadout selection, modest rewards, cooldowns, reset-on-loss behaviour and unlockable opponent tiers.

It is planning content only. It is not a completed battle/training engine.

### Flying Practice / Obstacle Course

The current Flying Practice page describes a future aerial route course with route markers, obstacles, collectibles, scoring and tiered results.

It is planning content only. It is not a completed flying engine.

### Pattern Lock Puzzle / Symbol Assembly

The current Pattern Lock page describes a future rune, seal, mosaic, lock or ritual diagram puzzle using pieces, slots, optional rotation, validation and completion effects.

It is planning content only. It is not a completed symbol-assembly engine.

### Potion Match / Item Order Puzzle

The current Potion Match page describes a future ordered ingredient/item selection puzzle with sequence length, item pool, transform speed, wrong-pick rule and reward/quality logic.

It is planning content only. It is not a completed potion-matching engine.

### Underworld Black Oil / Hazard Puzzle

The current Underworld Black Oil page describes a future living hazard puzzle with spreading/pulsing danger, source count, spread rate, safe path width, cleansing tools, survival/escape/containment modes and win/loss state.

It is planning content only. It is not a completed hazard engine.

## Puzzle Creator to Quest Builder Handoff

Puzzle Creator and Quest Builder are related but separate.

Puzzle Creator determines whether its own challenge is complete. Quest Builder consumes a public puzzle completion result and authors Quest-level outcomes around it.

A future Quest Builder `Puzzle` block should use:

```text
puzzleId
```

Example future relationship:

```text
Puzzle Creator
  saves puzzle_chalice_pedestal

Quest Builder
  flow block: Solve the Chalice Pedestal
  puzzleId: puzzle_chalice_pedestal
  on complete: set flag_chalice_pedestal_solved, trigger dialogue, grant item, continue Quest
```

Puzzle Creator owns the contained challenge. Quest Builder owns prerequisites, dialogue, rewards, flags, Capra feedback and branch outcomes around that challenge.

Project Editor may consume public Quest or puzzle completion results only where needed for wider route/Flatplan structure.

## Internal Puzzle Rules Versus Quest Outcomes

Puzzle-local completion checks belong to Puzzle Creator.

Examples:

```text
exit reached
required collect found
correct symbol sequence entered
correct item order completed
hazard survived
```

Quest-level outcomes belong to Quest Builder.

Examples:

```text
set flag_chalice_pedestal_solved
trigger dialogue
grant item
continue to next Quest block
show Capra story feedback
unlock Quest reward
```

A puzzle's internal completion rule should not become a collection of free-text rules inside a Quest block.

## Asset, Object, Effect and Audio Reference Rules

Puzzle Creator may reference stable final records such as:

```text
asset_       final images, icons, sounds, generated audio or other media
archobj_     reusable object archetypes where supported
archeffect_  reusable effect archetypes where supported
```

Puzzle Creator must not:

- store final links to `intake/`;
- store final links to `artifex/assets-library/` legacy catalogue paths;
- store data URLs, blob URLs or absolute local paths as permanent puzzle references;
- create `archsound_` records or a separate sound-archetype index;
- copy generated sound recipes into puzzle files.

Sound and audio feedback must resolve to registered `asset_` IDs once Sound Library / Asset Library support exists.

## Scatter and Decoration Rules

Scatter is decoration-only.

Scatter may define authored decorative markers, visual slots and placeholder positions. It does not define objectives, collision, route logic, transfers or completion conditions.

Scatter marker positions may exist without linked final art. Placeholder-first authoring is valid. Optional visuals must later resolve to registered final `asset_` records.

The planned Secondary Light Set is a second decorative-light layer only. It depends on existing primary light positions and should fill underlit corridor areas while avoiding the primary light set, start, exit, Collect objects, Door endpoints and Portal endpoints.

## Door, Portal, Traboule, Foe and Hazard Boundaries

Doors currently own local transfer/movement behaviour through Maze connection logic. Door visuals may reference registered `asset_` IDs, but selected Door artwork is not fully rendered in playable preview yet.

Local Portals currently exist as interim transfer behaviour. Global/shared Portal Registry integration is future cross-module work and must involve Scene Editor, Project Editor, Quest Builder, Health/Build and the portal endpoint design.

Traboule remains a planned hidden pass-through wall behaviour until implemented.

Foe and Hazard placement/setup/runtime behaviour remain disabled or unimplemented unless real behaviour is added and browser-tested.

Underworld Black Oil is a separate future hazard-puzzle engine page, not evidence that generic Maze Hazard runtime behaviour exists.

## Current Gaps

Known gaps include:

- canonical connected-project puzzle saving is not implemented;
- `puzzles/puzzle-index.json` and `puzzles/puzzle_<slug>.json` writing is not implemented;
- Quest Builder `Puzzle` block and `puzzleId` selector are not implemented;
- other launcher modules are planning placeholders, not completed engines;
- Secondary Light Set / coverage-fill placement is not implemented;
- selected Door images are not yet rendered in playable preview;
- linked Scatter asset images and real light effects are not yet rendered in playable preview;
- Portal registered visual/effect selection and global Portal Registry integration are not implemented;
- Completion Rule enforcement during Walk Test/game runtime is not complete;
- Foe, Hazard and Traboule runtime behaviour is not implemented;
- Tunnel Mode, real first-person/3D renderer and helper pendant/crystal are not implemented;
- registered sound-feedback selection depends on the accepted Sound Library / Asset Library foundation.

## Source Classification

`artifex/apps/puzzle-creator/index.html` is the current route and visible V1.35 baseline evidence.

`artifex/apps/puzzle-creator/README.md` contains valid permanent purpose, ownership and handoff material, but its current-state section still describes V1.34 and is superseded by the V1.35 route/PR evidence. Its enduring boundary rules are consolidated into this specification.

`docs/artifex/07b-puzzle-creator-quest-integration.md` contains valid Puzzle Creator / Quest Builder handoff rules and is consolidated into this specification and `7A`.

`artifex/shared/todo-guide/puzzle-creator-maze-labyrinth-update-steps.md` contains useful Maze baseline and outstanding Maze task evidence. It is not a permanent module specification.

`artifex/apps/puzzle-creator/src/js/puzzle-module-briefs.js` is current implementation evidence for the V1.35 user-facing launcher modules and placeholder planning content.

`artifex/apps/puzzle-creator/src/js/engines/*.js` is current implementation evidence for registered engine IDs, module type labels, default module IDs, purpose text and planning fields.

Open PR #44 is a V1.34 documentation refresh and must not be merged as a parallel current-status authority after V1.35. Any still-useful V1.34 boundary content is already represented here.

Merged PR #48 is the current V1.35 implementation baseline for the recovered module planning pages.

## Required Future Work

The active backlog, not this specification, owns implementation tasks. The main known Puzzle Creator work is:

- implement canonical connected-project puzzle save/index registration;
- define and validate final puzzle record schema and stable public puzzle results;
- coordinate Quest Builder `Puzzle` block and `puzzleId` selection after saved puzzle records exist;
- implement Secondary Light Set / coverage-fill if it remains the next approved Maze scope;
- render linked Door visuals and Scatter visual/light assets in playable preview;
- implement Portal registered visual/effect selection and global endpoint registry integration;
- implement Traboule, Foe, Hazard, Tunnel Mode, first-person/3D and helper pendant/crystal only through scoped versioned passes;
- build each non-Maze puzzle engine separately and do not present placeholders as completed engines;
- add registered sound feedback selection only after Sound Library / Asset Library foundation is accepted.

## Remaining Work

All current and future Puzzle Creator work belongs in `docs/artifex/2A-global-to-do.md`. This specification must not become a task list.
