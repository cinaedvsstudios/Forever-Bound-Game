# Artifex Global To Do

Status: Consolidation draft  
Intended final role: the single human-readable active task list for Artifex  
Documentation-control branch: `docs/artifex-document-control-foundation-20260602`

## How this document is used

This file consolidates outstanding work that is currently scattered across `docs/GLOBAL_TODO.md`, `artifex/shared/todo-guide/all-apps-todos.json`, per-app `todo.md` files, implementation plans, status-refresh records and active documentation PRs.

Once the consolidation is approved and the relevant file dependencies have been checked, this document becomes the only human-maintained Artifex backlog. Module specifications say what each module permanently is and owns. `docs/artifex/1A-project-file-contracts.md` says what all modules must obey. This file says what remains to be done.

Rules for interpreting migrated tasks:

- Completed historical work is not re-opened merely because an old todo or audit mentioned it.
- Current accepted baselines belong in module specifications; a baseline is repeated here only when necessary to prevent work being based on an obsolete version.
- Tasks copied from an open PR are marked **provisional** until that PR is accepted or its useful tasks are deliberately retained.
- Puzzle Creator and Sound Generator are currently active work streams. Their items are gathered here for control, but their existing working documents/code are not to be overwritten from this consolidation branch.
- Old per-app todo files, plans and audits are archive candidates only after their useful open work is safely represented here and their permanent rules/specification content has been transferred elsewhere.

## Current protected baselines and active overlaps

| Area | Current position relevant to task work | Protection rule |
|---|---|---|
| Documentation control | `0A-index-of-files.md` and `1A-project-file-contracts.md` are foundation drafts on the documentation-control branch. | Do not merge until the module-by-module extraction and global todo consolidation are reviewed. |
| Scene Editor | Accepted baseline is `artifex/apps/scene-editor/index.html` / `v0.37-control-state-inspector-retention`. Ownership repair work from v0.34–v0.37 is complete. | Do not revive old ownership-repair tasks; next work is project integration. |
| Archetype Object Creator | V1.36 is merged on `main`; its lifecycle remains subject to post-merge functional validation. | Validate before beginning further Object Creator feature development. |
| Effect Editor | Accepted route is `artifex/apps/effect-editor/index2.html` / `INDEX2-CLEAN-0.2.6`. | Do not restore older emergency route work or treat parity controls already repaired as outstanding. |
| Puzzle Creator | V1.34 is the accepted UI-shell/Maze baseline recorded through merged implementation work; documentation refresh PR #44 is still open. | Leave current Puzzle work alone until its active editing stream is complete; do not merge duplicate status documents as the final documentation solution. |
| Sound Generator / Sound Library | Shared Sound Library/Create Synth work is currently in open PR #46. | Any items taken from PR #46 are provisional until that work is accepted/merged or deliberately retained. |

---

# All Apps / Shared Platform

## Documentation consolidation and source-of-truth control

Priority: highest  
Status: in progress through this documentation-control branch

- Establish `docs/artifex/1A-project-file-contracts.md` as the one universal Artifex contract after reviewing all remaining rule-bearing documents.
- Establish this file, `docs/artifex/2A-global-to-do.md`, as the single human-readable active Artifex backlog.
- Update `docs/artifex/0A-index-of-files.md` and all accepted module specifications so they point only to the approved active documentation structure.
- Inspect every real module/service and choose or create exactly one active specification document containing only its unique permanent purpose, ownership, route/baseline and specific interface rules.
- Extract still-valid permanent rules, module-specific facts and open work from old READMEs, todos, audits, handovers, baseline matrices and status-refresh documents.
- Check whether `artifex/shared/todo-guide/all-apps-todos.json` is read by application code before changing its role. If runtime-required, retain it temporarily as a machine-readable dependency only; do not treat it as a second human-maintained backlog.
- Check whether generated project-level task files such as `todos/project-manager-todos.json` or `todos/project-editor-todos.json` are runtime/user-project outputs rather than platform backlog files; retain compatibility where required.
- After extraction and dependency checks, archive superseded active-status, audit, handover and per-app todo documents rather than deleting useful history.
- Resolve or close documentation PRs that only update documents being superseded by this controlled structure, after extracting any valid information they contain.

