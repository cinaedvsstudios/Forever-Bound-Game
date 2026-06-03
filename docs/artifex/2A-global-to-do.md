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
| Documentation control | `0A`, `1A` and `2A` were published on `main` through merged PR #47. This pass corrects the controlled backlog path and adds extracted module specifications `3A`, `4A`, `5A`, `6A` and `7A`. | Continue through documentation-only passes; do not create competing active indexes, task lists or status documents. |
| Hub / Artifex Portal | Current implementation is `artifex/index.html` / **Artifex Hub V1.1.4**; `3A-hub-artifex-portal.md` is created in this pass from that current implementation. | Do not treat the older radial/wedge Portal plan as the current implementation authority. |
| Creation Guide | Current implementation is `artifex/apps/creation-guide/index.html` / **V1.1.12**; it includes connected-folder starter creation and optional Initial Asset Intake Setup. `4A-creation-guide.md` is created in this pass. | Do not use V1.1.10/V1.1.11 documents to describe current functionality or re-list implemented intake setup as future work. |
| Project Editor | Current implementation is `artifex/apps/project-editor/index.html` / **v0.1.32 CONTRACT**; it is a modular browser-draft/ZIP-import-export structural editor and `5A-project-editor.md` is created in this pass. | Do not list implemented Asset Browser/linking/Stitcher/Health functionality as future work, and do not treat browser draft state as connected-project truth. |
| Scene Editor | Accepted implementation is `artifex/apps/scene-editor/index.html` / **v0.37-control-state-inspector-retention**; the v0.35–v0.37 stabilisation chain is complete and `6A-scene-editor.md` is created in this pass. | Do not revive old v0.34 wrong-object/ownership repair tasks; remaining work is connected-project/reference integration. |
| Quest Builder | Current implementation is `artifex/apps/quest-builder/index.html` / **V1.2.12**; it includes the accepted fine-grid/smart-routing presentation and `7A-quest-builder.md` is created in this pass. | Do not list existing explicit connections, snap/grid presentation, block editing shell or export/validation foundation as missing; connected-project and structured-authoring work remains open. |
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
- Continue extraction after the Quest Builder pass in the approved module order, with **Archetype Object Creator** next.
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
docs/artifex/04-scene-editor.md
docs/artifex/05-creation-guide.md
docs/artifex/05a-creation-guide-v119-implementation-notes.md
docs/artifex/07-quest-builder.md
docs/artifex/07a-quest-builder-structured-authoring.md
docs/artifex/07b-puzzle-creator-quest-integration.md
artifex/apps/quest-builder/README.md
artifex/apps/quest-builder/docs/structure.md
artifex/apps/quest-builder/docs/block-taxonomy.md
artifex/apps/quest-builder/docs/todo.md
artifex/apps/project-editor/docs/project-editor-real-split-plan.md
artifex/apps/scene-editor/scene-editor-v037-accepted-baseline-2026-06-02.md
artifex/apps/scene-editor/scene-editor-cleanup-report-2026-05-29.md
artifex/apps/scene-editor/scene-editor-v034-failed-acceptance-and-consolidation-plan-2026-05-31.md
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

- Complete shared connected-project-folder service adoption across authoring apps beyond the current Creation Guide starter/intake implementation.
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

Active specification created in this pass: `docs/artifex/4A-creation-guide.md`.  
Verified implementation baseline: `artifex/apps/creation-guide/index.html` / **Artifex Creation Guide V1.1.12** on current `main`.

## Verified complete or already present in V1.1.12

- Connected Project Folder controls exist for connect and re-authorise actions.
- **Create Starter Structure** writes the empty canonical starter foundation through shared folder/structure services without overwriting existing files.
- Blank Starter Project initial output uses `startScreenId: null` until a real registered screen exists.
- **Initial Asset Intake Setup** exists, with the six displayed intake source buckets, **Create Intake Folders** / **Verify Intake Folders** and **Skip for Now**.
- Current Health presentation already reports connected-folder state, starter structure and intake setup status.

## Outstanding feature and cleanup work

- Add a working non-blocking **Recommended Starting Media** checklist for logo/title mark, background, player art, NPC art, interactable object, transition object and icon/UI placeholder set; it currently appears only as a future/warning Health item.
- Add project-logo identity flow: intake source → Asset Library promotion → final registered project logo reference → display in Creation Guide/project selector where appropriate.
- Extend Health/readiness reporting for real recommended-media state and invalid project-logo reference; retain later shared Health Guide reuse rather than multiplying duplicate check owners.
- Reconcile the current layered V1.1.12 implementation: `app-bootstrap.js` still patches an older `module-app.js`, and the current UI modules overlay older project metadata/label concepts. Perform this only as a focused versioned implementation pass, not documentation repair.
- Reconcile browser-local project summary/active-project handoff with the eventual Shared Active Project Service while retaining connected project files as authored-data truth.
- Add the Template Game project choice only after the populated connected-reference project is proven.
- Decide archive or local-pointer treatment for `docs/artifex/05-creation-guide.md`, `docs/artifex/05a-creation-guide-v119-implementation-notes.md` and `artifex/apps/creation-guide/README.md` after `4A` is accepted.

