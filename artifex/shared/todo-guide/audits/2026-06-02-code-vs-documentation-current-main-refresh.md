# Current-Main Code Versus Documentation Refresh Audit — 2 June 2026

## Status and scope

This is a documentation-only verification record against GitHub `main` at:

```text
81c7a6df28fa6f0d57b7033076a7ec28c2ca34d7
```

It corrects active planning/status records where merged runtime work had advanced beyond earlier audits. It does not modify app runtime, approve unmerged work, claim manual browser acceptance where none is recorded, or change save/schema/integration contracts.

This refresh deliberately does **not** edit `artifex/shared/todo-guide/audits/2026-06-01-current-main-baseline-matrix.md`, because open Archetype Object Creator PR #38 also changes that shared matrix while Object Creator work remains under review. The matrix should receive a later conflict-free refresh after that active PR is resolved.

## Verification sources checked

```text
GitHub main commit: 81c7a6df28fa6f0d57b7033076a7ec28c2ca34d7
artifex/apps/scene-editor/index.html
artifex/apps/effect-editor/index2.html
artifex/apps/puzzle-creator/index.html
artifex/apps/puzzle-creator/README.md
artifex/shared/todo-guide/puzzle-creator-maze-labyrinth-update-steps.md
artifex/shared/todo-guide/audits/2026-06-01-current-main-baseline-matrix.md
artifex/shared/todo-guide/audits/2026-06-01-master-rules-compliance-and-stability-audit.md
docs/artifex/24-stabilisation-cleanup-and-ui-resumption-plan.md
PRs #25, #27–#38 and their recorded review/status data
```

## Confirmed current-main changes that were not consistently reflected in documentation

### Scene Editor — implementation merged; manual acceptance remains outstanding

Earlier records correctly documented that `v0.34-live-acceptance-repair` failed manual acceptance and required Object Inspector / transform ownership consolidation. That implementation has since been completed and merged through PR #37.

Confirmed from current `main`:

```text
Active entry point: artifex/apps/scene-editor/index.html
Visible/cache version: v0.35-owner-consolidation
Merged PR: #37 — Consolidate Scene Editor object, movement and UI ownership
Merge commit: d759ae7412779de5689eb202ce9024829af6b58d
```

Confirmed implementation outcome recorded by PR #37 and visible in the active load chain:

```text
- Renderer owns permanent inspector/card structure.
- Transform controls own rotation, resize, scale, Wrap Bounding Box, Aspect Ratio Lock and Border binding.
- Stage drag owns move-handle drag, middle-mouse pan, X/Y drag sync and offscreen range.
- Layer controls are reduced to layer ownership.
- Slider UI no longer owns a separate direct transform mutation route.
- scene-editor-aspect-controls.js, scene-editor-card-controller.js and scene-editor-offscreen-placement.js are no longer loaded by index.html.
- scene-editor-object-states.css is loaded for permanent Border display state.
```

Important remaining gate:

```text
No post-merge deployed manual browser acceptance result was found in the checked records.
Scene Editor must therefore be classified as: implementation merged, acceptance pending.
It must not be described either as still awaiting implementation or as fully accepted/stable.
```

Required acceptance remains: selected ball/box isolation; Wrap/Aspect correctness on the rendered stage; Border toggle isolation; layer recalculation persistence; move/offscreen/pan; asset picker, preview, menu, import and JSON download; no duplicate controls or console errors.

### Effect Editor — accepted Index2 baseline advanced beyond the original route-decision audit

The original route-decision audit correctly selected `index2.html` while it was `INDEX2-CLEAN-0.2.3` and limited the first Hub cutover to PR #25. Later accepted work is now present on `main` and supersedes the old statement that the parity features were still missing.

Confirmed current `main` state:

```text
Accepted active route: artifex/apps/effect-editor/index2.html
Hub route: artifex/apps/effect-editor/index2.html?from=hub
Visible/cache version: INDEX2-CLEAN-0.2.6
```

Merged work after route selection:

```text
#27  Ported rotation-direction modes, Orbital Force and ALL CAPS text control.
#28  Repaired text-layer/layer-delete failures; later layout/text-default parts corrected by #29.
#29  Restored user-required panel placement and diagnostics behaviour.
#30  Repaired missing finite helper for Dynamics/Orbital Force sync.
#31  Repaired missing setText helper in Dynamics controls.
#32  Corrected ARTIFEX rune/header alignment and emitter-control mapping.
#33  Restored the existing Brush / Shape Library and advanced the visible label to 0.2.6.
#34  Recorded Effect Editor backlog additions.
#35  Recorded confirmed reference examples and My Settings/pinned-control future work.
#36  Updated the baseline matrix for the accepted Effect Editor Index2 state.
```

