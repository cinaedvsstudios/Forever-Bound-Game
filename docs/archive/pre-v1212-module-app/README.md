# Quest Builder Pre-V1.2.12 Module-App Archive

Archive pass date: `2026-06-01`.

## Files archived

| Archived file | Former location |
|---|---|
| `styles.css` | `artifex/apps/quest-builder/v1/styles.css` |
| `module-app.js` | `artifex/apps/quest-builder/v1/src/module-app.js` |
| `module-io.js` | `artifex/apps/quest-builder/v1/src/module-io.js` |
| `module-renderer.js` | `artifex/apps/quest-builder/v1/src/module-renderer.js` |
| `module-state.js` | `artifex/apps/quest-builder/v1/src/module-state.js` |

## Reason for archiving

These files belong to the older boilerplate-style Quest Builder module-app path. The active Quest Builder page does not load `styles.css` and does not load `module-app.js`. The archived JavaScript files were only used by that obsolete module-app chain and were not found in the active HTML entry, active JavaScript imports, dynamic imports, `document.write` loading, Hub/app navigation, app-index links, or documented live test links.

`module-config.js` was not archived in this pass because it is still imported by the active V1.2.12 Quest Builder runtime.

## Current active replacement

The active Quest Builder entry remains:

```text
artifex/apps/quest-builder/index.html
```

The active script/style chain remains:

```text
artifex/apps/quest-builder/index.html
  -> artifex/apps/quest-builder/v1/quest-builder.css?v=1.2.12
     -> artifex/apps/quest-builder/v1/quest-builder-v108.css?v=1.2.12-base
  -> artifex/apps/quest-builder/v1/src/quest-builder-app.js?v=1.2.12
```

The active runtime is the V1.2.12 module set rooted at `artifex/apps/quest-builder/v1/src/quest-builder-app.js`.

## Live functionality confirmation

This archive move is file-only. No active Quest Builder HTML, CSS entry file, current runtime module, schema file, export/import code, connected-project behaviour, puzzle handoff, dialogue behaviour, shared service, or other Artifex app was changed.