Source material currently being consolidated includes:

```text
docs/GLOBAL_TODO.md
artifex/shared/todo-guide/README.md
artifex/shared/todo-guide/all-apps-todos.json
artifex/apps/*/docs/todo.md
artifex/apps/*/*plan*.md
artifex/shared/todo-guide/audits/**
docs/artifex/23-current-main-scan-and-pr20-recovery.md
docs/artifex/24-stabilisation-cleanup-and-ui-resumption-plan.md
```

## Module/file ownership and technical-debt audit

Priority: high  
Status: open

- Audit each module against the master contract for clear file ownership and module boundaries.
- Inspect large monolith files and split only where a real permanent responsibility boundary is required.
- Audit active patch, override, rescue, enhancer and hotfix layers across apps; move retained behaviour into permanent owners and archive inactive layers only after verification.
- Do not add new patch/wrapper layers as the normal method of feature work or repair.
- Keep implementation passes scoped to one app and one concern unless a clearly authorised dependency makes that impossible.

## Shared Artifex shell, branding and navigation consistency

Priority: medium/high  
Status: open, app-by-app adoption required

- Standardise the common header arrangement: Artifex logo/app title, visible version pill, divider and main menu.
- Standardise the File → Module flyout pattern listing core modules rather than listing every module inline in File menus.
- Audit each active app against the shared dark Artifex chrome and module accent-colour rules now incorporated into the master contract draft.
- Standardise visible version/cache-key handling so changed UI loads the matching accepted version consistently.
- Standardise remembered editor layout state and a Reset Saved Layout action in apps that have draggable/resizable panels, collapse state, zoom/pan or view toggles.

## Active project and connected-folder authoring foundation

Priority: highest  
Status: partly started; broad adoption remains open

- Complete shared connected-project-folder service adoption across the authoring apps.
- Make authoring modules load the active connected project's real owned files and indexes rather than falling back to unrelated demo/browser-local state when a project is connected.
- Implement consistent save-state reporting: **Saved to Project Folder**, **Local Draft Only**, **Project File Changed**, **Conflict**, **Permission Required**, **No Folder Connected**, **Save Failed**.
- Implement navigation protection when leaving an app with local-only unsaved work, offering Save and Continue, Stay Here, Continue Without Saving and Export Backup where relevant.
- Preserve the rule that browser-local data is recovery/workspace state and ZIP/download is backup/fallback, not the normal permanent project save path.
- Validate typed starter schema alignment and project-relative paths as each module adopts real connected-folder saving.

## Shared reference and cross-app linking infrastructure

Priority: high  
Status: open

- Create a shared project reference index so modules can display where assets, object archetypes, effects, actions, scenes, quests, routes and other linked resources are actually used.
- Use the shared reference index to power real reference listings in Archetype Object Creator rather than placeholder links.
- Define and implement a project-wide Portal endpoint registry and cross-app linking contract. Portals are not Maze-only paired teleporters: Puzzle Creator and Scene Editor may place endpoints, Quest Builder may activate/reference them, Project Editor displays/validates the graph, and Health/Build report broken links.
- Complete canonical Puzzle Creator → Quest Builder handoff using saved `puzzle_` IDs only after canonical puzzle saving/registration exists.

## Template Game connected-reference proof

Priority: high  
Status: open

- Build and validate the populated Template Game connected reference project using the same contracts as a real project.
- Prove cross-app reads/references through at least project identity, structural routes, screen/scene records, final registered assets, object/effect records, a Quest and, when implemented, a saved Puzzle linked into a Quest.
- Validate Health/Build results against the connected Template Game.
- Add Template Game as a Creation Guide new-project choice only after the connected reference proof passes.

