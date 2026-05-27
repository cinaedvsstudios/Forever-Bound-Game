# Forever Bound / Artifex Global To Do

This list is for cross-module or unresolved work that should not be forgotten while individual tools are being built.

## Artifex – Archetype Object Creator

### Step 5 asset/action workflow follow-up

Status: To do
Priority: High
Source: Archetype Object Creator V1.17 review

Items to add or refine:

- Move the selected action title so it sits cleanly above the right-side control boxes, while keeping the preview area visually higher and tighter.
- Reduce the vertical gap between the preview window and the play / frame navigation buttons.
- Add a fixed-height, scrollable **Reference** box under the preview controls, separated by a horizontal line.
- The Reference box should list every scene, quest, or object file that references the current character/object/action, so the editor can be used to check whether files are correctly connected.
- The Reference box should not use fake placeholder links. It needs a real source of truth from Project Manager, Scene Editor, Quest Builder, or an exported project index.
- In the Frame Fix popup, change the title to show the exact frame being edited, e.g. `Frame Correction – Frame 03`.
- Add a reset button beside the close button in Frame Fix.
- Add a brightness slider to Frame Fix, stored per frame alongside scale, X offset, and Y offset.
- When using **Match brightness across frames**, store the generated per-frame brightness values so the user can see how much each frame was adjusted.
- Apply frame correction values live to both the large preview and the thumbnail/frame strip.
- Decide whether the bottom controls should keep both **Add Images** and **Add Frame**, or rename **Add Frame** to **Add Empty Frame Slot** so the distinction is clearer.

Notes:

- The object package should remain one main `archetype.json` plus `asset_manifest.json`, images, sounds, and generated folders in the ZIP.
- Avoid adding more overlay/patch files. Keep the object creator at no more than two overlay modules unless the older patch is properly folded into the base code.
- Any reference-index work probably belongs partly in Project Manager or the shared Artifex project model, not only in Archetype Object Creator.
