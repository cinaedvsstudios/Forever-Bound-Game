# Artifex Effect Editor Modular Test Package

This is a self-contained modular test version of the Artifex Effect Editor.

It is intentionally placed in its own folder so it can be uploaded and tested without replacing the current production editor.

## Folder path to upload

Upload the whole folder as:

```text
artifex/apps/effect-editor-modular-test/
```

Open:

```text
artifex/apps/effect-editor-modular-test/index.html
```

## What this package contains

```text
index.html
styles.css
src/editor-app.js
src/editor-state.js
src/editor-ui.js
src/editor-library.js
src/editor-io.js
src/editor-renderer.js
src/fx-runtime.js
src/presets/base-effects.js
src/presets/composite-effects.js
```

## Smoke checks

After uploading, check:

1. Page loads.
2. Grid appears.
3. Insert menu opens.
4. Insert > Base Layer > Standard Particle creates visible particles.
5. Menus open.
6. Sliders affect the active layer.
7. Side panel resize does not kill render.
8. Bottom panel resize does not kill render.
9. Export JSON downloads a JSON file.
10. Snapshot PNG downloads a PNG.

## Important limitation

This is a working modular test build, not a full extraction of every single feature from the old monolithic Effect Editor.

Its purpose is to prove the split architecture and safe upload workflow first.
