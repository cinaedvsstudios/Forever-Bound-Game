# Quest Builder V1.0.8 Monolith Archive

Archive pass date: `2026-06-01`.

## Files archived

| Archived file | Former location |
|---|---|
| `quest-builder-v108.js` | `artifex/apps/quest-builder/v1/quest-builder-v108.js` |

## Reason for archiving

`quest-builder-v108.js` is the old V1.0.8 monolithic Quest Builder runtime. The current Quest Builder page does not load this script directly, through active JavaScript imports, through dynamic imports, or through `document.write` loading. Its superseded runtime behaviour is represented by the current V1.2.12 modular Quest Builder runtime.

`quest-builder-v108.css` was not archived in this pass because the active stylesheet entry still imports it as base styling.

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

`quest-builder-app.js` then imports the current V1.2.12 modules under `artifex/apps/quest-builder/v1/src/`.

## Live functionality confirmation

This archive move is file-only. No active Quest Builder HTML, CSS entry file, current runtime module, schema file, export/import code, connected-project behaviour, puzzle handoff, dialogue behaviour, shared service, or other Artifex app was changed.
