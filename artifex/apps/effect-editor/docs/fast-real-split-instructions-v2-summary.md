# Fast Real Split Instructions V2 Summary

This file corrects the first `fast-real-split-instructions.md` so it matches the original Phase 1B fix language and acceptance rules.

## Use these sources correctly

- Working render source: `fb-effect-base` / `fed68ad0526bca288f6ba41f1bcc0413de5355d0`.
- Menu wording and Insert behaviour reference: Phase 1B docs/UI.
- Do not use `effect-editor-reapply-phase1b` as the render base unless separately verified.
- Do use Phase 1B for terminology and acceptance checks.

## Phase 1B wording to preserve

Top menu must remain:

- `File`
- `Edit`
- `View`
- `Insert`
- `Help`

Insert sections must remain:

- `Base Layer`
- `Effect Archetype Assets`
- `Custom Effect`

Do not rename `Base Layer` to `Base Effect Layer`.
Do not rename `Effect Archetype Assets` to generic `Composite Effect`.

## Phase 1B behaviour to preserve

- File / Edit / View / Insert / Help all open reliably.
- Existing `data-menu-id` / `toggleTopMenu` style behaviour is preserved unless replaced by an equivalent tested system.
- `Base Layer` populates from the real base preset registry.
- `Effect Archetype Assets` populates from the real composite/archetype registry.
- `Custom Effect` populates from local saved custom effects.
- Blank sections show visible empty states.
- Grid appears.
- 16-column / 9-row guide remains readable and square where applicable.
- Layer stack updates when a layer is added.
- Particles render after adding a layer.
- Resize does not hide grid labels or particles.

## Phase 1B non-touch rule

Do not change these unless the current split step explicitly extracts that subsystem:

- render loop logic
- canvas scale logic
- devicePixelRatio handling
- resolution metadata/behaviour
- particle math
- particle update
- particle drawing
- brush rendering
- performance tuning

## Corrected 8-step split names

1. `v2.3.1 SPLIT-PRESETS` — extract `PRESETS_REGISTRY` and `COMPOSITES_REGISTRY`; preserve `Base Layer`, `Effect Archetype Assets`, and `Custom Effect`.
2. `v2.3.2 SPLIT-MENU` — extract top menu / Insert logic; preserve File / Edit / View / Insert / Help and defensive menu opening.
3. `v2.3.3 SPLIT-STATE` — extract composition, layer, clipboard, custom preset state, and layer operations.
4. `v2.3.4 SPLIT-IO` — extract JSON import/export, localStorage, Save New Version, and custom effect persistence.
5. `v2.3.5 SPLIT-RUNTIME` — extract `Particle`, shape definitions, colour/alpha interpolation, particle update/draw helpers.
6. `v2.3.6 SPLIT-RENDERER` — extract canvas setup, resize, grid, render/tick loop, emitter HUD, FPS, zoom/pan. Highest-risk step.
7. `v2.3.7 SPLIT-UI` — extract remaining UI sync, layer list UI, sliders, colour controls, tabs, toasts, cards, toolbar statuses.
8. `v2.3.8 SPLIT-CLEAN` — remove dead duplicate code and confirm the old monolith is not the active runtime.

## Required recurring acceptance block

Every split-step report must confirm:

1. Grid appears.
2. Grid cells are square where applicable.
3. File / Edit / View / Insert / Help open.
4. Insert contains `Base Layer`.
5. Insert contains `Effect Archetype Assets`.
6. Insert contains `Custom Effect`.
7. A Base Layer entry can add a layer.
8. An Effect Archetype Asset can load if entries exist.
9. Custom Effect shows saved entries or a clear empty state.
10. Particles render.
11. Side panel resize does not hide grid labels.
12. Bottom panel resize does not hide grid labels.
13. Browser console has no new fatal errors.

## Report format addition

Every step report must include this section:

```text
Phase 1B consistency preserved:
- File / Edit / View / Insert / Help
- Base Layer
- Effect Archetype Assets
- Custom Effect
- visible empty states
```

## Main correction to the first instruction file

The first `fast-real-split-instructions.md` is still useful, but wherever it says `Base Effect Layer`, read it as `Base Layer`. Wherever it says generic `Composite dropdown`, read it as `Effect Archetype Assets`. The split must preserve Phase 1B menu wording and acceptance checks while still doing the real module extraction.
