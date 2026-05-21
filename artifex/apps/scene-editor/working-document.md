# Artifex Scene Editor Working Document

This document is a reconstructed working document for the Artifex Scene Editor, based on the project chat/canvas planning and the active repo patches. It is meant to preserve the practical design decisions, terminology, feature direction, and next-phase planning in the repo.

## Core purpose

The Artifex Scene Editor is the visual scene-building tool for Forever Bound. It edits scene JSON rather than replacing the game engine. The editor should let a user load a scene, place and adjust objects visually, set metadata, and export/download the updated JSON for use in the game project.

The editor is part of the wider Artifex hub. Artifex should become a collection of mini-apps, not a single overloaded editor. The Scene Editor handles scene layout and object placement. Other tools should handle asset browsing, sprites, bitmap fonts, effects, tasks, and project management.

## Current terminology

Use these names consistently:

- Title Bar: the top bar with Artifex branding, Import, Download JSON, Blank Screen, status/tooltips, and navigation.
- Control Panel: the left-side editor panel containing cards such as Scene Basics, Elements, Selected Item, and JSON Preview.
- Work Area: the right-side visual stage where the scene is previewed and objects are selected/moved.
- Stage: the actual 16:9 scene area inside the Work Area.
- Object box / selection box: the editor frame around a scene object. It represents the object's editable x/y/width/height frame, not necessarily the original image pixel size.
- Visual box: future concept for where the rendered image appears.
- Hitbox: future concept for interaction/click/collision zones.
- Label anchor: future concept for where the object's label appears.

## Current scene editor structure

The Scene Editor currently lives at:

`artifex/apps/scene-editor/`

Current major files include:

- `index.html` — loads the Scene Editor app and helper/style files.
- `scene-editor-v2.js` — core editor render/bind logic.
- `scene-editor.css` — original editor styling.
- `context-menu.css` — right-click menu styling.
- `scene-editor-v3.css` and `scene-editor-v3-helper.js` — later UI/grid/control helper work.
- `scene-editor-v10.css` — texture/loading polish.
- `scene-editor-v11.css`, `scene-editor-v11-helper.js`, `scene-editor-v11-hotfix.js` — asset picker and Wrap Image foundation.
- `scene-editor-v12.css`, `scene-editor-v12-helper.js`, `scene-editor-v12f.css` — selected-item layout, border toggle, proportional scale controls, and zoom-to-object repair.
- `devnotes.md` — running patch log and future feature notes.

Important cleanup note: the editor currently has several helper files layered over the core editor. This is useful for fast patching, but the stable behavior should eventually be consolidated into the core editor file, especially the Selected Item layout.

## Project and hub direction

Artifex should become a hub with separate mini-apps. The Scene Editor is one app inside the hub, not the entire system.

Likely Artifex hub modules:

- Scene Editor — edit scene JSON visually.
- Asset Library — browse and tag reusable art/video/effect assets.
- Sprite Wizard — build and organize sprite sheets / frame animation metadata.
- Font Packer — convert fonts into bitmap/atlas assets and JSON maps for canvas/WebGL-style rendering.
- CG Effects Library — reusable effect scripts/assets that scenes can plug into.
- Project Manager — choose active project, project settings, localStorage project state, task links, file paths.
- Tasks — project tasks, next steps, and build reminders.
- Project Overview — high-level status, current project metadata, and linked working docs.
- Possible later tools: UI Layout Editor, Dialogue/Codice Editor, Map Editor, Item/Quest Data Editor.

The central hub button should eventually switch the active project. The editor should auto-load the last open project from localStorage where safe.

## Import/export workflow

Current workflow:

1. Open the Scene Editor.
2. Import a scene JSON from hard drive, URL, or templates.
3. Edit scene data visually or through Control Panel fields.
4. Download JSON.
5. Manually upload/commit the JSON back to the project repo.

Planned future workflow:

- Project settings store known project paths and preferred URLs.
- Editor remembers recent imports in localStorage.
- Local hard-drive files cannot be silently reopened by the browser, so recent local files can only be remembered by name unless a more advanced File System Access workflow is added.
- Ideally, when moving between screens, the editor should autosave a backup to localStorage and, if browser permissions allow, overwrite a local project JSON backup file based on the path in project settings.

## File/path behavior

Image path fields should support:

- Online — paste a URL or repo/project path.
- HDD — choose a local file for preview.
- Assets — choose a stable asset from the Artifex Asset Library manifest.

Important local file rule:

- HDD/local file images often become `blob:` URLs in the browser.
- Blob URLs are temporary preview references only.
- A saved JSON with a blob URL will not reliably reload later.
- Stable paths should come from repo assets, online URLs, or the Asset Library.

Save/download warning concept:

- If scene JSON contains external unsaved image URLs, blob URLs, or unstable local image references, the editor should warn before downloading/saving.
- Warning should offer Continue, Cancel, Show List, and later Download All where possible.
- Download All should ideally rename files using the element ID.

