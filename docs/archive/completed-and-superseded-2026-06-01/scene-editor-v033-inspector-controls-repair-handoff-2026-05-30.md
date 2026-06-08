# Scene Editor v0.33 inspector and control repair handoff — 2026-05-30

## Purpose

This is the next Scene Editor implementation pass after deployed `v0.32-controls-resize-search` failed manual acceptance. It must repair the broken controls and reorganise the editor so scene-level settings remain in the sidebar while selected-object editing is handled in a floating inspector.

This pass is not cross-app integration and must not create any helper, patch, hotfix, post-load override or version-numbered runtime module.

## Repository and baseline

Repository: `cinaedvsstudios/Forever-Bound-Game`

App path: `artifex/apps/scene-editor/`

Start from current `main`.

Current deployed version: `v0.32-controls-resize-search`

Current live URL:

`https://cinaedvsstudios.github.io/Forever-Bound-Game/artifex/apps/scene-editor/index.html?fresh=v0.32-controls-resize-search`

Important delivered work already on `main`:

- PR #6 split the core into permanent modules and archived unused legacy files.
- PR #11 renamed remaining live numbered modules to permanent ownership-based files.
- PR #13 implemented `v0.32-controls-resize-search`, but it failed user acceptance and must be repaired rather than treated as final.

## User acceptance result for v0.32

Confirmed visually acceptable or present:

- `v0.32-controls-resize-search` loads on the deployed page.
- The new control style is generally moving in the requested direction.
- Shadow Blur is present.
- Settings search is present.

Confirmed defects and requested structure changes:

1. Slider tracks in Visual Adjustments do not change values/effects when dragged; arrow step buttons do work.
2. The value between arrow buttons is not editable. The user needs to be able to type exact numeric values.
3. Aspect Ratio OFF still does not visually stretch/compress the displayed image during non-proportional resize.
4. The individual nested mini-card surfaces around every numeric control create visual clutter and must be removed/simplified.
5. Scale, Bounding Box/Wrap and Aspect Ratio controls should be together as one coherent controls section directly beneath Rotation Origin.
6. Tags should not be in the selected-object Transform area. Scene Editor needs a Scene Tags field in the Scene card directly below Screen Type.
7. The purple top file/project display and the bottom `No active project / Choose in Hub` pill contradict each other: the purple display is hardcoded to `Forever Bound Game` even when no active project is selected.
8. Object Details should no longer be a long inline sidebar card. Selected-object editing should open as a floating Object Inspector window, remember its position, and contain object-specific Details, Transform and Visual Adjustments.
9. The Animation card is redundant in Scene Editor: animated object authoring belongs in Archetype Object Creator; remove the Scene Editor Animation placeholder card.
10. The existing Audio card is wrongly object-linked. Remove the object-audio placeholder and provide Scene Audio only for scene-level ambience/music settings.
11. Scene Events / Triggers are needed in the future for scene entry, interaction, portals/exits, effects, sounds, object actions and quest state, but this is a later cross-app schema/integration task. Do not implement an ad hoc Events card in this v0.33 repair pass.

## Critical implementation rules

- Use the existing permanent modules and existing CSS only.
- Do not create new helper, patch, override, fixup, hotfix or version-numbered runtime JavaScript/CSS files.
- Do not reintroduce any archived file.
- Do not undo the permanent module ownership cleanup.
- Do not begin the connected-project-folder service, scene/screen indexes, reference index, portal registry, archetype linkage or full active-project loading in this pass.
- Do not modify other apps.
- Do not change shared Module menu contents or order.
- Do not merge automatically. Create a draft PR after testing.

The shared Module menu order remains exactly:

1. Hub
2. Creation Guide
3. Project Manager
4. Scene Editor
5. Quest Builder
6. Puzzle Creator
7. Effect Editor
8. Archetype Object Creator

## Required reading before editing

Read:

