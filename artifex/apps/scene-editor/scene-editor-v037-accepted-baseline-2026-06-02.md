# Scene Editor v0.37 Accepted Baseline — 2 June 2026

## Accepted current-main baseline

The accepted Scene Editor baseline is now:

```text
Route: artifex/apps/scene-editor/index.html
Version: v0.37-control-state-inspector-retention
Implementation PR: #43
Merge commit: c1c15d672abd541b0377d8789712705f4e860450
```

This record supersedes status wording that treats `v0.34-live-acceptance-repair` as the current app or says the Scene Editor ownership consolidation still needs to be implemented.

## Stabilisation chain now delivered

| PR | Version | Accepted outcome |
|---:|---|---|
| #37 | `v0.35-owner-consolidation` | Consolidated Object Inspector, transform, movement and UI ownership in permanent modules after the v0.34 wrong-object acceptance failure. |
| #41 | `v0.36-selection-display-clear-selection` | Corrected the selected-object artwork display distortion by keeping selection controls overlaid rather than affecting layout; added Clear Selection beside the preview control. The user reviewed the live test build and confirmed it appeared correct before merge. |
| #43 | `v0.37-control-state-inspector-retention` | Added colour-only active-state feedback for Aspect Ratio Lock and retained Object Inspector scroll position while switching objects. Merged at the user's instruction after the requested adjustment removing the unnecessary ON label. |

## Accepted interpretation

```text
Scene Editor is no longer blocked by the v0.34 wrong-object ownership failure.
Scene Editor is no longer waiting for the v0.35 ownership consolidation pass.
Scene Editor v0.37 is the current accepted baseline for future scoped work.
```

## Next Scene Editor work

The next useful Scene Editor implementation pass is not another stabilisation overlay. It is project integration work, in this order:

1. Connect authored scenes to the active project's real scene files.
2. Display accurate project-file versus local-draft save status.
3. Place validated Object Creator and Effect Editor outputs through stable project references.
4. Later define Scene Events, Triggers and portal linking once saving and references are reliable.

## Scope note

This status record does not claim that connected-project scene saving, reusable object/effect placement or Scene Events are implemented. Those remain future work and require separate scoped passes.
