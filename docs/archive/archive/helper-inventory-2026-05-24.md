# Artifex Scene Editor Helper Inventory — 2026-05-24

Purpose: record the current helper/script/style stack before consolidation. The goal is to reduce the Scene Editor back to stable core code plus only a small number of permanent modules.

## Current loader map

### Directly loaded by `artifex/apps/scene-editor/index.html`

#### Core

- `scene-editor-v2.js` — core editor application, render loop, local backup, import/export, stage, base cards, selected object fields. Keep and consolidate into this.

#### Direct helper scripts

- `scene-editor-v19-card-preload.js` — card preload/support script. Audit. Merge or remove.
- `scene-editor-v11-helper.js` — asset picker / path helper era. Audit. Merge stable asset picker behaviour or keep only if it is a proper module.
- `scene-editor-v11-hotfix.js` — hotfix. Remove after confirming its behaviour is obsolete or merged.
- `scene-editor-v12g-helper.js` — centre move / wrap / object behaviour era. Audit and merge useful parts.
- `scene-editor-v12h-helper.js` — older local working-copy/resume helper. Should be mostly obsolete because local backup moved into core. Remove only after confirming no active behaviour is still needed.
- `scene-editor-v12j-helper.js` — file pill / resume polish helper. Merge any useful display logic into core or remove.
- `scene-editor-v15-guard.js` — guard against selected-card/layout conflicts. Audit. Remove if no longer needed after consolidation.
- `scene-editor-v15-helper.js` — selected object split-card layout, transform, visual/animation/audio cards. Important but should be merged into core selected-object render.
- `scene-editor-v18-value-sliders.js` — red-dot numeric sliders. Candidate permanent module or merge into core controls.
- `scene-editor-v19-independent-cards.js` — independent card behaviour. Merge into core card rendering.
- `scene-editor-v20-card-controller.js` — collapse/card controller. Merge into core card handling.
- `scene-editor-v21-visual-adjustments.js` — live visual effects controls. Merge into core selected-object visual card or keep as a deliberate permanent visual-controls module.
- `scene-editor-v22-offscreen-placement.js` — offscreen drag limits and dynamic loader for later helpers. Merge offscreen logic into core and stop using it as a loader.

#### Direct CSS files

- `scene-editor.css` — base editor stylesheet. Keep as main style target.
- `context-menu.css` — context menu styling. Keep or merge into base stylesheet.
- `scene-editor-v3.css` — early UI styling. Audit and merge useful styles.
- `scene-editor-v10.css` — texture/visual styling. Audit and merge.
- `scene-editor-v11.css` — asset picker/path styling. Keep only if asset picker remains separate.
- `scene-editor-v12.css` — card/selected layout styling. Merge.
- `scene-editor-v12f.css` — scale/zoom selected-object styling. Merge or remove.
- `scene-editor-v12g.css` — centre move handle styling. Merge.
- `scene-editor-v12h.css` — local backup/resume styling. Merge into core/base if still useful.
- `scene-editor-v12i.css` — control-card layout classes. Merge into base.
- `scene-editor-v12j.css` — file pill/resume polish. Merge or remove.
- `scene-editor-v13.css` — control-card layout conversion. Merge.
- `scene-editor-v17-rotate-polish.css` — rotate handle/slider polish. Merge into transform CSS.
- `scene-editor-v18-value-sliders.css` — red-dot slider styling. Candidate permanent module or merge.
- `scene-editor-v21-visual-adjustments.css` — visual adjustment styling. Candidate permanent module or merge.

### Dynamically loaded by `scene-editor-v22-offscreen-placement.js`

- `scene-editor-v23-aspect-controls.css`
- `scene-editor-v23-aspect-controls.js`
- `scene-editor-v24-object-preview.css`
- `scene-editor-v24-object-preview.js`
- `scene-editor-v25-menu-polish.css`
- `scene-editor-v25-menu-polish.js`
- `scene-editor-v26-label-layout-polish.css`
- `scene-editor-v26-label-layout-polish.js`

`scene-editor-v26-label-layout-polish.js` is currently paused because it interfered with the blank/resume screen and Open Local Backup.

### Other recent patch files not currently loaded directly by index

- `scene-editor-v27-final-polish.css` — final polish override created during the v26/v27 chain. Should not become another permanent layer. Merge useful styles or delete.
- `scene-editor-v27-effects-polish.js` — visual/shadow override attempt. Not wired into index as of this inventory. Merge only if the formula is needed.
- `scene-editor-v27-visual-shadow-override.js` — stronger shadow override attempt. Not wired into index as of this inventory. Merge only if the formula is needed.

## Consolidation target

Target after cleanup:

- `scene-editor-v2.js` becomes the stable core editor file or is renamed later to `scene-editor.js`.
- `scene-editor.css` becomes the stable base/theme stylesheet.
- Keep at most two deliberate modules during the next stage:
  - value sliders, if not merged immediately,
  - selected-object preview, if kept separate because it is self-contained.

Everything else should be merged, removed, or archived.

## Merge order

### Pass 1 — restore stability

- Keep v26 JS paused.
- Confirm Open Local Backup works.
- Confirm import, download, local backup, object select, object drag, and selected preview still work.

### Pass 2 — core card/layout merge

Merge into core render and CSS:

- card labels: Scene, Background, Object Layers, Selected Details, Transform Selected,
- Background card,
- file/status pill,
- top menu,
- manual local save button,
- card open/collapsed colours,
- collapse emoji styling.

Then remove or disable the label/menu/final polish helpers that become redundant.

### Pass 3 — object controls merge

Merge into core or one clean module:

- transform selected card,
- rotate handle and rotate origin,
- aspect ratio lock,
- wrap bounding box to image,
- offscreen placement,
- value sliders and reset menu.

### Pass 4 — visual/preview merge

Merge or formalise:

- visual effect formulas,
- glow/shadow/vibrance behaviour,
- selected-object preview popup.

## Decision table

| File or group | Current role | Decision |
| --- | --- | --- |
| `scene-editor-v2.js` | Core editor | Keep and merge into it |
| v11/v12 helpers | asset/path/card/move/local polish history | Audit, merge useful code, remove obsolete helpers |
| v15 helper/guard | selected split-card layout | Merge into core selected panel |
| v18 sliders | numeric red-dot controls | Merge or keep as one permanent module |
| v19/v20 card scripts | card independence/controller | Merge into core card render |
| v21 visuals | visual controls | Merge or keep as visual module |
| v22 offscreen | offscreen drag plus dynamic loader | Merge offscreen; stop using as loader |
| v23 aspect | aspect/wrap controls | Merge into transform card |
| v24 preview | selected object preview | Candidate permanent module |
| v25 menu polish | top menu styling/logic | Merge into core top bar |
| v26 label layout | paused unstable DOM patch | Remove after core merge |
| v27 polish/visual override | late overrides | Merge useful styles/formulas or delete |

## Rule reminder

Do not add another temporary helper for ordinary UI changes. If a helper is used for a quick test, it must be merged, removed, or promoted to a proper permanent module within two update cycles.