- `docs/artifex/18-color-and-display-rules.md`
- `docs/artifex/19-project-file-contracts.md`
- `artifex/shared/todo-guide/README.md`
- `artifex/shared/todo-guide/all-apps-todos.json`
- `artifex/apps/scene-editor/scene-editor-core-split-todos.json`
- `artifex/apps/scene-editor/scene-editor-cleanup-report-2026-05-29.md`
- `artifex/apps/scene-editor/index.html`
- `artifex/apps/scene-editor/scene-editor-renderer.js`
- `artifex/apps/scene-editor/scene-editor-bindings.js`
- `artifex/apps/scene-editor/scene-editor-layer-controls.js`
- `artifex/apps/scene-editor/scene-editor-value-sliders.js`
- `artifex/apps/scene-editor/scene-editor-value-sliders.css`
- `artifex/apps/scene-editor/scene-editor-aspect-controls.js`
- `artifex/apps/scene-editor/scene-editor-transform-controls.js`
- `artifex/apps/scene-editor/scene-editor-visual-adjustments.js`
- `artifex/apps/scene-editor/scene-editor-card-controller.js`
- `artifex/apps/scene-editor/scene-editor-object-preview.js`
- `artifex/shared/active-project/active-project-client.js`

Before editing, inspect the currently rendered/sidebar architecture and identify exactly which permanent module owns each changed DOM region. Do not layer replacement DOM on top of retained old cards.

## Scope of implementation

### 1. Repair adjustable numeric controls

The v0.32 visual treatment is accepted as the design direction but its control implementation is broken.

Required behaviour:

- Every adjustable numeric control has a working horizontal slider.
- Every adjustable numeric control has a visible editable numeric input in the central value position so exact values can be typed.
- `<` and `>` buttons decrement/increment using the correct step.
- Slider dragging, arrow stepping and typed input all update the same underlying value and trigger the same existing persistence/rendering behaviour.
- Values remain clamped to configured min/max and correctly support decimal steps where needed.
- Shadow Blur reset/default remains `25`; Shadow Strength and Glow Strength reset remain `0`.
- Slider/step/input controls retain useful `title` tooltips and keyboard accessibility.
- The original source numeric input must not be hidden and replaced by a non-editable `<span>` as in v0.32. The visible centre value must itself be editable, or the implementation must use one visible canonical numeric input bound directly to the data flow.

Visual revision:

- Retain the warm Artifex slider/stepper visual language from the reference image.
- Remove the extra bordered/background mini-card wrapper around each individual numeric control. Controls should sit cleanly inside their owning card or floating inspector section, without dozens of nested cards.

Expected owner files:

- `scene-editor-value-sliders.js`
- `scene-editor-value-sliders.css`
- Existing owning module markup only when required.

### 2. Diagnose and properly fix aspect-ratio-off stretching

Do not merely repeat the v0.32 `object-fit: fill` patch. Manual deployment verification proved it did not solve the user-facing behaviour.

Required behaviour:

- With aspect lock OFF, changing width only visibly stretches/compresses the image horizontally while height remains unchanged.
- With aspect lock OFF, changing height only visibly stretches/compresses the image vertically while width remains unchanged.
- This must work through the visible numeric field, the slider, arrow buttons and stage resize handles.
- With aspect lock ON, the object remains proportional through all of those resize paths.
- This must be tested on the actual rendered image-type object used by the title-screen template, not only by reading stored dimensions or computed attributes.

Diagnosis requirement:

- Determine why the live v0.32 object still does not visibly distort: data/model rerender, transform controls, aspect module, stage markup, object CSS, object preview, or any later module overriding dimensions/fit.
- Report the actual cause found and the exact permanent-module fix.

Expected owner files after diagnosis may include only existing permanent files such as:

- `scene-editor-aspect-controls.js`
- `scene-editor-transform-controls.js`
- `scene-editor-renderer.js`
- existing stylesheet(s)

### 3. Redesign object-specific editing as a floating Object Inspector

