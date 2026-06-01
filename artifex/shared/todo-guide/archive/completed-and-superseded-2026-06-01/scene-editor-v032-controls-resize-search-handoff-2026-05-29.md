# Scene Editor v0.32 controls, resize and settings-search handoff — 2026-05-29

## Purpose

This is the next focused Scene Editor implementation pass after the completed structural cleanup and permanent runtime-module rename pass. It fixes one functional defect discovered during live v0.31 verification and adds three requested UI improvements before wider cross-app integration starts.

## Current verified state

Repository: `cinaedvsstudios/Forever-Bound-Game`

App path: `artifex/apps/scene-editor/`

Current official live version: `v0.31-runtime-module-cleanup`

Current live URL:

`https://cinaedvsstudios.github.io/Forever-Bound-Game/artifex/apps/scene-editor/index.html?fresh=v0.31-runtime-module-cleanup`

Delivered work already complete:

- PR #6 delivered the core split and archived unused legacy files.
- PR #11 delivered the final active runtime-module renames and the stale-toast correction.
- The deployed v0.31 page loads, restores the local title-screen scene, displays `v0.31-runtime-module-cleanup`, and no longer displays the old `v0.28-consolidation` helper message.
- During live review, the user found one functional defect and requested three further interface improvements described below.

## Permanent module rule

Do not create any new helper, patch, override, hotfix, or versioned runtime file. Do not solve this work by placing a script after the existing implementation and overriding it.

Implement changes inside the existing permanent owning modules and existing CSS only. If responsibility is split between existing modules, edit those modules directly and clearly report why each was changed.

Do not integrate unrelated systems or begin cross-app linking in this pass.

## Required reading before editing

Read these files first:

- `docs/artifex/18-color-and-display-rules.md`
- `docs/artifex/19-project-file-contracts.md`
- `artifex/shared/todo-guide/README.md`
- `artifex/shared/todo-guide/all-apps-todos.json`
- `artifex/apps/scene-editor/scene-editor-core-split-todos.json`
- `artifex/apps/scene-editor/scene-editor-cleanup-report-2026-05-29.md`
- `artifex/apps/scene-editor/index.html`
- All permanent Scene Editor modules and CSS involved in the work described below.

## Scope of work

### 1. Fix unlocked aspect-ratio resizing

Observed live bug in v0.31:

When Aspect Ratio is switched off and an image object is resized non-proportionally, the object does not visibly stretch/distort as intended.

Required behaviour:

- With aspect ratio lock OFF, width and height must be independent. Dragging a horizontal or vertical resize direction, or changing the corresponding size control, must visibly stretch/compress the rendered image/object on that axis.
- With aspect ratio lock ON, existing proportional resize behaviour must remain intact.
- “Stretch/distort” here means non-proportional width/height scaling of the object/image; do not add a stylistic CSS skew transform.
- Preserve selection, move, rotate, origin marker, object preview, local saving and scene JSON behaviour.

Inspect the ownership chain before editing, especially:

- `artifex/apps/scene-editor/scene-editor-aspect-controls.js`
- `artifex/apps/scene-editor/scene-editor-transform-controls.js`
- `artifex/apps/scene-editor/scene-editor-renderer.js`
- Existing CSS only if the rendered `<img>`/object is being visually forced back to fixed aspect.

Fix the actual cause inside the owning permanent module(s). Do not add a separate resize fix file.

### 2. Add setting search at the top of the left panel

Add a compact setting-search field at the top of the left editor/control panel, before the settings cards.

Required behaviour:

- Placeholder text such as `Search settings…`.
- Search is case-insensitive.
- It searches card titles and visible field/control labels in the left panel.
- As the user types, hide cards or control rows with no matching setting and retain/show the matching control rows/cards.
- Clearing search restores the full panel without losing current selections, values or collapsed/open state.
- When nothing matches, show a compact themed “No matching settings” message.
- Search must not alter scene data or local saved data.
- It must be keyboard-usable and include an appropriate `title`/accessible label.

Expected owning modules:

- `scene-editor-renderer.js` for the permanent search markup/message container.
- `scene-editor-bindings.js` for filter interaction and reset/clear behaviour.
- Existing Scene Editor panel/control CSS for styling.

Do not add a search helper/patch file.

### 3. Add Shadow Blur beside Shadow Strength

The user found that visual controls include Shadow Strength but no way to independently control Shadow Blur.

Required behaviour:

- Add a separate `Shadow Blur` adjustable control in the Visual section, located with Shadow Strength.
- Persist the property in the existing selected-object visual-adjustment data flow and local save/export behaviour.
- Provide a sensible default for older scene data that does not contain a blur value.
- Shadow Strength must continue to control intensity/opacity/strength, while Shadow Blur controls blur/spread softness separately.
- Applying blur must be visibly reflected on the selected object/stage output and survive selection switching/local restore/download JSON where visual settings currently persist.

Expected owning module:

- `scene-editor-visual-adjustments.js`

Use existing rendering/style paths as necessary, but do not create a new visual helper or patch layer.

### 4. Restyle adjustable value controls to the approved visual treatment

The user supplied a visual reference showing adjustable controls styled as a stacked control group:

- uppercase, widely letter-spaced serif/fantasy label in muted cream/gold;
- a pale cream horizontal slider track;
- a prominent rounded cream slider thumb;
- beneath the slider, a compact dark rounded left decrement button containing `<`, a centred numeric value readout, and a compact dark rounded right increment button containing `>`;
- borders/highlights remain within the warm dark Artifex bronze/copper style.

