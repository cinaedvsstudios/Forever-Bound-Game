# Artifex Global To Do

Status: Active consolidation backlog during module extraction  
Intended final role: the single human-readable active task list for Artifex  
Current documentation pass branch: `docs/hub-spec-and-controlled-todo-path-20260602`

## How this document is used

This file is the single controlled destination for outstanding human-maintained Artifex work during the documentation consolidation. It replaces the idea that current work should remain scattered across `docs/GLOBAL_TODO.md`, machine-readable task data, per-app todo files, implementation plans, status-refresh records and active documentation PRs.

Module specifications say what a module permanently is and owns. `docs/artifex/1A-project-file-contracts.md` says what all modules must obey. This file says what remains to be done.

Rules for interpreting migrated tasks:

- Completed historical work is not reopened merely because an older todo or audit mentioned it.
- Accepted baselines belong in module specifications; a baseline is repeated here only when necessary to stop future work being based on an obsolete version.
- Tasks taken from open runtime PRs remain **provisional** until the relevant work is accepted or deliberately retained.
- Older todo/audit/plan documents remain extraction evidence until their valid information is represented in the controlled documents and archive treatment is approved.
- Puzzle Creator and Sound Generator are protected active work streams and must not be overwritten from older documentation evidence.

## Current protected baselines and active overlaps

| Area | Current position relevant to task work | Protection rule |
|---|---|---|
| Documentation control | `0A`, `1A` and `2A` were published on `main` through merged PR #47. This pass corrects the controlled backlog path and adds the first extracted module specification, `3A`. | Continue through documentation-only passes; do not create competing active indexes, task lists or status documents. |
| Hub / Artifex Portal | Current implementation is `artifex/index.html` / **Artifex Hub V1.1.4**; `3A-hub-artifex-portal.md` is created in this pass from that current implementation. | Do not treat the older radial/wedge Portal plan as the current implementation authority. |
| Scene Editor | Accepted baseline is `artifex/apps/scene-editor/index.html` / `v0.37-control-state-inspector-retention`. Ownership repair work from v0.34–v0.37 is complete. | Do not revive old ownership-repair tasks; next work is project integration. |
| Archetype Object Creator | V1.36 is merged on `main`; its lifecycle remains subject to post-merge functional validation. | Validate before beginning further Object Creator feature development. |
| Effect Editor | Accepted route is `artifex/apps/effect-editor/index2.html` / `INDEX2-CLEAN-0.2.6`. | Do not restore older emergency-route work or treat parity controls already repaired as outstanding. |
| Puzzle Creator | V1.35 is merged on `main` through PR #48: Labyrinth Maze remains the working editor and the other surfaced modules are recovered planning pages/placeholders. Documentation refresh PR #44 remains open. | Protect the V1.35 distinction; do not describe planning pages as completed gameplay engines or merge duplicate status docs as final authority. |
| Sound Generator / Sound Library | Shared Sound Library/Create Synth work is currently in open PR #46. | Any items taken from PR #46 remain provisional until that work is accepted/merged or deliberately retained. |

---

# All Apps / Shared Platform

## Documentation consolidation and source-of-truth control

Priority: highest  
Status: in progress

- Maintain `docs/artifex/1A-project-file-contracts.md` as the one universal Artifex contract while remaining rule-bearing documents are audited.
- Maintain this file, `docs/artifex/2A-global-to-do.md`, as the sole human-readable active Artifex backlog.
- Maintain `docs/artifex/0A-index-of-files.md` as the controlled index of active specifications, subordinate references and archive treatment.
- Inspect every real module/service and retain or create exactly one active specification document containing only its unique permanent purpose, ownership, route/baseline and specific interfaces.
- Continue extraction after the Hub pass in the approved module order, with **Creation Guide** next.
- Extract still-valid permanent rules, module-specific facts and open work from older READMEs, todos, audits, handovers, baseline matrices and status-refresh documents.
- Check whether `artifex/shared/todo-guide/all-apps-todos.json` is read by application code before changing its role. If runtime-required, retain it as a machine/runtime dependency only, not a second human-maintained backlog.
- Check whether project-level files such as `todos/project-manager-todos.json` or `todos/project-editor-todos.json` are user-project output/runtime dependencies and retain compatibility where required.
- Archive superseded status, audit, handover and per-app todo documents only after extraction and dependency checks; do not delete useful history.
- Reconcile or close documentation PRs that update superseded documentation structures after any unique valid content is captured.