Create a floating Object Inspector that appears when an object is selected and contains selected-object editing. It must not be an additional duplicate copy of the same sidebar content.

Required Object Inspector content:

- Object Details: ID, Name, Type, Image Path, Text where appropriate.
- Transform: X, Y, Width, Height, Layer, Z/Depth, Rotation, Rotation Origin.
- A single coherent block directly under Rotation Origin containing Scale, Bounding Box/Wrap and Aspect Ratio controls together.
- Visual Adjustments, including Shadow Strength and Shadow Blur.
- Selected-object actions such as Visible, Border and Delete.

Required window behaviour:

- It opens when an object is selected.
- It remains available while an object is selected and can be closed/minimised if the current app window convention supports that cleanly.
- It is draggable.
- Its position is remembered using a Scene Editor-specific localStorage layout key and restored on reload.
- Its default location must not cover the stage centre unnecessarily or push the scene-level sidebar into a long mess.
- Do not create a new helper file for this; implement window/markup/binding responsibility in the permanent renderer/bindings/card/owning modules and existing CSS.

Sidebar after this change:

The left sidebar should contain scene-level controls only:

- file/save/project status presentation;
- Settings Search;
- Scene;
- Background;
- Scene Audio;
- Object Layers;
- JSON Preview only if still useful as an existing editor/debug card.

Remove inline duplicated object Details / Transform / Visual cards from the left sidebar once the inspector owns them.

Settings Search must still be useful after the move. It should match scene-level sidebar settings and the active Object Inspector’s visible control labels/cards, revealing/filtering appropriate areas without changing scene or object data.

### 4. Move Tags to Scene-level ownership

Required behaviour:

- Add a `Scene Tags` field in the Scene card immediately below `Screen Type`.
- Store/edit this as scene-level data, for example `scene.tags`, using the app’s existing save/export/local draft flow.
- Remove the visible Tags field from the selected-object Transform/Object Inspector interface.
- Preserve any previously loaded `item.tags` data in JSON without destructive conversion or loss; it simply should not be edited as a Scene Editor placement control.

Expected owner files:

- `scene-editor-renderer.js`
- `scene-editor-bindings.js`
- `scene-editor-scene-model.js` or app data normalisation only if required to safely initialise `scene.tags`.

### 5. Fix contradictory active-project display without implementing full project loading

Currently the sidebar file pill hardcodes `Project: Forever Bound Game`, while the shared active-project pill can correctly display `No active project — Choose in Hub`.

Required behaviour:

- Read presentation state from `window.ArtifexActiveProject` / its ready event or existing shared client interface.
- The top sidebar/file presentation must not claim a project is active when the shared active-project client says none is active.
- When no project is active, show a consistent no-project state in the sidebar as well.
- When an active project is selected, display its actual project name consistently.
- Preserve scene file name and local/downloaded save information separately from active-project status.

Non-goal:

- Do not implement real active project file loading, project folder writes or source-of-truth changes in this pass. This item is only about eliminating the visible false/conflicting presentation.

Expected owners:

- `scene-editor-renderer.js`
- `scene-editor-app.js` and/or `scene-editor-bindings.js` only where required to rerender after `artifex:active-project-ready`.

### 6. Remove redundant Animation placeholder from Scene Editor

Current `scene-editor-layer-controls.js` creates an `Animation` placeholder card with future object-linked animation/file/frame controls.

Required behaviour:

- Remove this visible Animation card from Scene Editor.
- Do not delete or mutate animation data in loaded scene/object JSON if such data exists; simply remove the redundant authoring placeholder/UI.
- Record in tracker/report that animation authoring belongs in Archetype Object Creator; Scene Editor may later reference object states/actions through a proper cross-app contract.

Expected owner:

- `scene-editor-layer-controls.js`

### 7. Replace object-linked Audio placeholder with Scene Audio

Current `scene-editor-layer-controls.js` creates object-linked Audio placeholder controls for dialogue, interaction, movement, jump and ambient sound. That ownership is wrong.

