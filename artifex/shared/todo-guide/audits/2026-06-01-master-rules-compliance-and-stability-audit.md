# Artifex Rules-Compliance and Stability Analysis — Corrected Master Audit

## Status and purpose

Date recorded: 2026-06-01.  
Current-main refresh added: 2026-06-02 for accepted Puzzle Creator work.

This is the accepted corrected master-audit record after the 31 May integration review, the Phase 1 archive/hotfix inventory, and the three approved archive-only cleanup passes. It combines the current-main stability findings with the global Artifex rules/contract review needed to decide which apps are safe for controlled UI work and which require further repair or verification.

This document is a planning and audit record only. It does not authorise implementation, route changes, schema changes, archive moves, wrapper removal or UI redesign.

## Later accepted-current-main refresh — Puzzle Creator

The original audit selected Puzzle Creator V1.32 as the first fuller UI-only lane after a quick baseline check. That lane has now been completed and superseded by two accepted UI passes on `main`:

| PR | Version | Merge commit | Accepted result |
|---|---|---|---|
| #39 | V1.33 | `3d956ff33e5f1b59ee9c46728397da5c851d7a62` | Correct Puzzle Creator module identity, clarify Scatter placement through **Place Markers**, apply typed amounts without requiring Enter, and organise **Walls → Scatter → Colours**. |
| #42 | V1.34 | `db5e03c243a22f49a79d4468f869e77df0208cb0` | Add **Choose a Puzzle Type** landing screen, blank initial viewer, and labelled **Setup / Display / Logic / Colors** workflow navigation. |

Accepted current Puzzle Creator baseline:

```text
Entry route: artifex/apps/puzzle-creator/index.html
Visible/cache version: V1.34
Currently developed playable workflow: Maze / Labyrinth
```

V1.34 is an accepted UI-shell/navigation baseline only. It does not establish canonical connected-project saving under `puzzles/`, a live Quest Builder `puzzleId` handoff, or completed gameplay editors for Arena Trial, Obstacle Course, Symbol Assembly, Item Order Puzzle or Hazard Puzzle.

## Authority and boundaries

The audit must be read alongside:

```text
docs/artifex/18-color-and-display-rules.md
docs/artifex/19-project-file-contracts.md
docs/artifex/19a-project-starter-file-schemas.md
docs/artifex/20-asset-intake-workflow.md
docs/artifex/21-template-game-project-contract.md
docs/artifex/22-sound-archetype-generator.md
docs/artifex/23-current-main-scan-and-pr20-recovery.md
docs/artifex/24-stabilisation-cleanup-and-ui-resumption-plan.md
artifex/apps/puzzle-creator/README.md
artifex/shared/todo-guide/puzzle-creator-maze-labyrinth-update-steps.md
artifex/shared/todo-guide/audits/2026-06-01-change-timeline.md
artifex/shared/todo-guide/audits/2026-06-01-current-main-baseline-matrix.md
artifex/shared/todo-guide/audits/2026-06-01-archive-and-hotfix-inventory.md
```

Interpretation rules preserved from the accepted baseline:

```text
- Current main is the only implementation baseline.
- UI-only work must not silently include schemas, save paths, integration or architecture changes.
- A connected project root is the normal editable source of truth only where writable-folder behaviour has been verified and accepted for that app.
- localStorage is a recovery/draft or app-local state layer, not automatic evidence of contract-compliant authoring.
- ZIP/download/export behaviour is backup or fallback behaviour unless separately accepted as the app's current model.
- Stability and UI readiness are assessed app-by-app.
```

## Confirmed completed cleanup already merged into current main

| PR | Area | Merge commit | Scope and accepted result |
|---|---|---|---|
| #22 | Project Editor | `07fb19c7d8d01a8d7068d7f2b00ac5fb7900738d` | Archive-only move of four superseded files plus archive README records. Active entry remained `artifex/apps/project-editor/index.html` loading `./src/project-app.v7.js?v=0.1.32-contract` at that checkpoint. |
| #23 | Quest Builder | `c0a82d69f08338a19447e26d28ba7fbcbbb5be28` | Archive-only move of six inactive legacy files plus archive README records. Active `quest-builder-v108.css` and `module-config.js` were deliberately retained because current V1.2.12 still uses them. |
| #24 | Puzzle Creator | `ce26b1c2cd42cd36ec6ba9c341ec360df8261c29` | Archive-only move of `maze-v109-controls.js` and `maze-v110-fixes.js` plus README. The V1.32 route at that checkpoint was later superseded by accepted V1.33 and V1.34 UI work. |

These archive-only passes are complete and must not be treated as behavioural fixes or reopened by default.

## Global compliance and stability matrix