## Health, audit and Build validation

Priority: high  
Status: open/partly foundational

- Consolidate reusable diagnostics into Shared Health Guide rather than duplicating check logic inside each authoring module.
- Validate connected-folder permission/write status, unsaved local drafts, external changes/conflicts, missing registered paths, broken IDs/references, duplicate IDs, unused assets and stale build/backup outputs.
- Ensure Health reports issues and fix ownership without silently overwriting authored content.
- Ensure Build Game validates and packages the project without becoming an authoring owner.

---

# Hub / Artifex Portal

Status: requires module audit after master/global foundation

- Check current Hub route, app links, visible version, icons and module labels against the final accepted module list.
- Ensure the Effect Editor Hub link remains directed to the accepted Index2 route.
- Define the Hub specification: navigation and project-entry ownership only, not authored module/project data.
- Integrate accurate active-project presentation only through the agreed shared active-project service/contract.
- Apply final shared shell branding/navigation conventions once the global shell contract is accepted.

---

# Creation Guide

Current documented baseline needing verification: V1.1.12 / connected-folder starter work mixed with transitional/local behaviour.

## Verification and contract alignment

- Verify current starter project initialisation from fresh `main`, including output files, folder layout and package/ZIP fallback behaviour.
- Confirm Blank Starter creation uses `startScreenId: null` until a real registered start screen exists; do not repeat older missing-start-screen behaviour.
- Verify remaining bootstrap/folder helper layers and decide whether any active transition code requires later consolidation into permanent ownership.

## Outstanding feature work

- Add **Initial Asset Intake Setup**: explain `intake/` staging, show the six standard source buckets, provide Create Intake Folders and Skip for Now, and write the approved intake structure to the connected project folder.
- Add a non-blocking **Recommended Starting Media** checklist for logo/title mark, background, player art, NPC art, interactable object, transition object and UI/icon placeholder set.
- Add project logo identity flow: intake source → Asset Library promotion → final registered project logo reference → display in Creation Guide/project selector where appropriate.
- Extend setup/readiness Health reporting for folder permission/save state, unsaved local drafts, intake completion/skipping, media readiness and invalid project-logo references.
- Reuse Shared Health Guide checks rather than retaining duplicate long-term health logic.
- Add the Template Game project choice only after the populated connected-reference project is proven.

---

# Project Editor

Current documented baseline needing verification: `artifex/apps/project-editor/index.html` / `v0.1.32 CONTRACT`.

## Naming, baseline and save verification

- Verify current Project Editor shell, current route/version and save/export behaviour from current `main` only.
- Remove remaining user-facing **Project Manager** terminology in later versioned passes while preserving compatibility for legacy identifiers/files that are still read.
- Migrate project-generated todo filename use from `todos/project-manager-todos.json` to `todos/project-editor-todos.json` only through an explicit backward-compatible migration.

## Connected project and structure editing

- Implement connected-folder open/re-authorisation/import flow so Project Editor loads canonical split project files from the real selected root.
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

Completed stabilisation work from v0.35–v0.37 must not be reopened as pending ownership work. The remaining tasks are integration tasks:

- Connect authored scenes/screens to the active project's real scene/screen files and indexes.
- Display accurate project-file versus local-draft save status through the shared save-state model.
- Place validated Object Creator and Effect Editor outputs through stable registered project references.
- Adopt Sound Library selection for scene ambience, local sound sources and transitions only after the Sound Library foundation is accepted and in a separate Scene Editor-owned pass. Status: **provisional, sourced from open PR #46**.
- Later define Scene Events, Triggers and portal linking after save/reference foundations are reliable.

---

# Quest Builder

Current live documented baseline: `V1.2.12`.

## Current known UI/terminology follow-up

- Change the live Module flyout label from **Project Manager** to **Project Editor** in a normal versioned app pass.
- Preserve accepted fine-grid, snap-mode and smart shortest-edge connector presentation while later features are implemented.

