# Artifex Shared To-Do Guide — Live Work Dashboard

## Purpose

This is the single human-readable live status and work dashboard for Artifex platform and app tasks. Its machine-readable companion is:

```text
artifex/shared/todo-guide/all-apps-todos.json
```

Historical handoffs, completed stabilisation reports and old planning files may explain why a decision was made, but they are **not** live work queues. App-local design/reference documents may remain available while their specialist detail is still useful, but current action status must be recorded here and in `all-apps-todos.json`.

## How tasks are tracked

| Scope | What it tracks | Current authority |
|---|---|---|
| All-app platform work | Shared services, contracts, menu/branding rules, project-folder adoption and cross-app integration. | This dashboard + `all-apps-todos.json`. |
| Specific-app work | Current actionable work for one editor/tool. | This dashboard + `all-apps-todos.json`; supporting app docs may hold detailed design/acceptance material only. |
| Connected game-project validation | Broken/missing authored content inside one selected project. | Future generated project task file under `<project-root>/todos/`; not a replacement for this platform queue. |

Preferred future project-level task filename:

```text
todos/project-editor-todos.json
```

Legacy stored paths or code identifiers using `project-manager` must be migrated compatibly rather than treated as a second official user-facing app name.

## Required contract documents before implementation

Use the relevant current specifications before changing an app:

```text
docs/artifex/18-color-and-display-rules.md
docs/artifex/19-project-file-contracts.md
docs/artifex/19a-project-starter-file-schemas.md       when project/starter JSON is involved
docs/artifex/20-asset-intake-workflow.md               when assets/intake are involved
docs/artifex/21-template-game-project-contract.md       when reference-project work is involved
docs/artifex/22-sound-archetype-generator.md            when sound/generator work is involved
docs/artifex/07a-quest-builder-structured-authoring.md  when Quest authoring is involved
docs/artifex/07b-puzzle-creator-quest-integration.md    when Quest/Puzzle handoff is involved
artifex/shared/todo-guide/README.md
artifex/shared/todo-guide/all-apps-todos.json
```

## Locked decisions

```text
- Current main is the only implementation baseline unless the user explicitly approves otherwise.
- Project Editor is the locked user-facing name; historical project-manager identifiers are migration/compatibility data only.
- Connected project-folder files are the intended authored source of truth where the app has a verified write path; localStorage is recovery/draft state rather than proof of project saving.
- ZIP/download export is backup/fallback unless an app is expressly still operating in import/export-only mode.
- Creation Guide owns Blank Starter Project creation.
- Template Game is a populated reference project; Artifacts Adventures is later real production work; they are not the same thing.
- Quest Builder owns Quest progression and Quest-scoped dialogue/Capra content; Puzzle Creator owns self-contained puzzle definitions linked by stable puzzleId references.
- Procedural synth sounds are final audio assets registered through assets/audio/sfx/ and assets/asset-index.json, not a new archetypes/sounds system.
- Audit/research tasks report only. They do not authorise code changes, merges, archive moves or refactors.
- One app and one concern per implementation pass. No silent multi-hour implementation and no normal reliance on patch/hotfix/wrapper layers.
```

## Current accepted baseline — 1 June 2026

| Surface | Accepted position | Current action gate |
|---|---|---|
| Project Editor | Obsolete static/bootstrap files archived through PR #22; live runtime remains v0.1.32 CONTRACT. Direct project-folder authoring is not confirmed live. | Later save/export and terminology verification. |
| Quest Builder | Inactive legacy files archived through PR #23; V1.2.12 active styling/config files correctly retained. | Later presentation and contract/save checks; correct visible Project Manager wording when editing the app. |
| Puzzle Creator | Obsolete maze patch files archived through PR #24; V1.32 active loader route retained and app-specific build passed. | Safe first fuller UI lane after a short current-main baseline check; keep engine/save/integration out of that UI pass. |
| Effect Editor | User confirmed the complete rewrite at `index2.html` is the good baseline; Hub now opens it through PR #25. Emergency `index.html` remains untouched as reference/rollback. | Map and later port three missing parity items only: rotation-direction controls, orbital control and ALL CAPS text conversion. |
| Scene Editor | v0.34 remains blocked by confirmed selected-object/wrong-object behaviour risk and overlapping ownership. | First required behavioural repair: consolidate Object Inspector and transform ownership, with ball/box manual acceptance gate. |
| Archetype Object Creator | V1.35 active but unverified. | Validate Step 5, project save/index update, browser recovery and Sound Generator callback before changes. |
| Creation Guide | Connected-folder foundation exists, but live wrapper and contract verification remain. | Verify bootstrap/folder setup and starter ZIP/package/schema alignment when selected. |
| Sound Generator preview/shared popup | Retained active shared tool; not save-free because it participates in recipe/index save and caller assignment. | Safe small visual-only lane after smoke test; save/index/callback integration excluded. |
| Hub | Effect Editor route corrected; wider icon/name/version tidy-up is presentation work, not urgent while direct URLs are used. | Audit only when Hub visual work becomes worthwhile. |

