# Archetype Object Creator To-Do

This file tracks work that belongs specifically to Archetype Object Creator. Platform-wide work belongs in `artifex/shared/todo-guide/all-apps-todos.json`.

## Open

### Test V1.19 Step 5 wizard and export contract polish

Status: open  
Priority: high  
Source: V1.18 / V1.19 implementation pass

Verify in the live app that Step 5 and the object export contract now work as intended:

- Selected action title sits above the right-side control boxes.
- Preview window is pulled up and play/frame buttons are closer to the preview.
- Reference box appears below the preview controls, has fixed height, and scrolls.
- Reference box does not invent fake scene links; it waits for a real shared reference index.
- Frame Fix popup title shows `Frame Correction – Frame XX`.
- Frame Fix has Reset and Close controls.
- Frame Fix has scale, X, Y, and brightness controls with visible numeric steppers.
- Match brightness across frames stores per-frame brightness values and shows them in the brightness control.
- Frame corrections apply live to preview and frame thumbnails.
- Bottom controls clearly distinguish `Add Images` from `Add Empty Frame Slot`.
- New object archetypes use the canonical `archobj_` ID prefix.
- Exported object files are named for individual files under `archetypes/objects/` and declare `archetypes/object-index.json` as the index target.

### Integrate current overlay code into normal module files

Status: open  
Priority: high  
Source: project file contracts / patch-layer rule

The app currently stays within the two-active-overlay limit, but `template-card-enhancements.js` has grown into a large live overlay. Fold the stable Step 5 wizard, icon-card, ZIP export, frame correction, sound-event, and reference-panel logic into normal Object Creator module files when the layout is confirmed.

Suggested split:

- `object-template-icons.js`
- `object-wizard-step5.js`
- `object-wizard-frame-correction.js`
- `object-wizard-asset-package.js`
- `object-wizard-reference-panel.js`

After the split, keep `editor-app.js` as a thin entry file and remove any no-longer-needed overlay import.

## Done

### Align object archetype exports with project file contracts

Status: done  
Completed in: V1.19  
Source: docs/artifex/19-project-file-contracts.md

Completed changes:

- New object archetype IDs now use the canonical `archobj_` prefix.
- Older imported/local `object_` IDs are normalised to `archobj_` IDs.
- Reusable object archetypes now declare `archetypes/object-index.json` as the object index target.
- Individual object export paths now resolve to `archetypes/objects/<archobj_id>.json`.
- Exported JSON includes `exportPaths.objectIndex` and `exportPaths.objectFile` for Project Manager / build tooling.

Scene Editor still needs to consume object archetype IDs when placing instances, but that belongs to Scene Editor / shared project integration rather than this app-local export task.

## Blocked by all-apps work

### Real scene/quest/reference listing

Status: blocked  
Priority: high  
Blocked by: `todo_all_apps_project_reference_index`

The Reference panel is present, but real results require the shared project reference index to exist. That index is tracked globally in `artifex/shared/todo-guide/all-apps-todos.json` because Project Manager, Scene Editor, Quest Builder, Effect Editor, Build Game, and Archetype Object Creator all need the same project graph source of truth.
