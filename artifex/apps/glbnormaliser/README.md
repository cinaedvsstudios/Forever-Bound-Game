# GLB Asset Normaliser - Measured Scale + Pivot Star

This version works from the page itself, without typing a folder path into a BAT window.

## How to use

1. Open `index.html` in Chrome or Edge.
2. Click **Choose GLB Folder**.
3. Select the folder containing your `.glb` files.
4. The app remembers the folder. Next time, click **Restore last folder** if the browser does not restore it automatically.
5. The left panel lists folders and `.glb` files.
6. Click a `.glb` to inspect it.
7. Use **Z**, **X**, or **Y** to choose the pivot-edit axis.
8. Drag the gold star in the preview. It moves only along the selected axis.
9. Choose a **Target basis** and **Target size (m)**. The app treats 1 app/world unit as 1 metre.
10. The app calculates the **Root scale to write** and shows the expected size after saving.
11. Use **Save copy** first.
12. Once tested, use **Overwrite original** with **Backup before overwrite** switched on.

## Measured scale controls

The app measures each GLB's bounding box when it loads.

The top bar shows:

- Current size in metres / app units.
- Target basis: Height, Width, Depth, Longest side, or Manual root scale.
- Target size in metres.
- Root scale that will be written into the GLB.
- Expected size after saving.

For normal GLB/glTF files, **Y-up** is usually correct. If an asset was exported with a different up axis, change **Bottom axis** before setting height or pivot.

Batch processing uses the same target-size logic per file. For example, if you select ten sacks and set **Target basis = Height** and **Target size = 0.65m**, each selected sack is scaled individually so its measured height becomes 0.65m.

## Layout changes

The left folder/file panel scrolls independently.

The middle preview area stays fixed/sticky so the model does not disappear while you work.

The right asset information/actions/log panel scrolls independently.

## Preview quality slider

The top bar includes **Render preview quality**.

Lower settings use a faster point-cloud preview.

The maximum setting switches to a built-in solid mesh preview using the asset's triangle geometry and material base colours. This is not a full PBR/game-engine renderer, but it is much closer to a normal object render than the dot preview and does not need external libraries.

## What saving changes

The tool adds or reuses a root node named `FB_NormalisedRoot`.

It moves the original scene root nodes so the gold star position becomes the origin/pivot, then applies a uniform scale to `FB_NormalisedRoot`.

This preserves the original mesh buffers, materials, textures, and embedded binary data. It is intended for static GLB props.

## Browser note

The folder picker uses the File System Access API. Chrome and Edge support this style of local folder read/write access. Firefox/Safari may not.

Folder handles cannot be stored as plain text in localStorage, so the app stores the actual browser folder handle in IndexedDB and stores the visible remembered folder name in localStorage.

## Safety note

Use **Save copy** first. For overwrite, leave **Backup before overwrite** checked. The backup file is written beside the original GLB with a `.bak-YYYYMMDD-HHMMSS.glb` name.
