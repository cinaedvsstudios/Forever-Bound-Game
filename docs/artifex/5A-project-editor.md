# Project Editor Specification

Status: Active module specification draft during documentation consolidation  
Owning module: Project Editor  
Active route: `artifex/apps/project-editor/index.html`  
Current verified implementation baseline: `Artifex Project Editor v0.1.32 CONTRACT - Flatplan` on `main` commit `01b0ab337735220ef627c1d9f770c2d4ec237e8d`  
Governing universal contract: `docs/artifex/1A-project-file-contracts.md`  
Subordinate exact schema reference: `docs/artifex/19a-project-starter-file-schemas.md`  
Outstanding work source: `docs/artifex/2A-global-to-do.md`

## Purpose

Project Editor is the Artifex structural-authoring surface. It presents and edits the project-level Flatplan and structural graph: project nodes, routes, route conditions and gates, structural layout positioning, links from structural nodes to records owned by other modules, and structural readiness views used before runtime/build work.

This document owns permanent information unique to Project Editor. Universal project-file, connected-folder, save-state, reference, branding and documentation-control rules remain owned by the master contract and linked technical references.

## Ownership Boundary

Project Editor owns:

- the structural project graph and Flatplan presentation;
- project-level nodes and routes, including route types, route conditions/gates and structural link metadata;
- layout positioning and visual organisation of the project structure;
- browsing and linking registered or imported module-owned references into project-level structural nodes, without taking ownership of the referenced records;
- Project Editor-specific presentation of structural health/build-preparation findings and generated structural follow-up tasks;
- browser-draft and backup-import/export presentation while those are the implemented Project Editor storage interfaces.

Project Editor must not:

- create the Blank Starter Project or initial project intake flow owned by Creation Guide;
- author scene interiors or screen visual placement owned by Scene Editor;
- author quest/sidequest internals, puzzle definitions, object/effect archetypes or final asset records;
- silently rewrite records belonging to other modules because it links or validates them;
- treat its default/demo Flatplan state or browser-local draft state as a connected project's permanent authored source of truth;
- package or run the final game as if it owned Build Game or Runtime/Playtest responsibilities.

## Active Baseline

The current implementation evidence is `artifex/apps/project-editor/index.html`, whose title identifies **Artifex Project Editor v0.1.32 CONTRACT - Flatplan** and whose live route loads a modular entry script, `src/project-app.v7.js`.

| Current area | Baseline status | Current implementation fact |
|---|---|---|
| Runtime shell | Implemented | Small live HTML shell loading focused Project Editor modules rather than retaining the original monolithic runtime in `index.html`. |
| Flatplan and structural state | Implemented in browser-draft workflow | Project, logic, layout and registry state can be edited and persisted in browser localStorage. |
| Manifest workspace | Implemented | Displays project metadata, start-screen/package information and enabled-module presentation. |
| Stitcher / route logic | Implemented in structural draft model | Presents route types, conditions, gate/link ID, flag/state metadata, line colour and animated flow settings. |
| Route type model | Implemented | Provides simple, branch, quest-gated, puzzle-gated, item-gated, flag/condition and completed-state route kinds, with legacy aliases normalised. |
| Project Tasks / To-Do Board | Implemented | Presents generated shared-Health-derived project follow-up tasks; active code still uses legacy `Project Manager` naming/output path. |
| Asset Browser | Implemented for imported project/index data | Reads imported canonical index files for scenes/screens, quests, sidequests, puzzles, object/effect archetypes and assets. |
| Link to selected Flatplan node | Implemented for imported items | Stores selected imported item ID/name/file/link metadata into the selected structural node. |
| Getting Started / Missing Setup | Implemented | Presents shared Health output and routes missing initial setup responsibility back to Creation Guide. |
| Build Prep | Implemented as diagnostics presentation | Uses shared Health output and generates project follow-up data; it is not final Build Game packaging. |
| Import / backup export | Implemented | Imports project JSON/ZIP sections and exports a backup ZIP package. |
| Direct connected-project save | Not implemented | The active Save action writes browser draft state only and explicitly states direct project-folder saving is not connected. |
| Runtime route playtest | Not implemented | The current Stitcher playtest control is a placeholder alert rather than a verified runtime/playtest integration. |