## Asset Library

Asset Library folder:

`artifex/assets-library/`

Asset categories:

- `static-images/` — still props, characters, backgrounds, cave pieces, objects.
- `animated/` — GIF/WebP animated overlays, gems, magic effects, smoke, fire, etc.
- `animation-frames/` — frame-by-frame animation sequences; currently empty.
- `videos/` — MP4 loops such as fire, sparks, twinkle, explosion.

Manifest:

`artifex/assets-library/asset-library.json`

The manifest indexes assets by:

- ID
- name
- category
- type
- path
- format
- recommended use
- tags
- optional blend mode suggestion for video/effect assets

MP4 loops are acceptable for effects such as fire, sparks, twinkles, portals, and overlays. They should eventually support blend modes such as screen/lighten/additive-like display behavior.

## Object box and image sizing

The editor box around an object is not the original image's pixel size. It is the object frame based on scene JSON values:

- x
- y
- width
- height
- layer / z
- zDepth

Transparent padding in an image can make the visible object look much smaller than its selection box. Large images can also appear visually mismatched if the object's width/height values do not match the asset's proportions.

Wrap Image exists to help fix this. It reads the selected image's natural ratio and adjusts width/height so the object box better matches the image.

Additional proportional scaling was added so width and height can be increased/decreased together by 2 points.

Future improvement:

- Separate visual box, hitbox, selection box, and label anchor.
- Add trim-transparent-padding behavior later if needed.

## Selected Item controls

Selected Item should contain:

- ID
- Name
- Type dropdown
- Image Path with Online / HDD / Assets picker
- Text field for text/label/UI objects
- X Axis
- Y Axis
- Z / Depth slider
- Height
- Width
- Layer
- Wrap Image
- Proportional scale up/down
- Tags
- Delete Selected
- Visible
- Border

Future toggles/fields:

- Name toggle — hide/show object label in Work Area.
- Border toggle — hide/show editor selection border.
- Locked toggle — prevent moving/editing that object.
- Fixed ratio toggle — lock/unlock aspect ratio when resizing.
- Effects card — tint, brightness, contrast, saturation, opacity, blend mode.

Border toggle currently persists through localStorage. Later it should save as per-object JSON data.

## Layer system

Current layer concept:

- Higher/front layers should appear above lower/back layers.
- Elements list should conceptually represent frontmost at the top and backmost at the bottom.
- Current layer numbers can become messy because duplicates and edits can create non-sequential values.

Needed future behavior:

- Clean Layers button.
- Recalculate layer values sequentially.
- Top Elements row = frontmost.
- Bottom Elements row = backmost.
- Drag Elements rows up/down to reorder layers.
- Layer value pill updates when selecting an object.
- Editing layer value moves the object to that layer and shifts others accordingly.

## Work Area grid and zoom

Work Area should support:

- Zoom in.
- Zoom out.
- Reset/default zoom.
- Right-click reset button to set current zoom as default.
- Grid with more lines than the first version.
- Stronger major lines every 5 lines.
- Horizontal numeric labels and vertical letter labels.
- Axis labels to show direction.
- Drag/pan view area using scroll/mouse behavior.

Right-click Zoom to object should zoom and center/scroll the selected object into view.

## Context menu

Right-click object menu should include:

- Header with object name.
- Object type.
- Zoom to object.
- Properties.
- Duplicate.
- Delete.

Menu should eventually be object-type aware, so different object types can show different actions.

## Effects / CG effects direction

CG effects should probably be separate reusable JS/effect modules that scenes can reference. Scene JSON controls where the effect appears, how it is positioned, and what settings it uses.

Possible effect model:

- effectId
- target object / layer / position
- x/y/width/height
- timing
- loop or one-shot
- blend mode
- opacity
- speed
- color/tint
- trigger condition

The CG Effects Library should remain separate from the Scene Editor but integrate with it through the asset/effect picker.

## Settings and persistence

Settings that should save to localStorage:

- zoom
- default zoom
- collapsed cards
- highlight toggle
- possibly last active project
- possibly last selected asset category/filter/search
- recent imports/templates/URLs

Later Settings menu should allow:

- export settings JSON
- import settings JSON
- project paths
- asset library path
- template folder path
- preferred project save/download location

## Known design principle

Avoid adding too many features directly into one giant editor. Artifex should be a hub. Scene Editor should stay focused on scene JSON and visual layout. Asset work, sprite work, font packing, project management, and effect libraries should be separate mini-apps that connect through shared project settings and manifests.

## Immediate cleanup recommendation

The selected-item layout is currently being managed through helper scripts layered over `scene-editor-v2.js`. This was useful for rapid patches, but it caused repeated layout resistance.

The stable fix is to move the selected item grid directly into `selectedForm()` in `scene-editor-v2.js` so the controls are born in the right cells instead of being moved after render.
