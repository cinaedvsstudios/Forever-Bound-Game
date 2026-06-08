# Template Game Reference Project Specification

Status: Active reference-project specification during documentation consolidation  
Reference project: Template Game  
Source evidence: `docs/artifex/21-template-game-project-contract.md`  
Related documents: `01A`, `04A`, `05A`, `07A`, `10A`, `11A`, `12A`, `13A`, `14A`, `15A`, `16A`, `17A`, `18A`, `19A`

## Purpose

The Template Game is a small populated connected Artifex reference project.

It proves that Artifex apps can read, write and reference one another's outputs inside one coherent project package using the same contracts as a real game.

It is not the Blank Starter Project and it is not Artifacts Adventures.

After the connected reference flow works, Artifacts Adventures / Forever Bound becomes the first real production project authored through the proven Artifex toolchain.

## Three Different Layers

| Layer | Meaning | Created/populated by |
|---|---|---|
| Blank Starter Project | Empty valid project structure: directories, top-level starter files and empty indexes. | Creation Guide / shared structure initializer. |
| Template Game | Small populated connected reference project proving cross-app data flow and references. | Owning apps and validation/build work. |
| Artifacts Adventures / Forever Bound | Real production project authored through Artifex. | Creator through Artifex apps after reference flow works. |

The Template Game uses the same folder hierarchy and file schemas as any real project. It is populated later; it is not a different file format.

## Locked Tool Name

The high-level structural/Flatplan tool is named **Project Editor**.

Historical `Project Manager` labels or stored filename references are migration items and are not the user-facing name used for new work.

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

A complete connected project package may contain:

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
        synth_<slug>.json
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

Not every output file exists immediately after Blank Starter creation. A generated synth JSON file is optional and is created later through the shared sound-generator flow.

Older implementations may still read or write `todos/project-manager-todos.json`. Migration to `project-editor-todos.json` must be handled deliberately and compatibly.

## Minimum Populated Template Game Content

| Owner / area | Minimum connected reference content |
|---|---|
| Creation Guide | Project identity, active-project setup, blank starter foundations and enabled-module/index references. |
| Project Editor | Valid Flatplan/route structure in `logic.json`, editor layout in `layout.json`, registry/library-link data where required and visible save/connection state. |
| Asset Library | Populated `assets/asset-index.json`, at least one asset group where useful and registered test visual/audio assets. |
| Scene Editor | At least one playable scene file registered in `scenes/scene-index.json`. |
| Screens / UI flow | At least one real title/start screen registered in `screens/screen-index.json`. |
| Archetype Object Creator | At least one used object archetype; ideally a player, interactable and exit/transition when supported. |
| Effect Editor | At least one reusable effect archetype visibly used or referenced by the scene. |
| Quest Builder | At least one minimal Quest/Calling connected to the scene or project flow. |
| Puzzle Creator | One simple registered puzzle when included in the integration pass, or an intentionally valid empty index while deferred. |
| Sound Generator | Optional initially; later one generated sound recipe registered as an audio asset and referenced by an object, scene, Quest or puzzle event. |
| Health Guide / Build Game | Generated validation/build output only when testing those systems. |

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
- one procedural synth asset once runtime playback is implemented;
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
- [ ] Project Editor reads the connected project's real files rather than unrelated demo/default state.
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

Template Game proves technical connection and reference flow.

Normal day-to-day usability and remaining workflow/UI improvements should then be proven and refined while making Artifacts Adventures / Forever Bound through Artifex.


## Archived Reference Scenario Evidence

The former `artifex/artifex-adventures/19-artifex-adventure-template.md` file contains a detailed historical draft for an Artifex Adventures reference scenario, including Orient Express / Great Omar story material, passenger targets, train locations, quest flags, object archetypes and a module-demonstration checklist. Its useful role is source evidence for the Template Game proof scenario; it is not a separate active template specification.

## Source Classification

`docs/artifex/21-template-game-project-contract.md` is consolidated into this reference. After this file is accepted, the old document can become archive/source evidence.