Source evidence currently requiring later treatment includes:

```text
docs/GLOBAL_TODO.md
artifex/shared/todo-guide/README.md
artifex/shared/todo-guide/all-apps-todos.json
artifex/apps/*/docs/todo.md
artifex/apps/*/*plan*.md
artifex/shared/todo-guide/audits/**
docs/artifex/11-portal-hub.md
docs/artifex/23-current-main-scan-and-pr20-recovery.md
docs/artifex/24-stabilisation-cleanup-and-ui-resumption-plan.md
```

## Module/file ownership and technical-debt audit

Priority: high  
Status: open

- Audit each module against the master contract for clear file ownership and module boundaries.
- Inspect large monolith files and split them only where a real permanent responsibility boundary requires it.
- Audit active patch, override, rescue, enhancer and hotfix layers across apps; move retained behaviour into permanent owners and archive inactive layers only after verification.
- Do not add new patch/wrapper layers as the normal method of feature work or repair.
- Keep implementation passes scoped to one app and one concern unless an authorised dependency makes that impossible.

## Shared Artifex shell, branding and navigation consistency

Priority: medium/high  
Status: open, app-by-app adoption required

- Standardise the common header arrangement: Artifex logo/app title, visible version pill, divider and main menu.
- Standardise the File → Module flyout pattern listing core modules rather than listing every module inline in File menus.
- Audit each active app against the shared dark Artifex chrome and module accent-colour rules in the master contract.
- Standardise visible version/cache-key handling so changed UI loads the matching accepted version consistently.
- Standardise remembered editor layout state and a Reset Saved Layout action in apps that have draggable/resizable panels, collapse state, zoom/pan or view toggles.

## Active project and connected-folder authoring foundation

Priority: highest  
Status: partly started; broad adoption remains open

- Complete shared connected-project-folder service adoption across authoring apps.
- Make authoring modules load the active connected project's real owned files/indexes rather than unrelated demo or browser-local data when a project is connected.
- Implement consistent save-state reporting: **Saved to Project Folder**, **Local Draft Only**, **Project File Changed**, **Conflict**, **Permission Required**, **No Folder Connected**, **Save Failed**.
- Implement navigation protection when leaving an app with local-only unsaved work, offering Save and Continue, Stay Here, Continue Without Saving and Export Backup where relevant.
- Preserve the rule that browser-local data is recovery/workspace state and ZIP/download is backup/fallback, not normal permanent project saving.
- Validate typed starter schema alignment and project-relative paths as each module adopts real connected-folder saving.

## Shared reference and cross-app linking infrastructure

Priority: high  
Status: open

- Create a shared project reference index so modules can display where assets, object archetypes, effects, actions, scenes, quests, routes and linked resources are actually used.
- Use that reference index to power real reference listings in Archetype Object Creator rather than placeholder links.
- Define and implement a project-wide Portal endpoint registry and cross-app linking contract: Puzzle Creator and Scene Editor may place endpoints, Quest Builder may activate/reference them, Project Editor displays/validates the graph, and Health/Build report broken links.
- Complete canonical Puzzle Creator → Quest Builder handoff using saved `puzzle_` IDs only after canonical puzzle saving/registration exists.

## Template Game connected-reference proof

Priority: high  
Status: open

- Build and validate the populated Template Game connected reference project using the same contracts as a real project.
- Prove cross-app reads/references through at least project identity, routes, screen/scene records, final registered assets, object/effect records, a Quest and, when implemented, a saved Puzzle linked into a Quest.
- Validate Health/Build results against the connected Template Game.
- Add Template Game as a Creation Guide new-project choice only after the connected reference proof passes.

