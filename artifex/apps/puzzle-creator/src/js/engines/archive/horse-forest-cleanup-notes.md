# Horse Forest Cleanup Notes

This folder records active-file cleanup for the Puzzle Creator Horse Forest / Obstacle Course work.

The accepted live route is:

- `artifex/apps/puzzle-creator/src/js/engines/obstacle-course-runtime.js`

The only separate support file intentionally loaded by `main.js` is:

- `artifex/apps/puzzle-creator/src/js/engines/obstacle-course-asset-debug.js`

The following files were removed from the active `engines/` folder because they were patch/override/prototype files and made the runtime chain unstable:

- `obstacle-course-layout-patch.js`
- `obstacle-course-control-relocator.js`
- `obstacle-course-path-runtime.js`

Their history remains available in Git commits. Future changes should be made directly inside the live runtime or inside the dedicated asset debug helper only.

Do not revive parallel horse runtime files. Do not add new patch loaders to `main.js` unless a temporary emergency test is explicitly requested and removed immediately after validation.
