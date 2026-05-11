# Forever Bound Local JSON Scene Editor

This patch adds a local browser editor that can import a scene JSON file, show it over a background preview, let you drag Mel's start position and object markers, then download the edited JSON.

It does not use a GitHub token.
It does not save directly to GitHub.
It only saves a temporary local draft in your browser.

## Files in this patch

| File | What it does |
|---|---|
| `editor.html` | New editor page. Open it through GitHub Pages by adding `/editor.html` to the site URL. |
| `src/editor.ts` | The editor logic. Imports JSON, lets you drag markers, copies/downloads JSON. |
| `src/editor.css` | The editor layout and styling. |
| `data/scenes/ch00_q00_forest_route_scene.json` | Example scene JSON structure for the current forest test. |

## How to upload manually

1. Upload `editor.html` to the repo root.
2. Upload `src/editor.ts` into the existing `src` folder.
3. Upload `src/editor.css` into the existing `src` folder.
4. Upload the sample JSON only if you want it. If you already have a scene JSON, keep yours.

## How to open it

If your game is live at:

`https://cinaedvsstudios.github.io/Forever-Bound-Game/`

then the editor should be:

`https://cinaedvsstudios.github.io/Forever-Bound-Game/editor.html`

GitHub Pages may need a minute after upload.

## Workflow

1. Open `editor.html`.
2. Click `Import scene JSON`.
3. Choose the scene JSON from your computer.
4. Click `Preview background image` if the background does not show from the repo path.
5. Drag Mel / objects / walkable area.
6. Click `Download edited JSON`.
7. Upload the downloaded JSON back into the same GitHub folder, replacing the old one.

## Important

This editor edits data only. It does not edit PNGs, TypeScript game code, or GitHub automatically.