## Health, audit and Build validation

Priority: high  
Status: open/partly foundational

- Consolidate reusable diagnostics into Shared Health Guide rather than duplicating check logic inside each authoring module.
- Validate connected-folder permission/write status, unsaved local drafts, external conflicts, missing registered paths, broken IDs/references, duplicate IDs, unused assets and stale build/backup outputs.
- Ensure Health reports issues and fix ownership without silently overwriting authored content.
- Ensure Build Game validates/packages the project without becoming an authoring owner.

---

# Hub / Artifex Portal

Active specification created in this pass: `docs/artifex/3A-hub-artifex-portal.md`.  
Verified implementation baseline: `artifex/index.html` / **Artifex Hub V1.1.4** on current `main` checked after merged Puzzle Creator PR #48.

- Review and rename the transitional **Puzzle / Asset Tools** Hub label so Puzzle Creator is not displayed as if it owns Asset Library.
- Confirm final user-facing naming for **Object Creator** versus **Archetype Object Creator** during that module's specification pass, then update the Hub label if required.
- Maintain the Effect Editor destination as `apps/effect-editor/index2.html` unless a later approved Effect Editor baseline replaces it.
- Reconcile the current browser-local `artifex.projectLibrary` / `artifex.activeProjectId` handoff with any confirmed Shared Active Project Service; do not treat current Hub localStorage as permanent project-file truth.
- Apply later shared-shell/header refinements through a dedicated implementation pass after the documentation decisions are approved.
- Archive `docs/artifex/11-portal-hub.md` only after `3A` is accepted and no uncaptured live task remains.

---

# Creation Guide

Current documented baseline needing verification: V1.1.12 / connected-folder starter work mixed with transitional/local behaviour.  
Audit order: next after Hub.

## Verification and contract alignment

- Verify current starter project initialisation from fresh `main`, including output files, folder layout and ZIP fallback behaviour.
- Confirm Blank Starter creation uses `startScreenId: null` until a real registered start screen exists; do not repeat older missing-start-screen behaviour.
- Verify remaining bootstrap/folder helper layers and decide whether active transition code needs later consolidation into permanent ownership.
- Extract the single Creation Guide module specification and update `0A` when complete.

## Outstanding feature work

- Add **Initial Asset Intake Setup**: explain `intake/` staging, show the six standard source buckets, provide Create Intake Folders and Skip for Now, and write approved intake structure to the connected project folder.
- Add a non-blocking **Recommended Starting Media** checklist for logo/title mark, background, player art, NPC art, interactable object, transition object and UI/icon placeholder set.
- Add project logo identity flow: intake source → Asset Library promotion → final registered project logo reference → display in Creation Guide/project selector where appropriate.
- Extend setup/readiness Health reporting for folder permission/save state, local drafts, intake completion/skipping, media readiness and invalid project-logo references.
- Reuse Shared Health Guide checks rather than retaining duplicate long-term health logic.
- Add the Template Game project choice only after the populated connected-reference project is proven.

---

# Project Editor

Current documented baseline needing verification: `artifex/apps/project-editor/index.html` / `v0.1.32 CONTRACT`.

## Naming, baseline and save verification

- Verify current Project Editor shell, route/version and save/export behaviour from current `main` only.
- Remove remaining user-facing **Project Manager** terminology in versioned passes while preserving compatibility for legacy identifiers/files still read.
- Migrate generated todo filename use from `todos/project-manager-todos.json` to `todos/project-editor-todos.json` only through explicit backward-compatible migration.
- Extract the single Project Editor specification after Creation Guide.

## Connected project and structure editing