Required Scene Editor Audio behaviour:

- Remove the object-linked Audio placeholder from the selected-object inspector/sidebar.
- Provide a `Scene Audio` card in the scene-level sidebar only.
- Initial Scene Audio scope should be limited and clearly scene-level: ambience/background audio file, music/audio track if the existing scene data model supports it cleanly, volume, loop and fade controls where they can be represented without inventing a large event system.
- Persist new scene-audio fields through the existing scene/local save/export flow, with safe defaults for old scene data.
- Do not create object-specific sounds here; those belong to Archetype Object Creator or future events.

Expected owners after inspecting existing data model:

- `scene-editor-renderer.js`
- `scene-editor-bindings.js`
- `scene-editor-scene-model.js` if scene-level audio defaults/normalisation are needed
- `scene-editor-layer-controls.js` to remove the wrong placeholder card

### 8. Record Scene Events / Triggers as future integration work only

Do not implement events in this pass.

Update tracking documentation to add an open future task for a proper Scene Events / Triggers contract. It should cover later links such as:

- on scene enter;
- on object interact/pickup;
- portal/exit trigger;
- conditions;
- FX/sound triggers;
- existing object action/animation trigger;
- quest-state updates.

This must be handled with the future cross-app data/schema work involving Scene Editor, Archetype Object Creator, Effect Editor, Quest Builder and Project Manager.

## Version and cache sync

Only after the implementation and tests succeed, update the live version/cache label consistently to:

`v0.33-inspector-controls-repair`

Update all existing version surfaces used by Scene Editor, including the document title, config version, app fallback/version labels, active CSS/JS cache query keys in `index.html`, and any owned module fallback strings that display the app version.

## Tracker/report correction requirement

`v0.32` failed manual user acceptance. The existing tracker incorrectly describes the four v0.32 items as done/ready after user verification. Update:

- `artifex/apps/scene-editor/scene-editor-core-split-todos.json`
- `artifex/apps/scene-editor/scene-editor-cleanup-report-2026-05-29.md`

Record accurately:

- PR #13 merged and deployed as v0.32, but failed manual acceptance.
- The failed behaviours were slider dragging, non-editable value readout and aspect-off resize still not stretching.
- The v0.33 tasks above were required as repair/reorganisation work.
- Do not mark v0.33 complete or make the cross-app gate ready until the v0.33 deployed build is manually accepted by the user.
- Add future Scene Events / Triggers contract as an open later-integration task.

## Testing requirements

Use a served environment, not `file://`.

Run before creating the draft PR:

1. `node --check` on every active Scene Editor JavaScript file and required shared client file loaded by `index.html`.
2. Start the supported dev server, such as `npm run dev -- --host 127.0.0.1`.
3. Verify the v0.33 Scene Editor URL and all linked active CSS/JS assets return HTTP success.
4. Run Playwright/headless-browser interaction testing if available. Temporary test/browser dependencies must not be committed solely for testing.
5. Verify the diff is limited to focused Scene Editor existing permanent modules/CSS/version/docs plus this handoff file already present on main. No new runtime helper/patch files.

Automated test coverage must include where possible:

- App loads, visible build is `v0.33-inspector-controls-repair`, local scene restore still works.
- A numeric control slider changes its underlying value and visible stage/render effect.
- A numeric centre value can be typed manually and updates the same underlying value/render effect.
- `<` / `>` buttons continue working.
- Shadow Strength and Shadow Blur are independently operable by slider, typed number and buttons; Shadow Blur default/reset is `25`.
- Aspect OFF visibly changes the rendered width/height distortion of an image object using slider, typed input, step button and stage resize handle paths.
- Aspect ON preserves proportional resizing through the same practical paths.
- Floating Object Inspector opens on selection, contains Object Details/Transform/Visual Adjustments/actions, is draggable, remembers position after reload, and does not leave duplicated object-editing cards in the sidebar.
- Scale/Bounding Box/Aspect controls appear together directly below Rotation Origin in the inspector.
- Scene Tags appears directly below Screen Type and persists as scene-level data; object tags are not destructively removed from loaded JSON.
- Sidebar project display is consistent with the shared active-project pill in both no-project and selected-project states.
- Animation placeholder is no longer displayed.
- Audio is scene-level only, persists correctly, and object-linked placeholder controls do not appear.
- Settings Search still finds/filter-restores sidebar and open inspector controls after the UI move.
- Existing selection, movement, rotation, origin marker, layer controls, preview, context menu, zoom, save/download and `window.ArtifexSceneEditorCore` compatibility still work.

