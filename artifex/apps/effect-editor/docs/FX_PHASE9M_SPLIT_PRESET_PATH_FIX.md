# FX Phase 9M — Split Preset Path Fix

The user's repo/local folder stores built-in presets as:

- `src/presets/base-effects.js`
- `src/presets/composite-effects.js`

The previous hotfix expected a single `src/presets.js` file, so the Insert menu and archetype browser could load blank if that root file was missing.

This hotfix updates `index.html` to load the split preset files directly, while also keeping `src/presets.js` in the package as a compatibility fallback for older builds.

Visible version: `v2.3.3 ALPHA`.
