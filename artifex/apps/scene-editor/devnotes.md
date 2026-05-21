# Artifex Scene Editor Dev Notes

Short running patch log for the Scene Editor. Keep this file practical: what changed, what was fixed, and what still needs checking.

## Current active test URL

`https://cinaedvsstudios.github.io/Forever-Bound-Game/artifex/apps/scene-editor/?v=v13`

## Patch log

### Early editor foundation — blank scene and core editor shell

- Built the first Scene Editor app shell under `artifex/apps/scene-editor/`.
- Added top Title Bar, left Control Panel, and right Work Area / stage layout.
- Added basic JSON import/download flow.
- Added blank editor state so the editor opens without automatically loading a JSON file.
- Added basic scene fields, selected-item fields, and JSON preview.
- Added basic draggable scene objects on the work stage.

### Template foundation — starter test scenes and simple SVG assets

- Added templates folder support so test JSON files can be loaded from templates.
- Added starter template JSON files for basic editor testing.
- Added simple placeholder SVG assets for testing: grid/background style assets, coloured placeholder objects, simple prop/person/object shapes.
- Noted that early template files point to SVGs, not JPEG/GIF assets.
- Added Import from templates modal/list behavior.

### Import menu pass — hard drive, URL, and templates

- Changed the old choose/change JSON button into an Import button.
- Import menu supports: From hard drive, From URL, and From templates.
- Added template popup/modal for choosing starter files.
- Changed startup behavior so the editor starts blank rather than auto-loading an existing JSON.
- Added basic load/open toasts.

### Branding and title bar pass

- Replaced the text-only editor title with Artifex logo/title images.
- Adjusted Title Bar button sizing and spacing.
- Added vertical divider after the Artifex title area.
- Added hover/status text area in the Title Bar.
- Moved filename out of the Title Bar and into a file pill at the top of the Control Panel.

### Control Panel card pass

- Locked terminology around Control Panel, Title Bar, and Work Area.
- Added collapsible cards with ↕ controls.
- Added different card-header colour treatments for Scene Basics, Elements, Selected Item, and JSON Preview.
- Set JSON Preview collapsed by default.
- Reduced some Control Panel text sizing to make the editor less cramped.

### Work Area grid and zoom pass

- Added Work Area zoom controls: +, o, and -.
- Added right-click Set default zoom behavior on the zoom reset button.
- Saved zoom/default zoom settings to localStorage.
- Added more detailed grid styling, including denser gridlines, stronger major lines, axis labels, and coordinate labels.
- Added status/toast feedback for zoom/default zoom changes.

### Object selection and context menu pass

- Made selected object glow/highlight more visible.
- Added highlight toggle behavior.
- Added right-click object context menu with object name/type and actions such as Zoom to object, Properties, Duplicate, and Delete.
- Fixed duplicate behavior after early attempts where the toast appeared but the object did not actually duplicate.
- Fixed right-click menu handling after earlier context menu events were not being captured reliably.

### Layer and Elements list pass

- Added element numbering in the Elements card.
- Adjusted Elements list so the top item represents the frontmost layer and the bottom item represents the backmost layer conceptually.
- Added a layer value pill/control tied to the selected item.
- Began cleanup work around messy layer numbers, with later need for a real Clean Layers pass still outstanding.
- Changed several Elements card controls toward compact emoji/icon controls.

### Selected Item fields and effects planning pass

- Changed Selected Item card title to use the selected object's name.
- Added/kept fields for ID, Name, Type, Image Path, Text, X/Y, Width/Height, Layer, Z/Depth, Tags, and Visible.
- Type field moved toward dropdown behavior.
- Added Tags field for later Asset Library searching.
- Added planning notes for future effects: tint, brightness, contrast, saturation, blend mode, opacity, lock, multi-select, show/hide name, and show/hide border.

### Image path and file-source pass

- Added folder button beside image/path fields.
- Path menu supports Online and HDD options.
- Added warning concept for local blob/HDD images that cannot survive a reload unless converted into stable project assets.
- Added unsaved-image warning planning for save/download flows.
- Added Download All Images behavior for URL-based images and later adjusted naming toward element IDs.

### Asset library folder foundation

- Added `artifex/assets-library/` folder structure.
- Split asset folders by kind: static images, animated assets, animation frames, and videos.
- Confirmed MP4 loops are acceptable for reusable visual effects such as fire/sparks when used with blend/overlay modes.
- Added first asset-library manifest indexing the uploaded assets by ID, path, category, format, recommended use, and tags.

### v0.10 series — texture, recent imports, and loading polish

- Added charcoal texture styling for the Title Bar and Control Panel.
- Corrected texture path to use `../../charcolbg.jpg` from the scene-editor folder.
- Changed panel cards to black with 50% transparency.
- Added loading toasts and glow/pulse styling.
- Added Recent Projects / Recent Imports early placeholder behavior.
- Added unsaved-change warning on Blank Screen.

### v0.11 series — asset picker and Wrap Image foundation

