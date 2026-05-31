# Artifex Shared To-Do Guide

## Purpose

This guide defines how Artifex tracks work without confusing project problems, platform work and app-specific implementation tasks.

Artifex uses three connected task scopes:

| Scope | What it tracks | Typical location |
|---|---|---|
| Current project tasks | Missing/broken content or references inside one connected game project. | `<project-root>/todos/project-manager-todos.json` when generated. |
| All-app platform tasks | Changes required across the Artifex suite or shared services. | `artifex/shared/todo-guide/all-apps-todos.json` |
| Specific-app tasks | Work needed only in one app/module. | `artifex/apps/<app-slug>/docs/todo.md` or app-specific JSON where needed. |

## Required Contract Documents

Before updating project-file, intake, Template Game, generated-audio or save-system tasks, check:

```text
docs/artifex/05-creation-guide.md
docs/artifex/18-color-and-display-rules.md
docs/artifex/19-project-file-contracts.md
docs/artifex/19a-project-starter-file-schemas.md
docs/artifex/20-asset-intake-workflow.md
docs/artifex/21-template-game-project-contract.md
docs/artifex/22-sound-archetype-generator.md     [where procedural audio is involved]
artifex/shared/todo-guide/all-apps-todos.json
```

## Project Terminology

Do not collapse these into one task concept:

| Term | Meaning |
|---|---|
| **Blank Starter Project** | Empty valid starter project created by Creation Guide: structural JSON, required directories and empty indexes, plus optional intake setup. |
| **Template Game** | Later small populated connected reference project proving cross-app file/reference integration. |
| **Artifacts Adventures** | First real production project made through Artifex after Template Game flow works. |

## Gameplay Action / Input Mapping Decision

Gameplay action mapping is setup data. Creation Guide creates the initial default profile; Project Editor inspects/validates it; a future settings/controls editor may later own detailed remapping.

Canonical relative file path inside the selected connected project root:

```text
input-map.json
```

The exact canonical schema belongs in:

```text
docs/artifex/19a-project-starter-file-schemas.md
```

Current schema name and action prefix:

```text
artifex.input-map.v1
action_
```

Do not restore the older `artifex.inputMap.v1` name or a `projects/<project-id>/input-map.json` assumption. The connected folder itself is `<project-root>/`.

## Procedural Sound Generator / Generated Audio Decision

The future shared Procedural Sound Generator is an embedded popup callable from Archetype Object Creator, Scene Editor, Puzzle Creator and later sound-assigning tools. It creates electronic sound recipes through understandable controls and Web Audio preview/playback.

Its generated sounds use the existing Asset Library model:

```text
assets/audio/sfx/synth_<slug>.json
assets/asset-index.json → asset_sfx_<slug>
```

Imported audio files and generated synth recipes must appear in the same audio/sound-effects selector. Calling records store only their registered `asset_` ID.

Do not create:

```text
archetypes/sound-index.json
archetypes/sounds/
archsound_
```

The generator is shared platform work; hooking it into an individual editor is app-specific work; a missing or invalid generated sound reference inside a game is a current-project validation task. See `docs/artifex/22-sound-archetype-generator.md`.

## Scope 1: Current Project Tasks

Project-level tasks answer:

```text
What is missing or broken inside this connected project?
Which owned project file needs editing?
Which module owns the fix?
What blocks preview, validation or build?
```

Examples include:

- missing `project.json` or `input-map.json`;
- a blank project referring to a start screen that does not exist;
- broken Flatplan routes or linked scene/screen/quest/puzzle/archetype IDs;
- missing asset registrations, including procedural synth JSON recipes referenced by an `asset_` ID;
- required gameplay actions not mapped;
- local drafts not yet written to the project folder;
- build or health output reporting unresolved references.

When generated, the project-specific task file is relative to the connected project root:

```text
todos/project-manager-todos.json
```

This may be generated or displayed by Project Editor, Creation Guide or Shared Health Guide, but it describes one project rather than the Artifex platform.

## Scope 2: All-Apps Platform Tasks

All-app tasks answer:

```text
Which shared contract or shared service is missing?
Which apps still use old file paths, old schemas, local-only saving or unrelated demo state?
What must change across the Artifex suite?
```

Examples include:

- build/use the shared connected-project-folder service;
- integrate direct-save and recovery-draft status across apps;
- ensure every app loads the selected active connected project;
- build the shared Procedural Sound Generator and register generated sounds through Asset Library;
- standardise module menus, versions and branding rules;
- prove cross-app references through Template Game;
- audit file ownership/module split/patch-layer rules.

Machine-readable location:

```text
artifex/shared/todo-guide/all-apps-todos.json
```

## Scope 3: Specific-App Tasks

Specific-app tasks concern one module only, for example:

- Creation Guide: implement intake setup, media checklist, logo support or Template Game selection.
- Project Editor: connect real folder reads/writes, asset browser/index integration or route tools.
- Scene Editor: save scene/screen files and references through the shared folder contract; later expose sound assignment hooks.
- Archetype Object Creator: add Choose Sound/Create Synth Sound/Save and Assign hooks for object events.
- Puzzle Creator: later expose generated-sound selection for feedback events.
- Effect Editor: build a specific FX engine or remove legacy live patches.

Recommended locations:

```text
artifex/apps/<app-slug>/docs/todo.md
artifex/apps/<app-slug>/docs/todo.json
```

## Shared Task Shape