## Workspace layout track

- Add dynamic workspace expansion when cards approach the lower/right boundaries while maintaining comfortable blank padding.
- Allow START/END endpoints to be positioned consistently in an expanded workspace without inferring logic from their visual position.
- Add horizontal Insert Space layout management; consider vertical/obstacle-aware routing only if tested use requires it.

## Structured Quest authoring track

- Define export-safe structured data for operations, requirements, outcomes and Quest-scoped dialogue/Capra records.
- Replace vague free-text editing with contextual block-editing sections for actions, conditions, outcomes, failure/feedback, dialogue/presentation, linked assets and validation.
- Add in-app **Open Dialogue / Feedback** authoring inside Quest Builder; do not create an unnecessary separate Dialogue app for first version.
- Validate target IDs, dialogue references, feedback data and completion conditions.
- Align Quest/Sidequest saving to canonical connected-project typed indexes and folder saving.

## Linked Puzzle track

- Wait for or coordinate canonical Puzzle Creator connected-project saving/registration.
- Add a meaningful Quest Builder `Puzzle` block with required `puzzleId`.
- Read/select real registered puzzles from the active connected project.
- Store Quest-level requirements, outcomes and feedback only; do not copy puzzle internal definitions.
- Add missing-puzzle/public-result validation and Project Editor public-result gate integration.

## Audio integration track

- Add Sound Library selectors for stable Quest start, completion, failure, reward, dialogue and feedback audio fields only after the Sound Library foundation is accepted. Quest records store registered `asset_` IDs only. Status: **provisional, sourced from open PR #46**.

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

- Plan a separate focused ownership split of large `editor-ui.js` only after lifecycle validation; do not combine refactoring with a validation repair.
- Complete real scene/quest/reference listing in the existing Reference panel once the shared project reference index exists.
- Adopt Sound Library-first selection for Object Creator sound events only after the Sound Library foundation is accepted and without regressing the V1.36 lifecycle. Status: **provisional, sourced from open PR #46**.

## Migrated older todo handling

Older presentational Step 5 work in `docs/GLOBAL_TODO.md` has largely been delivered or superseded through V1.36. Retain only the unresolved real-reference-index requirement and lifecycle verification; do not re-add obsolete overlay/layout repair tasks as new feature work.

---

# Effect Editor

Accepted baseline: `artifex/apps/effect-editor/index2.html` / `INDEX2-CLEAN-0.2.6`.

## Editor UI and saved-library work

- Final QA/fix pass for the Display panel and view controls: avoid overlap with diagnostics, retain a clean icon grid, remove duplicate controls and keep Pause/Snapshot/Zoom positioning coherent.
- Restore the **My Settings** / favourite pinned controls panel as an Index2-owned module, including draggable/collapsible panel, edit/pin mode, live mirrored controls and locally persisted pinned controls/panel position.
- Add an **Effect Library** browser with visual thumbnails/previews, names, tags and engine types, ultimately backed by canonical connected-project effect records/indexes.
- Add an obvious Save action in Effect Archetype Assets with real connected-project save/status behaviour and separate backup/export fallback.
- Add live emitter-width brace markers and Degree Range cone guides that accurately reflect direction/range modes and respond to Guides visibility.

## Runtime/effect engine work

- Rescale gravity and speed controls into intuitive user-facing values consistent with visible runtime movement.
- Complete text-effect runtime and controls: spawn delay, text-specific density, multiline/spacing/wrap behaviour, direction/reveal/scatter/keep-block/lifetime controls and stability across font choices.
- Build missing real FX engines: smoke/cloud/mist/fog, spark/ember, electric arc/lightning, ribbon/trail, tornado/vortex/swirl, beam/laser, projectile/fireball, lens flare compositor, heat distortion/warping, convex/concave warps, liquid/blob/black-oil, rain/weather, shockwave/radial burst and sprite-sheet/flipbook FX.
- Perform a visual-quality pass on built-in presets only after underlying engines are stable.
- Finish real brush, overlay and icon asset loaders, with future Asset Library connection where appropriate.
- Integrate retained V3 polish/legacy layers into normal permanent module ownership and archive dead layers only after stable verification.

