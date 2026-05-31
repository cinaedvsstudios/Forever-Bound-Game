# Template Game Connected Reference Project Contract

## Purpose

The **Template Game** is a small populated connected Artifex reference project. It exists to prove that Artifex apps can read, write and reference one another's outputs inside one coherent project package using the same contracts as a real game.

Template Game should use existing SVG, image, audio and test assets wherever practical. It may later include one generated procedural synth sound when the shared sound generator and runtime playback exist. It is not a replacement for **Artifacts Adventures**, and it does not need to become a polished final game before real production begins.

After the connected reference flow works, **Artifacts Adventures** is the first real production project authored through the proven Artifex toolchain.

## Required Companion Documents

```text
docs/artifex/05-creation-guide.md
docs/artifex/07-quest-builder.md
docs/artifex/07a-quest-builder-structured-authoring.md
docs/artifex/07b-puzzle-creator-quest-integration.md
docs/artifex/19-project-file-contracts.md
docs/artifex/19a-project-starter-file-schemas.md
docs/artifex/20-asset-intake-workflow.md
docs/artifex/22-sound-archetype-generator.md        [when generated-audio validation is included]
artifex/shared/todo-guide/all-apps-todos.json
```

- `19-project-file-contracts.md` remains authoritative for ownership, save behaviour, relative paths and cross-app boundaries.
- `19a-project-starter-file-schemas.md` remains authoritative for the exact blank-starter JSON shapes.
- `20-asset-intake-workflow.md` remains authoritative for intake-to-final-asset promotion of supplied resources.
- `07b-puzzle-creator-quest-integration.md` defines how a saved Puzzle Creator record is used as a Quest Builder flow step without duplicating puzzle internals.
- `22-sound-archetype-generator.md` defines the generated-audio asset and playback flow if Template Game tests procedural synth sound.
- This document defines the minimum later populated reference content required for Template Game.

## Locked Tool Name

The high-level structural/Flatplan tool is named **Project Editor**. Historical `Project Manager` labels or stored filename references are migration items and are not the user-facing name used for new work.

## Three Different Layers

| Layer | Meaning | Created/populated by |
|---|---|---|
| **Blank Starter Project** | Empty valid project structure: directories, top-level starter files and empty indexes. | Creation Guide / shared structure initializer. |
| **Template Game** | Small populated connected reference project proving cross-app data flow and references. | Appropriate owning apps and validation/generation work. |
| **Artifacts Adventures** | First real production project authored through Artifex. | Creator through Artifex apps after reference flow works. |

Template Game must use the same folder hierarchy and file schemas as any real project. It is populated later; it is not a different file format.

## Current Implementation Boundary

Creation Guide V1.1.11 can connect a writable project folder and create a Blank Starter Project structure. Project Editor v0.1.32 CONTRACT is aligned to the same starter schemas, but its direct connected-folder load/save integration remains future work.

Quest Builder V1.2.12 currently demonstrates flow layout and explicit connectors, but it does not yet save canonical connected-project Quest files or expose a live linked-Puzzle block. Puzzle Creator V1.30 currently demonstrates puzzle authoring and JSON output, but it does not yet register canonical connected-project puzzle records for Quest Builder selection.

Template Game cannot be declared connected until the relevant apps load the same active connected project rather than falling back to unrelated browser/demo state.

## Blank Starter Versus Populated Reference Content

Creation Guide may create the blank starter foundations:

```text
project.json
logic.json
layout.json
registry.json
library-links.json
input-map.json
README.md
scenes/scene-index.json
screens/screen-index.json
quests/quest-index.json
sidequests/sidequest-index.json
puzzles/puzzle-index.json
archetypes/object-index.json
archetypes/effect-index.json
assets/asset-index.json
required empty folders
optional intake folders/README when the user approves that step
```

Creation Guide must not populate sample scenes, screens, quests, puzzles, archetypes, effects or promoted/generated assets merely because Template Game will later require them.

Generated health reports, build results, backup manifests and app-authored task/content files are created by their owning systems only when those systems are exercised.

## Canonical Folder Hierarchy

```text
<project-root>/
  project.json
  logic.json
  layout.json
  registry.json
  library-links.json
  input-map.json
  README.md

  intake/
    README.md
    backgrounds/
    characters/
    objects/
    icons-ui/
    music/
    dialogue-sfx/

  scenes/
    scene-index.json
    scene_<slug>.json

  screens/
    screen-index.json
    screen_<slug>.json

  quests/
    quest-index.json
    quest_<slug>.json

  sidequests/
    sidequest-index.json
    sidequest_<slug>.json

  puzzles/
    puzzle-index.json
    puzzle_<slug>.json

  archetypes/
    object-index.json
    effect-index.json
    objects/
      archobj_<slug>.json
    effects/
      archeffect_<slug>.json

  assets/
    asset-index.json
    groups/
      assetgroup_<slug>.json
    images/
      backgrounds/
      characters/
      props/
      ui/
    sprites/
      characters/
      objects/
      fx/
    audio/
      music/
      sfx/
        synth_<slug>.json       [generated sound asset, only when created]
      voice/
    fonts/
    video/

  health/
    latest-health-report.json

  build/
    runtime-project.json
    build-manifest.json

  backups/
    backup-manifest.json

  todos/
    creation-guide.json
    project-editor-todos.json
```

This hierarchy describes a possible complete connected project package. Not every output file exists immediately after Blank Starter creation. A generated synth JSON file is an optional final audio asset created later through the shared sound-generator flow; it is not a new blank-starter requirement or a sound-archetype index.

