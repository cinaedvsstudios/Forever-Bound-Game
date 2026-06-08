# Runtime Engine / Playtest Specification

Status: Active module/service specification during documentation consolidation  
Owning module/service: Runtime Engine / Playtest  
Active route: no verified standalone Runtime Engine / Playtest app route exists yet  
Current verified implementation baseline: concept and boundary only; current repo evidence includes Playtest/Build documentation, Project Editor Stitcher placeholder playtest button, module-architecture references, Puzzle Creator internal puzzle runtimes, and Effect Editor internal FX runtimes  
Governing universal contract: `docs/artifex/1A-project-file-contracts.md`  
Related specifications: `docs/artifex/14A-shared-health-guide-project-audit.md`, `docs/artifex/15A-build-game.md`  
Outstanding work source: `docs/artifex/2A-global-to-do.md`

## Purpose

Runtime Engine / Playtest is the playable-preview layer of Artifex.

It reads authored project data and runs or previews it without becoming the author of that data. It lets the creator test a scene, screen, Flatplan node, route, Quest, Puzzle, or full project before final Build Game packaging.

This specification defines the shared runtime/playtest boundary. It must not falsely claim that a complete standalone Runtime Engine or Playtest app has already been implemented.

## Ownership Boundary

Runtime Engine / Playtest owns:

- running authored project data in preview or test mode;
- resolving an entry point for a test run;
- temporary playtest state such as fake flags, fake items, debug inventory, test position and test conditions;
- rendering or delegating runtime presentation of scenes, screens, routes, puzzles, quests, objects, effects and audio during a test;
- reporting runtime/playtest errors back to the authoring module or Health system;
- allowing safe reset of temporary playtest state;
- future runtime adapters needed to consume canonical project files or Build Game output.

Runtime Engine / Playtest must not:

- author or permanently modify project records;
- save fake flags/items/test state into canonical project files;
- silently fix broken project data;
- promote assets;
- rewrite routes, scenes, quests, puzzles, object archetypes, effect archetypes or asset records;
- become Build Game packaging;
- treat module-specific editor previews as proof that the full project runtime exists;
- run from browser-local demo/default state when a connected project is selected unless explicitly labelled as demo/test data;
- make an authoring module responsible for another module's runtime behaviour.

## Runtime Engine Versus Playtest

The **Runtime Engine** is the system that actually runs playable project content.

**Playtest** is the author-facing test mode that invokes the runtime from an editor context and may apply temporary overrides, jump points, fake items, fake flags or debug state.

For example:

- Scene Editor may call Playtest to preview one scene.
- Project Editor may call Playtest from a selected Flatplan node or route.
- Quest Builder may call Playtest for one Quest or branch.
- Puzzle Creator may call Playtest for one saved puzzle.
- Build Game may run a final pre-export check.

The Runtime Engine executes content. Playtest chooses entry point, debug context and temporary state.

## Current Verified Implementation Status

No complete standalone Runtime Engine / Playtest route is verified in the current repo audit.

Existing evidence is mixed:

- `docs/artifex/08-playtest-and-build.md` defines desired Playtest options and Build Game packaging direction.
- `docs/artifex/02-module-architecture.md` lists Runtime Engine and Playtest as separate concepts and says Playtest should be available from multiple modules.
- Project Editor Stitcher has a **Playtest Route Transition** button, but current code only shows an alert saying route playtest is queued.
- Puzzle Creator contains internal puzzle runtimes such as Maze/Labyrinth and Potion Match runtime files; those are puzzle-specific engines, not a complete shared project runtime.
- Effect Editor contains internal FX runtime/rendering files; those are effect-preview/runtime helpers, not a complete game runtime.
- Project Editor Build Prep logs shared Health reports and task output, but does not run playable content.

Therefore Runtime Engine / Playtest is a required service boundary with partial module-local preview/runtime pieces, not a completed cross-project runtime layer.

