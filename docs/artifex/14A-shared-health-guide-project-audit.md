# Shared Health Guide / Project Audit Specification

Status: Active shared-service specification during documentation consolidation  
Owning service: Shared Health Guide / Project Audit  
Active route: no standalone app route verified yet; currently consumed through Project Editor Build Prep and Creation Guide Health UI  
Current verified implementation baseline: `artifex/shared/health-guide/health-checks.js` and `artifex/shared/health-guide/todo-output.js` on current `main`  
Known current callers: Project Editor Build Prep / Getting Started health presentation, Creation Guide local project-health panel  
Governing universal contract: `docs/artifex/1A-project-file-contracts.md`  
Related specifications: `11A-shared-connected-project-folder-service.md`, `12A-shared-active-project-service.md`, `13A-registered-content-service-picker.md`  
Outstanding work source: `docs/artifex/2A-global-to-do.md`

## Purpose

The Shared Health Guide / Project Audit service is the common diagnostic layer for Artifex projects.

It checks whether a connected project is structurally usable, whether required files and indexes exist, whether links resolve, whether routes are coherent, whether folder/save state is safe, and whether the project is ready for preview or build.

It reports problems and fix owners. It must not silently repair authored content.

## Ownership Boundary

Shared Health Guide owns:

- shared diagnostic check definitions;
- project readiness summaries;
- health-report schema and output shape;
- issue severity, status and summary classification;
- fix-owner assignment metadata;
- conversion of failed health checks into project to-do output;
- the project-audit view of folder, save, reference, route, setup and build-readiness problems;
- reporting whether a problem belongs to Creation Guide, Project Editor, Scene Editor, Quest Builder, Puzzle Creator, Asset Library, Object Creator, Effect Editor, Build Game or another shared service.

Shared Health Guide must not:

- author or rewrite module records;
- create missing scenes, quests, assets, puzzles, objects or effects;
- silently fix broken links;
- overwrite connected project files;
- replace module-owned validators where detailed semantic validation belongs to that module;
- become Build Game;
- treat a warning as permission to mutate the project;
- create a second human-maintained backlog outside `2A`.

## Current Verified Implementation

The current shared check implementation is:

```text
artifex/shared/health-guide/health-checks.js
```

It exposes:

```text
buildProjectSetupChecks(stateManagerOrState)
buildHealthSummary(checks)
createHealthReport({ stateManager, scope })
```

The current to-do conversion implementation is:

```text
artifex/shared/health-guide/todo-output.js
```

It exposes:

```text
createProjectManagerTodoOutput(healthReport)
downloadJSONFile(filename, value)
```

Current checks focus on Project Editor / project-structure readiness. They inspect manifest, start screen assignment and resolution, input map expectation, library links, Flatplan nodes, route resolution, layout records, route types, gated route conditions, scene/screen links and orphaned nodes.

This is a real implemented foundation, but it is not yet the complete project-wide audit system.

## Current Report Shape

The current shared health report uses:

```text
schemaVersion: artifex.healthReport.v1
scope
generatedAt
summary
checks[]
```

Each check may include:

```text
checkId
label
detail
pass
severity
owner
fixOwner
creationGuideAction
tags[]
```

The summary contains:

```text
total
passed
failed
hardFailures
warnings
needsCreationGuide
status
```

Current status can be:

```text
passed
warning
failed
```

A future expanded service may add more detailed machine-readable categories, but the current report shape must remain compatible where already consumed.

## Current Project To-Do Output

The current to-do generator converts failed checks into a machine-readable task output.

It currently emits:

```text
schemaVersion: artifex.todos.v1
scope: project-manager
generatedFrom: artifex/shared/health-guide/health-checks.js
generatedAt
healthReportScope
summary
tasks[]
```

The current export filename from Project Editor Build Prep is still:

```text
project-manager-todos.json
```

This is a compatibility fact, not the desired final name. New documentation should use **Project Editor**, while implementation migration must still recover or read legacy `project-manager` task files until deliberately replaced.

The intended project task output path is:

```text
todos/project-editor-todos.json
```

Older project packages may still contain:

```text
todos/project-manager-todos.json
```

Those must be treated as recoverable legacy data.

## Current Project Editor Integration

Project Editor Build Prep imports the shared health report and to-do output modules.

It renders a **Build Prep & Shared Health Guide** workspace that displays the shared checks, counts pass/warning/failure state, logs the report, and exports Project Manager to-dos.

Project Editor currently consumes Health as a presentation and task-output layer. It is not yet a complete connected-folder audit because Project Editor itself still needs direct connected-project file loading and saving.

## Current Creation Guide Integration

Creation Guide has its own local project-health panel.

It reports setup readiness for project identity, creator metadata, connected project folder, GitHub repo path, deployed URL, starter project structure, initial asset intake setup, active project saved, assignments, recommended starting media and cross-app project loading.

This panel is current Creation Guide implementation evidence. It should be moved toward shared Health Guide reuse over time so the suite does not maintain duplicate long-term health logic.

## Health Check Categories

Shared Health should ultimately support these project-audit categories:

```text
project identity and metadata
active project and connected-folder consistency
permission and save-state readiness
starter structure and required canonical files
typed index presence and schema validity
project-relative path validity
start screen and route graph validity
scene/screen reference validity
quest/sidequest reference validity
puzzle reference validity
object archetype reference validity
effect archetype reference validity
asset reference validity
portal and cross-app endpoint validity
input-map/action mapping validity
local-only draft warnings
external file changes and conflicts
duplicate IDs
unused records/assets
stale backups/build outputs
build readiness
```

Not every category is implemented yet. This list defines the service direction and boundary.

## Fix Ownership Rule

Health reports where a problem appears and who owns the fix.

Examples:

- Missing starter files are usually Creation Guide or shared folder/initializer issues.
- Broken Flatplan routes are Project Editor issues.
- A scene record missing from `scenes/` is a Scene Editor issue.
- A Quest block with a missing saved puzzle reference is a Quest Builder display problem, but supplying the missing puzzle record belongs to Puzzle Creator.
- A missing `asset_` registration belongs to Asset Library or the module-specific finalisation handoff that was supposed to register it.
- A missing generated sound asset belongs to Asset Library / Sound Library foundation, not to a parallel sound-archetype index.
- Build readiness failures may appear in Build Game, but the authored-content fix remains with the owning module.

Health must not collapse all fixes into Project Editor merely because Project Editor displays the audit.

## No Silent Repair Rule

Health may report, warn, block, create task output, and point to an owner.

Health must not silently:

- create records;
- delete records;
- rename IDs;
- rewrite links;
- overwrite files;
- promote assets;
- change routes;
- change module content;
- mark tasks done;
- reassign ownership without evidence.

Any repair action must be explicit, module-owned, reversible where possible, and safe against connected-folder conflicts.

## Relationship to Connected Project Folder Service

Health should use the shared connected-folder state and file readers where available.

It should report:

- no folder connected;
- permission required;
- unsupported direct folder access;
- save failed;
- local draft only;
- project file changed;
- conflict;
- connected folder/project mismatch;
- invalid project-relative paths;
- missing or unreadable required files.

Health must not duplicate the low-level folder service or store browser handles.

## Relationship to Active Project Service

Health should check that the selected active project and connected folder agree.

It should detect:

- selected project without a connected folder;
- connected folder whose `project.json` does not match selected project ID;
- stale browser project-library entries;
- apps showing demo/default data while an active project exists;
- local-only drafts belonging to another active project.

## Relationship to Registered Content Service

Health should reuse the same final-reference concepts as the registered-content reader.

It should reject or warn on permanent references to:

```text
intake/
artifex/assets-library/
blob:
data:
file:
http:
https:
absolute local paths
```

unless a future explicit reference-media rule allows that category in a safe way.

## Relationship to Build Game

Build Game is a consumer of Health results and may run stricter packaging validation.

Shared Health answers: "What is wrong or risky in the project?"

Build Game answers: "Can this project be packaged into a validated runtime build output?"

Build Game may block packaging on Health failures, but it must not become the authoring owner of those fixes.

## Relationship to Project Tasks

Health may generate project-specific task output under:

```text
todos/project-editor-todos.json
```

or migrate older:

```text
todos/project-manager-todos.json
```

Project-specific task files describe missing/broken content inside one connected project. They are not the same as `docs/artifex/2A-global-to-do.md`, which is the human-readable Artifex platform backlog.

## Current Gaps

Known gaps include:

- current shared checks are mainly Project Editor / setup / Flatplan oriented;
- Creation Guide still has separate local health logic;
- connected-folder save/conflict checks are not yet broadly implemented;
- registered content validation is not yet fully shared across all modules;
- reference usage indexing is not yet complete;
- Build Game validation is not yet implemented as a full packaging gate;
- Health output is not yet consistently written to `health/latest-health-report.json`;
- project task output still uses legacy Project Manager naming in current code;
- module-specific semantic validators are not yet consistently integrated.

## Source Classification

`artifex/shared/health-guide/health-checks.js` is the current shared health-check implementation authority.

`artifex/shared/health-guide/todo-output.js` is the current implementation authority for converting failed health checks into project task output.

`artifex/apps/project-editor/src/project-buildprep.js` is current Project Editor evidence that Build Prep consumes shared Health and exports project task output.

`artifex/apps/creation-guide/v1/src/project-health.js` is current Creation Guide evidence for setup/readiness health display that should later reuse shared checks.

`artifex/shared/todo-guide/README.md` and `all-apps-todos.json` are historical/current evidence for intended task scopes, Health responsibility and Build validation work. Their live tasks have been consolidated into `2A`.

## Required Future Work

The active backlog, not this specification, owns implementation tasks. The main known Health work is:

- expand shared health checks across all canonical project files and module indexes;
- integrate Creation Guide readiness checks with shared Health;
- integrate connected-folder permission/save/conflict state;
- integrate registered-content validation;
- integrate project reference index results;
- define `health/latest-health-report.json` writing and reading;
- migrate task output to Project Editor naming with legacy recovery;
- feed Build Game validation without making Build Game the authoring owner;
- display fix owner and next action consistently across apps.

## Remaining Work

All current and future Shared Health Guide / Project Audit work belongs in `docs/artifex/2A-global-to-do.md`. This specification must not become a task list.
