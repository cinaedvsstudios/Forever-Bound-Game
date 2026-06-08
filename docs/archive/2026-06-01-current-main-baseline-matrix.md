# Phase 0 Current-Main App and Service Baseline Matrix — 1 June 2026

## Status and scope

This record preserves the current-main app/service baseline and open-PR classification produced by the read-only Phase 0 audit, **with verified current-main refresh notes added later where accepted work superseded the original baseline**. It records what must be checked or stabilised next; it does not itself approve future runtime changes, merges, archive moves or UI implementation.

## Verified refresh after the original Phase 0 scan — Effect Editor

The original Phase 0 Effect Editor finding is superseded. Later accepted work on 2026-06-01 resolved the route ambiguity and repaired the clean Index2 route. Current `main` must now treat the Effect Editor state as follows:

```text
Accepted active route: artifex/apps/effect-editor/index2.html
Accepted visible/cache version: INDEX2-CLEAN-0.2.6
Hub route: artifex/apps/effect-editor/index2.html?from=hub
Do not restore or build on the old emergency index.html route as the accepted editor implementation.
Do not reactivate emergency/rescue/patch files as active implementation without explicit approval.
```

Verified accepted Effect Editor work now present on `main` includes:

```text
- clean Index2 route selected for the Hub;
- missing runtime-helper failures repaired so Quick Edit Helper and inline layer actions work again;
- ARTIFEX header restored with rotated ᚠ mark and centred post-divider toolbar group;
- Rotate / Rotation Direction / Degree Range restored as emitter direction and spread/cone controls;
- existing Brush / Shape Library wired back into Index2;
- Effect Editor backlog expanded for Effect Library thumbnails, visible archetype Save action, emission guides and additional FX engine targets;
- app-specific reference record added at artifex/apps/effect-editor/docs/todo.md for confirmed effect examples and future My Settings / pinned-controls restoration.
```

Remaining Effect Editor work is backlog/feature work, not unresolved route selection: full save/project-folder integration, Effect Library browser, guide overlays, engine expansion/polish, My Settings restoration and technical cleanup must be handled in later approved scoped passes.

## Verified refresh after the original Phase 0 scan — Puzzle Creator

The original Phase 0 Puzzle Creator V1.32 finding is superseded by accepted live UI work completed on 2026-06-02.

```text
Accepted active route: artifex/apps/puzzle-creator/index.html
Accepted visible/cache version: V1.34
Accepted UI passes: PR #39 / V1.33 and PR #42 / V1.34
```

Verified accepted Puzzle Creator work now present on `main` includes:

```text
- correct Artifex Puzzle Creator Module identity in the header;
- Scatter action clarified as Place Markers, applying typed amount/seed values without requiring Enter;
- Colors stage ordered as Walls → Scatter → Colours;
- initial Choose a Puzzle Type landing screen rather than immediately opening Maze / Labyrinth;
- blank viewing area until a workflow is selected;
- fixed labelled workflow navigation: Setup, Display, Logic and Colors;
- Puzzle menu return to the chooser without deliberately discarding authored Maze state.
```

Maze / Labyrinth remains the currently developed playable puzzle editor. Arena Trial, Obstacle Course, Symbol Assembly, Item Order Puzzle and Hazard Puzzle remain early workflow choices rather than completed gameplay editors. V1.34 does not implement canonical `puzzles/` saving or live Quest Builder `puzzleId` integration.

## Stability interpretation

```text
Safe for UI discussion now    = visual/design conversation may continue without code changes.
Safe for UI implementation     = an approved visible-only code pass may begin after its named baseline check.
Blocked                        = implementation would risk building on known incorrect or ambiguous runtime behaviour.
```

## Current-main baseline matrix