- Implement connected-folder open/re-authorisation/import flow so Project Editor loads canonical split project files from the selected root.
- Implement direct Save Current Project / Save All for Project Editor-owned structural files through the shared folder service, retaining export ZIP only as backup/fallback.
- Define and validate real project package import/export around canonical split files and typed schema contracts.
- Make the Asset Browser read real scene, screen, quest, sidequest, puzzle, object archetype, effect archetype and asset indexes instead of placeholders.
- Add valid link-to-selected-node behaviour for referenced module outputs.
- Improve the inspector by selected node/route/gate type.
- Make Stitcher routes support real simple, branch, quest-gated, puzzle-gated, item-gated and condition-gated routes.
- Present Shared Health/Build Prep results without owning other modules' authored corrections.

---

# Scene Editor

Accepted baseline: `artifex/apps/scene-editor/index.html` / `v0.37-control-state-inspector-retention`.

Completed stabilisation work from v0.35–v0.37 must not be reopened as pending ownership work. Remaining tasks are integration tasks:

- Extract the single Scene Editor specification and preserve the accepted v0.37 baseline.
- Connect authored scenes/screens to the active project's real scene/screen files and indexes.
- Display accurate project-file versus local-draft save status through the shared save-state model.
- Place validated Object Creator and Effect Editor outputs through stable registered project references.
- Adopt Sound Library selection for ambience, local sound sources and transitions only after the Sound Library foundation is accepted and in a separate Scene Editor-owned pass. Status: **provisional, sourced from open PR #46**.
- Later define Scene Events, Triggers and portal linking after save/reference foundations are reliable.

---

# Quest Builder

Current live documented baseline needing verification: `V1.2.12`.

## Current known UI/terminology follow-up

- Change any live Module flyout label from **Project Manager** to **Project Editor** in a normal versioned app pass.
- Preserve accepted fine-grid, snap-mode and smart shortest-edge connector presentation while later features are implemented.
- Extract the single Quest Builder specification after Scene Editor.

## Workspace layout track

- Add dynamic workspace expansion when cards approach lower/right boundaries while maintaining comfortable blank padding.
- Allow START/END endpoints to be positioned consistently in an expanded workspace without inferring logic from visual position.
- Add horizontal Insert Space layout management; consider vertical/obstacle-aware routing only if tested use requires it.

## Structured Quest authoring track

- Define export-safe structured data for operations, requirements, outcomes and Quest-scoped dialogue/Capra records.
- Replace vague free-text editing with contextual block-editing sections for actions, conditions, outcomes, failure/feedback, dialogue/presentation, linked assets and validation.
- Add in-app **Open Dialogue / Feedback** authoring inside Quest Builder; do not create an unnecessary separate Dialogue app for first version.
- Validate target IDs, dialogue references, feedback data and completion conditions.
- Align Quest/Sidequest saving to canonical connected-project typed indexes and folder saving.

## Linked Puzzle and audio track

- Coordinate canonical Puzzle Creator connected-project saving/registration before adding meaningful Quest Builder Puzzle blocks.
- Add a `Puzzle` block with required `puzzleId`, reading real registered puzzles and storing Quest-level context/outcomes only.
- Add missing-puzzle/public-result validation and Project Editor public-result gate integration.
- Add Sound Library selectors for stable Quest start, completion, failure, reward, dialogue and feedback fields only after the Sound Library foundation is accepted; saved references use `asset_` IDs only. Status: **provisional, sourced from open PR #46**.

---

# Archetype Object Creator

Current runtime baseline: **V1.36 merged on `main` from PR #38**.  
Immediate gate: functional lifecycle validation before more feature work.

## Mandatory V1.36 post-merge validation

Use a disposable Blank Starter Project folder only:

- Test **Save Project (In Progress)** with uploaded images: project JSON stores staging paths and no browser `dataUrl`, while current-session thumbnails, playback, Frame Fix and brightness matching remain usable.
- Test **File → Open Project Object** for a saved `in_progress` object and confirm staged images rehydrate into visible editable Step 5 frames.
- Test invalid **Finish / Mark Object Ready** and confirm it writes no final media, final asset-index record or ready object/index entry.
- Test valid finalisation and confirm final media promotion, asset-index registration and top-level gameplay/portrait registered asset-ID mapping.
- Test multiple uploaded images in primary Gameplay Sprite or Dialogue Portrait requirements and confirm finalisation refuses them before final output writes.
- Test stale-target sound assignment: begin assignment from Action A, change selection to Action B before return, and confirm the returned sound asset ID remains assigned only to Action A.
- Test per-frame correction persistence across actions, project save/reopen, export/import and finalisation.
- Confirm no duplicate Step 5 controls, module-load failures or console errors.

