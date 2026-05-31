# Phase 0 Change Timeline Audit — 31 May 2026

## Status and scope

This record preserves the output of the read-only Phase 0 Codex audit reviewed on 1 June 2026. It is a status record only. It does not approve merges, branch reuse, runtime fixes, file moves, archive operations or implementation work.

Audit reporting window:

```text
2026-05-31 00:00 Europe/Berlin through 2026-05-31 23:59 Europe/Berlin
```

Authority rules applied during the audit:

```text
- Current main is the only implementation baseline.
- Open PRs and branches are evidence only unless explicitly approved later.
- PR #20 must not be merged, manually resolved, or used as a development base.
- Scene Editor v0.35 exploratory branches must not be merged or cherry-picked as shortcuts.
```

## Plain-English outcome

31 May 2026 was a high-volume integration day. A large mixed merge brought runtime, shared-service, documentation and asset changes into `main` across many Artifex areas before later corrective records identified that some of the resulting app states were unverified or had failed manual acceptance.

Important consequence: useful work is present on `main`, but further UI implementation should not proceed by blindly building on old PRs or layering more fixes. The next work must use current `main` and first inventory archive candidates and hotfix/wrapper ownership.

## Commits and changes confirmed on `main`

| Berlin time | Commit | Title | Area affected | Classification | Current interpretation |
|---|---|---|---|---|---|
| 21:56:20 | `a7688ae19739` | `pics` | `artifex/foreverbound/intake/capra01.webp` through `capra07.webp` | Asset | Approval/checkpoint unclear from repo evidence. |
| 21:56:20 | `4829ef4d7408` | Merge branch `main` | Archetype Object Creator, Creation Guide, Effect Editor index2, Puzzle Creator, Quest Builder, Scene Editor, Sound Generator, shared project-folder/registered-content/todo docs and Artifex docs | Merge / mixed runtime / docs / shared service | Large mixed merge; several included app states later required corrective status records. |
| 23:20:44 | `8be7e412c992` | docs: record PR20 stop and current-main scan plan | `docs/artifex/23-current-main-scan-and-pr20-recovery.md` | Documentation | Corrective checkpoint. |
| 23:21:18 | `69e6e258f7b1` | docs: link current-main scan and PR20 recovery handover | `docs/artifex/00-index.md` | Documentation | Corrective checkpoint. |
| 23:26:38 | `d0620ba954fe` | Approve V1.32 and record secondary light coverage enhancement | Puzzle Creator todo/status document | Documentation | Appears to record Puzzle Creator acceptance; still requires quick baseline before new UI work. |
| 23:28:37 | `12a12708578e` | Document unverified Object Creator V1.35 state and required audit | Archetype Object Creator current-state review | Documentation / corrective | Records V1.35 as unverified. |
| 23:31:18 | `63b93851005f` | Remove obsolete invalid Artifex debug workflow | `.github/workflows/artifex-wire-debug-live.yml` | Workflow | Corrective removal of obsolete invalid workflow. |
| 23:31:29 | `203a5d5fe96b` | Update Object Creator README with current unverified V1.35 state | Archetype Object Creator README | Documentation / corrective | Records unverified status. |
| 23:33:22 | `eba32189b4a3` | Mark old Object Creator apply instructions as historical and point to current review | Archetype Object Creator apply instructions | Documentation / corrective | Historical correction. |
| 23:35:56 | `a4bd6e5f516d` | Correct Object Creator todo status after unverified V1.35 integration | Archetype Object Creator todo | Documentation / corrective | Status correction. |
| 23:39:18 | `657c0b7e384f` | Update Object Library note for active Object Creator and V1.35 audit | Object Library docs | Documentation / corrective | Status correction. |
| 23:44:40 | `d5047b31fea8` / PR #21 | Add Scene Editor v0.34 failed acceptance and consolidation plan | Scene Editor failure/consolidation document | Documentation / corrective | Records failed acceptance and required consolidation path. |

## Important runtime work included by the large merge

The audit reported that the 21:56 merge included same-day work across:

```text
- Archetype Object Creator V1.35 runtime and documentation.
- Creation Guide V1.1.12 runtime helpers.
- Effect Editor index2 clean integration files.
- Puzzle Creator V1.31/V1.32 maze/scatter runtime and documentation.
- Quest Builder V1.2.12 connected-project, puzzle handoff and dialogue work.
- Scene Editor v0.34 acceptance-repair runtime.
- Shared Sound Generator V1.00.
- Shared project-folder and registered-content utilities.
- Global Artifex documentation and todo records.
```

The operational conclusion is that runtime integration reached `main` before later corrective documents marked portions of it as failed or unverified.

## Pull requests created or updated during the window