---

# Project Editor

Active specification created in this pass: `docs/artifex/5A-project-editor.md`.  
Verified implementation baseline: `artifex/apps/project-editor/index.html` / **Artifex Project Editor v0.1.32 CONTRACT - Flatplan** on current `main`.

## Verified complete or already present in v0.1.32 CONTRACT

- The live route is a modular Project Editor shell rather than the old monolithic `index.html`.
- Flatplan structural browser-draft editing exists for project, logic, layout and registry state.
- The Asset Browser already reads imported canonical index content for scenes/screens, quests, sidequests, puzzles, object/effect archetypes and assets.
- Linking an imported library item to a selected Flatplan node is already implemented.
- Stitcher already exposes simple, branch, quest-gated, puzzle-gated, item-gated, flag/condition and completed-state route types with gate/flag/state fields.
- Shared Health-backed Getting Started and Build Prep presentation already exists.
- Project JSON/ZIP import and backup ZIP export exist; browser draft saving is explicitly labelled as browser-only.

## Outstanding integration, compatibility and cleanup work

- Implement connected-folder open/re-authorisation/load flow so Project Editor reads canonical split files and live indexes from the active project root rather than relying on demo/default or imported browser-only state.
- Implement direct Save Current Project / Save All for Project Editor-owned structural files through the shared folder service, retaining browser drafts and ZIP export only as recovery/backup/fallback layers.
- Preserve and validate the existing import/export package interface while direct save is added, including compatibility for older project package files.
- Migrate remaining active **Project Manager** source text, shared-health scopes and generated `todos/project-manager-todos.json` handling to Project Editor naming only through an explicit backward-compatible path.
- Confirm/fix the Module menu Effect Editor destination against the protected accepted `apps/effect-editor/index2.html` route.
- Extend structural validation for live connected references, broken gate/link IDs and real runtime/build readiness without authoring other modules' records.
- Improve selected-node/route inspector editing only where not already provided by Stitcher; do not re-list the implemented route-type form as missing.
- Replace the placeholder Stitcher route-playtest alert only when a confirmed Runtime/Playtest interface exists.
- Decide archive treatment for `artifex/apps/project-editor/docs/project-editor-real-split-plan.md` after `5A` is accepted and no uncaptured live task remains.

---

# Scene Editor

Active specification created in this pass: `docs/artifex/6A-scene-editor.md`.  
Verified accepted implementation baseline: `artifex/apps/scene-editor/index.html` / **Artifex Scene Editor v0.37-control-state-inspector-retention** on current `main`, supported by merged accepted-baseline PR #45.

## Verified complete or already present in v0.37

- The live Scene Editor is modular and loads owned model, IO, stage-drag, renderer, bindings, core API and app/bootstrap components.
- The v0.35–v0.37 ownership/stabilisation chain is accepted: Object Inspector/transform/movement ownership consolidation, selected-object artwork display repair, Clear Selection, colour-only Aspect Ratio Lock state and retained inspector scroll position are not pending work.
- Scene/screen visual editing already covers scene identity/type/tags, grid, background, layers, placed elements, UI collection and scene-level audio fields in the local JSON workflow.
- Local browser working-copy recovery, JSON import/template loading and JSON download are implemented.
- Scene Editor displays active-project context through the shared active-project client, but this is currently presentation only.
- The current Asset Library popup selects existing fixed-manifest asset paths for visual placement; it is not connected-project final-asset registration or selection.

## Outstanding integration and future work

- Implement connected-project scene/screen loading, direct saving and typed scene/screen index registration through the shared folder/save-state foundation.
- Display accurate project-file versus local-draft/save/conflict/permission status rather than relying only on local backup/download indicators.
- Replace fixed-manifest/path-only placement with stable connected-project registered references for validated Asset Library, Archetype Object Creator and Effect Editor outputs where appropriate.
- Adopt Sound Library selection for ambience, local sound sources and transitions only after the Sound Library foundation is accepted and in a separate Scene Editor-owned pass. Status: **provisional, sourced from open PR #46**.
- Define Scene Events, Triggers and portal linking only after save/reference foundations are reliable and the cross-module ownership contract is agreed.
- Decide archive treatment for `docs/artifex/04-scene-editor.md`, `artifex/apps/scene-editor/scene-editor-v037-accepted-baseline-2026-06-02.md`, `scene-editor-cleanup-report-2026-05-29.md` and `scene-editor-v034-failed-acceptance-and-consolidation-plan-2026-05-31.md` after `6A` is accepted and no uncaptured live task remains.

