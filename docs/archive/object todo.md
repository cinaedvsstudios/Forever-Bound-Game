# Archetype Object Creator To-Do

This file tracks work that belongs specifically to Archetype Object Creator. Platform-wide work belongs in `artifex/shared/todo-guide/all-apps-todos.json`.

Historical review/handover document:

```text
artifex/apps/archetype-object-creator/docs/current-state-v1.35-review.md
```

## Current status — V1.36 merged on main; lifecycle validation outstanding

Current `main` runtime is V1.36, merged from PR #38 on 2 June 2026 at merge commit `ef4f37ebe5850c6367db59e57c01e2bb89949384`.

PR #38 delivered the V1.36 Step 5 ownership and save-lifecycle consolidation. The visible UI corrections were manually checked before merge; the project-folder save/finalisation lifecycle must now be validated on merged `main` in a disposable project folder before further Object Creator feature development.

### Confirmed before merge on 2 June 2026

Status: visually checked and accepted by the creator in the PR preview; now present on `main`.

- Step 5 right-side Action Behaviour layout renders without overlapping text/fields.
- **Add Frame Event** visibly creates an editable event row.
- **Add Empty Frame Slot** supports clicking an empty slot to choose an image and fill the slot in place without changing its sequence position.
- The saved-wizard crystal-ball icon is larger and no longer has the unwanted circular button border/background.

### V1.36 functional lifecycle work now on main but not yet validated

- Stable Step 5 DOM ownership moved into the checklist/frame-task/Step 5 behaviour owners; active imports for `object-wizard-step5-layout.js` and `object-wizard-frame-correction.js` were removed.
- Save Browser Draft, Save Project (In Progress), Finish / Mark Object Ready and Mark Task Ready have distinct intended meanings.
- `authoringStatus: "in_progress" | "ready"` is introduced for object records/index entries.
- Uploaded frames can be staged under `intake/objects/<archobj_id>/...` on in-progress save and promoted into registered final `asset_` records only on finalisation.
- The Sound Events callback captures its initiating requirement target so selection changes do not redirect assignment.
- Frame corrections use canonical per-frame `frameCorrections` with legacy migration rather than an active duplicate requirement-level correction path.
- Review amendments preserve open-session previews after in-progress save, validate planned final output before normal final media writes, map primary gameplay/portrait assets to top-level visual IDs and refuse multiple fixed-path primary image inputs.

### Mandatory post-merge validation before more Object Creator features

Use a disposable Blank Starter Project folder only.

- Save Project (In Progress) with uploaded images: project JSON contains staging paths/no `dataUrl`, while current-session thumbnails, preview/playback, Frame Fix and brightness matching remain usable.
- File → Open Project Object: reopen the saved `in_progress` object and confirm staged images are restored into visible editable Step 5 frames.
- Invalid Finish / Mark Object Ready: confirm no final media file, final asset-index record or ready object/index entry is written.
- Valid finalisation: confirm final media and asset-index registration occur and `visual.spriteAssetId` / `visual.portraitAssetId` receive registered final asset IDs as applicable.
- Multiple uploaded images in the primary Gameplay Sprite or Dialogue Portrait task: confirm finalisation refuses them before final output writes.
- Sound Generator stale-target sequence: begin from Action A, switch to Action B before assignment completes and confirm the returned `asset_sfx_...` ID remains assigned only to Action A.
- Per-frame correction persistence across actions, save/reload, export/import and finalisation.
- No duplicate Step 5 controls, module-load errors or console errors.

## Open follow-up work after V1.36 lifecycle validation

### General editor UI module maintenance

Status: open  
Priority: medium

`editor-ui.js` remains large. Plan a separate focused ownership split only after the V1.36 lifecycle has passed validation; do not combine that cleanup with correction of any lifecycle validation failure.

### Real scene/quest/reference listing

Status: blocked by all-app work  
Priority: high  
Blocked by: `todo_all_apps_project_reference_index`

The Reference panel exists, but real results require the shared project reference index tracked globally in `artifex/shared/todo-guide/all-apps-todos.json`.

## Historical implementation record

- V1.36 merged from PR #38 on 2 June 2026, consolidating touched Step 5 ownership and adding the staged-frame/ready lifecycle; its non-UI lifecycle remains subject to post-merge validation.
- V1.35 introduced provisional project-folder saving, save/finalise controls and shared synth-sound hookup; its problems are documented in `docs/current-state-v1.35-review.md`.
- V1.34 attempted Step 5 persistence and compact-layout repair.
- V1.33 split Step 5 requirement/frame modules but introduced a later repaired state-contract regression.
- V1.32 established the named object wizard/session structure.
- V1.31 removed older live patch-layer files and recorded them in the archive manifest.

## Rule for future work

Do not add patch, rescue, compatibility-overlay or MutationObserver installer modules over Step 5. Validate the merged V1.36 lifecycle first; then new work must extend the permanent named owners.