## Follow-up work after lifecycle validation

- Extract the single Archetype Object Creator specification during its audit pass.
- Plan a separate focused ownership split of large `editor-ui.js` only after lifecycle validation; do not combine refactoring with a validation repair.
- Complete real scene/quest/reference listing in the existing Reference panel once the shared project reference index exists.
- Adopt Sound Library-first selection for Object Creator sound events only after the Sound Library foundation is accepted and without regressing the V1.36 lifecycle. Status: **provisional, sourced from open PR #46**.

Older presentational Step 5 work in `docs/GLOBAL_TODO.md` has largely been delivered or superseded through V1.36. Retain only unresolved real-reference-index requirements and lifecycle verification; do not re-add obsolete overlay/layout repair tasks as new feature work.

---

# Effect Editor

Accepted baseline: `artifex/apps/effect-editor/index2.html` / `INDEX2-CLEAN-0.2.6`.

## Editor UI and saved-library work

- Extract the single Effect Editor specification and protect the accepted `index2.html` route.
- Perform final QA/fix work for Display panel/view controls: avoid overlap with diagnostics, retain a clean icon grid, remove duplicates and keep Pause/Snapshot/Zoom coherent.
- Restore **My Settings** / favourite pinned controls as an Index2-owned module, including draggable/collapsible panel, edit/pin mode, live mirrored controls and local persistence.
- Add an **Effect Library** browser with visual previews, names, tags and engine types, ultimately backed by canonical connected-project effect records/indexes.
- Add an obvious Save action in Effect Archetype Assets with real connected-project save/status behaviour and separate backup/export fallback.
- Add emitter-width brace markers and Degree Range cone guides that accurately reflect direction/range modes and respond to Guides visibility.

## Runtime/effect engine work

- Rescale gravity and speed controls into intuitive user-facing values consistent with visible runtime movement.
- Complete text-effect runtime and controls: spawn delay, text density, multiline/spacing/wrap, direction/reveal/scatter/keep-block/lifetime controls and font stability.
- Build missing real FX engines: smoke/cloud/mist/fog; spark/ember; electric arc/lightning; ribbon/trail; tornado/vortex/swirl; beam/laser; projectile/fireball; lens flare compositor; heat distortion/warping; convex/concave warps; liquid/blob/black-oil; rain/weather; shockwave/radial burst; sprite-sheet/flipbook FX.
- Perform visual-quality work on built-in presets only after underlying engines are stable.
- Finish real brush, overlay and icon asset loaders, with future Asset Library connection where appropriate.
- Integrate retained V3 polish/legacy layers into normal permanent ownership and archive dead layers only after verification.

## Confirmed visual targets and audio track

- Preserve targets for lens flare/light glint, underworld black-oil droplets, futuristic HUD bloom, sunlight rays, interactive water, shockwave and ground fog; choose final visual references for Explosion and Storm before implementing them.
- Add optional Sound Library cues for effect start, loop, impact and end only after the Sound Library foundation and accepted FX schema owner are confirmed; silent effects remain valid and saved cues use registered `asset_` IDs only. Status: **provisional, sourced from open PR #46**.

---

# Asset Library

- Define or retain the single Asset Library specification for final registered `asset_` records, metadata, groups and selection.
- Complete source promotion from `intake/` into final indexed `assets/` records while keeping permanent authored content free of intake references.
- Support promotion/registration required by Creation Guide project-logo identity and starting-media readiness.
- Support Effect Library and other module selectors through stable registered references rather than demo records.
- Add canonical import/promotion for new audio files such as WAV, MP3 and OGG into final `assets/audio/` records; Sound Library selects registered audio and must not become an ad-hoc importer. Status: **provisional, sourced from open PR #46**.