Explicitly list manual verification items remaining after deployment.

## PR requirements

- Start from current `main`.
- Create a new branch for v0.33; do not reuse old Codex branches.
- Before PR creation, run `git diff --name-status main...HEAD` and `git diff --stat main...HEAD`.
- Create a draft PR only; do not merge automatically.
- Stop and report if a safe repair requires a new patch/helper layer or if tests cannot be made to pass inside permanent modules.

## Copy-paste Codex prompt

```text
Continue the Artifex Scene Editor from current `main` in `cinaedvsstudios/Forever-Bound-Game`.

Read and execute the full handoff document:

artifex/shared/todo-guide/scene-editor-v033-inspector-controls-repair-handoff-2026-05-30.md

Important: `v0.32-controls-resize-search` is deployed but failed manual user acceptance. Do not treat the v0.32 tasks as complete. Do not stop after auditing; perform the entire focused v0.33 repair/reorganisation pass, test it, update the tracker/report accurately, and create a draft PR.

Non-negotiable constraints:
- No new helper, patch, override, hotfix or version-numbered runtime JS/CSS files.
- Work only inside existing permanent Scene Editor modules and existing CSS.
- Do not redo the core split or permanent module rename cleanup.
- Do not begin cross-app integration or implement Scene Events/Triggers; only record Events/Triggers as future work.
- Do not modify other apps or shared Module menu order.
- Do not merge automatically.

Required v0.33 result:
- Working slider dragging plus editable numeric entry and step buttons, without the cluttered per-control mini-card shells.
- Properly diagnosed and fixed aspect-ratio-OFF image stretching across actual user-facing resize paths; aspect ON remains proportional.
- Floating remembered-position Object Inspector containing Object Details, Transform, Visual Adjustments and object actions.
- Scale / Bounding Box / Aspect Ratio grouped together beneath Rotation Origin.
- Scene Tags moved to the Scene card below Screen Type; no visible object-tags editing in Scene Editor and no destructive loss of existing item.tags data.
- Sidebar active-project display cannot contradict the shared active-project pill.
- Animation placeholder removed from Scene Editor.
- Object-linked Audio placeholder removed and replaced with Scene Audio only.
- Settings Search still works across the reorganised sidebar/active inspector.
- Version/cache updated consistently to `v0.33-inspector-controls-repair` only after passing tests.
- Tracker/report corrected to state that deployed v0.32 failed user acceptance and v0.33 still awaits deployed user verification before cross-app work.

In your final response report:
- draft PR URL or exactly what UI action is needed to expose it;
- branch and commits;
- changed files and `git diff --name-status main...HEAD`;
- actual diagnosed causes and fixes for the slider and aspect failures;
- precise Object Inspector/localStorage/window implementation;
- Scene Tags and Scene Audio schema/default/persistence decisions;
- removed placeholder UI and future Scene Events task recorded;
- tests and results;
- remaining manual user checks;
- confirmation that no helper/patch/runtime override files or cross-app implementation were added.
```

## Manual acceptance after deployment

After review and merge, user acceptance must be performed on:

`https://cinaedvsstudios.github.io/Forever-Bound-Game/artifex/apps/scene-editor/index.html?fresh=v0.33-inspector-controls-repair`

Do not open the cross-app integration phase until the user accepts the deployed v0.33 page.
