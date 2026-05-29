# Recovered Proposed Feature List

Recovered from an older chat screenshot. These items are mostly already represented in `devnotes.md` under the future feature phases, but this file preserves the old version-labelled roadmap wording so it is not lost.

## v0.13 — layer cleanup

1. Add Clean Layers button in the Elements card.
2. Recalculate all layer numbers sequentially.
3. Top item in Elements list = frontmost layer.
4. Bottom item in Elements list = backmost layer.
5. Add move forward / move backward controls.
6. Later: drag rows up/down to reorder layers.

Status: Not fully done yet. Some layer controls exist, but the real Clean Layers/reorder pass is still future work.

## v0.14 — asset library integration pass

1. Add “Add from Assets” button in Elements card.
2. Choosing an asset creates a new scene object automatically.
3. Static images become prop/pickup/etc.
4. GIF/WebP animated assets become animated overlay/pickup objects.
5. MP4 assets become video/effect overlay objects.
6. Asset tags are copied into the object tags field.
7. Asset name becomes the object name by default.

Status: Partly done. Asset Browser exists and can replace the selected object's image path. The missing part is creating new objects directly from assets.

## v0.15 — hitbox / visual box separation

1. Add Visual Box vs Hitbox concept.
2. Selection frame controls the visual box.
3. Hitbox controls click/collision/interaction.
4. Add “show hitbox” toggle.
5. Add “copy visual box to hitbox”.
6. Add “wrap visual to image”.

Status: Not done yet. This is still a future structural feature.

## v0.16 — Project / settings foundation

1. Start a Project Settings panel.
2. Save project name, project JSON URL/path, asset folder path, template folder path.
3. Auto-load last project from localStorage.
4. Export/import project settings JSON.
5. Later: project manager/checklist/tasks.

Status: Not fully done yet. Some settings exist in localStorage, but the project settings panel and project manager workflow are still future work.
