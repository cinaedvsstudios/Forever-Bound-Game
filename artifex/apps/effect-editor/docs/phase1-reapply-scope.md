# Effect Editor Phase 1 Reapply Scope

Branch: `effect-editor-reapply-phase1`
Base branch: `effect-editor-render-restore`

Purpose: rebuild forward from the stable render baseline without reintroducing the scale/resolution bug.

## Rule for this branch

Do not change particle scale, design resolution, canvas coordinate conversion, brush rendering, or particle update math in this phase.

This phase is only allowed to reapply safe UI shell changes that should not affect the render loop.

## Phase 1 allowed changes

### Header branding

Bring back:

- `../../artifexlogo.png`
- `../../artifextitle.png`
- `./charcolbg.jpg` as header texture
- vertical divider after the title/logo block
- menu group shifted beside the title area
- version badge updated to `v2.3.1 RESTORE`

### Top menu labels only

Keep the old working dropdown behaviour unless it is proven broken.

Allowed wording changes:

- File stays File
- Edit stays Edit
- View stays View
- Insert stays Insert
- Help stays Help

Do not rewrite the menu system in this phase.

### Insert menu wording only

Rename categories without changing insert mechanics:

- `Base Effect Layer` -> `Base Layer`
- `Composite Effect` -> `Effect Archetype Assets`
- `Custom Effect` should remain available for now until the library browser is reintroduced cleanly.

Do not replace the Insert menu with a new library modal in this phase.

### Preset files

Preset files remain data-only.

Allowed:

- keep `src/presets/base-effects.js`
- keep `src/presets/composite-effects.js`

Not allowed:

- DOM patching in preset files
- render patching in preset files
- hidden repair loaders

## Acceptance test after phase 1

1. Grid appears.
2. Insert -> Base Layer -> any simple base particle creates visible particles.
3. Resize the side panel.
4. Resize the bottom panel.
5. Grid labels remain visible.
6. Particles remain visible.
7. Menus still open.

## Stop condition

If particles vanish again, stop immediately and compare only the latest phase 1 change against the render-restore baseline.

Do not proceed to card rework, local files, thumbnail flow, or resolution presets until this phase passes.