---

# Shared Connected Project Folder Service

Classification pending: confirm whether this remains a distinct maintained service specification or is sufficiently covered by the master contract plus implementation ownership.

- Complete directory-handle persistence/re-authorisation and relative-path read/write adoption required by authoring modules.
- Provide common save-state and unsaved-navigation guard behaviour.
- Ensure project JSON never stores private local paths or browser handles.
- Support safe validation/finalisation workflows where owning apps write staged/final content through the connected project.

---

# Shared Active Project Service

Classification pending: confirm whether this warrants its own service specification.

- Make all apps reliably load the selected active project's real owned content/indexes where connected-project integration is implemented.
- Prevent apps from quietly showing unrelated demo/default state when a real active project is available.
- Define the safe boundary between browser-saved workspace selection/state and the connected project folder as authored-data source of truth.
- Reconcile the Hub V1.1.4 localStorage handoff as part of this decision, without making Hub responsible for authored project data.

---

# Registered Content Service / Picker

Classification pending: determine whether this is a maintained service specification or part of Asset Library/shared project infrastructure.

- Provide stable selection/lookup of registered asset, object archetype and effect archetype records for authoring modules.
- Support real reference validation without creating parallel ownership of selected records.
- Align with Asset Library and project reference index decisions.

---

# Shared Health Guide / Project Audit

- Establish or confirm the single Health Guide specification and shared check ownership.
- Replace duplicated per-app long-term check logic with reusable shared checks displayed in app-appropriate contexts.
- Report broken references, missing records, invalid connected-folder state, unsaved drafts, conflicts, duplicate IDs, unused assets and build readiness.
- Report fix owner/module clearly and never silently correct authored content.

---

# Build Game

- Establish or confirm the single Build Game specification.
- Validate canonical project files, registered resources and unresolved cross-module references before packaging.
- Consume Shared Health results where appropriate without becoming an authoring owner.
- Prove final packaging through the Template Game connected-reference workflow before relying on it for production output.

---

# Runtime Engine / Playtest

Classification pending: determine whether Runtime Engine and Playtest are one maintained service or separate specifications.

- Confirm what existing playable/preview routes actually exist and which authored records they read.
- Define preview/testing entry points from Scene Editor, Project Editor, Quest Builder, Puzzle Creator and Build Game without transferring ownership of authored content.
- Validate project-file reading against the connected-project contract after module saving becomes reliable.

---

# Puzzle Creator

Protected active work stream: consolidate its final specification only after checking the latest Puzzle work.  
Current merged baseline: `artifex/apps/puzzle-creator/index.html` / **V1.35** from merged PR #48. **Labyrinth Maze** remains the implemented playable workflow; **Boxing Ring**, **Flying Practice**, **Pattern Lock Puzzle**, **Potion Match** and **Underworld Black Oil** are recovered planning pages/placeholders, not completed gameplay engines.

- Preserve the accepted V1.35 launcher/navigation/Maze baseline and the distinction between working editor and planning placeholders.
- Implement canonical connected-project saving/index registration for `puzzles/puzzle-index.json` and `puzzles/puzzle_<slug>.json`.
- Coordinate saved `puzzleId` handoff with Quest Builder only after canonical saved puzzle records exist.
- Scope additional puzzle engines/features separately and do not present unbuilt choices as completed editors.
- Retain registered-content/final-asset reference rules for puzzle-owned assets/effects/audio.
- Adopt Sound Library feedback selection for correct input, wrong input, unlock, timer warning, completion and failure only after the Sound Library foundation is accepted and without interfering with current Puzzle work. Status: **provisional, sourced from open PR #46**.
- Reconcile open Puzzle documentation PR #44 late in the Puzzle specification pass rather than merging it as a parallel current-status authority.

---

# Sound Generator / Sound Library

Protected active work stream: open PR #46 currently modifies this area.  
This section records provisional adoption work without claiming PR #46 is accepted or merged.