- Added Assets option to Image Path folder menus.
- Added Asset Library picker using `artifex/assets-library/asset-library.json`.
- Asset picker supports search and filtering.
- Selecting an asset inserts a stable path into Image Path.
- Added initial Wrap Image feature to match object box proportions to the selected image.
- Fixed asset picker so selected assets update the visible object on screen.
- Added dropdown close behavior when clicking elsewhere.

### v0.12c — selected-item layout repair

- Rebuilt the selected-item metrics area into a more deliberate grid.
- Layout target: X / Y / Z on the left, scale/wrap controls in the middle, Height / Width / Layer on the right.
- The helper now creates the Wrap Image button if it is missing.
- Old empty field rows are removed after fields are moved into the grid.

### v0.12d — divider and Border toggle restore

- Restored the divider line under the metrics grid.
- Re-added the Border checkbox beside Delete Selected and Visible.
- Border toggle remains localStorage-based for now.
- Later improvement: save border visibility into the scene JSON per object.

### v0.12e — border toggle override fix

- Fixed Border toggle so it works on selected objects as well as unselected objects.
- `border-hidden` now overrides selected highlight styles, outline, box-shadow, border, and purple editor background.

### v0.12f — proportional scale controls and zoom-to-object repair

- Added middle-column proportional scale controls: up arrow, wrap image, down arrow.
- Up/down controls change Width and Height together by 2 points.
- Kept Wrap Image as the center scale tool.
- Added `scene-editor-v12f.css` for the scale-control stack styling.
- Patched right-click `Zoom to object` so it zooms in and scrolls the selected object into view instead of only showing a toast.

### v0.12g — object move handle and max zoom pass

- Added a 💠 move handle in the centre of each object.
- Object dragging should now require using the 💠 handle instead of dragging from anywhere on the object.
- Clicking an object body should select it without accidentally moving it.
- Added visual feedback on the 💠 handle while hovering and dragging.
- Patched Zoom to object toward maximum zoom and center-scroll behavior.
- Needs checking: selection without movement, handle-only dragging, visual feedback, and max zoom centering.

### v0.12h — local working-copy resume and plain move handle

- Added localStorage working-copy backup helper.
- When the editor is blank and a local backup exists, the Blank Scene Editor area now shows a non-modal “Start where you left off?” panel.
- Open local backup loads the cached JSON working copy rather than trying to reopen a hard-drive file.
- File pill now shows local backup and last downloaded timestamps where available.
- Download JSON records a last-downloaded timestamp.
- Removed the 💠 emoji from the move handle and left the plain round centre drag circle.
- Zoom to object now targets roughly 200% instead of a tiny one-step zoom.

### v0.12i — core working-copy save and control-card layout foundation

- Moved local working-copy save/resume into the core editor file so it saves from the live scene state instead of relying on JSON Preview.
- Disabled the older preview-based resume helper so collapsed JSON Preview no longer blocks local backup.
- Start where you left off should now restore directly from localStorage.
- Zoom to object now doubles the current zoom toward the selected object, capped at the editor maximum.
- Added `scene-editor-v12i.css` with reusable control-card layout classes: 1-column, 2-column, 3-column, mixed groups, spans, dividers, and notes.
- Needs checking: local backup survives refresh, Open local backup restores the edited scene, and Zoom to object doubles current zoom.

### v0.12j — file pill and resume panel polish

- Added `scene-editor-v12j-helper.js` and `scene-editor-v12j.css` for file pill / resume panel polish.
- File pill display changed toward: `📁 💾 filename.json` and second line `| LOCAL: dd-mm-yy hh:mm | HDD: dd-mm-yy hh:mm |`.
- Resume panel polish: removed the extra Blank Scene Editor heading, made “Start where you left off?” purple, highlighted the file name, centered the buttons, and made Open local backup purple.
- Needs checking: file pill should not overflow, resume panel buttons should be centered, and Open local backup should stay visually primary.

### v0.12k — file pill metadata sanitiser

- Fixed duplicated file pill icons / duplicated LOCAL-HDD text caused by the visible pill text being read back as the file name.
- Sanitises stored working-copy filename and downloaded filename in localStorage.
- Strips `📁`, `💾`, `LOCAL`, `HDD`, `Local backup`, and `Last downloaded` pollution from displayed/saved file names.
- Rebuilds the file pill from clean values only.
- Needs checking: file pill should settle to one icon pair, one clean filename, and one LOCAL/HDD metadata line.

### v0.13 — control-card layout conversion

- Loaded `scene-editor-v13.css` and `scene-editor-v13-helper.js`.
- Converted the file pill into a fixed 3-row structure: project name, file title, then icons/date-time row.
- File pill bottom row uses two columns: icons on the left and `LOCAL` / `HDD` timestamps on the right.
- Added a project placeholder icon `🏗️` beside the folder and disk icons.
- Converted Scene Basics into layout groups: 1-column identity/path group, 2-column grid group, and 1-column toggle group.
- Converted Elements into layout groups: top controls/layer row and full-width item list.
- Converted Selected Item into layout groups: 1-column identity/path group, metrics block, tags group, and tools group.
- This is still helper-based, but it proves the card layout rules before moving them into the core editor render functions.
- Needs checking: file pill should stay stable, cards should not lose controls, selected-item metrics/wrap/scale controls should still work.

