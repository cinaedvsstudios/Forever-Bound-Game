# Artifex Scene Editor Future Updates

This file preserves the next planned fixes and sets the rule for temporary helper files.

## Immediate priority

Stabilise the Scene Editor before new feature work continues.

The editor currently has too many layered helper scripts and style patches. This made fast testing possible, but it also creates bugs when later patches alter the same screen areas as the core editor. The recent label/layout polish helper interfered with the blank resume screen, so helper consolidation is now required.

## Helper rule from now on

A helper may be used as a temporary patch only.

A helper must not stay in place for more than two update cycles. After one or two test passes, it must be merged into the real code, converted into a clearly named permanent module, or removed.

Do not add helpers that patch other helpers. Do not keep short-loop or mutation-based interface patches unless they are emergency fixes.

### Hard prevention rule

This situation must not happen again.

Before adding any new helper file, first check whether the change can be made in one of these existing places:

- `scene-editor-v2.js` for core editor state, scene render, card creation, file/status pill, save/load, stage render, and core object movement.
- `scene-editor.css` or a current active stylesheet for permanent styling.
- An already-loaded permanent module when the behaviour clearly belongs to that module.

A new helper is allowed only when all of these are true:

1. The change is experimental or emergency-only.
2. The helper has a named owner/purpose in this file or the helper inventory.
3. The helper has a merge/remove deadline before it is committed.
4. The helper does not patch another helper.
5. The helper does not use repeated DOM mutation loops unless there is no safer option.

Any new helper must include a comment at the top with:

- why it exists,
- which real file/module it should eventually merge into,
- what test confirms it can be removed,
- and the maximum number of follow-up updates it may survive.

If a change creates a helper, the next or following patch must either merge it, convert it into a permanent module, or delete it. Do not move on to unrelated features while helper debt from the last two updates is still unresolved.

### Patch checklist before every Scene Editor change

Before making a new Scene Editor patch:

1. Check `index.html` to see which scripts and styles are currently loaded.
2. Check whether the target behaviour is already handled by core or an existing helper.
3. Avoid adding overlapping behaviour in a second place.
4. If touching a visual area, identify the owning stylesheet before editing.
5. After the patch, remove any newly obsolete helper/script/style from `index.html`.
6. Update the changelog or this file when the change affects helper/module ownership.

## Current stabilisation plan

1. Confirm the editor front screen loads.
2. Confirm Open Local Backup works again.
3. Confirm local working-copy save still works.
4. Audit every helper and style patch currently loaded.
5. Merge stable behaviour into the real editor files.
6. Remove or pause temporary helpers that are no longer safe.

## Planned fixes to preserve

### Selected object preview

- Eye button on the left side of the Work Area.
- Popup shows only the selected object.
- No handles, borders, labels, rotate tail, move dot, or editor overlay.
- Apply transform and visual effects.
- Black, white, and green preview backgrounds.
- Live update while values change.
- Zoom slider in the popup.
- Middle-mouse drag pans the preview only.
- Preview should match the stage render as closely as possible.

### Visual effects

- Glow Strength is improved and should remain testable.
- Shadow Strength still needs to become darker at 100.
- Vibrance should have a clearer visible effect.
- Later add Glow Colour options: white, purple, blue, green, red, gold, and custom.

### Red-dot sliders

- All numeric value fields should have the red-dot vertical slider.
- Right-clicking the red dot should show Reset.
- Reset returns the value to its neutral default.
- Slider changes must update the object live and save the working copy.

### Card naming and layout

Stable target labels:

- Scene Basics becomes Scene.
- Elements becomes Object Layers.
- Object Details becomes Selected Details.
- Transform becomes Transform Selected.

Background Image Path should move into a separate Background card.

Open cards should be purple. Collapsed cards should be brown. This should be native code, not a repeated after-render patch.

Collapse emojis should not have a heavy bordered button around them.

### Top menu

Compact menu buttons:

- File
- Edit
- View
- Effects
- Help

No dropdown arrows on the buttons.

Default state brown. Open state purple. Focus outline purple.

File menu should contain New Blank Scene, New from Template, Download JSON, and Settings.

Dropdowns must appear above the eye button and stage controls.

### File/status pill and save controls

The file/status pill should use these sections:

- Project
- File
- Save info

Labels should be blue. Values should be yellow.

Add a save-disk button before the vertical divider in the top bar to force a local browser backup and show a saved toast.

Autosave currently uses a very short debounce after edits, not a timed every-few-minutes save.

### Shape consistency

Use the same rounded shape language for cards, file pill, eye button, zoom buttons, and utility buttons.

Use the same brown and purple gradients across menus, cards, and buttons.

## Helper integration order

### Pass A: emergency stability

- Pause unstable layout-polish helper behaviour.
- Restore Open Local Backup.
- Confirm the front screen works.

### Pass B: inventory

- List every helper and style file loaded by the Scene Editor.
- Mark each file as merge, keep, or remove.

### Pass C: core UI merge

Merge these into the real editor code first:

- stable card labels,
- Background card,
- file/status pill,
- top menu,
- manual local save button,
- collapse icon styling,
- open/collapsed card colour state.

### Pass D: object editing merge

Merge these next:

- red-dot sliders,
- slider reset menu,
- aspect-ratio lock,
- wrap bounding box to image,
- rotate origin and rotate handle,
- offscreen placement,
- visual adjustment formulas.

### Pass E: permanent module decision

Possible permanent modules:

- Asset Picker.
- Selected Object Preview.
- Future animation/effects preview tools.

Everything else should be merged into core or removed.

## Development rule

Every future patch must update this file or devnotes. Temporary helpers need a clear merge/remove deadline. If a helper causes a regression, pause it rather than adding another helper on top.

Do not stack new helpers on top of old helpers as a normal workflow. The default workflow is now: edit the owning real file, test, then delete obsolete patches. Helpers are a last resort, not the default build method.
