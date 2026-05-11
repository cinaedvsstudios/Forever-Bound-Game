# Artifex Static Fix

This version is for the direct GitHub Pages / no-build workflow.

Use these files instead of the previous TypeScript-only version:

- `index.html` now loads `./src/style.css` and `./src/main.js`.
- `src/main.js` is browser-ready JavaScript.
- `src/main.ts` is included only as an optional source/reference file.

Replace your `index.html`, add/replace `src/main.js`, keep/replace `src/style.css`, and add the JSON files under `data/screens/` and `data/editor/`.

If your page is white, open DevTools > Console. The most likely old error was the browser trying to load `src/main.ts` directly instead of browser-ready JavaScript.