| Area | Current-main entry point / visible version | Save/source-of-truth status | Known stability issue | UI discussion | UI implementation | Next action |
|---|---|---|---|---:|---:|---|
| Creation Guide | `artifex/apps/creation-guide/index.html` / V1.1.12 | Mixed: connected folder for starter/intake; local storage for library/active project; ZIP backup | PR #20 clean runtime is not live; starter ZIP/package alignment may still need verification; runtime still uses bootstrap/helpers | Yes | Hold pending baseline | Confirm live baseline and residual wrapper/package risk from current `main` only. |
| Project Editor | `artifex/apps/project-editor/index.html` / v0.1.32 CONTRACT | Mixed/local draft/export; direct project-folder authoring not confirmed live | Project Manager naming remnants; direct folder save incomplete; PR #9 and #20 overlap | Yes | Hold | Baseline check and later diff-based PR salvage inventory only. |
| Scene Editor | `artifex/apps/scene-editor/index.html` / v0.34-live-acceptance-repair | Mixed/unclear local/download and active-project display | Confirmed failed acceptance at the original scan checkpoint; use later Scene Editor acceptance records before planning new work | Yes | Requires latest app-specific baseline | Do not rely on this original row alone after later Scene Editor merges. |
| Quest Builder | `artifex/apps/quest-builder/index.html` / V1.2.12 | Local storage plus import/export/download; connected-project contract not confirmed as live write path | Legacy Project Manager links and export/schema baseline need checking | Yes | Likely after quick check | Short baseline check before presentation-only UI work. |
| Puzzle Creator | `artifex/apps/puzzle-creator/index.html` / V1.34 | Primarily import/export/download with some project-folder/registered-content reading; canonical `puzzles/` saving not implemented | Accepted UI-shell baseline is live; non-Maze engines and Quest/save integration remain future work | Yes | Accepted UI lane; future scopes separate | Preserve V1.34; scope any next Maze feature or integration pass separately. |
| Archetype Object Creator | `artifex/apps/archetype-object-creator/index.html` / V1.35 at the original scan checkpoint | Intended project-folder save with browser draft/recovery and ZIP backup | Status belongs to separate active Object Creator work and is not altered by Puzzle Creator acceptance | Yes | Separate validation/work stream | Refer to latest Object Creator record before changes. |
| Effect Editor | `artifex/apps/effect-editor/index2.html` / INDEX2-CLEAN-0.2.6 | Mainly local/import-export; connected project-folder save not confirmed | Accepted Index2 implementation is usable and protected; remaining gaps are tracked feature/save/engine/polish work rather than route ambiguity | Yes | Scoped work only after explicit approval | Do not redo accepted Index2 repairs; refer to `artifex/apps/effect-editor/docs/todo.md` and shared to-do items before later feature work. |
| Sound Generator preview/shared popup | `artifex/apps/sound-generator-preview/index.html`; `artifex/shared/sound-generator/sound-generator-window.js` / V1.00 | Connected project-folder save for recipe/index; JSON import/export fallback | Caller integration, especially Object Creator, is not yet accepted | Yes | Likely safe for preview UI after smoke test | Candidate fallback safe UI lane after quick baseline check. |
| Shared project-folder service | `artifex/shared/project-folder/project-folder-client.js` / 0.1.0 | IndexedDB-stored directory handle and direct folder writes | Not adopted consistently by all apps; browser permission limitations | Yes | Not a UI priority | Baseline/contract tests only unless an approved integration pass needs it. |
| Shared active-project service | `artifex/shared/active-project/active-project-client.js` / 1.0.0 | Local-storage project library and active project ID | Presentation duplication previously affected Scene Editor | Yes | App-dependent | Include in relevant app baseline checks. |
| Shared health/todo services | `artifex/shared/health-guide/`; `artifex/shared/todo-guide/` | JSON/todo generation/export | Remaining Project Manager wording and stale statuses require audit | Yes | Documentation-only later | Include in archive/hotfix and naming inventory. |
| Hub/app-index surfaces | `artifex/index.html` / Hub V1.1.4 | Local active-project/library display | Effect Editor Hub target has been corrected to accepted Index2 route; broader link/name/app-index baseline not yet checked | Yes | Likely after quick check | Safe UI candidate only after broader link/version smoke test. |