### Recovered older proposed version roadmap

- Added `recovered-proposed-feature-list.md` to preserve the older screenshot roadmap for v0.13 to v0.16.
- It records the exact older plan for layer cleanup, asset-library object creation, hitbox/visual-box separation, and project/settings foundation.
- The items were already broadly represented in the Future Feature Phases below, but the recovered list keeps the old version-number wording intact.

## Known rough edges / next checks

- Selected-item layout is still partly managed by helper scripts, not directly generated in `scene-editor-v2.js`. Long-term fix should move this layout directly into `selectedForm()`.
- Border toggle currently persists locally only, not inside exported scene JSON.
- Recent local hard-drive imports cannot be reopened automatically because browsers do not allow silent local file access.
- Asset Library should later support adding a new element directly from an asset, not only replacing the selected object's image path.
- Layer numbering still needs a cleanup/reorder pass.
- Unsaved/local blob image handling still needs a cleaner workflow once the Asset Manager exists.
- The editor now has several helper files layered over the original editor. This works for patching, but a later cleanup should consolidate stable behavior into the core editor file.
- Move handle behavior should eventually be moved into core stage item rendering rather than helper injection.
- Control-card grid classes and v0.13 conversions exist, but once tested they should be moved into the core render functions rather than being applied after render.

## Future feature phases

### Phase 1 — stabilise the current Scene Editor

- Move the selected-item layout directly into `selectedForm()` in `scene-editor-v2.js` instead of rebuilding it through helper scripts.
- Consolidate stable helper behavior into the core editor file once the layout is proven.
- Clean up duplicate/temporary patch files where safe.
- Make Border, Name, Visible, Locked, and Fixed Ratio proper per-object JSON properties.
- Make object editing stable without the Control Panel jumping back to the top.
- Make Zoom to object, duplicate, delete, and context menu actions reliable.
- Keep `devnotes.md` updated after every patch.

### Phase 2 — layer system cleanup

- Add a Clean Layers action.
- Recalculate all layer values sequentially.
- Make the top Elements row the frontmost object and the bottom row the backmost object.
- Add drag-to-reorder inside the Elements list.
- Make the layer value pill update from selected object and move the object when edited.
- Add move forward/backward controls.
- Keep layer changes reflected immediately in the Work Area and exported JSON.

### Phase 3 — object box, resize, rotate, and hitbox tools

- Add resize handles to the selected object box.
- Add rotate handle at the top center of the selection box.
- Add aspect-ratio lock and unlock behavior.
- Add proportional scaling controls as stable native controls.
- Add separate Visual Box and Hitbox concepts.
- Add show/hide hitbox toggle.
- Add copy visual box to hitbox.
- Add label-anchor controls for object names.

### Phase 4 — Asset Library integration

- Add Add from Assets button in the Elements card.
- Choosing an asset should be able to create a new scene object, not only replace the selected object's image.
- Copy asset tags into the new object's Tags field.
- Use asset name as the default object name.
- Support static images, GIF/WebP animated assets, MP4 loops, and later animation-frame sequences.
- Add last-used asset category/filter/search memory.
- Improve unstable URL/blob image warnings and Download All asset handling.

### Phase 5 — effects and visual treatment

- Add Effects card under Selected Item.
- Add tint, brightness, contrast, saturation, opacity, and blend mode controls.
- Blend mode options should include normal, lighter, darker, multiply, screen, dodge, and burn where browser support allows.
- Add MP4/effect overlay support for fire, sparks, twinkles, explosions, smoke, portals, and magic.
- Begin CG Effects Library integration through scene JSON references.
- Store effect configuration in JSON rather than hardcoding it into scenes.

### Phase 6 — project settings and persistence

- Add Project Settings panel.
- Store project name, project JSON URL/path, asset folder path, template folder path, and preferred save/download locations.
- Auto-load last active project from localStorage where safe.
- Add Recent Imports behavior for templates and URL imports.
- Keep local hard-drive files as name-only recents unless a File System Access workflow is added.
- Add export/import settings JSON.
- Add settings backup workflow.

### Phase 7 — Artifex hub expansion

- Keep Scene Editor as one mini-app inside Artifex.
- Add Sprite Wizard for sprite sheets and animation metadata.
- Add Font Packer for bitmap font atlas PNG + JSON map creation.
- Add CG Effects Library as its own tool/module.
- Add Project Manager, Tasks, and Project Overview.
- Consider later UI Layout Editor, Dialogue/Codice Editor, Map Editor, and Item/Quest Data Editor.
- Use the central Artifex hub button/project selector to switch active project and load the last-used project state.

### Phase 8 — game/runtime integration

- Make sure exported scene JSON remains compatible with the Forever Bound runtime.
- Add a preview/test mode for scene behavior.
- Add support for click hotspots, doors/exits, pickups, blockers, walk areas, search zones, and triggers.
- Add validation before download/export.
- Add warnings for missing assets, invalid paths, duplicate IDs, broken layers, and unsupported formats.
- Eventually connect scene JSON, asset manifest, effects library, and project settings into one consistent build workflow.