## Confirmed visual targets to preserve during implementation

- Lens flare / light glint: Three.js lens flare-style target combined with the user's circular overlay asset.
- Underworld oil droplets: living black-oil/blob target based on marching-cubes-style motion.
- Futuristic HUD bloom: general bloom effect plus uploaded PNG/image bloom support.
- Sunlight rays: god-rays/light-shaft target.
- Interactive water: disturbed/rippled water target.
- Shockwave: radial impact-ring target.
- Ground fog: low drifting ground-level fog/mist target.
- Choose final visual references for Explosion and Storm before implementing those engine targets.

## Audio integration track

- Add optional Sound Library cues for start, loop, impact and end sounds only after the Sound Library foundation is accepted and after confirming the accepted FX schema owner. Silent effects remain valid; saved cues use registered `asset_` IDs only. Status: **provisional, sourced from open PR #46**.

---

# Asset Library

- Define/retain the final Asset Library module specification for final registered `asset_` records, metadata, groups and asset selection.
- Complete supplied-source promotion from `intake/` into final indexed `assets/` records while keeping permanent authored content free of intake references.
- Support promotion/registration workflows needed by Creation Guide project-logo identity and starting-media readiness.
- Support Effect Library/other module selectors through stable registered references rather than placeholder/demo records.
- Add the canonical import/promote workflow for new audio files such as WAV, MP3 and OGG into final `assets/audio/` records; Sound Library should select registered audio, not become an ad-hoc importer. Status: **provisional, sourced from open PR #46**.

---

# Shared Connected Project Folder Service

Classification pending: confirm whether this remains a distinct maintained service specification or is sufficiently covered by the master contract plus implementation ownership.

- Complete directory-handle persistence/re-authorisation and relative-path read/write adoption needed by authoring modules.
- Provide common save-state and unsaved-navigation guard behaviour.
- Ensure project JSON never stores private local paths or browser handles.
- Support safe validation/finalisation workflows where owning apps write staged/final content through the connected project.

---

# Shared Active Project Service

Classification pending: confirm whether this warrants its own service specification.

- Make all apps reliably load the selected active project's real owned content/indexes where connected-project integration is implemented.
- Prevent apps from quietly showing unrelated demo/default state when a real active project is available.
- Define the safe boundary between browser-saved workspace selection/state and the connected project folder as the authored-data source of truth.

---

# Registered Content Service / Picker

Classification pending: determine whether this is a maintained service specification or part of Asset Library/shared project infrastructure.

- Provide stable selection/lookup of registered asset, object archetype and effect archetype records for authoring modules.
- Support real reference validation without creating parallel ownership of the selected records.
- Align with Asset Library and project reference index decisions.

---

# Shared Health Guide / Project Audit

- Establish or confirm the single Health Guide specification and shared check ownership.
- Replace duplicated per-app long-term check logic with reusable shared checks displayed in app-appropriate contexts.
- Report broken references, missing required records, invalid connected-folder state, unsaved local drafts, conflicts, duplicate IDs, unused assets and build readiness.
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

Protected active work stream: consolidate only after checking the latest Puzzle work.  
Last accepted baseline established through merged UI work: `artifex/apps/puzzle-creator/index.html` / `V1.34`, with Maze / Labyrinth as the currently developed playable workflow.

- Preserve the accepted V1.34 launcher/navigation/Maze UI-shell baseline while later work is scoped.
- Implement canonical connected-project saving/index registration for `puzzles/puzzle-index.json` and `puzzles/puzzle_<slug>.json`.
- Coordinate the saved `puzzleId` handoff with Quest Builder only after canonical saved puzzle records exist.
- Scope additional puzzle engines/features separately; do not present surfaced non-Maze choices as completed gameplay editors until built/tested.
- Retain registered-content/final-asset reference rules for any puzzle-owned assets/effects/audio.
- Adopt Sound Library feedback selection for correct input, wrong input, unlock, timer warning, completion and failure only after the Sound Library foundation is accepted and without interfering with current Puzzle work. Status: **provisional, sourced from open PR #46**.

