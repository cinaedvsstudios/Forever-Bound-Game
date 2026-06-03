# Artifex Global To Do

Status: Active consolidation backlog during module extraction  
Intended final role: the single human-readable active task list for Artifex  
Current documentation pass branch: `docs/hub-spec-and-controlled-todo-path-20260602`

## How this document is used

This file is the single controlled destination for outstanding human-maintained Artifex work during documentation consolidation. Module specifications say what a module permanently is and owns. `docs/artifex/1A-project-file-contracts.md` says what all modules must obey. This file says what remains to be done.

Rules for migrated tasks:

- Completed historical work is not reopened because an older todo or audit mentioned it.
- Baselines live in module specifications and are repeated here only when needed to stop stale implementation decisions.
- Tasks from open runtime PRs remain **provisional** until the relevant work is accepted or deliberately retained.
- Old todos, audits and plans remain extraction evidence until their valid information is represented in controlled documents and archive treatment is approved.
- Puzzle Creator and Sound Generator remain protected active work streams and must not be overwritten from older evidence.

## Protected baselines and active overlaps

| Area | Current controlled position | Protection rule |
|---|---|---|
| Documentation control | `0A`, `1A` and `2A` were published through merged PR #47. This pass adds extracted specifications `3A` through `8A`. | Do not create competing active indexes, task lists or current-state documents. |
| Hub / Artifex Portal | `artifex/index.html` / **Artifex Hub V1.1.4**; extracted into `3A`. | Do not treat the older radial/wedge plan as current authority. |
| Creation Guide | `artifex/apps/creation-guide/index.html` / **V1.1.12**; extracted into `4A`. | Connected-folder starter creation and Initial Asset Intake Setup already exist. |
| Project Editor | `artifex/apps/project-editor/index.html` / **v0.1.32 CONTRACT**; extracted into `5A`. | Imported-index browser, node linking, Stitcher forms and Health/Build Prep presentation already exist. |
| Scene Editor | Accepted `artifex/apps/scene-editor/index.html` / **v0.37-control-state-inspector-retention**; extracted into `6A`. | Do not revive completed v0.35–v0.37 stabilisation work. |
| Quest Builder | `artifex/apps/quest-builder/index.html` / **V1.2.12**; extracted into `7A`. | Do not list implemented connection/grid/routing/export foundations as future work. |
| Archetype Object Creator | `artifex/apps/archetype-object-creator/index.html` / **V1.36**; extracted into `8A`. | V1.36 is the current implementation, but its project-save/finalisation lifecycle still requires disposable-project functional validation before feature development. |
| Effect Editor | Accepted route is `artifex/apps/effect-editor/index2.html` / **INDEX2-CLEAN-0.2.6**. | Do not restore old emergency routes or overwrite the accepted Index2 baseline. |
| Puzzle Creator | Merged **V1.35**: Labyrinth Maze is working; surfaced additional modules are planning pages/placeholders. | Audit late; do not call placeholders completed engines. |
| Sound Generator / Sound Library | Open PR #46 modifies this area. | Audit last; copied tasks remain provisional until accepted/merged. |

---

# All Apps / Shared Platform

## Documentation control

Priority: highest  
Status: in progress

- Maintain `1A-project-file-contracts.md` as the single universal contract, `2A-global-to-do.md` as the single human-readable backlog and `0A-index-of-files.md` as the controlled document map.
- Continue module extraction in order, with **Effect Editor** next after the completed `8A` Object Creator extraction.
- Extract remaining valid rules/tasks from old READMEs, audits, handovers, status files and app-specific todos; archive only after transfer and dependency checking.
- Check whether `artifex/shared/todo-guide/all-apps-todos.json` or project-level todo files are consumed by code before changing their role; runtime-required machine task data must not remain a competing human backlog.
- Reconcile or close older documentation PRs only after capturing unique valid material.

## Ownership and technical-debt audit

Priority: high  
Status: open

- Audit each module against the master contract for single permanent ownership and bounded cross-module references.
- Review large monolith files and split only at real permanent responsibility boundaries.
- Audit active patch, overlay, rescue, enhancer and hotfix layers; move retained behaviour into permanent owners and archive inactive history only after verification.
- Do not add new patch/wrapper layers as normal feature or repair work.

## Shared shell, branding and navigation consistency

Priority: medium/high  
Status: open