Use one general task shape for machine-readable task sets:

```json
{
  "taskId": "todo_project_editor_missing_input_map",
  "scope": "specific-app",
  "owningModule": "project-editor",
  "relatedModules": ["creation-guide"],
  "title": "Report missing input map",
  "description": "The connected project does not include the canonical input-map.json file.",
  "status": "open",
  "priority": 4,
  "effort": 2,
  "source": "health-guide",
  "projectFile": "input-map.json",
  "appFile": null,
  "fixOwner": "creation-guide",
  "tags": ["setup", "controls", "validation"]
}
```

Required fields:

```text
taskId
scope
owningModule
title
status
priority
effort
source
fixOwner
```

Recommended status values:

```text
unassigned
assigned
started
snoozing
blocked
review
done
archived
open
warning
failed
passed
not-needed
```

## Ownership Rules For Tasks

A task should distinguish where it appears from who owns the actual fix. A missing quest reference may appear in Project Editor/Health because it breaks the project graph, while the missing quest content belongs to Quest Builder. A missing scene record may appear in a project audit, while Scene Editor owns the correction. Creation Guide owns the initial creation of the blank starter data and input map, not later authored module content.

A generated synth recipe is owned/registered as final audio by Asset Library with creation supplied through the shared Procedural Sound Generator. An object, scene or puzzle task may report a broken sound reference, but it must not copy the recipe into that content record or invent another sound library.

## App Roles Relevant To Tasks

| App/service | Task responsibility |
|---|---|
| Creation Guide | New project setup, connected folder initialisation, future intake/media/logo setup, project registration and early setup Health. |
| Project Editor | Existing project structure, Flatplan/routes/registry/library links, structural audit display and later connected-folder structural save. |
| Scene Editor | Scene/screen authored content, related index entries and referenced final sound asset IDs. |
| Quest Builder | Quest/sidequest/branch/condition/reward content. |
| Puzzle Creator | Puzzle definitions, related entries and referenced feedback sound asset IDs. |
| Archetype Object Creator | Reusable object archetype content and referenced behaviour sound asset IDs. |
| Effect Editor | Reusable FX archetype content. |
| Asset Library | Promotion/registration of supplied source files and registration/selection of generated synth recipes in final `assets/`. |
| Shared Procedural Sound Generator | Popup UI, Web Audio preview/playback recipe generation and asset-registration request flow. |
| Shared Health Guide | Generated audit/readiness reporting, including missing/invalid procedural-audio resources; never silent content overwrite. |
| Build Game | Generated validated build output and audio-resource validation; never authored module content. |

## Current Creation Guide / Project Editor Status

Current verified/aligned state:

```text
Creation Guide V1.1.11
  Connected Project Folder and Create Starter Structure are implemented and browser-tested.
  Canonical starter-schema generator is loaded for fresh starter-file creation.
  Intake/media/logo/Template Game selection remain pending.

Project Editor v0.1.32 CONTRACT
  Default/package schema shapes align with the canonical starter schemas.
  It still labels/saves browser draft state only until direct-folder integration is built.
```

A known pending contract fix remains: a genuinely Blank Starter Project should not reference a non-existent start screen. This requires an approved runtime change to the starter initializer, separately from documentation alignment.

## Machine-Readable App Index

Artifex should maintain one machine-readable app index so audits know which apps are active, draft, archived, experimental or template-only:

```text
artifex/apps/app-index.json
```

This is platform metadata, not a file inside any connected game project.

## Audit Reports

Repo-wide Artifex audits should be written under:

```text
artifex/shared/todo-guide/audits/
```

Suggested filenames:

```text
YYYY-MM-DD-global-app-audit.md
YYYY-MM-DD-<app-slug>-audit.md
```

An audit report is an inspection record, not permission to refactor or overwrite runtime code. It should identify source contract files, apps/files inspected, compliance gaps, risk level, recommended task scope and whether a change needs human approval.

## Inspection Prompt Rule

When inspecting an app, begin with the central contracts and report before refactoring:

```text
Inspect this app against docs/artifex/19-project-file-contracts.md,
docs/artifex/19a-project-starter-file-schemas.md where starter/project JSON is involved,
docs/artifex/20-asset-intake-workflow.md where assets/intake are involved,
docs/artifex/21-template-game-project-contract.md where reference-project work is involved,
docs/artifex/22-sound-archetype-generator.md where sound selection or generated-audio assets are involved,
and artifex/shared/todo-guide/README.md.

Report:
1. files owned/read/written and files it must not own;
2. schema/path/ID compatibility;
3. save state and connected-folder compatibility;
4. whether work belongs to project, all-app or specific-app scope;
5. exact safe changes before editing.
```

## Locked Decisions

- New Blank Starter Project creation belongs in Creation Guide.
- Project Editor assembles/validates/edits existing structural project files; it does not create populated games by itself.
- Connected project-folder data becomes the intended saved source of truth; localStorage is recovery draft only.
- ZIP/package output is backup/fallback, not normal everyday saving.
- Starter JSON shapes are canonical only in `docs/artifex/19a-project-starter-file-schemas.md`.
- `intake/` is staging only; final authored/runtime references resolve through final registered `assets/` content.
- Procedural synth sounds are generated final audio assets in `assets/audio/sfx/`, registered in `assets/asset-index.json`, not a separate archetype library.
- Template Game and Artifacts Adventures are separate projects with different purposes.