| App / surface | Accepted current-main position relevant to this record | Remaining debt / risk | UI implementation status | Recommended next step |
|---|---|---|---|---|
| Hub / app index | `artifex/index.html`, Hub V1.1.4 at the audit baseline; local active-project/library display. | Link/version/project-selection routes require app-specific current-main checks when selected. | Likely safe only after quick route/version check. | Short read-only link/version baseline before any Hub polish. |
| Creation Guide | `artifex/apps/creation-guide/index.html`, V1.1.12 at the audit baseline; mixed connected-folder/local/ZIP behaviour. | `app-bootstrap.js` and folder setup ownership/contract alignment required later app-specific verification. | Hold for its own work; does not block independent safe UI lanes. | Dedicated current-main wrapper/contract verification when selected. |
| Project Editor | `artifex/apps/project-editor/index.html`, v0.1.32 CONTRACT at the audit baseline; mixed/local draft/export. | Naming drift and save/file-contract verification remain separate. | Hold pending app-specific baseline if selected. | Verify save path and remaining terminology from current main only. |
| Scene Editor | Original audit recorded a live selected-object correctness failure. | Later Scene Editor work has merged separately; this Puzzle refresh does not re-audit its accepted current status. | Use later Scene Editor records/current main. | Do not rely on the old blocker without checking later accepted work. |
| Quest Builder | `artifex/apps/quest-builder/index.html`, V1.2.12; local storage plus import/export/download at the audit baseline. | Live `Puzzle` flow block and connected-project `puzzleId` selection remain unimplemented. | Likely safe for presentation-only work after short baseline. | Keep schema/integration work separate. |
| Puzzle Creator | `artifex/apps/puzzle-creator/index.html`, **V1.34 accepted**; import/export/download plus selected registered-content reads. | Canonical `puzzles/` saving, live Quest handoff and further puzzle-engine implementation remain future separate scopes. | **Accepted UI-shell baseline.** | Preserve V1.34; choose any next Puzzle pass explicitly. |
| Archetype Object Creator | Separate app/status stream; do not infer a new Object Creator baseline from Puzzle work. | Its own save/sound/asset lifecycle validation and active work remain outside this refresh. | Separate decision required. | Do not alter from Puzzle Creator work. |
| Effect Editor | Later accepted Index2 work supersedes the original route ambiguity; use the refreshed baseline matrix and app-specific records. | Remaining save/engine/polish work is separately scoped. | Accepted baseline; explicit later passes only. | Do not restore emergency route as accepted implementation. |
| Sound Generator preview/shared popup | V1.00 preview at audit baseline. | Save, asset-index and caller assignment are integration-sensitive. | Suitable only for visual-only work after smoke test. | Exclude caller/save integration from UI polish. |

## Shared services position

| Shared surface | Accepted position | Later treatment |
|---|---|---|
| Shared project-folder service | Contract-critical foundation through `project-folder-client.js` and `project-structure-initializer.js`; not evidence that every app has adopted the file contract. | Test only as required by an approved app integration pass. |
| Shared active-project service | Local-storage active project/library service; app-dependent and not evidence of connected-folder saving. | Include in relevant app baseline checks. |
| Shared registered-content service | Retained active shared content infrastructure; full adoption/compliance not established by Puzzle UI work. | Verify only within approved asset/index integration work. |
| Shared health/todo surfaces | Current evidence and output infrastructure; terminology/status cleanup may remain. | Documentation/terminology review as required. |
| Shared Sound Generator runtime/store | Active permanent popup/UI/save owners; not changed by the accepted Puzzle UI passes. | Preserve unless specifically scoped. |

## Puzzle Creator accepted UI lane outcome

The original audit's recommendation to use Puzzle Creator as the first fuller UI-only lane is now complete.

Accepted behaviour now protected in V1.34:

```text
- app opens to Choose a Puzzle Type rather than defaulting straight into Maze;
- the preview area is blank until a workflow is chosen;
- Maze / Labyrinth opens the existing developed workflow;
- the workflow rail has visible Setup, Display, Logic and Colors labels;
- the Colors stage retains Walls → Scatter → Colours organisation;
- Scatter uses the clear Place Markers action and accepts typed amount/seed values without needing Enter;
- returning to the chooser is available from the Puzzles menu without deliberately discarding authored state.
```

Explicit exclusions retained:

```text
- no canonical puzzles/puzzle-index.json saving;
- no Quest Builder puzzleId integration;
- no project-folder/shared registered-content service implementation work;
- no Object Creator, sound or asset lifecycle work;
- no claim that non-Maze puzzle choices are completed gameplay editors.
```

## UI resumption readiness after Puzzle Creator V1.34

| Candidate | Gate still required | Safe scope | Explicit exclusions | Decision |
|---|---|---|---|---|
| Puzzle Creator V1.34 follow-up | A newly approved named scope and manual acceptance gate. | One selected Maze/UI feature or a separately planned save/integration design pass. | No automatic bundling of feature, schema, save, Quest or shared-service work. | Current baseline accepted; future work separate. |
| Sound Generator preview/shared popup V1.00 | Short modal-open/control/preview smoke test. | Popup/card layout, typography, spacing, control readability and visual accessibility. | Project-folder recipe save, asset-index registration, JSON import/export behaviour, save-and-assign callback and Object Creator integration. | Small low-risk visual lane. |
| Quest Builder V1.2.12 | Quick entry/runtime/style and visible-flow check. | Presentation-only card/flow/menu/control styling. | Schema, connection logic, export/save integration and new wrappers. | Suitable later visual lane. |
| Hub V1.1.4 | Link/version/project-selection baseline. | Branding, spacing, typography and app-card presentation. | Route restructuring and active-project/local-storage behaviour. | Small later UI candidate. |

## Prioritised remaining work position

The original audit's unresolved-app findings remain historical evidence for those apps, but current status must be verified against subsequent accepted work before implementation. Within Puzzle Creator, the safe UI-lane decision has been fulfilled through V1.34 and is no longer an outstanding gate.

Puzzle Creator next-work directions, only when separately selected, include:

```text
- Secondary Light Set / coverage-fill Maze enhancement;
- later Traboule/Portal/Foe/Hazard work under separately tested scopes;
- separately planned canonical puzzles/ saving and Quest Builder integration.
```

## Accepted conclusion

Puzzle Creator V1.34 is now the accepted live UI-shell baseline on `main`. Its initial UI-resumption lane is complete. Further Puzzle work must preserve the accepted launcher/navigation/Maze presentation unless intentionally redesigned, and must keep gameplay features, canonical saving and Quest integration as separate approved scopes.
