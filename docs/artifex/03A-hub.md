# Hub / Artifex Portal Specification

Status: Active module specification draft during documentation consolidation
Owning module: Hub / Artifex Portal
Active route: `artifex/index.html`
Current verified implementation baseline: `Artifex Hub V1.1.4`
Governing universal contract: `docs/artifex/01A-project-file-contracts.md`
Outstanding work source: `docs/artifex/02A-global-to-do.md`

## Purpose

The Hub / Artifex Portal is the front-door navigation and project-entry surface for the Artifex suite. It presents available authoring and output destinations and currently exposes a browser-local selected-project switcher so tools can be opened with active-project context.

This document owns permanent information unique to the Hub. It does not duplicate universal chrome, save, ID, path or asset rules from `1A`, and it does not contain the Hub backlog.

## Ownership Boundary

The Hub owns:

- its entry route and presentation of module destinations;
- Hub-only navigation labels, destination mapping and route-context handoff behaviour;
- its centre active-project selection and presentation interface while that interface is implemented within the Hub;
- presentation of unavailable or future destinations as placeholders.

The Hub must not:

- create or author scenes, screens, quests, puzzles, archetypes, assets, routes or build output;
- redefine the ownership of another Artifex module;
- treat the localStorage behaviour in the current implementation as the permanent connected-project source of truth;
- replace Creation Guide, connected-project-folder infrastructure or any confirmed shared active-project service.

## Active Baseline

The current implementation evidence is `artifex/index.html`, whose title is `Artifex Hub V1.1.4`.

The live baseline is a three-column landing page with a centre project switcher. It is not the earlier radial six-wedge Portal plan.

| Area | Current display label | Current destination or behaviour | Current classification |
|---|---|---|---|
| Project Tools | Creation Guide | `apps/creation-guide/?from=hub` | Implemented navigation. |
| Project Tools | Project Editor | `apps/project-editor/?from=hub` | Implemented navigation. |
| Project Tools | Scene Editor | `apps/scene-editor/?from=hub` | Implemented navigation. |
| Project Tools | Quest Builder | `apps/quest-builder/?from=hub` | Implemented navigation. |
| Libraries + Output | Object Creator | `apps/object-creator/?from=hub` | Implemented navigation; final displayed naming is reviewed in the Object Creator pass. |
| Libraries + Output | Effect Editor | `apps/effect-editor/index2.html?from=hub` | Implemented protected destination to the accepted Index2 baseline. |
| Libraries + Output | Puzzle / Asset Tools | `apps/puzzle-creator/?from=hub` | Implemented Puzzle Creator destination with a transitional/inaccurate Hub label. |
| Libraries + Output | Build Game | Button only; current click shows a future-output alert. | Placeholder, not an implemented route. |

## Current Active-Project Interface

At the current baseline, the Hub interface uses browser localStorage:

- `artifex.projectLibrary` stores the browser-saved project summaries shown in the selector;
- `artifex.activeProjectId` stores the selected project identifier;
- the **Change Project** dialog can set or clear that identifier and route the user to Creation Guide to create or manage projects;
- module links are patched with `from=hub`, optional `project=<active project id>`, and the current Hub cache/version query value.

These facts record the current implementation only. Browser-local state is workspace, draft or handoff state rather than permanent authored project truth. Any later move to a shared connected-project or active-project service is implementation work tracked in `2A`.

## Hub-Only Navigation and Presentation Rules

- The Hub is the user-facing entry page at `artifex/index.html`.
- The Hub may present an active-project selector or summary and pass selected-project context into module navigation.
- The Hub may present modules without implementing those modules' internal authoring behaviour.
- A destination presented as implemented must resolve to its current accepted app entry route.
- The Effect Editor destination must remain `artifex/apps/effect-editor/index2.html` until an approved later baseline replaces it.
- Hub labels must use official module names once each owning module specification settles them; **Project Editor** must not be reintroduced as **Project Manager**.
- A Hub label that collapses distinct owning modules, such as the current **Puzzle / Asset Tools** label routing into Puzzle Creator, is a transitional implementation issue and not permanent architecture.

## Interfaces and Dependencies

The current Hub consumes:

- browser-local selected-project summaries and selected-project ID;
- the accepted app entry routes and displayed module names established by owning module decisions.

The current Hub passes:

- `from=hub` route context;
- optional `project=<active project id>` route context;
- the current Hub cache/version query value.

The Hub does not write authored project data files or final Asset Library registration records.

## Extraction from the Earlier Portal Document

`docs/artifex/11-portal-hub.md` is source evidence for early Portal work and radial/wedge design ideas. Its old six-wedge mapping, decorative dial asset notes, future radial layout and former “centre hub later” wording do not describe the current V1.1.4 implementation and must not remain the active Hub specification.

Valid information transferred into this specification is limited to the enduring boundary: the Hub is Artifex's front door, it navigates to major tool destinations, **Project Editor** is the official structural editor name, and active-project selection at the Hub is presentation/handoff rather than authored project content.

After this specification is accepted and any remaining live work is retained in `2A`, `docs/artifex/11-portal-hub.md` is eligible for archive as historical evidence.

## Remaining Work

All current and future Hub tasks are owned by `docs/artifex/02A-global-to-do.md`. This specification must not accumulate task checklists.
