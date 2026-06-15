# Effect Editor Working Baseline — INDEX2-PROTO-CONTROLS-0.2.13

Status: WORKING BASELINE

Locked branch:

`working/index2-proto-controls-0213`

Locked commit:

`28ad4969a3241f6fec575c6525174dee47d5e9c4`

Date locked:

2026-06-15

## Scope

This baseline marks the Effect Editor state after the prototype placeholder controls were connected and the two-column control-panel layout was accepted.

Current live route:

`artifex/apps/effect-editor/index.html`

Visible version before renderer work:

`INDEX2-PROTO-CONTROLS-0.2.13`

## Accepted working behaviour

- Existing old effects still work.
- Insert menu opens correctly.
- Insert menu uses click-only selection.
- Moving the mouse over Insert items does not change the selected preview.
- Clicking an effect button updates the Insert preview/text panel.
- Clicking Add inserts the selected effect as a layer.
- Insert menu is sorted alphabetically.
- Insert menu is displayed as a three-column chooser.
- New prototype placeholder entries are visually blue.
- `Emission Point / Chimney Fire` is shown in the main Insert menu as `Chimney Smoke`.
- Prototype placeholder layers show their correct Effect Specific Controls.
- Prototype layers keep Search Settings, Effect Archetype Assets, and Effect Specific Controls visible.
- Generic left-panel sections are hidden for prototype layers and restored for normal layers.
- Sliders and colour controls in Effect Specific Controls use a two-column layout.
- Dropdowns, image/file choosers, text rows, checkbox rows, and action rows remain full-width.
- Prototype controls save values onto the selected placeholder layer.
- No renderer connection has been made yet for the prototype smoke/shimmer effects.

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

Prototype source folders remain separate and should not be modified unless the next phase explicitly needs renderer extraction:

- `artifex/apps/effect-editor/smoke-engine/`
- `artifex/apps/effect-editor/fx-shimmer/`

## Next risky phase

The next phase is renderer connection. Treat that as reversible. If it breaks the editor UI or existing old effects, revert to the locked branch above.
