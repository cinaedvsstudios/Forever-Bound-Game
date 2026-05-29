# Artifex Documentation Index

This folder contains the planning documentation for Artifex as a reusable game-building system.

Artifex is not the Forever Bound editor. Forever Bound is a separate game that may later be referenced as an example of a finished project made with Artifex. Artifex itself should remain generic and reusable.

## Documents

- `01-core-vision.md` — the core idea, Artifex Adventures template, and overall direction.
- `02-module-architecture.md` — the main Artifex modules and how they relate to each other.
- `03-project-editor-flatplan.md` — Project Editor, Manifest, Flatplan, Flatplan Catalog, Stitcher, routes, depots, junctions, and map projection.
- `04-scene-editor.md` — visual scene/screen editing, title screens, UI layouts, object placement, basic asset use, old local JSON editor behaviour, and migration notes.
- `05-creation-guide.md` — wizard, milestones, checklist, timeline, project dashboard, project health checks, and task tracking.
- `06-object-library.md` — advanced reusable object definitions, archetypes, instances, characters, items, enemies, and props.
- `07-quest-builder.md` — quests, side quests, branches, flags, conditions, rewards, unlocks, and progression.
- `08-playtest-and-build.md` — playtesting, previewing scenes, testing routes/quests, and building/exporting the finished game.
- `09-terminology.md` — working terminology list, including synonyms and not-yet-locked terms.
- `10-naming-brainstorm.md` — naming research from publishing, game development, transport, and logistics.
- `11-portal-hub.md` — Artifex portal, wedge layout, centre hub, utilities wedge, and portal asset notes.
- `12-project-settings.md` — project profiles, active project selector, URLs, save paths, import/export settings, and autosave limitations.
- `13-effects-library.md` — CG Effects Library, reusable fog/sparks/magic/rain/smoke effects, effect JSON, and Scene Editor integration.
- `14-asset-library.md` — searchable asset library, tags, metadata, asset groups, character animation groups, and Scene Editor integration.
- `15-template-system.md` — Artifex templates, template manifest, placeholder game data, and template workflow.
- `16-dev-status-and-risks.md` — current repo/editor state, known problems, phase plan, risks, important files, and immediate priorities.
- `17-codex-prompts.md` — preserved Codex prompt material.
- `18-color-and-display-rules.md` — display frame, colour palette, and colour meaning reference.
- `19-project-file-contracts.md` — project file contracts, module integration rules, canonical IDs, package structure, and ownership matrix.
- `20-asset-intake-workflow.md` — simple creator-facing asset drop folders and promotion workflow from intake to final indexed project assets.

## Current Simplified Module List

1. Runtime Engine.
2. Scene Editor.
3. Project Editor.
4. Creation Guide.
5. Advanced Object Library.
6. Quest Builder.
7. Playtest.
8. Build Game.

## Working Principle

Artifex should provide a working template game, visual editing tools, structure tools, logic tools, and an export workflow. Users should mostly replace, duplicate, connect, and expand working examples rather than building an engine from nothing.