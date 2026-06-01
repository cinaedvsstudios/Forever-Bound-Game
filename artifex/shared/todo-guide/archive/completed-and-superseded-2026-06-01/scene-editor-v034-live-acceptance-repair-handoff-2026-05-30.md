# Scene Editor v0.34 live acceptance repair handoff — 2026-05-30

## Purpose

This is the focused repair pass required after deployed `v0.33-inspector-controls-repair` improved the Scene Editor layout but failed manual acceptance on several user-facing behaviours and presentation issues. Preserve the successful v0.33 structure, repair the failed parts directly in existing permanent modules/CSS, test it, update the tracker/report accurately, and create a draft PR.

## Repository and baseline

Repository: `cinaedvsstudios/Forever-Bound-Game`

App path: `artifex/apps/scene-editor/`

Start from current `main`, which contains merged PR #16 / merge commit `8d9617ebcc58df25a8e8b639d55bcd6b0fe57f65`.

Current deployed version: `v0.33-inspector-controls-repair`

Current live URL:

`https://cinaedvsstudios.github.io/Forever-Bound-Game/artifex/apps/scene-editor/index.html?fresh=v0.33-inspector-controls-repair`

## v0.33 live user verification result

The following v0.33 direction is accepted and must be retained:

- The floating Object Inspector exists and selected-object controls are no longer making the scene-level sidebar extremely long.
- Scene Tags are visible in the Scene card below Screen Type.
- The top project row no longer falsely claims `Forever Bound Game` is selected when no active project exists.
- The Animation/object-linked Audio placeholder cards are no longer wanted in Scene Editor.
- The active build visibly loads as `v0.33-inspector-controls-repair`.

The following problems were found in the deployed page and must be fixed:

1. Object Inspector typography and field sizing are too large compared with the left sidebar. It must visually match the same compact scale/density.
2. `Wrap Bounding Box to Image` does not make the selection/bounding box fit the visible image correctly. In the deployed title-screen test, the red ball remains inside a far larger wide rectangle even when wrap is turned on.
3. Middle-mouse drag no longer pans/moves the workspace as it did before; restore this interaction.
4. There are still two visible Active Project displays: the purple sidebar status/file card and the floating bottom-right shared active-project pill. There must be only one in Scene Editor.
5. Search Settings must continue to search both scene-level sidebar controls and the active Object Inspector controls; this is already intended in v0.33 and must be regression-tested.

## Critical implementation rules

- Do not create any helper, patch, override, hotfix, post-load fix or version-numbered runtime JS/CSS file.
- Work only in existing permanent Scene Editor modules and existing CSS. If a defect resides in an existing shared client already loaded by Scene Editor, prefer Scene Editor-scoped presentation changes rather than changing other apps.
- Do not undo the v0.33 floating inspector, Scene Tags, Scene Audio, numeric-entry, Size / Shape grouping, removed Animation/object-Audio placeholder direction, or SVG aspect repair work.
- Do not implement cross-app integration, connected project folder access, Scene Events/Triggers, archetype linking or project indexes in this pass.
- Do not modify other apps or the shared Module menu order.
- Create a draft PR only. Do not merge automatically.

## Required reading before editing

Read:

- `docs/artifex/18-color-and-display-rules.md`
- `docs/artifex/19-project-file-contracts.md`
- `artifex/shared/todo-guide/README.md`
- `artifex/shared/todo-guide/all-apps-todos.json`
- `artifex/apps/scene-editor/scene-editor-core-split-todos.json`
- `artifex/apps/scene-editor/scene-editor-cleanup-report-2026-05-29.md`
- `artifex/apps/scene-editor/index.html`
- all active permanent Scene Editor JS/CSS loaded by `index.html`, especially:
  - `scene-editor-renderer.js`
  - `scene-editor-app.js`
  - `scene-editor-bindings.js`
  - `scene-editor-aspect-controls.js`
  - `scene-editor-transform-controls.js`
  - `scene-editor-layer-controls.js`
  - `scene-editor-value-sliders.js`
  - `scene-editor-value-sliders.css`
  - `scene-editor-offscreen-placement.js`
  - `scene-editor.css`
  - `scene-editor-control-cards.css`