## Current Implemented Interfaces

### Structural browser-draft state

The active state manager currently reads and writes the following browser localStorage records:

```text
artifex_project
artifex_logic
artifex_layout
artifex_registry
artifex_real_assets
```

These keys currently support Project Editor workspace recovery and browser-draft editing. They do not establish permanent authored storage for a connected project folder.

### Project package import and backup export

The active File menu exposes:

```text
Open / Import Project Files
Save Browser Draft Only
Export Backup ZIP
Create New Project in Creation Guide
```

Project Editor currently imports or exports package sections for:

```text
project.json
logic.json
layout.json
registry.json
library-links.json
input-map.json
health/latest-health-report.json
todos/project-manager-todos.json
scenes/scene-index.json
screens/screen-index.json
quests/quest-index.json
sidequests/sidequest-index.json
puzzles/puzzle-index.json
archetypes/object-index.json
archetypes/effect-index.json
assets/asset-index.json
```

The current import and ZIP backup interface is a real implemented exchange mechanism. It is not the planned normal connected-folder direct-save workflow.

### Imported library/index browsing and structural linking

The current Asset Browser recognises imported canonical indexes owned by other modules and groups them as:

```text
Quest Library
Side Quest Library
Scenes/Screens Library
Puzzle Library
Archetype Object Library
Archetype Effect Library
Asset Browser
```

When an imported item is selected, Project Editor can link that item's identifier, name, type, source owner and source file into the selected Flatplan node. This is Project Editor-owned structural reference authoring; it does not transfer ownership of the linked record into Project Editor.

The current browser reads imported index data. Reading the live indexes of the connected active project remains future integration work.

### Stitcher route configuration

The current Stitcher edits route and visual metadata for these structural route classes:

```text
simple
branch
quest-gated
puzzle-gated
item-gated
flag-condition
completed-state
```

It provides the presentational/form layer for gate identifiers, flag keys, required state, route colour and animated-flow display. Validation against live connected module records and genuine runtime preview remain later integration concerns.

### Shared Health and Build Prep presentation

Project Editor currently consumes the shared Health Guide in both its Getting Started/Missing Setup and Build Prep views. It can present missing setup, point Creation Guide-owned issues back to Creation Guide and generate project follow-up task data.

Project Editor's permanent boundary is presentation and structural validation: it must not become the author of missing Creation Guide, Scene Editor, Quest Builder, Puzzle Creator, Asset Library or Build Game output merely because a shared health check reports an issue.

## Current Compatibility and Transition Notes

The current live module is identified publicly as **Project Editor**, but several active source comments, UI strings, health scopes and the generated output filename still retain the older **Project Manager** terminology, particularly `todos/project-manager-todos.json`. These are active compatibility facts, not the intended user-facing module name. Any migration to Project Editor naming must be explicit and backward-compatible so older project packages can still be read where required.

The current default state contains populated Forever Bound demo/example nodes and `startScreenId: 'node_1'`. It is used only when no real project package has been loaded into Project Editor. It is not a Blank Starter Project output and does not supersede Creation Guide's canonical empty-starter rule that begins with `startScreenId: null`.

The current Project Editor Module menu links Effect Editor through `../effect-editor/`, whereas the controlled accepted Effect Editor route is protected as `artifex/apps/effect-editor/index2.html` until an approved later replacement exists. Explicit route alignment or verification remains implementation work in `2A`.

## Extraction from Earlier Project Editor Material

`artifex/apps/project-editor/docs/project-editor-real-split-plan.md` is implementation-planning evidence for moving the editor from a monolithic page into live focused modules. The current implementation has progressed beyond that plan to the verified `v0.1.32 CONTRACT` modular baseline. Its enduring ownership/baseline facts are captured here, and any still-live implementation work belongs in `2A` rather than the old split plan remaining a current authority.

After this specification is accepted and all still-live tasks are represented in `2A`, the older split-plan/status material is eligible for archive treatment as historical evidence.

## Remaining Work

All current and future Project Editor tasks are owned by `docs/artifex/2A-global-to-do.md`. This specification must not accumulate task checklists.