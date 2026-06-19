# Scene Mockup — V1

A standalone scene-composition tool for the Forever Bound game repository.

## Run

Open `scene-mockup/index.html` through a local HTTP server or the repository's Vite development server, then visit `/scene-mockup/`.

## V1 included

- Import PNG, JPG, WEBP and GLB assets.
- Add assets to a 2D composition canvas, drag them, and nudge with the arrow keys.
- Set an image as the background using right-click from the asset library.
- Layer stack with ordering, visibility, lock, opacity and blend modes.
- Manual hue, saturation, brightness and contrast controls.
- Automatic colour match for all foreground layers, followed by manual per-layer controls.
- Chroma key for image layers.
- Eraser mask for image layers, reversible through **Reset image**.
- Project save and open (`.scene-mockup.json`).
- JPEG, transparent PNG and transparent WEBP export.
- GLB thumbnail rendering via Three.js loaded from a CDN; a generated fallback thumbnail is used when a browser cannot render the model.

## Structure

- `css/` — shared styles, layout and components.
- `js/core/` — state, data model and utility functions.
- `js/features/` — export, GLB preview, project I/O, chroma key and eraser mask.
- `js/ui/` — canvas, panels, toolbar and asset library.

## Notes for the next pass

The current GLB support renders an imported model to a transparent 2D preview so it can participate in the same 2D scene layer and export pipeline. The next functional pass can add an embedded live 3D inspector for camera angle, lighting and turntable rotation before the render is committed to the scene.