The accepted remaining Effect Editor work is now feature/save/polish backlog rather than route ambiguity or missing parity mapping:

```text
- connected-project save/status and canonical effect-index integration;
- Effect Library browser with thumbnails/previews;
- emission guide overlays;
- additional real FX engines and preset-quality work;
- My Settings/pinned-controls restoration;
- later technical cleanup of unused legacy/emergency debt only if separately scoped.
```

### Puzzle Creator — V1.32 and archive cleanup already recorded; one README description is stale

Confirmed current `main` state:

```text
Active entry point: artifex/apps/puzzle-creator/index.html
Visible version: V1.32
Active loader retained: src/js/engines/maze-labyrinth-consolidation-loader.js?v=1.32
PR #24 archive-only cleanup merged: maze-v109-controls.js and maze-v110-fixes.js archived.
```

The detailed Maze/Labyrinth update record already describes V1.32 approval, permanent named modules and implemented Scatter placement modes. The app README still says `Current Live V1.30 State`; that wording is stale and should be corrected by the currently running Puzzle Creator documentation/baseline pass rather than this parallel documentation refresh, to avoid overlapping that work.

### Archetype Object Creator — do not mark V1.36 complete

Confirmed current status:

```text
Current main remains documented at V1.35/unverified.
PR #38 proposes V1.36 and is open, not merged.
```

Review findings on PR #38 include one P1 failure affecting promoted gameplay sprites and Finish / Mark Object Ready, plus P2 findings affecting generated sound-row persistence and preservation of existing playback/trigger fields. No current-main document should state that V1.36 has been accepted or delivered unless those issues are resolved and the PR is later merged/accepted.

## Updated practical status table

| Surface | Code status on current `main` | Correct documentation interpretation now |
|---|---|---|
| Effect Editor | Accepted Index2 route at `INDEX2-CLEAN-0.2.6`; PRs #25 and #27–#36 merged | Usable accepted baseline with future save/library/engine/polish backlog; no route ambiguity blocker. |
| Scene Editor | `v0.35-owner-consolidation` merged through PR #37 | Required ownership implementation delivered; deployed manual acceptance still pending. |
| Puzzle Creator | V1.32 live; archive-only PR #24 merged | Suitable for current read-only/manual baseline check; do not reopen old patch stack. |
| Archetype Object Creator | V1.35 remains on `main`; PR #38 open | Blocked/in review until V1.36 issues are repaired and later accepted. |
| Project Editor | Archive-only PR #22 merged; functional/save work still later | Continue current-main-only verification; do not merge old PR #9 as-is. |
| Creation Guide | No accepted replacement for wrapper/contract debt | Continue focused future verification; do not merge old PR #20. |
| Quest Builder | Archive-only PR #23 merged; later integration work remains | No current emergency; later contract/save/terminology checks remain. |

## Documents updated by this refresh

```text
artifex/shared/todo-guide/audits/2026-06-01-master-rules-compliance-and-stability-audit.md
docs/artifex/24-stabilisation-cleanup-and-ui-resumption-plan.md
artifex/shared/todo-guide/audits/2026-06-01-effect-editor-route-decision-audit.md
```

## Documents deliberately not changed in this pass

```text
artifex/shared/todo-guide/audits/2026-06-01-current-main-baseline-matrix.md
  Reason: also modified by active Object Creator PR #38; update later without conflict.

artifex/apps/puzzle-creator/README.md
  Reason: stale V1.30 wording identified, but a parallel Puzzle Creator baseline task is currently running.

Archetype Object Creator documentation and shared save/asset/sound contract docs
  Reason: active PR #38 owns those proposed changes and remains under review.
```

## Next safe actions

```text
1. Complete and review the running Puzzle Creator baseline/documentation result.
2. Repair and review Object Creator PR #38; do not merge while its recorded P1/P2 findings remain.
3. Run the Scene Editor deployed manual acceptance checklist against v0.35-owner-consolidation.
4. After active Object Creator work no longer conflicts, refresh the baseline matrix so Scene Editor is no longer shown as awaiting implementation.
```