## Proposed shared foundation currently under review in PR #46

- Provide a shared Sound Library selector listing registered imported/generated audio assets through `assets/asset-index.json` and returning registered `asset_` IDs only.
- Provide Create New Synth Sound inside Sound Library, writing approved generated recipes to final audio assets and registering them through Asset Library.
- Confirm a preview harness proves selection, preview, generated-synth save/registration and caller-target preservation before caller-app adoption.
- After any merge, reconcile the Sound Generator specification and this todo section to the accepted baseline.

## Deferred caller adoption tasks after foundation acceptance

- Archetype Object Creator: Sound Library-first selection for object sound events without regressing V1.36 lifecycle/target ownership.
- Quest Builder: selectors for stable Quest audio fields.
- Effect Editor: optional effect start/loop/impact/end cues.
- Puzzle Creator: feedback sounds.
- Scene Editor: ambience, sources and transitions.
- Asset Library: import/promotion of newly supplied audio files, since Sound Library must not own ad-hoc audio importing.

---

# Documentation / PR reconciliation queue

These are documentation-control actions, not implementation approval:

| PR / document area | Current interpretation | Consolidation treatment |
|---|---|---|
| Merged PR #47 — documentation-control foundation | Published `0A`, `1A` and `2A` to `main`, but `0A`/`1A` retained an incorrect reference to `docs/GLOBAL_TODO.md`. | Treat as foundation baseline and correct the backlog-path inconsistency in this documentation-only pass. |
| This Hub extraction pass | Adds `3A`, corrects `0A`/`1A`, and refreshes `2A` for current Hub and Puzzle V1.35 baseline. | Review as a documentation-only PR; no runtime or archive operation is authorised by it. |
| Open PR #40 — Scene/Effect status refresh | Scene status was superseded by the later accepted Scene Editor v0.37 record; status-refresh files are not final documentation authority. | Extract any unique outstanding task only; do not merge as another active status source. |
| Open PR #44 — Puzzle V1.34 status refresh | Contains earlier Puzzle baseline evidence, now superseded for runtime by merged V1.35 PR #48. | Reconcile late in the Puzzle module-spec pass; do not merge as a competing final authority. |
| Merged PR #48 — Puzzle Creator V1.35 planning pages | Establishes current Puzzle UI/content baseline and recovered placeholder planning pages. | Protect in this to-do until the later Puzzle specification extraction. |
| Open PR #46 — Sound Library / Create Synth Sound | Active runtime/doc/task work in an area still being edited. | Preserve as active work; tasks copied here remain provisional until accepted/merged. |
| `docs/GLOBAL_TODO.md` | Contains older tasks and superseded follow-up records. | Archive only after this `2A` structure is approved and any remaining live task has been extracted. |
| `artifex/shared/todo-guide/all-apps-todos.json` | Contains a backlog and may have machine/runtime dependencies. | Use as extraction evidence; check dependencies before retiring its human-backlog role. |
| Per-app todos, plans, audits and status files | Mix current work with history and specification facts. | Extract into `2A`/module specs, then archive where superseded and safe. |

## Migrated-source checkpoint

Open work has been copied or consolidated here from the known active backlog/evidence sources reviewed so far:

```text
docs/GLOBAL_TODO.md
artifex/shared/todo-guide/README.md
artifex/shared/todo-guide/all-apps-todos.json
artifex/apps/archetype-object-creator/docs/todo.md
artifex/apps/effect-editor/docs/todo.md
artifex/apps/quest-builder/docs/todo.md
docs/artifex/11-portal-hub.md
docs/artifex/24-stabilisation-cleanup-and-ui-resumption-plan.md
artifex/index.html at Artifex Hub V1.1.4
merged Scene Editor accepted-baseline PR #45
open Puzzle documentation PR #44
merged Puzzle Creator implementation PR #48
open Sound Library / Sound Generator PR #46
```

As each module is audited in order, this file must be checked against its remaining app-specific plans/todos so any additional still-live task is added here before the older source is archived.