---

# Sound Generator / Sound Library

Protected active work stream: open PR #46 currently modifies this area.  
This section preserves future/adoption work without claiming PR #46 is accepted or merged.

## Proposed shared foundation currently under review in PR #46

- Provide a shared Sound Library selector that lists registered imported/generated audio assets through `assets/asset-index.json` and returns registered `asset_` IDs only.
- Provide Create New Synth Sound inside Sound Library, writing approved generated recipes to final audio assets and registering them through Asset Library.
- Confirm the standalone preview harness proves selection, preview, generated-synth save/registration and caller-target preservation before caller-app adoption.
- After any merge, reconcile the Sound Generator specification document and this todo section to the actual accepted baseline.

## Deferred caller adoption tasks after foundation acceptance

- Archetype Object Creator: Sound Library-first selection for object sound events without regressing V1.36 lifecycle/target ownership.
- Quest Builder: selectors for stable quest audio fields.
- Effect Editor: optional effect start/loop/impact/end cues.
- Puzzle Creator: feedback sounds.
- Scene Editor: ambience, sources and transitions.
- Asset Library: import/promotion of newly supplied audio files, since Sound Library must not own ad-hoc audio importing.

---

# Documentation / PR reconciliation queue

These are documentation-control actions, not implementation approval:

| PR / document area | Current interpretation | Consolidation treatment |
|---|---|---|
| Draft PR #47 — this documentation-control branch | Contains `0A` and `1A`, now to include `2A`. | Keep as draft until module extraction and document reference updates are sufficiently complete for review. |
| Open PR #40 — Scene/Effect status refresh | Its Scene status was superseded by the later accepted Scene Editor v0.37 record; parts of its status-refresh approach are no longer needed as separate active docs. | Extract any unique outstanding task only; do not merge it as another active status authority. |
| Open PR #44 — Puzzle V1.34 status refresh | Contains useful current Puzzle baseline information but updates the older duplicated documentation structure while Puzzle remains an active work stream. | Reconcile late with the Puzzle module spec/global todo rather than merge duplicate status sources as the final structure. |
| Open PR #46 — Sound Library / Create Synth Sound | Active runtime/doc/task work in an area currently being edited. | Preserve as active work; tasks copied here are explicitly provisional until accepted/merged. |
| `docs/GLOBAL_TODO.md` | Contains older Object Creator follow-up items, many superseded by V1.36; unresolved real-reference need retained here. | Supersede/archive only after this `2A` document is approved and references are updated. |
| `artifex/shared/todo-guide/all-apps-todos.json` | Contains a large backlog and may have live/machine dependency implications. | Use as extraction source; check dependencies before retiring its human-backlog role. |
| Per-app `todo.md`, plan, audit and status files | Mix current work with history and specification facts. | Extract into this todo/module specs, then archive where superseded and safe. |

## Migrated-source checkpoint

Open work has been copied or consolidated here from the known active backlog sources reviewed so far:

```text
docs/GLOBAL_TODO.md
artifex/shared/todo-guide/README.md
artifex/shared/todo-guide/all-apps-todos.json
artifex/apps/archetype-object-creator/docs/todo.md
artifex/apps/effect-editor/docs/todo.md
artifex/apps/quest-builder/docs/todo.md
docs/artifex/24-stabilisation-cleanup-and-ui-resumption-plan.md
merged Scene Editor accepted-baseline PR #45
open Puzzle documentation PR #44
open Sound Library / Sound Generator PR #46
```

As each module is audited in order, this file must be checked against its remaining app-specific plans/todo documents so any additional still-live task is added here before the old source is archived.