## Immediate blockers to general UI implementation

```text
1. Later accepted app-specific status must supersede any original-scan blocker that has since been repaired or re-tested.
2. Archetype Object Creator remains a separate work stream and must not be altered by Puzzle Creator status updates.
3. Project Editor and Creation Guide overlap with stale/unsafe PR work and need current-main baseline decisions.
4. Active patch/wrapper/helper layering has not yet been inventoried fully for archive and consolidation.
```

Effect Editor is no longer blocked by route ambiguity. Puzzle Creator is no longer waiting for its first UI lane: V1.34 is its accepted UI-shell baseline. Leave accepted work alone unless an explicitly approved later pass is selected.

## Apps most likely to reopen UI work quickly

After the accepted Puzzle Creator passes, remaining safe visual lanes still require their own short baseline and scope lock:

| Order | Candidate | Reason | Exclusions for initial UI pass |
|---:|---|---|---|
| 1 | Sound Generator preview V1.00 | Standalone preview harness with narrow visual surface | No caller-integration, save-contract or asset-index changes. |
| 2 | Quest Builder V1.2.12 | Likely suitable for presentation-only work after checking baseline | No export/schema or connected-project work. |
| 3 | Hub V1.1.4 | Potentially safe branding/navigation surface after link check | No project-selection model changes. |
| 4 | Effect Editor Index2 0.2.6 | Accepted repaired baseline exists and planned future work is documented | No regression of accepted repairs; no emergency/patch-route revival; scope only approved feature work. |
| 5 | Puzzle Creator V1.34 follow-up | Accepted baseline exists; further feature work can be scoped cleanly when selected | No canonical save, Quest handoff, shared-service or unrelated engine changes unless separately approved. |

## First required stabilisation pass after inventory

The original Phase 0 scan identified Scene Editor Object Inspector and transform ownership consolidation as its required repair. Later Scene Editor work has since merged independently; any further Scene Editor planning must use fresh current `main` and its latest accepted records rather than treating the original scan as live status.

Any later pass must:

```text
- start from fresh current main;
- follow the latest accepted app-specific record;
- consolidate into permanent owning modules rather than add another patch;
- stop after a deployed manual acceptance test;
- not include unrelated UI redesign.
```

## PR classification and accepted later work

| PR / set | Area | Classification | Required treatment |
|---|---|---|---|
| #9 | Project Editor / legacy Project Manager task workspace and inspector work | Requires diff-based salvage review | Do not merge as-is. Compare later only if Project Editor is selected for stabilisation. |
| #17 | Effect Editor index2 integration | Historical evidence only | Do not merge. Superseded by the accepted clean Index2 work now on `main`. |
| #20 | Creation Guide / Project Editor cleanup | Unsafe / abandoned | Do not merge or use as a branch base. Recreate only approved ideas from fresh `main`. |
| Later merged Effect Editor work on 2026-06-01 | Effect Editor Index2 route, repairs, Brush / Shape Library and documented backlog/references | Accepted current-main state | Protect and inspect from `main`; do not overwrite with older route, emergency or patch implementations. |
| #39 | Puzzle Creator V1.33 identity, Scatter and Colors-stage clarity | Accepted current-main state | Preserve as part of the V1.34 Maze baseline. |
| #42 | Puzzle Creator V1.34 landing screen and labelled workflow navigation | Accepted current-main state | Treat V1.34 as the current Puzzle Creator UI-shell baseline; do not revert to auto-opening Maze inadvertently. |

## Phase 0 conclusion and updated next focus

The original Phase 0 scan correctly identified Puzzle Creator as a safe UI lane. That lane has now been completed through accepted V1.33 and V1.34 work. Puzzle Creator should now be treated as stable at its accepted UI-shell baseline while any later feature, saving or Quest-integration work is separately scoped and tested.