---

# Quest Builder

Active specification created in this pass: `docs/artifex/7A-quest-builder.md`.  
Verified implementation baseline: `artifex/apps/quest-builder/index.html` / **Artifex Quest Builder V1.2.12** on current `main`.

## Verified complete or already present in V1.2.12

- The live app is modular and loads focused modules for configuration, block taxonomy, quest schema, saved layout, UI bindings, canvas rendering, connection routing, editor dialogs and export.
- The current editor already provides Quest/block inspection, popup editing, New Quest Wizard, starter templates and a visual Quest Flow workspace.
- START and END nodes, explicit logical Quest connections, source-coloured connector display and current export/validation of explicit connections are already implemented.
- V1.2.12 already provides the accepted fine grid, optional snap-to-grid control and smart shortest-edge connector display routing; these are not future tasks.
- Workspace layout preferences and card positions already persist in browser state.
- JSON bundle export, split project-file downloads and current warning/self-check validation already exist as an export workflow, although they are not canonical connected-project saving.

## Outstanding implementation and integration work

- Align Quest/Sidequest export/index output with the canonical typed `quests` / `sidequests` collections and remove current old schema/path assumptions including `projectTarget: projects/<project-id>/` from future direct-save output.
- Implement real connected-project load, deliberate save, save-state and conflict/navigation handling for Quest Builder-owned `quests/` and `sidequests/` files through the shared connected-folder foundation.
- Replace demo/local-only opened content behaviour once an active connected project is available, while retaining browser draft/export as fallback or recovery only.
- Change the live Module flyout from **Project Manager** / old project-manager route to **Project Editor** through a normal versioned app pass with compatibility checked where necessary.
- Align current `dialogue` block source metadata away from implying a required separate `dialogue-library`; first-version Quest-specific dialogue and Capra feedback belong contextually inside Quest Builder.
- Define export-safe structured data for actions, requirements/conditions, success outcomes, failure/Capra feedback and Quest-scoped dialogue records, then implement the contextual block editor and validation around that defined structure.
- Add in-app **Open Dialogue / Feedback** authoring where a block needs ordered lines; do not create a separate top-level Dialogue Editor for first version.
- Add dynamic workspace expansion, moveable/saved START and END positions and horizontal Insert Space layout management as a separate UI/layout implementation track; consider obstacle-routing/manual-side override only if tested need is demonstrated.
- Coordinate Puzzle Creator canonical saving/registration first, then add a real Quest Builder `Puzzle` block with required `puzzleId`, real saved-puzzle selection, Quest-level outcomes only and missing-puzzle/public-result validation.
- Add Sound Library selectors for stable Quest voice, start, completion, failure, reward, dialogue and feedback audio fields only after the Sound Library foundation is accepted; save registered `asset_` IDs only. Status: **provisional, sourced from open PR #46**.
- Add future **Test Quest** through confirmed shared Runtime/Playtest support without changing permanent project files during test overrides.
- Decide archive or minimal-local-pointer treatment for `docs/artifex/07-quest-builder.md`, `07a-quest-builder-structured-authoring.md`, `07b-puzzle-creator-quest-integration.md`, `artifex/apps/quest-builder/README.md`, `docs/structure.md`, `docs/block-taxonomy.md` and `docs/todo.md` after `7A` is accepted and no unique live requirement remains.

---

# Archetype Object Creator

Current runtime baseline: **V1.36 merged on `main` from PR #38**.  
Immediate gate: functional lifecycle validation before more feature work.  
Next documentation extraction: create its single module specification after checking current implementation and any validation evidence.

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

- Complete directory-handle persistence/re-authorisation and relative-path read/write adoption required by authoring modules beyond the current Creation Guide implementation.
- Provide common save-state and unsaved-navigation guard behaviour.
- Ensure project JSON never stores private local paths or browser handles.
- Support safe validation/finalisation workflows where owning apps write staged/final content through the connected project.

---

# Shared Active Project Service

Classification pending: confirm whether this warrants its own service specification.

