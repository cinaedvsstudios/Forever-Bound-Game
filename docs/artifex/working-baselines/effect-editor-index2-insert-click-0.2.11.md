# Effect Editor Working Baseline — INDEX2-INSERT-CLICK-0.2.11

Status: WORKING BASELINE

Locked branch:

`working/effect-editor-index2-insert-click-0.2.11`

Locked commit:

`3ff3db1fe60d5004b032d353a60d9b8fc92ce316`

Date locked:

2026-06-15

## Scope

This baseline marks the Effect Editor state after Phase 1 and the adapter-definition preparation pass.

Current live route:

`artifex/apps/effect-editor/index.html`

Visible version before the next control-connection work:

`INDEX2-INSERT-CLICK-0.2.11`

## Accepted working behaviour

- Insert menu opens correctly.
- Insert menu uses the click-only selection flow.
- Moving the mouse over Insert items does not change the selected preview.
- Clicking an effect button updates the preview/text panel.
- Clicking Add inserts the selected effect as a layer.
- Insert menu is sorted alphabetically.
- Insert menu is displayed as a three-column chooser.
- New prototype placeholder entries are visually blue.
- `Emission Point / Chimney Fire` has been renamed in the main Insert menu to `Chimney Smoke`.
- Prototype placeholder layers hide the generic left-panel controls.
- Clicking back to a normal effect restores the normal left-panel controls.
- The left panel styling has been restored with `panel-restore.css`.
- The smoke and shimmer control adapter definition files exist, but are not wired into the live left panel yet.

## Files in this baseline

Primary editor files:

- `artifex/apps/effect-editor/index.html`
- `artifex/apps/effect-editor/v3/src/index2-app.js`
- `artifex/apps/effect-editor/v3/src/editor-core.js`
- `artifex/apps/effect-editor/v3/src/editor-effect-controls.js`
- `artifex/apps/effect-editor/v3/src/presets/portal-wormhole-presets.js`
- `artifex/apps/effect-editor/v3/src/prototype-adapters/prototype-presets.js`
- `artifex/apps/effect-editor/v3/src/prototype-adapters/smoke-controls.js`
- `artifex/apps/effect-editor/v3/src/prototype-adapters/shimmer-controls.js`
- `artifex/apps/effect-editor/v3/styles.css`
- `artifex/apps/effect-editor/v3/panel-restore.css`

Prototype source folders remain separate and should not be modified by the next control-connection pass:

- `artifex/apps/effect-editor/smoke-engine/`
- `artifex/apps/effect-editor/fx-shimmer/`

## Next risky phase

The next phase is to connect the adapter definitions into `editor-effect-controls.js` so prototype placeholder layers show their relevant controls inside the Effect Specific Controls card.

That next phase should be treated as reversible. If it breaks the left panel, revert to the locked branch above.
