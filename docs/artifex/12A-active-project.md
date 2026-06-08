# Shared Active Project Service Specification

Status: Active shared-service specification during documentation consolidation  
Owning service: Shared Active Project Service  
Active route: no standalone app route; currently implemented as shared browser/client infrastructure plus Hub and Creation Guide localStorage workflows  
Current verified implementation baseline: `artifex/shared/active-project/active-project-client.js` version `1.0.0`, Hub V1.1.4 active-project selector, and Creation Guide V1.1.12 project-library/project-flow logic  
Governing universal contract: `docs/artifex/01A-project-file-contracts.md`  
Related service specification: `docs/artifex/11A-connected-project-folder.md`  
Outstanding work source: `docs/artifex/02A-global-to-do.md`

## Purpose

The Shared Active Project Service identifies which Artifex project the suite should treat as currently selected.

It is the cross-app selection layer that tells Hub, Creation Guide, Project Editor, Scene Editor, Quest Builder, Puzzle Creator, Archetype Object Creator, Effect Editor, Asset Library, Health, Build Game and Runtime/Playtest which project should be opened.

It is not the same thing as the connected project folder. It currently stores and exposes browser-local project metadata and the selected project ID. The connected project folder service stores and re-authorises the browser folder handle. Authoring modules still need to load and save their own real project files from the connected project folder.

## Ownership Boundary

The Shared Active Project Service owns:

- the active project ID used across Artifex apps;
- the browser-local project library used to list known projects in the current browser;
- the shared keys currently used for cross-app active-project selection;
- resolving an active project from URL query parameters or remembered browser state;
- exposing current active-project metadata to apps;
- dispatching the ready event that tells an app the active-project client has initialised;
- showing lightweight active-project context where the shared client is loaded;
- the rule that active-project selection is only selection/context, not authored project data.

The service must not:

- author project content;
- create starter files or folder structure;
- own the writable project folder handle;
- decide the schema of module-owned files;
- validate all project content;
- silently switch projects while a module has unsaved local-only work;
- make localStorage the permanent source of truth for authored project files;
- make default/demo data appear to be the active connected project;
- overwrite a module's current draft because another project was selected.

## Current Verified Implementation

The current shared client is:

```text
artifex/shared/active-project/active-project-client.js
```

It exposes:

```text
window.ArtifexActiveProject
```

The shared localStorage keys are:

```text
artifex.projectLibrary
artifex.activeProjectId
```

The shared client currently:

- reads `artifex.projectLibrary`;
- reads `artifex.activeProjectId`;
- optionally reads the `project` URL query parameter;
- if the URL project ID exists in the browser project library, writes that value into `artifex.activeProjectId`;
- exposes the resolved project, project ID, project name and project library through `window.ArtifexActiveProject`;
- provides a `refresh()` method;
- dispatches `artifex:active-project-ready`;
- renders a small active-project pill;
- links the user back to Creation Guide when no project is selected or when they choose to manage/open a project.

This is useful current selection infrastructure. It is not yet a complete project-loading service.

## Current Hub Integration

Hub V1.1.4 reads the same keys:

```text
artifex.projectLibrary
artifex.activeProjectId
```

Hub displays the currently selected project, opens a Change Active Project dialog, lists projects stored in the browser library, writes the selected project ID back to `artifex.activeProjectId`, and patches tool links with the selected `project` query parameter.

Hub is therefore a current active-project selector UI.

Hub does not create the connected project folder handle, initialise project files, or load module-owned project data. Its selection state is browser context.

## Current Creation Guide Integration

Creation Guide currently creates and updates browser project-library entries.

The older base module logic includes:

```text
readProjectLibrary()
writeProjectLibrary()
saveProjectToLibrary()
loadActiveProject()
```

The current project-flow layer also uses:

```text
artifex.projectLibrary
artifex.activeProjectId
```

It allows New / Open project flow, creates browser-local project metadata, sets `artifex.activeProjectId`, and updates `lastOpenedAt`.

Creation Guide is currently both the project onboarding module and the main creator/updater of browser project-library entries. That does not mean Creation Guide owns the Shared Active Project Service permanently. It is the current caller/manager UI until the service is formalised.

## Current Scene Editor Integration

Scene Editor currently loads:

```text
../../shared/active-project/active-project-client.js
```

This gives Scene Editor visible active-project context.

It does not yet mean Scene Editor loads the active project's real scene/screen files or saves directly into the connected project folder. That remains module integration work.

## Active Project Versus Connected Folder

Active-project selection and connected-folder access are related but separate.

The active project tells Artifex which project is selected.

The connected project folder service tells Artifex whether the browser currently has a writable folder handle and permission.

A project can be selected in browser localStorage while the real project folder is not connected, not authorised, moved, unavailable, or different from the project metadata. Modules must not assume that active-project selection alone proves that connected project files are available.

Future integration should bind these concepts safely, for example:

```text
selected project ID
known project metadata
connected folder handle
folder permission status
project.json identity inside that folder
module-owned indexes/files
save-state and conflict status
```

The active project service owns selection identity and context. The connected folder service owns folder access. Each module owns loading and saving its own files.

## Browser Project Library Record Role

The browser project library currently stores summary metadata such as:

```text
projectId
projectName
status
version
creatorName
localProjectPath
onlineProjectPath
deployedUrl
useGithub
githubUsername
enabledModules
gates
createdAt
updatedAt
lastOpenedAt
```

This browser record is useful for navigation, project lists, and onboarding context.

It must not be treated as the canonical project file. The real project source of truth is the connected project folder and canonical project files such as `project.json`, `logic.json`, `layout.json`, indexes and module-owned records.