| PR | Branch | What it attempted | Reached `main`? | Phase 0 classification | Handling rule |
|---|---|---|---:|---|---|
| #19 | `scene-editor-v034-live-acceptance-repair-direct` | Scene Editor v0.34 live acceptance repairs for inspector, wrap, pan and project status | Yes | Merged, but failed manual acceptance | Treat live runtime as blocked until ownership consolidation is accepted. |
| #20 | `codex/clean-up-creation-guide-and-project-editor` | Clean Creation Guide runtime and explicit Project Editor composition | No | Unsafe / abandoned as a merge target | Do not merge or use as base; recreate only approved ideas from current `main`. |
| #21 | `docs/scene-editor-v034-failed-acceptance-plan` | Scene Editor failed-acceptance and consolidation record | Yes | Corrective documentation / merged | Retain as current planning evidence. |

## Changes still only in branches or PRs

### PR #20 — Creation Guide / Project Editor cleanup branch

| Berlin time | Commit | Branch | Title | Reached `main`? | Status |
|---|---|---|---|---:|---|
| 12:05:04 | `d403e16b964b` | `codex/clean-up-creation-guide-and-project-editor` | Clean Artifex app runtime composition | No | Experimental; unsafe to merge. |
| 12:27:52 | `9ea98bb00558` | `codex/clean-up-creation-guide-and-project-editor` | Align Creation Guide export with starter contract | No | Ideas may be revisited; branch is superseded by current-main drift. |

### Scene Editor v0.35 exploratory target-fix branch

| Berlin time | Commit | Branch | Title | Reached `main`? | Status |
|---|---|---|---|---:|---|
| 20:14:58 | `097f50ff66fc` | `scene-editor-v035-selection-target-fix` | Fix per-object aspect targeting in Scene Editor | No | Experimental / do not reuse directly. |
| 21:24:56 | `f98c9fa9bc05` | `scene-editor-v035-selection-target-fix` | Bind inspector edits to the displayed object | No | Experimental / do not reuse directly. |
| 21:28:13 | `868136ae066f` | `scene-editor-v035-selection-target-fix` | Correct selection-bound control handlers | No | Experimental / do not reuse directly. |
| 21:33:57 | `77a51382bec4` | `scene-editor-v035-selection-target-fix` | Keep visual adjustments pinned to shown inspector object | No | Experimental / do not reuse directly. |
| 21:38:50 | `e26617bb7c27` | `scene-editor-v035-selection-target-fix` | Use stable inspected object identity for aspect controls | No | Experimental / do not reuse directly. |

### Scene Editor v0.35 exploratory inspector-target branch

| Berlin time | Commit | Branch | Title | Reached `main`? | Status |
|---|---|---|---|---:|---|
| 22:08:02 | `210610abd76a` | `scene-editor-v035-inspector-target-core-fix` | Scope aspect and wrap controls to selected object | No | Experimental / do not reuse directly. |
| 22:11:06 | `d44cdd00fe57` | `scene-editor-v035-inspector-target-core-fix` | Advance Scene Editor target fix version | No | Experimental / do not reuse directly. |
| 22:13:46 | `e9df760ea8cb` | `scene-editor-v035-inspector-target-core-fix` | Publish Scene Editor v0.35 cache marker | No | Experimental / do not reuse directly. |

## Open-PR classification locked after Phase 0

| PR | Classification | Why | Next handling |
|---|---|---|---|
| PR #9 — Project Manager/Project Editor task workspace branch | Requires diff-based salvage review | It is open and stale; Project Editor, shared todos and locked naming changed after it was created. | Compare only later; do not merge as-is. Recreate any accepted missing work from current `main`. |
| PR #17 — Effect Editor index2 v0.2.3 branch | Historical evidence only | Much of the clean index2 route appears present on `main`, while the primary Effect Editor route still carries emergency/rescue modules. | Do not merge; use only to understand intended index2 direction. |
| PR #20 — Creation Guide/Project Editor cleanup branch | Unsafe / abandoned | Official recovery record says it is based on older state and must not be merged or used as a base. | Do not merge; approved ideas must be recreated from fresh `main`. |

## Locked Phase 0 conclusion

Phase 0 confirms that the repo requires controlled stabilisation rather than more broad implementation. In particular:

```text
- Scene Editor has a confirmed live correctness blocker and is first priority for later app-specific consolidation.
- Archetype Object Creator V1.35 is present on main but documented as unverified.
- Effect Editor has primary-route versus index2 baseline ambiguity.
- Project Editor and Creation Guide require careful current-main review rather than old-PR merging.
- The next active step is a read-only archive-and-hotfix inventory, not code fixes or file moves.
```