- Standardise header arrangement, File → Module flyout behaviour, platform chrome/accent use, visible version/cache handling and saved editor-layout/reset behaviour where relevant.
- Ensure **Project Editor** remains the official user-facing name and the protected Effect Editor destination remains `index2.html` unless replaced through an accepted baseline.

## Active project and connected-folder authoring foundation

Priority: highest  
Status: partly started

- Complete connected-project-folder adoption across authoring modules beyond Creation Guide starter/intake setup and the currently unvalidated Object Creator lifecycle implementation.
- Make modules load and save their owned real project files/indexes when a connected project is available rather than relying on demo or browser-local state.
- Implement consistent save-state reporting and unsaved-navigation protection across authoring apps.
- Keep browser storage as workspace/recovery state and ZIP/download as backup/fallback, not everyday project truth.
- Validate canonical typed indexes, project-relative paths and no-silent-overwrite behaviour during each module integration.

## Shared reference, Health, Build and Template Game work

Priority: high  
Status: open

- Create a shared project reference index for real usage of assets, objects, effects, actions, scenes, quests, routes and linked resources.
- Define a project-wide portal/linking contract across Scene Editor, Puzzle Creator, Quest Builder, Project Editor, Health and Build.
- Consolidate reusable diagnostics into Shared Health Guide without silent correction of authored content.
- Confirm Build Game validates/packages canonical content without becoming an authoring owner.
- Build and validate the populated Template Game connected reference project, then expose it in Creation Guide only after the proof succeeds.

---

# Hub / Artifex Portal

Specification: `docs/artifex/3A-hub-artifex-portal.md`.

- Rename the transitional **Puzzle / Asset Tools** label so Puzzle Creator is not presented as owning Asset Library.
- Resolve final displayed naming for Object Creator after `8A` is accepted.
- Reconcile current browser-local active-project handoff with any later confirmed shared active-project service.
- Apply shared-shell refinements through a later implementation pass.
- Archive `docs/artifex/11-portal-hub.md` only after `3A` is accepted and no uncaptured task remains.

---

# Creation Guide

Specification: `docs/artifex/4A-creation-guide.md`.  
Verified implemented already: connected-folder controls, Create Starter Structure, `startScreenId: null` blank starter output, Initial Asset Intake Setup and basic folder/structure/intake Health presentation.

- Add working non-blocking Recommended Starting Media checklist.
- Add project-logo flow from intake source through Asset Library promotion to registered display reference.
- Extend Health/readiness reporting for real recommended-media and invalid logo-reference status.
- Consolidate the layered V1.1.12 implementation only in a focused versioned implementation pass.
- Reconcile browser-local project handoff with eventual shared active-project infrastructure.
- Add Template Game choice only after the populated connected-project proof passes.
- Decide archive/local-pointer treatment for older Creation Guide documents after `4A` acceptance.

---

# Project Editor

Specification: `docs/artifex/5A-project-editor.md`.  
Verified implemented already: modular shell, browser-draft Flatplan editing, imported-index Asset Browser, node linking, Stitcher route forms, Health/Build Prep presentation and JSON/ZIP import/backup export.

- Implement connected-folder load and direct save for Project Editor-owned structural files and indexes.
- Retain browser drafts/ZIP export only as recovery or fallback and preserve backward compatibility for imported older packages.
- Migrate remaining active **Project Manager** source text/scopes/output filenames through explicit backward-compatible handling.
- Fix/confirm its Effect Editor menu destination against the protected `index2.html` route.
- Extend live connected-reference/gate validation and runtime/build readiness display without authoring other modules' records.
- Replace placeholder route-playtest behaviour only when a confirmed Runtime/Playtest interface exists.
- Archive the old split-plan document only after `5A` acceptance and task verification.

---

# Scene Editor

Specification: `docs/artifex/6A-scene-editor.md`.  
Verified implemented already: modular visual editor, accepted v0.35–v0.37 control/selection fixes, local scene/screen workflow, local recovery/import/template/download, active-project context display and fixed-manifest asset-path picker.

- Implement connected-project scene/screen loading, direct saving and typed index registration.
- Display canonical project-file/local-draft/conflict/permission save state.
- Replace fixed-manifest/path-only placement with stable connected-project registered Asset/Object/Effect references where applicable.
- Add Sound Library selection only after Sound foundation acceptance. Status: **provisional from PR #46**.
- Define Scene Events, Triggers and portal linking only after save/reference foundations are reliable.
- Decide archive treatment for old Scene Editor status/plan documents after `6A` acceptance.

---

# Quest Builder

