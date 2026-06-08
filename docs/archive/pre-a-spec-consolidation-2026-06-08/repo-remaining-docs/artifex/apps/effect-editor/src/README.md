# Artifex Effect Editor Source Split

This folder is the staged module area for the Artifex Effect Editor refactor.

The current live app still runs from `artifex/apps/effect-editor/index.html`.

The first refactor checkpoints are:

1. Extract shared CSS to `../styles.css`.
2. Extract Tailwind config to `config/tailwind.config.js`.
3. Extract preset registries into `presets/`.
4. Extract runtime classes and rendering helpers into `engine/`.
5. Extract DOM/UI functions into `ui/`.
6. Extract import/export and Artifex schema helpers into `io/`.

Refactor rule:
Do not change the visual behaviour of the editor while splitting files. The first pass is preservation only. After the app still loads and behaves the same, add the new Artifex-specific features.

Upcoming feature modules:

- `engine/shape-renderer.js` for built-in SVG/procedural particle shapes.
- `engine/texture-cache.js` for custom PNG texture sprite loading.
- `io/artifex-fx-schema.js` for Export Editor Project vs Export Artifex FX Asset.
- `io/effekseer-converter.js` for Effekseer `.efkproj` approximation imports.