Older implementations may still read or write `todos/project-manager-todos.json`; migration to `project-editor-todos.json` must be handled deliberately and compatibly rather than silently abandoning existing files.

## Minimum Populated Template Game Content

| Owner / area | Minimum connected reference content |
|---|---|
| Creation Guide | Project identity, active-project setup, blank starter foundations and enabled-module/index references. |
| Project Editor | Valid Flatplan/route structure in `logic.json`, editor layout in `layout.json`, registry/library-link data where required, and visible save/connection state. |
| Asset Library | Populated `assets/asset-index.json`, at least one asset group where useful, and registered test visual/audio assets. Imported audio and generated procedural audio use the same asset-library reference method. |
| Scene Editor | At least one playable scene file registered in `scenes/scene-index.json`. |
| Screens / UI flow | At least one real title/start screen registered in `screens/screen-index.json`. |
| Archetype Object Creator | At least one used object archetype; ideally a player, interactable and exit/transition when supported. |
| Effect Editor | At least one reusable effect archetype visibly used or referenced by the scene. |
| Quest Builder | At least one minimal Quest/Calling connected to the scene or project flow; when puzzle integration is tested, that Quest includes one linked Puzzle flow step by `puzzleId`. |
| Puzzle Creator | One simple registered puzzle when included in the integration pass, or an intentionally valid empty index while deferred. |
| Procedural Sound Generator | Optional in the initial pass; once implemented, one generated sound recipe registered as an audio asset and referenced by an object, scene, Quest or puzzle event. |
| Health Guide / Build Game | Generated validation/build output only when testing those systems; missing references reported honestly. |

## Minimum Reference Scenario

The first connected Template Game may be tiny. It should prove:

- one title/start screen;
- one playable scene;
- one structural route/transition;
- one registered background asset;
- one player/Mel visual asset;
- one interactable or pickup object;
- one door/exit/transition;
- one visible effect;
- one audio/music record where supported;
- one short Quest/Calling;
- one simple Puzzle, preferably inserted into that Quest as a linked flow step once both apps support canonical saving/loading;
- once procedural audio playback is implemented, preferably one `assets/audio/sfx/synth_<slug>.json` asset selected through `assets/asset-index.json`;
- one Health/Build validation pass when those systems are ready.

A populated Template Game may set `startScreenId` to its actual registered title/start screen. A genuinely Blank Starter Project uses `startScreenId: null` until a real screen exists.

## Puzzle-to-Quest Proof Scenario

When linked-puzzle integration is implemented, the Template Game should include this minimal proof:

```text
Puzzle Creator
  puzzle_test_challenge saved and registered in puzzles/puzzle-index.json

Quest Builder
  quest_test_calling contains a Puzzle flow block referencing puzzle_test_challenge
  puzzle completion produces one Quest-visible outcome, such as flag_test_puzzle_solved

Project Editor
  may display or consume the saved Quest/flag outcome where a route needs gating
```

The Quest record must not copy the Puzzle record's internal layout or challenge rules. Broken `puzzleId` references must be reported by Health/Build validation.

## Cross-App Reference Proof Checklist

Before declaring Template Game connected, verify that:

- [ ] Creation Guide can create/open/select the project and connect its folder.
- [ ] Project Editor reads the connected project’s real files rather than unrelated demo/default state.
- [ ] Project Editor writes its owned structural files through the shared folder service.
- [ ] Asset Library/Browser shows populated registered assets from the connected project.
- [ ] Scene Editor opens the registered scene and resolves its assets, objects and effects.
- [ ] Used object-archetype records resolve correctly.
- [ ] Used effect-archetype records resolve correctly.
- [ ] Quest/Calling records used by the flow resolve correctly.
- [ ] If linked-puzzle proof is included, Puzzle Creator saves/registers the puzzle, Quest Builder selects it by stable `puzzleId`, and the Quest does not duplicate the puzzle definition.
- [ ] No permanent authored content references `intake/` source files.
- [ ] All stored project paths are project-relative.
- [ ] If a procedural synth sound is included, it is registered as an `asset_` audio record, its JSON recipe exists under `assets/audio/sfx/`, and its calling record stores only that asset ID.
- [ ] Health/Build identifies unresolved IDs/files rather than silently accepting them.
- [ ] Preview/runtime launch works when runtime/build support exists.

## Template Game Is Not the Final UI Test

Template Game proves technical connection and reference flow. Normal day-to-day usability and remaining workflow/UI improvements should then be proven and refined while making **Artifacts Adventures** through Artifex.

## Synchronisation Rule

Future changes to Template Game paths, starter schemas or ownership rules must be compared against and, where affected, updated in:

```text
docs/artifex/00-index.md
docs/artifex/02-module-architecture.md
docs/artifex/05-creation-guide.md
docs/artifex/07-quest-builder.md
docs/artifex/07a-quest-builder-structured-authoring.md
docs/artifex/07b-puzzle-creator-quest-integration.md
docs/artifex/19-project-file-contracts.md
docs/artifex/19a-project-starter-file-schemas.md
docs/artifex/20-asset-intake-workflow.md
docs/artifex/22-sound-archetype-generator.md        [where procedural audio is involved]
artifex/shared/project-folder/project-structure-initializer.js
artifex/shared/todo-guide/README.md
artifex/shared/todo-guide/all-apps-todos.json
any future Template Game generator, seed package or validator
```