# GLB Asset Normaliser - Pivot Star Version

This version is designed to work from the page itself, without typing a folder path into a BAT window.

## How to use

1. Open `index.html` in Chrome or Edge.
2. Click **Choose GLB Folder**.
3. Select the folder containing your `.glb` files.
4. The left panel lists folders and `.glb` files.
5. Click a `.glb` to inspect it.
6. Set the scale value.
7. Use the **Z**, **X**, or **Y** view buttons to choose which pivot axis you want to edit.
8. Drag the gold star in the preview. It only moves along the active axis.
9. Use **Save copy** first.
10. Once tested, use **Overwrite original** with **Backup before overwrite** switched on.

## Pivot controls

The gold star is the pivot point that will become the GLB origin when saved.

The star starts at the calculated bottom-centre point. The **Reset pivot** button sends it back to that bottom-centre point.

The green cross marks the current origin. The gold box shows the current model bounds.

The **Z**, **X**, and **Y** buttons are axis edit modes. The active axis is highlighted and a dashed gold guide line is drawn through the star. Dragging the star changes only that one coordinate.

## What it changes

The tool adds or reuses a root node named `FB_NormalisedRoot`.

It moves the original scene root nodes so the chosen pivot-star point becomes the origin/pivot, then applies a uniform scale to `FB_NormalisedRoot`.

This preserves the original mesh buffers, materials, textures, and embedded binary data. It is intended for static GLB props.

## Browser note

The folder picker uses the File System Access API. Chrome and Edge support this style of local folder read/write access. Firefox/Safari may not.

## Safety note

Use **Save copy** first. For overwrite, leave **Backup before overwrite** checked. The backup file is written beside the original GLB with a `.bak-YYYYMMDD-HHMMSS.glb` name.
