# Archived Shared Status and Handoff Records — 1 June 2026

## Purpose

This archive folder contains completed or superseded Artifex status/handoff records that previously sat beside the live shared to-do system.

The current live work authorities are now:

```text
artifex/shared/todo-guide/README.md
artifex/shared/todo-guide/all-apps-todos.json
```

Audit/decision evidence remains under:

```text
artifex/shared/todo-guide/audits/
```

The files in this folder are retained as historical evidence and detailed handover context only. They must not be treated as the current queue or as permission to start implementation.

## Moved records

| Former location | Reason archived | Current live replacement / retained decision |
|---|---|---|
| `artifex/shared/todo-guide/puzzle-creator-patch-consolidation-todo.md` | Explicitly marked completed; obsolete patch cleanup already completed and later archive pass recorded. | Dashboard/JSON record the Puzzle Creator V1.32 baseline and future UI/Secondary Light work; detailed active feature plan remains in `puzzle-creator-maze-labyrinth-update-steps.md`. |
| `artifex/shared/todo-guide/scene-editor-cleanup-handoff-2026-05-27.md` | Older Scene Editor cleanup handoff superseded by later acceptance failure/audit decisions. | Dashboard/JSON record Scene Editor as blocked pending selected-object ownership repair. |
| `artifex/shared/todo-guide/scene-editor-v032-controls-resize-search-handoff-2026-05-29.md` | Superseded version-specific handoff. | Scene Editor blocker and required repair are recorded in the master audit and current queue. |
| `artifex/shared/todo-guide/scene-editor-runtime-module-cleanup-handoff-2026-05-29.md` | Completed runtime-module cleanup handoff. | Current queue retains only still-required Scene Editor repair work. |
| `artifex/shared/todo-guide/scene-editor-v033-inspector-controls-repair-handoff-2026-05-30.md` | Superseded by v0.34 acceptance findings and master audit. | Current queue records the surviving selected-object ownership blocker and manual acceptance need. |
| `artifex/shared/todo-guide/scene-editor-v034-live-acceptance-repair-handoff-2026-05-30.md` | Historical implementation/acceptance handoff; its current blocker conclusion has been transferred. | Current queue and master audit govern future Scene Editor repair; this file remains available here for detailed historical acceptance context. |
| `artifex/shared/todo-guide/effect-editor-handoff-2026-05-27.md` | Superseded by the accepted index2 route decision and PR #25 Hub cutover. | `audits/2026-06-01-effect-editor-route-decision-audit.md` and the live queue record accepted index2 baseline and the three parity items. |

## Files deliberately not archived in this pass

These still contain current supporting detail not fully replaced by the compact live task records:

```text
artifex/shared/todo-guide/puzzle-creator-maze-labyrinth-update-steps.md
artifex/shared/todo-guide/global-portal-endpoint-registry-design-2026-05-29.md
artifex/apps/quest-builder/docs/todo.md
artifex/apps/archetype-object-creator/docs/todo.md
artifex/apps/archetype-object-creator/docs/current-state-v1.35-review.md
artifex/apps/effect-editor/docs/compare-versions.md
artifex/apps/effect-editor/docs/PHASE_2_UI_CLEANUP.md
artifex/apps/scene-editor/scene-editor-core-split-todos.json
```

They may be reviewed for later archive only after their useful design or acceptance detail is either complete or safely extracted.