Apply that treatment consistently to **adjustable numeric/value controls** in the Scene Editor, including existing sliders and step controls for object transforms and visual adjustments where appropriate, plus the new Shadow Blur control.

Scope rule for other inputs:

- Ordinary editable text fields, paths, selects and the new settings search field must remain appropriate typed/select controls; do not convert them into slider/stepper controls.
- Their styling may be kept coherent with the same dark Artifex panel language, but the slider-plus-arrow structure is for adjustable numeric controls only.

Use existing CSS and existing renderer/owning modules. Do not add a `ui-polish-v*`, helper CSS patch, or runtime styling override file.

## Version and cache sync

Only after the above work is successfully implemented and tested, update the Scene Editor version/cache label consistently to:

`v0.32-controls-resize-search`

Update all current version/cache surfaces used by the live app, including:

- document title / visible current build outputs where derived or hardcoded;
- `scene-editor-config.js` version source;
- `scene-editor-app.js` fallback where required;
- CSS/JS cache query keys in `index.html`.

Do not leave mixed v0.31 and v0.32 runtime cache labels in the final `index.html` load list.

## Explicit non-goals

Do not:

- create any new helper, patch, override or version-numbered runtime code/CSS file;
- redo or undo the v0.30 core split;
- redo the v0.31 runtime module rename cleanup;
- change permanent module names again;
- change the shared Module menu contents or order;
- begin active-project loading, scene/screen indexes, object/effect archetype references, Project Manager integration or cross-app reference-index work;
- alter unrelated apps;
- merge automatically.

The shared Module menu order must remain exactly:

1. Hub
2. Creation Guide
3. Project Manager
4. Scene Editor
5. Quest Builder
6. Puzzle Creator
7. Effect Editor
8. Archetype Object Creator

## Testing requirements

Work autonomously through implementation and testing. Use a served environment, not `file://`.

Required checks:

1. Run `node --check` over every active JavaScript file loaded by Scene Editor `index.html`, including required shared client files.
2. Serve the repository with the current supported method such as `npm run dev -- --host 127.0.0.1`.
3. Verify the Scene Editor v0.32 served URL and every linked CSS/JS asset return HTTP success.
4. Run Playwright/headless browser smoke testing if available. Temporary browser/test dependencies may be installed outside tracked repo files only; do not commit test dependency/package/lockfile changes.
5. Automated interaction coverage should include where technically possible:
   - page render and v0.32 visible version;
   - local backup restore;
   - selecting each object;
   - aspect lock ON proportional resize;
   - aspect lock OFF independent width-only and height-only resize, with a visible bounding/image dimension change proving non-proportional stretch;
   - move, rotate and origin marker compatibility;
   - settings search finds a setting, filters unrelated controls, clears/restores panel and handles no-result state;
   - Shadow Strength still works;
   - Shadow Blur changes visual output independently and persists after selection switching/local restore/export;
   - adjustable controls render with the new slider/value/arrow treatment;
   - layer controls, card collapse, object preview, context menu, zoom and JSON download still work;
   - `window.ArtifexSceneEditorCore` compatibility remains intact.
6. Clearly list any interaction/visual items that still need manual browser verification after deployment.

## Documentation update required in the same PR

Update:

- `artifex/apps/scene-editor/scene-editor-core-split-todos.json`
- `artifex/apps/scene-editor/scene-editor-cleanup-report-2026-05-29.md`

If all work succeeds, record the four items completed and make the later cross-app integration gate ready/open. If any item is blocked or reverted, record it honestly and leave the gate blocked.

## PR rules

- Start from the actual current `main` branch, which already contains merged PR #11 and current tracker updates.
- Before creating the PR, run `git diff --name-status main...HEAD` and `git diff --stat main...HEAD`.
- The PR should include only Scene Editor owning modules/CSS/index/version/docs necessary for this focused v0.32 pass.
- Create a draft PR only. Do not merge it.
- Stop and report if implementation would require new patch/helper layers or if tests expose a regression that cannot be safely corrected inside the permanent modules.

## Copy-paste Codex instruction

```text
Continue the Artifex Scene Editor from current main in cinaedvsstudios/Forever-Bound-Game.

Read and execute the full handoff at:

artifex/shared/todo-guide/scene-editor-v032-controls-resize-search-handoff-2026-05-29.md

This is one integrated permanent-module implementation pass. Do not stop after reading/reporting. Implement the unlocked-aspect resize fix, left-panel settings search, Shadow Blur control and adjustable-control restyle; test the pass; update the required tracker/report documents; and create a draft PR. Do not create new helper/patch/override files and do not begin cross-app integration. Do not merge automatically.

In your final report include the draft PR link, branch, changed files, owning modules changed for each requirement, exact bug cause/fix for aspect-ratio-off resize, data property/default/persistence details for Shadow Blur, styling implementation summary, tests/results, remaining user checks, final version, and confirmation that no helper/patch files or cross-app changes were added.
```

## Manual acceptance after deployment

After review and merge, the user will check the deployed URL:

`https://cinaedvsstudios.github.io/Forever-Bound-Game/artifex/apps/scene-editor/index.html?fresh=v0.32-controls-resize-search`

Acceptance check:

- v0.32 displays consistently and the page restores the scene.
- With aspect lock off, width-only and height-only resize visibly stretch/compress the image; with lock on it remains proportional.
- Setting search finds/filters/restores controls without changing their values.
- Shadow Blur is visible, independent from Shadow Strength and persists.
- Numeric adjustment controls visually match the slider/value/arrow reference treatment.
- Selection, move, rotate, origin, layers, cards, preview, menus, zoom, context actions and JSON download remain functional.