Specification: `docs/artifex/7A-quest-builder.md`.  
Verified implemented already: modular editor, Quest/block shell, START/END, explicit connections, saved workspace layout, accepted fine-grid/snap/smart-shortest presentation, current export workflow and validation foundation.

- Align Quest/Sidequest export/index output with canonical typed collections and remove old direct-save path assumptions.
- Implement connected-project load/save/save-state/conflict handling for Quest Builder-owned files.
- Correct live **Project Manager** navigation wording/route to **Project Editor** with compatibility checks.
- Implement structured action/condition/outcome/dialogue/Capra authoring and validation inside Quest Builder.
- Add dynamic workspace expansion, movable/saved START/END placement and Insert Space as a separate UI track.
- After canonical Puzzle Creator saving exists, add a real `Puzzle` block using required `puzzleId` and Quest-level outcomes only.
- Add registered Sound Library selectors only after Sound foundation acceptance. Status: **provisional from PR #46**.
- Add Test Quest only through a confirmed shared Runtime/Playtest interface.
- Archive or replace overlapping Quest Builder docs with minimal pointers after `7A` acceptance.

---

# Archetype Object Creator

Specification: `docs/artifex/8A-archetype-object-creator.md`.  
Current implementation: **V1.36**, merged in PR #38. Its visible Step 5 repair was accepted before merge; its project-save/finalisation lifecycle is present in code but still requires functional validation.

## Mandatory V1.36 functional validation gate

Use a disposable Blank Starter Project folder only:

- Test **Save Project (In Progress)** with uploaded images: stored project JSON must use staging paths and no browser `dataUrl`, while current-session previews/playback/frame correction behaviour remains usable.
- Test **Open Project Object** for a saved `in_progress` object and confirm staged media rehydrates into editable visible frames.
- Test invalid **Finish / Mark Object Ready** and confirm no final media, final asset-index record or ready object/index entry is written.
- Test valid finalisation and confirm final media promotion, final `asset_` registration and top-level gameplay/portrait asset-ID mapping.
- Test multiple primary Gameplay Sprite or Dialogue Portrait images and confirm finalisation refuses fixed-path overwrites before final output writes.
- Test stale-target sound assignment by changing selection before return and confirming the returned sound remains attached only to the initiating target.
- Test per-frame correction persistence through actions, project save/reopen, export/import and finalisation.
- Confirm no duplicate Step 5 controls, module-load failures or console errors.

## Follow-up after validation

- Do not begin further Object Creator feature work until the lifecycle validation gate has passed or generated specific repair tasks.
- Plan any later split of large `editor-ui.js` only after validation and separately from repair work.
- Complete real Scene/Quest/Puzzle reference listing in the existing Reference panel once shared project-reference infrastructure exists.
- Adopt Sound Library-first object sound selection only after Sound foundation acceptance and without regressing lifecycle/target ownership. Status: **provisional from PR #46**.
- Decide archive/minimal-pointer treatment for `docs/artifex/06-object-library.md`, the local README, `docs/current-state-v1.35-review.md` and `docs/todo.md` after `8A` acceptance and validation tracking is retained here.
- Treat `APPLY_INSTRUCTIONS.txt` and `archive/legacy-patches/README.md` as historical/archive evidence only; do not restore retired patch layers.

---

# Effect Editor

Next documentation extraction.  
Protected accepted baseline: `artifex/apps/effect-editor/index2.html` / **INDEX2-CLEAN-0.2.6**.

- Extract the single Effect Editor specification from current implementation and relevant status/plan documents while protecting the accepted Index2 route.
- Complete remaining Display panel/view-control QA without reviving repaired parity tasks.
- Restore My Settings/favourite pinned controls as Index2-owned behaviour.
- Add Effect Library browsing and real connected-project save/status for effect archetypes.
- Add required visual guides and refine runtime-facing gravity/speed control scaling.
- Implement remaining real FX engines and text-effect runtime gaps only after ownership/baseline confirmation.
- Finish real brush/overlay/icon loaders and later Asset Library connection where appropriate.
- Add optional registered sound cues only after Sound foundation and accepted FX schema owner are confirmed. Status: **provisional from PR #46**.

---

# Asset Library

- Define or retain the single Asset Library specification for final registered `asset_` records, metadata, groups and selection.
- Complete promotion from `intake/` into final indexed records while keeping authored content free of intake references.
- Support Creation Guide logo/media promotion, Effect Library selectors and Object Creator bounded finalisation handoff through stable registered references.
- Add canonical imported-audio promotion; Sound Library selects registered audio and must not become an ad-hoc importer. Status: **provisional from PR #46**.

