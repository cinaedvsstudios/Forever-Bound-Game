# Effect Editor Render Restore Test Checklist

Branch: `effect-editor-render-restore`
Base: likely stable `v2.3.0 ALPHA` render version.

Purpose: verify that the old render path still works before reapplying newer UI changes.

## Test URL

Use the branch preview or manually copy this branch version of:

`artifex/apps/effect-editor/index.html`

Do not test against `main` for this phase.

## Acceptance test

1. Open Effect Editor.
2. Confirm the grid appears.
3. Open Insert.
4. Add a base particle/effect layer.
5. Confirm visible particles render in the workspace.
6. Resize the side panel.
7. Resize the bottom panel.
8. Confirm grid letters/numbers remain visible.
9. Confirm particles remain visible after resize.
10. Confirm the layer appears in the layer stack.

## Expected result

This branch is expected to have the older UI language and older card layout. That is acceptable for this test.

This branch is only being used to prove that the pre-resolution render engine still works.

## Do not judge in this phase

Do not judge these items yet:

- old generated logo/header
- old menu spacing
- old card names
- missing current thumbnail panel
- missing quick edit presets
- missing Shape / Brush / Custom controls
- missing current local file/export flow
- missing resolution presets

Those are documented separately and will be re-applied after the render baseline passes.

## Pass condition

Pass only if effects render visibly and survive panel resize.

## Fail condition

Fail if:

- grid appears but particles do not render,
- particles vanish after resize,
- inserting a layer does nothing,
- the render loop dies after a few seconds.

If this branch fails, the stable point is not actually stable and an earlier commit must be tested.