## URL Project Parameter Contract

The shared client currently supports a URL parameter:

```text
?project=<project-id>
```

If the ID exists in `artifex.projectLibrary`, the client sets it as the active project. Hub also patches module links to include the active project query parameter.

This is a convenience for cross-app navigation. It must not bypass save guards, permission checks, or connected-folder validation.

If the URL project ID is unknown, the client should not invent a project record from the URL alone.

## Events and Public API

The current shared client dispatches:

```text
artifex:active-project-ready
```

and exposes:

```text
window.ArtifexActiveProject.version
window.ArtifexActiveProject.libraryKey
window.ArtifexActiveProject.activeKey
window.ArtifexActiveProject.project
window.ArtifexActiveProject.projectId
window.ArtifexActiveProject.projectName
window.ArtifexActiveProject.library
window.ArtifexActiveProject.refresh()
```

Future service hardening may add explicit methods for selecting, clearing, validating, or refreshing the active project. Until then, existing direct localStorage writers in Hub and Creation Guide remain compatibility behaviour, not the ideal final service API.

## Relationship to Module Loading

Every authoring app should eventually follow this pattern:

1. Resolve active project context.
2. Confirm the connected project folder and permission status.
3. Load its owned canonical files and indexes from the connected project folder.
4. Clearly report whether it is showing connected project content, local draft fallback, demo/default content, or imported backup data.
5. Protect unsaved local-only work before switching project or navigating away.
6. Save only its owned files through the connected-folder service.

Apps must not silently show unrelated demo/default data when a real active project exists.

Apps must not write to the active project unless the connected folder is available and the user has granted permission.

## Relationship to Hub

Hub may remain the main project switching surface.

Hub owns project selection UI presentation, but the Shared Active Project Service owns the shared selection contract. If Hub changes how it stores or selects projects, the shared client and all modules must remain compatible.

Hub should not become the owner of project files or connected-folder writes.

## Relationship to Creation Guide

Creation Guide may remain the main project creation/registration surface.

Creation Guide can create browser project-library entries, set the active project, connect/re-authorise a folder through the folder service, and initialise starter structure.

Creation Guide should not remain the only place where active project state can be understood by apps. The shared service must expose enough state for all apps to know whether they are connected to the correct project.

## Relationship to Connected Project Folder Service

The active project service and connected folder service must eventually cooperate.

Required future checks include:

- whether the remembered folder belongs to the selected project;
- whether `project.json` inside the folder matches the selected `projectId`;
- whether the folder permission is current;
- whether project files exist and are valid;
- whether the selected browser project has no authorised folder;
- whether selecting a different project should clear or re-check the folder handle;
- whether unsaved drafts belong to another project and need a warning.

The active project service should not duplicate low-level file access. The connected folder service should not become the project selector UI.

## Relationship to Health and Build

Health should report active-project/folder mismatch, missing connected folder, missing project metadata, and modules showing local-only or demo/default content when a real active project is expected.

Build Game should never package from browser project-library metadata alone. It must read canonical project files and registered records from the connected project folder or an explicit build input package.

## Current Gaps

The current active project system is useful but incomplete.

Known gaps include:

- active project state is still mostly browser localStorage keys, not a formal service with a complete API;
- Hub and Creation Guide both write the project library directly;
- only some apps load the shared client;
- loading the shared client often provides visible context only, not real connected-file loading;
- active-project selection is not yet reliably bound to the connected folder handle;
- project identity in `project.json` is not yet checked against the selected browser project;
- unsaved local drafts are not yet consistently protected before project switching;
- stale browser project-library entries are not cleaned or reconciled;
- multiple browser/device scenarios are not solved;
- module links can carry `?project=...`, but modules must still validate and load their owned files safely;
- there is no complete shared API yet for selecting, clearing, validating, or subscribing to project changes beyond the current ready event and refresh method.

## Source Classification

`artifex/shared/active-project/active-project-client.js` is the current shared client implementation authority for resolving and exposing active-project browser context.

`artifex/index.html` is current Hub evidence for selecting, clearing, displaying and passing active project IDs through links.

`artifex/apps/creation-guide/v1/src/project-flow.js` and `artifex/apps/creation-guide/v1/src/module-app.js` are current Creation Guide evidence for creating/opening browser project records and setting the active project.

`artifex/apps/scene-editor/index.html` is current evidence that at least one authoring app loads the shared active-project client for visible active-project context.

Older Creation Guide README material still describes V1.1.10 limitations and target workflow. It is useful historical evidence but is superseded for current Creation Guide implementation by the already extracted Creation Guide specification and current V1.1.12 implementation.

`artifex/shared/todo-guide/all-apps-todos.json` contains current outstanding platform work for active-project runtime integration. That work belongs in `02A`, not in this specification.

## Required Future Work

The active backlog, not this specification, owns implementation tasks. The main known work is:

- formalise a stable Shared Active Project Service API beyond direct localStorage access;
- make all apps resolve the active project consistently;
- bind selected project context safely to the connected folder service;
- validate selected project metadata against `project.json` in the connected folder;
- prevent modules from silently showing unrelated demo/default data when an active project exists;
- add project-switch guards when local-only unsaved work exists;
- standardise visible active-project and save/folder state display across apps;
- reconcile stale or missing project-library entries;
- define how active project state behaves across browser/device boundaries;
- ensure Health and Build validate active-project/folder/file consistency.

## Remaining Work

All current and future implementation work belongs in `docs/artifex/02A-global-to-do.md`. This specification must not become a task list.