## Completed stabilisation decisions

| Completed work | Result |
|---|---|
| Master current-main and rules-compliance analysis | Recorded in `audits/2026-06-01-master-rules-compliance-and-stability-audit.md`. |
| PR #22 | Project Editor archive-only cleanup merged; no active behaviour change. |
| PR #23 | Quest Builder archive-only cleanup merged; two still-active files retained. |
| PR #24 | Puzzle Creator archive-only cleanup merged; V1.32 route unchanged. |
| Effect Editor route decision | Recorded in `audits/2026-06-01-effect-editor-route-decision-audit.md`; `index2.html` accepted. |
| PR #25 | Hub Effect Editor target changed to `apps/effect-editor/index2.html?from=hub` only. |

## Current ranked work queue

### Priority 1 — Behavioural blocker

| App | Task | Scope rule |
|---|---|---|
| Scene Editor | Consolidate Object Inspector and transform ownership to repair selected-object/wrong-object behaviour. | Codex implementation only after approval; test ball and box selection independently; do not mix with UI redesign or save-contract work. |

### Priority 2 — Finish recovered Effect Editor baseline

| App | Task | Scope rule |
|---|---|---|
| Effect Editor `index2` | Read-only mapping of old/current locations for rotation random/within degrees/lock direction, orbital control and convert-to-ALL-CAPS. | Research only first; old emergency route is not the repair target and is not to be archived yet. |
| Effect Editor `index2` | Port the three accepted parity features after mapping is approved. | Single later Codex parity pass limited to permanent index2 owners. |

### Priority 3 — Safe visible UI lanes

| App | Task | Scope rule |
|---|---|---|
| Puzzle Creator V1.32 | Baseline check followed by UI-only visual pass. | Do not touch maze engine, active loader, schema, save/project-folder or registered-content integration. |
| Sound Generator popup | Smoke check followed by visual-only polish. | Do not touch recipe save, asset-index registration, JSON fallback or caller callback. |

### Priority 4 — Required app validation / contract research

| App | Task |
|---|---|
| Archetype Object Creator | Validate V1.35 wizard flow, Step 5 ownership, connected save/index update, recovery and Sound Generator callback. |
| Project Editor | Verify save/export behaviour, connected-folder status and remaining visible Project Manager terminology. |
| Creation Guide | Verify wrapper debt and starter ZIP/package/schema alignment. |
| Hub | Later link/icon/version/module-name audit when Hub polish is prioritised. |

### Priority 5 — Platform backlog retained

```text
- Create/maintain a machine-readable app index at artifex/apps/app-index.json.
- Complete connected-project-folder adoption and honest draft/save-state handling across apps.
- Implement unsaved-navigation guard where authored changes remain local only.
- Standardise app header/menu/version/cache/branding behaviour under the display rules.
- Build shared reference-index and later Portal registry work only as separately approved integration passes.
- Build and validate the populated Template Game only after real connected flows are verified.
```

## App-specific supporting references retained temporarily

The documents below retain detailed feature/verification material and are not independent live priority queues. They must not override this dashboard or `all-apps-todos.json`:

```text
artifex/shared/todo-guide/puzzle-creator-maze-labyrinth-update-steps.md
artifex/apps/quest-builder/docs/todo.md
artifex/apps/archetype-object-creator/docs/todo.md
artifex/apps/archetype-object-creator/docs/current-state-v1.35-review.md
artifex/apps/effect-editor/docs/compare-versions.md
artifex/apps/effect-editor/docs/PHASE_2_UI_CLEANUP.md
artifex/apps/scene-editor/scene-editor-core-split-todos.json
```

Retain them until their useful acceptance/detail content is extracted or no longer relevant; then archive them through a separate verified documentation pass.

## Evidence and archive rule

Audit reports belong in:

```text
artifex/shared/todo-guide/audits/
```

Superseded status/handoff/planning documents belong in:

```text
artifex/shared/todo-guide/archive/
docs/archive/artifex-status-and-handoffs/
```

Archived records are evidence only. They do not re-open tasks or override current decisions.

## Task record rule

Machine-readable current task records live only in `all-apps-todos.json`. New entries must identify:

```text
taskId, scope, owningModule, title, description, status, priority, effort, source, fixOwner
```

Use `open`, `blocked`, `review`, `planned`, `done` or `archived` as normal status values. Completed work remains recorded only where needed to explain current baseline or prevent it being mistakenly redone.