---

# Shared Connected Project Folder Service

Classification pending.

- Decide whether this implemented shared infrastructure merits its own specification or remains contract plus code ownership only.
- Complete handle persistence/re-authorisation and relative-path read/write adoption beyond current module implementations.
- Provide shared save-state/navigation-guard behaviour and safe finalisation writes.

---

# Shared Active Project Service

Classification pending.

- Decide whether this warrants its own service specification.
- Make apps reliably load the selected connected project's real owned records and prevent unrelated demo/default state when project content exists.
- Reconcile Hub and Creation Guide browser-local handoff without treating either as authored-data owner.

---

# Registered Content Service / Picker

Classification pending.

- Decide whether this is a maintained service spec or part of Asset Library/shared project infrastructure.
- Provide stable registered-content lookup/selection and reference validation without taking ownership of records.

---

# Shared Health Guide / Project Audit

- Establish or confirm a single Health Guide specification and shared check ownership.
- Report broken references, invalid connected-folder state, unsaved drafts/conflicts, duplicate IDs, unused assets and build readiness without silently correcting authored data.

---

# Build Game

- Establish or confirm a single Build Game specification.
- Validate canonical project records and cross-module references before packaging.
- Prove packaging through the Template Game connected-reference workflow.

---

# Runtime Engine / Playtest

Classification pending.

- Confirm existing playable/preview routes and which authored records they read.
- Define safe preview/testing entry points from authoring modules without transferring ownership or writing test overrides into permanent files.

---

# Puzzle Creator

Protected active work stream; audit late.  
Current merged baseline: **V1.35**. Labyrinth Maze is implemented; other surfaced modules are planning pages/placeholders.

- Preserve the V1.35 distinction between working workflow and placeholders.
- Implement canonical connected-project puzzle saving/index registration.
- Coordinate `puzzleId` handoff with Quest Builder only after saved puzzle records exist.
- Scope additional engines separately and do not present unbuilt choices as completed editors.
- Add registered sound feedback selection only after Sound foundation acceptance. Status: **provisional from PR #46**.
- Reconcile open Puzzle documentation PR #44 during the later Puzzle specification pass rather than treating it as parallel authority.

---

# Sound Generator / Sound Library

Protected active work stream; audit last. Open PR #46 currently modifies this area.

- Review the proposed shared Sound Library selector and Create New Synth Sound workflow only after the active PR outcome is known.
- Require registered `asset_` IDs and final Asset Library audio ownership; do not create parallel sound-archetype records.
- After foundation acceptance, separately implement caller adoption in Object Creator, Quest Builder, Effect Editor, Puzzle Creator and Scene Editor without regressing their accepted baselines.

---

# Documentation / PR reconciliation queue

| PR / document area | Current interpretation | Consolidation treatment |
|---|---|---|
| Merged PR #47 | Published the initial documentation-control foundation. | Retain as foundation; path inconsistency is corrected in this extraction branch. |
| Draft PR #50 | Adds `3A`–`8A`, corrects `0A`/`1A`, and consolidates `2A` for verified current module baselines. | Review as documentation-only; reconcile branch with current `main` before merge. |
| Merged PR #38 | Established Object Creator V1.36 implementation. | Use as `8A` baseline evidence; retain functional validation as open work. |
| Merged PR #45 | Established Scene Editor v0.37 accepted-baseline record. | Captured in `6A`/`2A`; later decide archive treatment. |
| Open PR #40 | Earlier Scene/Effect status refresh; Scene portion is superseded. | Extract any unique Effect material only during Effect audit. |
| Open PR #44 | Earlier Puzzle V1.34 status refresh, superseded by V1.35 runtime. | Reconcile during later Puzzle audit only. |
| Open PR #46 | Active Sound Library/Create Synth work. | Preserve as provisional protected stream until accepted/merged. |
| Older global/app todo and audit documents | Mixed history, rules and outstanding work. | Archive only after relevant extraction/dependency verification. |

## Migrated-source checkpoint

The controlled documents now incorporate the reviewed useful information from the foundation/shared sources and the completed module audits through Archetype Object Creator, including the live source/docs reviewed for Hub, Creation Guide, Project Editor, Scene Editor, Quest Builder and Object Creator; merged baseline PRs #38 and #45; and protected Puzzle/Sound evidence. Further exact source-file classification continues through `0A` during each remaining module audit.