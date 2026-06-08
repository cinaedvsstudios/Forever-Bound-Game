# Scene Editor Consolidation Progress — 2026-05-24

## Removed safely

- `scene-editor-v12j-helper.js` was removed from `index.html` and deleted.
- `scene-editor-v12j.css` was removed from `index.html` and deleted.
- `scene-editor-v27-final-polish.css` was deleted because it was not loaded and could reintroduce old card-toggle styling if wired back later.

## Confirmed by manual testing

After each removal, the editor still loaded and the visible layout remained stable.

The current file/status pill still shows:

- Project
- File
- Local date/time

## Remaining loaded scripts to consolidate

- `scene-editor-v19-card-preload.js`
- `scene-editor-v11-helper.js`
- `scene-editor-v11-hotfix.js`
- `scene-editor-v12g-helper.js`
- `scene-editor-v12h-helper.js`
- `scene-editor-v15-guard.js`
- `scene-editor-v15-helper.js`
- `scene-editor-v18-value-sliders.js`
- `scene-editor-v19-independent-cards.js`
- `scene-editor-v20-card-controller.js`
- `scene-editor-v21-visual-adjustments.js`
- `scene-editor-v22-offscreen-placement.js`

## Next safest code target

Audit `scene-editor-v11-hotfix.js` and `scene-editor-v11-helper.js` together before removing either.

Do not remove `scene-editor-v11-hotfix.js` blindly, because it still appears to handle path-menu closing and asset-selection refresh after an asset is chosen.

## Next largest target

`scene-editor-v15-helper.js` remains the biggest helper debt. Its selected-card and Object Layers behaviour should be merged into core in stages. Its old centre-drag code is already blocked by `scene-editor-v15-guard.js` when core drag is active, but the duplicate code should still be removed during the v15 merge pass.
