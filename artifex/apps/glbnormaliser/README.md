# GLB Asset Normaliser - Folder Picker Version

This version is designed to work from the page itself, without typing a folder path into a BAT window.

## How to use

1. Open `index.html` in Chrome or Edge.
2. Click **Choose GLB Folder**.
3. Select the folder containing your `.glb` files.
4. The left panel lists folders and `.glb` files.
5. Click a `.glb` to inspect it.
6. Set the scale value.
7. Use **Save copy** first.
8. Once tested, use **Overwrite original** with **Backup before overwrite** switched on.

## What it changes

The tool adds or reuses a root node named `FB_NormalisedRoot`.

It moves the original scene root nodes so the visible model's bottom-centre point becomes the origin/pivot, then applies a uniform scale to `FB_NormalisedRoot`.

This preserves the original mesh buffers, materials, textures, and embedded binary data. It is intended for static GLB props.

## Browser note

The folder picker uses the File System Access API. Chrome and Edge support this style of local folder read/write access. Firefox/Safari may not.

## Safety note

Use **Save copy** first. For overwrite, leave **Backup before overwrite** checked. The backup file is written beside the original GLB with a `.bak-YYYYMMDD-HHMMSS.glb` name.