## Current Playtest Intent

The older Playtest/Build document defines Playtest as the way to test a project directly inside Artifex.

It lists desired test entry points including:

```text
play from start
play selected screen
play selected scene
play selected Flatplan node/station
play selected quest
play route from point A to point B
test with fake flags/items enabled
reset playtest state
```

It also separates smaller Scene Editor preview from broader Project Editor playtest and Quest Builder Test Quest.

Those goals remain valid as future scope, but they are not implemented as a complete shared runtime yet.

## Entry Point Contract

Runtime / Playtest should support explicit entry-point descriptors rather than ad-hoc buttons that each invent their own format.

Future entry-point examples:

```json
{ "kind": "project-start" }
{ "kind": "screen", "screenId": "screen_title" }
{ "kind": "scene", "sceneId": "scene_forest_path" }
{ "kind": "flatplan-node", "nodeId": "node_intro" }
{ "kind": "route", "routeId": "route_intro_to_forest" }
{ "kind": "quest", "questId": "quest_find_capra" }
{ "kind": "sidequest", "sidequestId": "sidequest_lost_ring" }
{ "kind": "puzzle", "puzzleId": "puzzle_labyrinth_01" }
{ "kind": "build-output", "buildId": "build_2026_06_07_001" }
```

The exact schema remains future implementation work. The rule is that test entry points must identify the owning record by stable ID and must not copy that record's internals into the Playtest call.

## Temporary Test State Contract

Playtest may support temporary state such as:

```text
fake flags
fake completed quests
fake solved puzzles
fake inventory/items
fake unlocked routes
debug player position
debug companion state
debug health/stats
reset playtest state
```

Temporary test state must remain temporary. It must not be saved into canonical project files unless the user deliberately applies a separate authoring change in the owning module.

A test run may store local/session state for debugging, but that state must be clearly separate from authored project state.

## Module Entry Buttons

Multiple modules may expose playtest buttons, but they should all call the shared Runtime / Playtest service instead of implementing incompatible private test systems.

### Scene Editor

Scene Editor may expose **Preview Scene** or **Preview Screen**. It should pass a stable scene/screen ID and any unsaved local-draft preview state only under an explicit draft-preview mode.

### Project Editor

Project Editor may expose play from start, selected node, selected route or route transition. The current Stitcher playtest button is only a placeholder alert. A real implementation should call Runtime / Playtest with a route or node entry descriptor.

### Quest Builder

Quest Builder may expose **Test Quest**. It should pass a stable Quest/Side Quest ID and temporary fake flags/items only as playtest state.

### Puzzle Creator

Puzzle Creator may expose **Test Puzzle**. Puzzle-specific engines may power the actual puzzle, but the shared Playtest service should define how a saved puzzle is launched and how results are returned.

### Build Game

Build Game may run a final pre-export or post-build playthrough check. It should consume validated build output or saved canonical project files, not unsaved editor draft state unless a debug mode explicitly says so.

## Relationship to Authoring Modules

Runtime / Playtest consumes authored records from other modules.

It does not own those records.

If runtime detects a broken reference, missing asset, impossible route or invalid puzzle link, it should report the problem and fix owner. The creator must fix the source in the owning module.

Examples:

- scene layout error: Scene Editor;
- route does not resolve: Project Editor;
- Quest condition invalid: Quest Builder;
- puzzle record missing or invalid: Puzzle Creator;
- object archetype missing: Archetype Object Creator;
- effect archetype missing: Effect Editor;
- final asset missing: Asset Library;
- connected folder unavailable: Shared Connected Project Folder Service;
- project/folder mismatch: Shared Active Project Service or setup workflow.

## Relationship to Build Game

Build Game packages validated runtime-ready output.

Runtime / Playtest runs playable content.

They must cooperate but remain separate:

- Playtest may run from authored canonical files, local draft debug state or build output depending on mode.
- Build Game should package only validated saved project content.
- Runtime should not be the packaging owner.
- Build Game should not become the live preview UI.

