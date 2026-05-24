# v15 Consolidation Pass — 2026-05-24

## Why this pass exists

`scene-editor-v15-helper.js` is still the largest active helper. It currently owns several behaviours that should not permanently live in a post-render DOM helper.

Because the editor is stable again, this helper should be reduced in small safe passes rather than rewritten all at once.

## Current v15 responsibilities

- Split Selected Details into separate cards.
- Build the Transform card and metric table.
- Build placeholder Visual, Animation, and Audio cards.
- Add Border visibility toggle.
- Build Object Layers stacked rows.
- Add layer lock/unlock controls.
- Add layer drag/reorder/recalculate behaviour.
- Patch asset picker buttons and add the game-category filter.
- It still contains an older centre-handle drag implementation, but core now owns centre-handle movement.

## Safe order

### Step 1 — Remove obsolete centre-drag from v15

Core `scene-editor-v2.js` now handles object centre-handle drag through the core move-drag flow. The v15 helper should no longer attach its own pointerdown/pointermove/pointerup drag handlers.

Target:

- keep core drag active,
- make `wireCentreHandleDrag()` inert or remove its call from `patch()`,
- leave all layout, layer, asset picker, and border functions untouched.

Check after this:

- selected-object move handle still drags objects,
- dragging does not jump to another object,
- X/Y fields still update,
- no visual card/layout regression.

### Step 2 — Move selected-card card creation into core

Move these stable behaviours into core render:

- Selected Details identity card,
- Transform card,
- Visual Adjustments card shell,
- Animation card shell,
- Audio card shell.

Do not move layer stack in the same patch.

### Step 3 — Move Object Layers stack into core

Move these behaviours after selected-card render is stable:

- row number,
- object pill,
- lock emoji,
- recalculate button,
- drag/reorder behaviour.

### Step 4 — Keep or formalise asset picker polish

The asset picker category filter can either become part of the asset picker module or stay as a named permanent module. It should not remain buried inside v15.

## Notes

Do not add another helper for these changes.

Do not change CSS layout while removing centre-drag from v15.

Do not combine the centre-drag removal with the selected-card core merge.
