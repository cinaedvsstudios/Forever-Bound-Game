# Artifex Scene Editor Dev Notes

Short running patch log for the Scene Editor. Keep this file practical: what changed, what was fixed, and what still needs checking.

## Current active test URL

`https://cinaedvsstudios.github.io/Forever-Bound-Game/artifex/apps/scene-editor/?v=v012f`

## Patch log

### v0.12f — proportional scale controls and zoom-to-object repair

- Added middle-column proportional scale controls: up arrow, wrap image, down arrow.
- Up/down controls change Width and Height together by 2 points.
- Kept Wrap Image as the center scale tool.
- Added `scene-editor-v12f.css` for the scale-control stack styling.
- Patched right-click `Zoom to object` so it zooms in and scrolls the selected object into view instead of only showing a toast.
- Needs checking: scale up/down updates the object immediately; Zoom to object centers the object reliably.

### v0.12e — border toggle override fix

- Fixed Border toggle so it works on selected objects as well as unselected objects.
- `border-hidden` now overrides selected highlight styles, outline, box-shadow, border, and purple editor background.

### v0.12d — divider and Border toggle restore

- Restored the divider line under the metrics grid.
- Re-added the Border checkbox beside Delete Selected and Visible.
- Border toggle remains localStorage-based for now.
- Later improvement: save border visibility into the scene JSON per object.

### v0.12c — selected-item layout repair

- Rebuilt the selected-item metrics area into a more deliberate grid.
- Layout target: X / Y / Z on the left, scale/wrap controls in the middle, Height / Width / Layer on the right.
- The helper now creates the Wrap Image button if it is missing.
- Old empty field rows are removed after fields are moved into the grid.

### v0.11 series — asset picker and Wrap Image foundation

- Added Assets option to Image Path folder menus.
- Added Asset Library picker using `artifex/assets-library/asset-library.json`.
- Asset picker supports search and filtering.
- Selecting an asset inserts a stable path into Image Path.
- Added initial Wrap Image feature to match object box proportions to the selected image.
- Fixed asset picker so selected assets update the visible object on screen.
- Added dropdown close behavior when clicking elsewhere.

### v0.10 series — texture, recent imports, and loading polish

- Added charcoal texture styling for the Title Bar and Control Panel.
- Corrected texture path to use `../../charcolbg.jpg` from the scene-editor folder.
- Changed panel cards to black with 50% transparency.
- Added loading toasts and glow/pulse styling.
- Added Recent Projects / Recent Imports early placeholder behavior.
- Added unsaved-change warning on Blank Screen.

## Known rough edges / next checks

- Selected-item layout is still partly managed by helper scripts, not directly generated in `scene-editor-v2.js`. Long-term fix should move this layout directly into `selectedForm()`.
- Border toggle currently persists locally only, not inside exported scene JSON.
- Recent local hard-drive imports cannot be reopened automatically because browsers do not allow silent local file access.
- Asset Library should later support adding a new element directly from an asset, not only replacing the selected object's image path.
- Layer numbering still needs a cleanup/reorder pass.
