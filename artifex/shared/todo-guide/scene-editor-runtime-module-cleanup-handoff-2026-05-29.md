# Scene Editor final runtime-module cleanup handoff — 2026-05-29

## Purpose

This is the next Codex task after the successfully merged Scene Editor core split. It is intentionally narrow: complete the remaining live helper-module naming/version cleanup without adding new features or beginning cross-app integration.

## Current stable state

Repository: `cinaedvsstudios/Forever-Bound-Game`

App path: `artifex/apps/scene-editor/`

Current official live Scene Editor version: `v0.30-scene-core-split`

Current live test URL:

`https://cinaedvsstudios.github.io/Forever-Bound-Game/artifex/apps/scene-editor/index.html?fresh=v0.30-scene-core-split`

Delivered core split PR: `#6 — Split Scene Editor core into modular files and archive legacy helpers`

Merged PR URL: `https://github.com/cinaedvsstudios/Forever-Bound-Game/pull/6`

Merge commit: `e5001234b22747269b49856daf200e07a4d70dfc`

The user opened the deployed v0.30 build after merge, confirmed the local scene restored, the stage and selected-object transform handles appeared, and reported the editor seems fine after the requested interaction check.

## Completed work: do not repeat

The large `scene-editor-v2.js` core has already been split. Do not undo or re-perform the split.

Permanent core stack now present and loaded:

- `scene-editor-config.js`
- `scene-editor-storage.js`
- `scene-editor-scene-model.js`
- `scene-editor-io.js`
- `scene-editor-stage-drag.js`
- `scene-editor-renderer.js`
- `scene-editor-bindings.js`
- `scene-editor-core-api.js`
- `scene-editor-app.js`
- `scene-editor-v2.js` as a small bootstrap shell only

Unused legacy files have already been archived into `artifex/apps/scene-editor/archive/legacy-2026-05-28/`. Do not repeat that archive pass unless only verifying repo state.

## Remaining cleanup problem

Six active runtime feature modules are still loaded under old numbered filenames. They are working, but their naming is not the permanent module structure required before wider cross-app work.

| Current live file | Responsibility | Rename target |
| --- | --- | --- |
| `scene-editor-v11-helper.js` | Asset library picker, image/path helper buttons, wrap image, import-warning/dirty markers | `scene-editor-asset-path-tools.js` |
| `scene-editor-v15-helper.js` | Layer controls, layer locks/border state and layer/asset UI enhancements | `scene-editor-layer-controls.js` |
| `scene-editor-v20-card-controller.js` | Card collapse/controller behaviour | `scene-editor-card-controller.js` |
| `scene-editor-v21-visual-adjustments.js` | Selected-object visual adjustment controls and persistence | `scene-editor-visual-adjustments.js` |
| `scene-editor-v23-aspect-controls.js` | Aspect-ratio lock, resize helpers and bounding-box wrap controls | `scene-editor-aspect-controls.js` |
| `scene-editor-v24-object-preview.js` | Floating selected-object preview modal | `scene-editor-object-preview.js` |

Confirmed visible defect: the deployed v0.30 page still shows the stale toast:

`v0.28-consolidation: Consolidated layout helper loaded`

The stale `VERSION = 'v0.28-consolidation'` constant exists in both:

- `scene-editor-v11-helper.js`
- `scene-editor-v15-helper.js`

## Hard rules

- Start from current `main`, which already includes PR #6 and the documentation closeout commits.
- Read the required files before making changes.
- This pass is rename/version-message cleanup only. Do not add new features.
- Do not begin active-project or cross-app linking work in this task.
- Do not change transform-control behaviour.
- Do not change existing feature behaviour during module renames.
- Do not create placeholders.
- Do not manually reconstruct large files; use full-file `git mv`/normal local repo operations.
- Do not archive or delete any active runtime file unless it has been replaced by an exact renamed file and `index.html` is updated accordingly.
- Do not add apps to the Module menu.
- Shared Module menu order must remain exactly: Hub, Creation Guide, Project Manager, Scene Editor, Quest Builder, Puzzle Creator, Effect Editor, Archetype Object Creator.
- Use a served environment and automated smoke tests where available; do not rely on `file://`.
- Create a draft PR; do not merge automatically.

## Required reference files

Before editing, read:

- `docs/artifex/18-color-and-display-rules.md`
- `docs/artifex/19-project-file-contracts.md`
- `artifex/shared/todo-guide/README.md`
- `artifex/shared/todo-guide/all-apps-todos.json`
- `artifex/apps/scene-editor/scene-editor-core-split-todos.json`
- `artifex/apps/scene-editor/scene-editor-cleanup-report-2026-05-29.md`
- `artifex/apps/scene-editor/index.html`

## Codex prompt to execute