- `artifex/shared/active-project/active-project-client.js`
- `artifex/templates/assets/template_red_ball.svg`

Before editing, reproduce each reported issue in a served browser build and identify the actual owning module/CSS cause.

## Scope of implementation

### 1. Compact Object Inspector to match sidebar density

Current deployed problem:

The floating Object Inspector exists, but its labels, inputs and spacing look substantially larger than equivalent controls in the scene-level sidebar. It looks like a different interface rather than a compact companion inspector.

Required result:

- Keep the floating inspector structure, drag behaviour, remembered position and minimise behaviour.
- Adjust existing CSS only so Object Inspector card headings, labels, text inputs, selects, path rows, slider/readout controls, spacing and padding match the compact visual density of the left panel.
- Do not shrink it with a blanket browser/CSS scale transform that makes text blurry or interaction geometry wrong.
- Preserve accessibility/readability and the Artifex style.
- Its width may be tuned if needed, but it must remain usable and not dominate the screen.

Likely owning files:

- `scene-editor.css`
- `scene-editor-control-cards.css`
- `scene-editor-value-sliders.css` only if the inspector numeric controls need scoped density corrections.

### 2. Fix Wrap Bounding Box to Image on actual title-screen assets

Current deployed problem:

The user selected the title-screen red ball image and enabled the wrap/bounding-box action, but the selection rectangle remained a much larger wide box than the rendered ball. This is not a correct wrap result.

Important concrete reference:

`artifex/templates/assets/template_red_ball.svg` is a `160 x 160` SVG with `viewBox="0 0 160 160"`. Its source aspect ratio is square. For this real test object, a successful Wrap Bounding Box action must result in a square object boundary rather than a wide rectangle.

Required behaviour:

- Clicking/enabling `Wrap Bounding Box to Image` on the selected red ball makes the selection boundary match the source image aspect ratio immediately and visibly.
- For the square red-ball SVG, the selected bounding rectangle must visibly become square around its image content, not remain wide.
- Confirm the value inputs, stage boundary and saved object dimensions agree after wrapping.
- Preserve intentional aspect-unlocked stretching: when Aspect Ratio Lock is OFF and Wrap is not being applied, the user can still distort the object.
- Preserve the corrected aspect-lock behaviour when Aspect Ratio Lock is ON.
- Confirm wrapping still works after the v0.33 SVG `<image>` rendering change; do not assume the old `.scene-item img` selectors still locate the selected image.
- Diagnose whether the failure comes from button wiring, natural-ratio lookup, values not committing through the new numeric control wrappers, a subsequent rerender overwriting the wrapped dimensions, or SVG-specific lookup/rendering.

Do not implement alpha/transparent-pixel cropping unless diagnosis proves it is required for a non-square asset. The red ball acceptance case only needs the known square SVG bounds to be respected.

Likely owning files:

- `scene-editor-aspect-controls.js`
- `scene-editor-layer-controls.js` only if the wrap button/wiring is wrong
- `scene-editor-renderer.js` or existing CSS only if render reapplication is the cause.

### 3. Restore middle-mouse workspace panning

Current deployed problem:

The user reports that holding/dragging with the middle mouse button no longer moves/pans the workspace.

Required behaviour:

- On the work area/stage background, press-and-drag with middle mouse button (`button === 1`) pans the workspace/canvas view as it did before the v0.33 pass.
- It must not move the selected object, resize it, rotate it, drag the Object Inspector or scroll/drag the sidebar.
- It must coexist with zoom controls and preserve the current stage/work-area coordinate behaviour.
- Prevent the browser's native autoscroll/middle-click interference while panning.
- Restore this within the correct existing permanent interaction module after inspecting the present ownership; do not introduce a panning helper file.
- If the functionality was already present before PR #16 and was accidentally broken, restore the previous behaviour rather than inventing an unrelated interaction model.

Likely owner after diagnosis may be an existing binding/stage/transform/view module or existing Scene Editor core coordinator. Identify it before editing and report it.

### 4. Remove duplicate Active Project UI inside Scene Editor only

Current deployed problem:

The purple sidebar file/status presentation now truthfully says there is no active project, but the fixed bottom-right shared active-project pill is also still visible. Two copies of the same status/action are unnecessary clutter.

Required result:

- Scene Editor shows one Active Project/status presentation only.
- Retain the purple sidebar file/status card as the Scene Editor location for project state, file name and save timestamps.
- Add or retain a clear actionable `Open` / `Choose in Hub` control in that sidebar presentation when no active project is selected, using the current established active-project navigation destination/contract.
- Hide/remove the floating bottom-right shared active-project pill on the Scene Editor page only; do not remove it globally or break other apps.
- When a real active project is present, the single sidebar presentation must show its actual project name consistently.
- This remains presentation-only: do not implement real active-project file loading or project-folder writing here.

Likely owning files:

- `scene-editor-renderer.js` for sidebar actionable presentation
- `scene-editor-bindings.js` or `scene-editor-app.js` only if an interaction/event binding is necessary
- existing Scene Editor CSS for hiding the injected shared pill within this app only.

### 5. Preserve and verify Settings Search across sidebar and inspector

Current code is intended to query both `.side-panel` and `#objectInspector`. The user asked specifically whether Search Settings should work on Object Inspector settings.

Required behaviour:

- Search Settings filters matching fields/cards in both the left scene-level sidebar and the open Object Inspector.
- Searching for `shadow` reveals matching Visual Adjustments controls in the Object Inspector.
- Searching for `rotation origin` reveals the matching Transform control.
- Clearing search restores both the sidebar and inspector without changing values or inspector position.
- Searching a nonsense string shows the no-matches state without permanently hiding the inspector.

Do not redesign the search feature unless a reproduced defect requires it; primarily regression-test and correct only what fails.

### 6. Audit numeric readout integration for retained modules

The v0.33 numeric readout is now an `<input>` with `.value`; older permanent modules may still try to update it as text content. During review, `scene-editor-offscreen-placement.js` was observed using `readout.textContent = field.value || '0'` in `updateNumberBounds()`.

Required result:

- Audit all active Scene Editor modules for access to `.value-slider-readout-v18`.
- Any code updating the visible editable numeric readout must use its current input value contract and not stale `.textContent` logic.
- Confirm X/Y offscreen positioning, object movement and typed/slider/stepper controls remain synchronised after this audit.

This is not permission to broaden the pass; only correct active conflicts caused by the already-delivered editable numeric control change.

## Version and cache sync

Only after implementation and tests succeed, update Scene Editor version/cache surfaces consistently to:

`v0.34-live-acceptance-repair`

Update the existing active version surfaces only: `index.html` CSS/JS cache keys and document title, `scene-editor-config.js`, `scene-editor-app.js` fallback/version outputs, and any existing permanent-module fallback status strings that display the active app version.

## Tracker/report requirement

Update:

- `artifex/apps/scene-editor/scene-editor-core-split-todos.json`
- `artifex/apps/scene-editor/scene-editor-cleanup-report-2026-05-29.md`

Record accurately:

- PR #16 merged and deployed as `v0.33-inspector-controls-repair`.
- v0.33 improved the structure but failed manual acceptance because Object Inspector density is mismatched, Wrap Bounding Box fails on the title-screen red ball, middle-mouse workspace pan regressed and Active Project status remains duplicated.
- The v0.34 repair pass was implemented, but remains awaiting deployed manual acceptance until the user tests it.
- Do not open cross-app integration readiness until deployed v0.34 is accepted by the user.

## Testing requirements

Use a served environment, not `file://`.

Before creating a PR:

1. Run `node --check` on every active Scene Editor JavaScript file loaded by `index.html` and the shared active-project client.
2. Serve using the supported method, such as `npm run dev -- --host 127.0.0.1`.
3. Verify the v0.34 Scene Editor URL and all linked active CSS/JS assets return HTTP success.
4. Run Playwright/headless-browser testing if available. Do not commit temporary test dependency/package/lock changes.
5. Run `git diff --name-status main...HEAD` and `git diff --stat main...HEAD`; the diff must be restricted to existing Scene Editor permanent modules/CSS/index/version/tracker/report required for this repair pass.

Automated browser coverage must include where possible:

- App loads showing `v0.34-live-acceptance-repair` and restores the title-screen local/template scene.
- Object Inspector remains floating/draggable/position-restoring/minimisable but its field/label density matches the sidebar control scale rather than oversized v0.33 styling.
- Search Settings searches the Object Inspector: search `shadow`, search `rotation origin`, clear search, and no-results state.
- Wrap Bounding Box action on the actual `template_red_ball.svg` object changes its boundary to a square ratio matching the known `160 x 160` asset and the displayed image/bounds are visibly aligned.
- Aspect Ratio OFF still permits visible non-proportional stretching after wrapping; Aspect Ratio ON preserves proportion.
- Middle-mouse dragging the workspace pans it; the same action does not move selected objects or drag the inspector; object drag/resize/rotate still work.
- Only one Active Project presentation is visible in Scene Editor; the remaining sidebar presentation exposes the needed Open/Choose action and responds to no-project/active-project state.
- X/Y inputs, slider drag, typed numeric values and arrow stepping stay synchronised after the readout-contract audit, including offscreen-position interaction if available.
- Scene Tags, Scene Audio, Layers, object selection, preview, context menu, zoom, save/download and `window.ArtifexSceneEditorCore` continue to work.

List any remaining visual/manual checks clearly in the final report.

## PR requirements

- Start a new Codex task/branch from current `main`, after merged PR #16.
- Create a draft PR only; do not merge it.
- Do not reuse the PR #16 branch.
- Stop and report if a safe fix requires a new helper/patch/override layer.

## Copy-paste Codex prompt

```text
Continue the Artifex Scene Editor from current `main` in `cinaedvsstudios/Forever-Bound-Game`.

Read and execute the full handoff document:

artifex/shared/todo-guide/scene-editor-v034-live-acceptance-repair-handoff-2026-05-30.md

Important: PR #16 / `v0.33-inspector-controls-repair` is deployed but failed live manual acceptance. Preserve the successful v0.33 restructuring and repair only the confirmed remaining issues in permanent modules/CSS.

Do the entire focused v0.34 pass autonomously: reproduce/diagnose the reported issues, implement repairs, test them, update the Scene Editor tracker/report accurately, and create a draft PR.

Non-negotiable constraints:
- No new helper, patch, override, hotfix, post-load fix or version-numbered runtime JS/CSS files.
- Work inside existing permanent Scene Editor modules and existing CSS only.
- Do not undo the floating Object Inspector, Scene Tags, Scene Audio, editable numeric controls, Size / Shape grouping or removal of placeholder cards.
- Do not implement cross-app integration, real project folder loading, events/triggers or change other apps.
- Do not merge automatically.

Required v0.34 result:
- Compact Object Inspector typography/control density matching the left sidebar.
- Wrap Bounding Box visibly fixes the actual square `template_red_ball.svg` selection bounds instead of leaving a wide empty rectangle.
- Middle-mouse workspace panning restored without breaking object/inspector interactions.
- One Active Project presentation only in Scene Editor: retain the actionable sidebar status and hide the duplicate fixed shared pill only on this app.
- Search Settings verified/fixed for both sidebar and Object Inspector controls.
- Audit/fix any stale numeric-readout integration such as active modules still writing `textContent` to the new editable value input.
- Version/cache updated to `v0.34-live-acceptance-repair` only after tests pass.
- Tracker/report state that v0.33 failed live acceptance and v0.34 awaits deployed user verification before cross-app work.

In your final response include:
- draft PR URL or exact UI action required to expose it;
- branch and commits;
- changed files and diff status;
- actual cause/fix of the wrap and middle-mouse regression;
- inspector CSS/presentation changes;
- Active Project single-display solution;
- numeric-readout audit result;
- tests and outcomes;
- remaining manual user checks;
- confirmation that no helper/patch/runtime override or cross-app implementation was added.
```

## Manual acceptance after deployment

After PR review and merge, test:

`https://cinaedvsstudios.github.io/Forever-Bound-Game/artifex/apps/scene-editor/index.html?fresh=v0.34-live-acceptance-repair`

Do not begin cross-app integration until this deployed page is manually accepted.
