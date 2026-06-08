# Creation Guide Specification

Status: Active module specification draft during documentation consolidation  
Owning module: Creation Guide  
Active route: `artifex/apps/creation-guide/index.html`  
Current verified implementation baseline: `Artifex Creation Guide V1.1.12`  
Governing universal contract: `docs/artifex/01A-project-file-contracts.md`  
Subordinate exact schema reference: `docs/artifex/19A-project-starter-schemas.md`  
Outstanding work source: `docs/artifex/02A-global-to-do.md`

## Purpose

Creation Guide is the Artifex project-onboarding and early-readiness surface. It starts a Blank Starter Project workflow, connects or re-authorises a writable project folder, creates the empty canonical starter project foundation, offers the optional initial intake-folder setup step, stores/selects browser-side active-project handoff state and displays setup-facing Health and assignment guidance.

This specification owns permanent information unique to Creation Guide. Universal project-file, relative-path, connected-folder, intake-versus-final-asset and documentation-control rules remain owned by the master contract and linked technical references.

## Ownership Boundary

Creation Guide owns:

- initial project identity/setup workflow and New / Open presentation;
- browser-side project summary registration and active-project selection/handoff presentation;
- initiating creation of the empty Blank Starter Project through the shared connected-folder and structure-initialiser services;
- the optional **Initial Asset Intake Setup** user flow, including create/verify/skip presentation and its setup status;
- starter input-map creation as part of initial Blank Starter Project output;
- setup-facing Health/readiness and assignment-planning presentation;
- ZIP export presentation as backup/fallback where available.

Creation Guide must not:

- author populated scenes, screens, quests, puzzles, object archetypes, effect archetypes or build output;
- promote supplied intake material into final Asset Library records;
- treat browser project summaries or selected-project localStorage as permanent authored project data;
- silently overwrite existing connected-project files during initialisation;
- present a Template Game as available before a populated connected reference project exists and validates.

## Active Baseline

The current implementation evidence is `artifex/apps/creation-guide/index.html`, whose visible title and version badge identify **Artifex Creation Guide V1.1.12**.

| Current area | Baseline status | Current implementation fact |
|---|---|---|
| Shell and Project Overview | Implemented | Two-panel Creation Guide surface with setup fields, New / Open, Set Active, Export ZIP, Assignments and Health access. |
| New / Open project flow | Implemented | Begins a Blank Starter Project setup and opens browser-registered projects from the Project Library. |
| Active-project handoff | Implemented as browser state | Uses browser Project Library and selected-project keys for handoff/presentation; this is not permanent authored project storage. |
| Connected Project Folder | Implemented | Provides Connect Project Folder, Re-authorise Folder and Create Starter Structure through shared project-folder services. |
| Blank Starter Project initialisation | Implemented | Writes missing canonical starter files and typed empty indexes into the connected folder without overwriting existing files. |
| Empty-project start screen rule | Implemented | Initial project and logic files use `startScreenId: null` until a real registered start screen exists. |
| Initial Asset Intake Setup | Implemented | Offers optional create/verify intake folders or Skip for Now, displays the six intake buckets and states that final content must use promoted `assets/` records. |
| Health/readiness panel | Partly implemented | Reports project identity, connected folder, starter structure, intake status, active-project state and assignments; still displays warning placeholders for recommended starting media and cross-app project loading. |
| Recommended Starting Media | Not implemented as a working setup flow | Present only as a future/warning Health item. |
| Project-logo intake/promotion/display | Not implemented | Remains future work with Asset Library involvement. |
| Template Game choice | Not implemented | Must remain unavailable until the populated connected reference project is proven. |

## Current Implemented Interfaces

### Browser workspace and handoff state

The current Creation Guide uses browser localStorage for workspace/handoff information:

```text
artifex.projectLibrary
artifex.activeProjectId
artifex.creationGuide.hideModuleIntro
artifex.creationGuide.healthAssignmentsCreated.<project-id>
artifex.creationGuide.intakeSetup.<project-id>
```

These current keys support browser project selection, intro preference, generated setup-assignment tracking and optional intake-step status. They do not replace the connected project folder as the permanent authored-data location.

### Connected-folder and starter-structure interface

Creation Guide currently consumes the shared browser project-folder client and shared structure initialiser. Its UI exposes:

```text
Connect Project Folder
Re-authorise Folder
Create Starter Structure
```

The current starter-structure action runs separately from optional intake creation. It requests canonical blank-starter output with intake excluded initially, so the creator can explicitly complete or skip **Initial Asset Intake Setup** afterwards.

The canonical starter output currently initiated by Creation Guide includes:

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
```

Exact JSON shapes belong only in `docs/artifex/19A-project-starter-schemas.md`. Creation Guide's unique rule is that it starts this empty-project initialisation action; it does not populate later module-owned content.

### Initial Asset Intake Setup interface

The current optional intake step provides:

```text
Create Intake Folders / Verify Intake Folders
Skip for Now
```

When created through the current shared initialiser, the visible source-material drop locations are:

```text
intake/backgrounds/
intake/characters/
intake/objects/
intake/icons-ui/
intake/music/
intake/dialogue-sfx/
```

Creation Guide owns presentation and initial creation of this optional staging setup. Asset Library owns the later promotion/registration of approved material into final usable assets.

## Current Implementation Transition Note

The visible V1.1.12 app is not yet a single cleaned permanent implementation. Its current shell loads `app-bootstrap.js`, which patches version text and presentation around an older base `module-app.js`; project-folder setup and intake setup are also applied through later source modules. The base module still contains older internal project labels and browser-project metadata concepts, while the shared structure initialiser writes the canonical connected-folder package.

This layered state is a current implementation fact only. It must not be interpreted as permission to restore older file names or treat browser-local project objects as the canonical connected project format. Any cleanup/consolidation work belongs in `02A` and must be handled as a later versioned implementation pass.

## Extraction from Earlier Creation Guide Documents

`docs/artifex/05-creation-guide.md` contains valid purpose and ownership material but no longer accurately records the live implementation: it states V1.1.11 and describes Initial Asset Intake Setup as future, whereas current V1.1.12 code implements the intake section and blank-starter folder flow. Its lasting Creation Guide-specific facts are transferred into this specification; still-live work belongs in `02A`.

`docs/artifex/05a-creation-guide-v119-implementation-notes.md` and `artifex/apps/creation-guide/README.md` record the earlier V1.1.10 split and state that connected-folder/intake work is future. They remain historical/source evidence only once this specification is accepted, because those descriptions have been superseded by the V1.1.12 implementation baseline.

`docs/artifex/20-asset-intake-workflow.md` contains cross-module intake and Asset Library workflow material. The Creation Guide-specific implemented optional intake step is recorded here; any remaining Asset Library-specific ownership decision is deferred to the Asset Library audit.

After this specification is accepted and any still-live tasks are represented in `02A`, the older Creation Guide status/specification files are eligible for archive or targeted cleanup treatment rather than continuing as parallel current authorities.

## Remaining Work

All current and future Creation Guide tasks are owned by `docs/artifex/02A-global-to-do.md`. This specification must not accumulate task checklists.