## Relationship to Shared Health Guide

Shared Health diagnoses readiness problems.

Runtime / Playtest may produce runtime errors during execution and feed them to Health, Build Prep or the originating module.

Health should validate obvious missing references before Playtest runs where possible, but runtime may still detect dynamic problems.

## Relationship to Connected Project Folder and Active Project

Runtime / Playtest must know whether it is running:

```text
connected project files
local draft preview
imported backup package
build output
demo/default data
```

The UI should state the source clearly.

A real active project should not accidentally run unrelated demo/default data.

If a connected folder is required but permission is missing, Playtest should report that instead of silently falling back.

## Relationship to Puzzle-Specific Runtimes

Puzzle Creator may contain internal runtime engines for specific puzzle types, such as Maze/Labyrinth or Potion Match.

Those engines execute puzzle internals. They are not the whole Artifex Runtime Engine.

The shared Runtime / Playtest service should launch saved puzzle records and receive public puzzle results without taking ownership of puzzle construction or evaluation rules.

## Relationship to Effect Runtime

Effect Editor may contain internal FX runtime/rendering helpers.

Those helpers preview or render effect archetypes. They are not the whole game runtime.

The shared Runtime Engine may later consume saved `archeffect_` records or build-output effect data. Effect Editor remains the authoring owner of effect definitions.

## Relationship to Save Data

Runtime / Playtest may need runtime save data for a playable game. That save data is distinct from Artifex authoring data.

Future save data might include player progress, inventory, flags, completed quests and puzzle results.

Playtest may create temporary save data. Build/runtime production may create real player save data. Neither should be confused with editable project authoring files.

## Current Gaps

Known gaps include:

- no verified standalone Runtime Engine app route;
- no verified complete Playtest service API;
- no canonical entry-point descriptor schema;
- no shared temporary-state schema;
- Project Editor route playtest is a placeholder alert;
- Quest Builder Test Quest is not implemented;
- Scene Editor connected-project Preview Scene integration remains future work;
- Puzzle Creator has puzzle-specific runtimes but not canonical saved-puzzle Playtest integration;
- Build Game final pre-export playthrough is not implemented;
- runtime reading from connected project files is not standardised;
- runtime reading from build output is not defined;
- runtime error reporting into Health or module UIs is not standardised.

## Source Classification

`docs/artifex/08-playtest-and-build.md` is the main older source for Playtest and Build intent. Its Build Game material has been split into `15A`; its Playtest material is captured here.

`docs/artifex/02-module-architecture.md` is source evidence that Runtime Engine and Playtest are intended separate concepts, with Playtest entry points exposed from Scene Editor, Project Editor, Quest Builder, Puzzle Creator and Build Game.

`artifex/apps/project-editor/src/project-stitcher.js` is current implementation evidence that Project Editor has only a placeholder route-playtest alert, not a completed runtime integration.

Puzzle Creator runtime engine files and Effect Editor runtime files are module-local runtime/preview evidence. They should be classified in their own module specs and should not be mistaken for the whole Artifex Runtime Engine.

## Required Future Work

The active backlog, not this specification, owns implementation tasks. The main known Runtime / Playtest work is:

- create or confirm the shared Runtime Engine / Playtest service;
- define canonical playtest entry descriptors;
- define temporary fake-state/debug-state handling;
- support Scene Editor Preview Scene / Preview Screen;
- replace Project Editor placeholder route playtest with real shared Playtest call;
- support Quest Builder Test Quest;
- support Puzzle Creator saved-puzzle Test Puzzle;
- support Build Game final pre-export or post-build playthrough;
- define runtime reading from connected project files and/or build output;
- standardise runtime error reporting and fix-owner mapping.

## Remaining Work

All current and future Runtime Engine / Playtest work belongs in `docs/artifex/2A-global-to-do.md`. This specification must not become a task list.
