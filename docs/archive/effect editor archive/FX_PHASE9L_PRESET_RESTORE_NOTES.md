# Phase 9L - Preset Restore Hotfix

This hotfix restores `src/presets.js` to the upload package. The current `index.html` loads presets from `./src/presets.js`, so the Insert menu and Effect Archetype Asset browser depend on that file being present beside `src/fx-runtime.js`.

Upload/replace all three files:

- `index.html`
- `src/fx-runtime.js`
- `src/presets.js`

The visible title version has been bumped to `v2.3.2 ALPHA`.
