# Scene Editor v2 Patch

This patch replaces the local JSON scene editor with a more practical editor.

## New features

- Smaller/custom grid through editable columns and rows.
- Letter/number grid labels. Vertical rows use letters. Horizontal columns use numbers.
- Coordinate entry such as `A3` for the selected object.
- Smoother dragging using pointer events and no full panel rerender while dragging.
- Scroll position in the left editor panel is preserved when clicking buttons.
- PNG overlay layers can be added.
- Layers have numeric depth. Background is layer 0. Higher numbers draw further forward.
- Items can be moved forward/backward with + and - buttons.
- Wide scrolling background checkbox for previewing repeat-x backgrounds.
- Scene Elements section lists layers, Mel markers, props, enemies, etc.
- Basic UI Editor tab for placing UI buttons/panels/labels. This exports ui[] data but does not yet automatically update the live game UI until the game reads that data.

## Upload locations

- `editor.html` -> repo root
- `src/editor.js` -> `src/editor.js`
- `src/editor.css` -> `src/editor.css`
- `docs/scene-editor-v2.md` -> optional docs folder