```text
Continue the Artifex Scene Editor cleanup in the repository:

cinaedvsstudios/Forever-Bound-Game

Start from current main. The full core split is already complete, merged and live as v0.30-scene-core-split through PR #6. Do not repeat the core split or archived legacy-file pass.

Your only implementation task is a final low-risk active runtime module cleanup pass:

1. Inspect current main and read:
   - docs/artifex/18-color-and-display-rules.md
   - docs/artifex/19-project-file-contracts.md
   - artifex/shared/todo-guide/README.md
   - artifex/shared/todo-guide/all-apps-todos.json
   - artifex/shared/todo-guide/scene-editor-runtime-module-cleanup-handoff-2026-05-29.md
   - artifex/apps/scene-editor/scene-editor-core-split-todos.json
   - artifex/apps/scene-editor/scene-editor-cleanup-report-2026-05-29.md
   - artifex/apps/scene-editor/index.html

2. Verify the current v0.30 active load list and confirm the following files are loaded and require pure permanent renames:
   - scene-editor-v11-helper.js -> scene-editor-asset-path-tools.js
   - scene-editor-v15-helper.js -> scene-editor-layer-controls.js
   - scene-editor-v20-card-controller.js -> scene-editor-card-controller.js
   - scene-editor-v21-visual-adjustments.js -> scene-editor-visual-adjustments.js
   - scene-editor-v23-aspect-controls.js -> scene-editor-aspect-controls.js
   - scene-editor-v24-object-preview.js -> scene-editor-object-preview.js

3. Use proper full-file moves (`git mv`) and update `index.html` to load the permanent filenames. Preserve the exact feature logic unless a minimal version/toast string change is required below.

4. Remove the visible stale helper-build message. The live v0.30 page currently shows `v0.28-consolidation: Consolidated layout helper loaded`, and stale `VERSION = 'v0.28-consolidation'` constants exist in the current v11 and v15 helper files. After rename, update their user-visible helper toast/tip version output to the new pass version or route it through the current Scene Editor version in a safe way. Do not rewrite the feature behaviour.

5. Update version/cache sync consistently to:

   v0.31-runtime-module-cleanup

   Update the visible/page/cache values that identify the deployed editor build, including index.html CSS/JS cache query values and the config/current version source. Do not leave mixed v0.30/v0.31 live cache labels in index.html.

6. Do not change these already-permanent active module names or their behaviour unless a required import/load path reference must be updated:
   - scene-editor-transform-controls.js
   - scene-editor-value-sliders.js
   - scene-editor-offscreen-placement.js
   - scene-editor-menu-controller.js

7. Do not perform cross-app integration, active-project adoption, scene/screen index work, object/effect archetype linking, or Module-menu additions in this pass. Those are later work after Scene Editor cleanup closes.

8. Test autonomously before creating the draft PR:
   - Run JavaScript syntax checks for active Scene Editor/shared JS files.
   - Start the served dev environment (`npm run dev -- --host 127.0.0.1` or the current supported equivalent).
   - Check the Scene Editor v0.31 page and every linked active CSS/JS asset return HTTP success.
   - Run Playwright/headless browser smoke testing if available, installing temporary browser/test dependencies only outside tracked repo files and committing no package/lock changes solely for testing.
   - Verify page render, local backup/resume, import menu, object selection, move handle, resize/rotate/origin interactions where automated tests can safely cover them, visual controls, layer/card controls, object preview, context actions, JSON download and `window.ArtifexSceneEditorCore` compatibility.
   - Explicitly state which final visual behaviours still require user verification after deployment.

9. Update these documents in the same PR:
   - artifex/apps/scene-editor/scene-editor-core-split-todos.json
   - artifex/apps/scene-editor/scene-editor-cleanup-report-2026-05-29.md

   Mark the runtime-module cleanup task complete only if the renames/version cleanup pass and tests succeed. Change the cross-app readiness gate from blocked by runtime-module cleanup to open/ready for the later integration pass only if this cleanup succeeds.

10. Create a draft PR through the Codex/GitHub review flow. Do not merge automatically.

Final response must report:
- branch and draft PR link;
- all files renamed;
- every actual logic/string change, if any;
- version used;
- active runtime load list after the pass;
- tests run and results;
- user tests still required;
- whether the Scene Editor cleanup list can now be closed before cross-app integration.

Stop and report rather than forcing changes if any rename causes functional breakage or test failures that cannot be safely fixed within this narrow pass.
```

## Acceptance check after PR merge

After the draft PR has been reviewed and merged, the user should open:

`https://cinaedvsstudios.github.io/Forever-Bound-Game/artifex/apps/scene-editor/index.html?fresh=v0.31-runtime-module-cleanup`

Check:

- The page loads and displays `v0.31-runtime-module-cleanup` consistently.
- The stale `v0.28-consolidation` toast no longer appears.
- Existing local backup/scene restore still works.
- Click between objects and confirm selection.
- Drag move, resize and rotate controls; verify origin marker remains.
- Verify layer controls, visual adjustments, aspect controls and object preview still work.
- Open menus and test context actions.
- Download JSON and confirm save/download status updates.

If accepted, mark the remaining Scene Editor runtime-module cleanup complete. The next work should be the separate cross-app active-project/reference/index integration phase.