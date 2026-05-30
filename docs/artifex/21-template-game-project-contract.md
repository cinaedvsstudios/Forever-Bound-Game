# Template Game Connected Reference Project Contract

## Purpose

The **Template Game** is a small, complete, connected Artifex reference project. It exists to prove that the Artifex apps can read and reference one another's outputs inside one coherent project package.

Template Game should be populated using existing SVG, image, audio and test assets wherever practical. It is not a replacement for **Artifacts Adventures**, and it is not required to become a perfected final game before real production begins.

After the connected reference flow works, **Artifacts Adventures** becomes the first real production project authored through the proven Artifex toolchain. Remaining day-to-day usability and workflow improvements can then be refined through real production use.

## Relationship to Existing Contracts

- `docs/artifex/19-project-file-contracts.md` remains the source of truth for ownership, save behaviour, project-relative paths and cross-app boundaries.
- `docs/artifex/05-creation-guide.md` remains the source of truth for project onboarding and the canonical recommended project hierarchy.
- `docs/artifex/20-asset-intake-workflow.md` remains the source of truth for intake-to-final-asset promotion.
- This document defines the minimum populated connected reference content required for the Template Game.

## Two Different Structures: Blank Starter Versus Populated Reference Project

| Layer | Meaning | Created by |
|---|---|---|
| Blank starter structure | directories, top-level starter files and empty indexes needed to begin a project | Creation Guide / `project-structure-initializer.js` |
| Populated Template Game | actual sample scenes, screens, assets, archetypes, quest/puzzle references, health/build validation results where generated | appropriate owning apps and/or later Template Game generation/validation pass |
| Artifacts Adventures | first real production project authored through the proven toolchain | creator through Artifex apps |

The initializer does not need to create generated output files merely because those files form part of a complete populated project. Generated health reports, build results, backup manifests or module-authored todo/content files are created or populated by their owning systems when required for authoring, generation or validation.

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
    project-manager-todos.json
```

This hierarchy describes the possible complete connected project package. Not every file is required to exist immediately after blank project creation.

## Minimum Populated Template Game Content

| Area / owner | Minimum populated reference content |
|---|---|
| Creation Guide | `project.json`, starter project metadata, enabled module list, project roots and index references |
| Project Manager | Flatplan/route structure in `logic.json`, layout in `layout.json`, relevant library links and visible project status/tasks |
| Asset Library / Browser | populated `assets/asset-index.json`, at least one asset group, actual test image/SVG/audio records |
| Scene Editor | at least one playable scene file referenced by `scenes/scene-index.json` |
| Screens / UI flow | at least one title/start screen referenced by `screens/screen-index.json` |
| Archetype Object Creator | at least one object archetype used by the scene; preferably Mel/player, an interactable object and an exit/transition object where supported |
| Effect Editor | at least one effect archetype visibly referenced by the scene |
| Quest Builder | at least one minimal quest/calling record connected to the scene or project flow |
| Puzzle Creator | at least one simple referenced puzzle when Puzzle Creator is included in the integration pass; otherwise retain an intentional empty valid index |
| Audio / visual assets | at least one background, character/player visual, object or transition visual, FX visual, UI/icon asset and one sound/music record where supported |
| Health / Build | validation/build output generated only when those systems are being tested; must report missing or unresolved references honestly |

## Minimum Playable / Reference Scenario

The first connected Template Game may remain tiny. It should ideally prove:

- one title/start screen;
- one playable scene;
- one Flatplan route or transition;
- one background;
- one player/Mel asset;
- one interactable or pickup object;
- one door/exit/transition;
- one visible effect;
- one audio record or playable sound where supported;
- one short quest/calling;
- one simple puzzle or intentionally deferred valid empty puzzle index;
- one successful health/build validation pass when Build Game is ready.

## Cross-App Reference Proof Checklist

Before declaring Template Game connected, verify that:

- [ ] Creation Guide can open/select the project.
- [ ] Project Manager recognises the project structure and does not fall back to unrelated demo data.
- [ ] Project Manager can show assets/files/references that exist and identify genuinely missing ones.
- [ ] Asset Browser can show populated registered assets.
- [ ] Scene Editor opens the referenced scene and sees its referenced assets/objects/effects.
- [ ] Object archetype records used by the scene resolve correctly.
- [ ] Effect archetype records used by the scene resolve correctly.
- [ ] Quest/calling records used by the test flow resolve correctly.
- [ ] Puzzle records resolve if included.
- [ ] No permanent content points directly into `intake/`.
- [ ] All project file paths are project-relative.
- [ ] Health/build validation identifies unresolved IDs or files rather than silently accepting them.
- [ ] The small reference game can be launched or previewed when runtime/build support exists.

## Template Game Is Not the Final UI Test

Template Game proves the technical connection and reference flow across Artifex apps. Actual day-to-day usability and remaining UI/workflow improvements will be proven and refined while creating **Artifacts Adventures** through Artifex.

## Synchronisation Rule

Any future change to Template Game required paths or cross-app ownership must be compared against and, where affected, updated in:

- `docs/artifex/05-creation-guide.md`;
- `docs/artifex/19-project-file-contracts.md`;
- `docs/artifex/20-asset-intake-workflow.md`;
- `artifex/shared/project-folder/project-structure-initializer.js`;
- `artifex/shared/todo-guide/all-apps-todos.json`;
- any future Template Game generator, seed package or validator.