- Make all apps reliably load the selected active project's real owned content/indexes where connected-project integration is implemented.
- Prevent apps from quietly showing unrelated demo/default state when a real active project is available.
- Define the safe boundary between browser-saved workspace selection/state and the connected project folder as authored-data source of truth.
- Reconcile the Hub V1.1.4 and Creation Guide V1.1.12 localStorage handoff as part of this decision, without making either module responsible for authored project data.

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
| Draft PR #50 — Hub, Creation Guide, Project Editor, Scene Editor and Quest Builder extraction pass | Adds `3A`, `4A`, `5A`, `6A` and `7A`, corrects `0A`/`1A`, and refreshes `2A` for verified current module baselines and protected Puzzle/Sound work. | Review as a documentation-only PR; no runtime or archive operation is authorised by it. |
| Merged PR #45 — Scene Editor accepted baseline | Accurately records v0.37 as accepted after the stabilisation chain and supersedes older pending/failure status wording. | Treat as source evidence now captured in `6A` / `2A`; determine later archive treatment after acceptance. |
| Open PR #40 — Scene/Effect status refresh | Its Scene status was superseded by the later accepted Scene Editor v0.37 record; status-refresh files are not final documentation authority. | Extract any unique outstanding Effect work only; do not merge as another active Scene status source. |
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
docs/artifex/04-scene-editor.md
docs/artifex/05-creation-guide.md
docs/artifex/05a-creation-guide-v119-implementation-notes.md
docs/artifex/07-quest-builder.md
docs/artifex/07a-quest-builder-structured-authoring.md
docs/artifex/07b-puzzle-creator-quest-integration.md
artifex/apps/quest-builder/README.md
artifex/apps/quest-builder/docs/todo.md
artifex/apps/quest-builder/docs/structure.md
artifex/apps/quest-builder/docs/block-taxonomy.md
artifex/apps/quest-builder/index.html at Artifex Quest Builder V1.2.12
artifex/apps/quest-builder/v1/src/module-config.js
artifex/apps/quest-builder/v1/src/block-types.js
artifex/apps/quest-builder/v1/src/quest-schema.js
artifex/apps/quest-builder/v1/src/layout-state.js
artifex/apps/quest-builder/v1/src/connection-routing.js
artifex/apps/quest-builder/v1/src/quest-builder-app.js
artifex/apps/quest-builder/v1/src/export-json.js
artifex/apps/creation-guide/README.md
artifex/apps/creation-guide/index.html at Artifex Creation Guide V1.1.12
artifex/apps/creation-guide/v1/src/project-folder-setup.js
artifex/apps/creation-guide/v1/src/intake-setup.js
artifex/apps/creation-guide/v1/src/project-health.js
artifex/shared/project-folder/project-structure-initializer.js
artifex/apps/project-editor/index.html at Artifex Project Editor v0.1.32 CONTRACT - Flatplan
artifex/apps/project-editor/src/project-app.v7.js
artifex/apps/project-editor/src/project-state.js
artifex/apps/project-editor/src/project-io.js
artifex/apps/project-editor/src/project-library-indexes.js
artifex/apps/project-editor/src/project-integration-ui.js
artifex/apps/project-editor/src/project-asset-linking.js
artifex/apps/project-editor/src/project-route-types.js
artifex/apps/project-editor/src/project-stitcher.js
artifex/apps/project-editor/src/project-buildprep.js
artifex/apps/project-editor/docs/project-editor-real-split-plan.md
artifex/apps/scene-editor/index.html at Artifex Scene Editor v0.37-control-state-inspector-retention
artifex/apps/scene-editor/scene-editor-config.js
artifex/apps/scene-editor/scene-editor-app.js
artifex/apps/scene-editor/scene-editor-storage.js
artifex/apps/scene-editor/scene-editor-scene-model.js
artifex/apps/scene-editor/scene-editor-io.js
artifex/apps/scene-editor/scene-editor-renderer.js
artifex/apps/scene-editor/scene-editor-asset-path-tools.js
artifex/apps/scene-editor/scene-editor-transform-controls.js
artifex/apps/scene-editor/scene-editor-v037-accepted-baseline-2026-06-02.md
artifex/apps/scene-editor/scene-editor-cleanup-report-2026-05-29.md
artifex/apps/scene-editor/scene-editor-v034-failed-acceptance-and-consolidation-plan-2026-05-31.md
merged Scene Editor accepted-baseline PR #45
docs/artifex/11-portal-hub.md
docs/artifex/24-stabilisation-cleanup-and-ui-resumption-plan.md
artifex/index.html at Artifex Hub V1.1.4
open Puzzle documentation PR #44
merged Puzzle Creator implementation PR #48
open Sound Library / Sound Generator PR #46
```

As each module is audited in order, this file must be checked against its remaining app-specific plans/todos so any additional still-live task is added here before the older source is archived.