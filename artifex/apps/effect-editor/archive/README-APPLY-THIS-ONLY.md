# Smoke Engine self-folder reference patch

Use this after moving the smoke prototype into one folder with `styles.css`.

Changed:
- `index.html` now loads `./styles.css?v=0.4`
- The Prototype Type dropdown no longer links out to `../atmosphere-volume/index.html`
- `smoke-engine.js` is unchanged because it already loads locally from `./smoke-engine.js`

Expected final folder:
artifex/apps/effect-editor/smoke-engine/
  index.html
  smoke-engine.js
  styles.css
  atmosphere-volume.js
  fog-mist-engine.js
  smoke-wisps.js

You can keep the extra fog files for reference, but the smoke prototype page only needs `index.html`, `smoke-engine.js`, and `styles.css`.
