# Phase 1B vs Real Split Consistency Check

## Purpose

This document compares the original Phase 1B Insert-menu fix instructions/results with the newer Fast Real Split instructions, then defines the wording and behaviour that must stay consistent while the Effect Editor is split into modules.

## Original Phase 1B intent

Phase 1B was not a feature expansion. It was a focused recovery pass after render was restored.

The original fix scope was:

- Fix top menu / Insert menu population.
- Keep the working render path stable.
- Preserve File / Edit / View / Insert / Help.
- Preserve Insert sections:
  - `Base Layer`
  - `Effect Archetype Assets`
  - `Custom Effect`
- Populate `Base Layer` from the real base preset registry.
- Populate `Effect Archetype Assets` from the real composite/archetype registry.
- Populate `Custom Effect` from local saved custom effects.
- Provide visible empty states instead of silent blank menus.
- Keep particles rendering.
- Keep layer stack updates working.
- Keep side panel and bottom panel resizing from breaking the grid/labels/render.

## Original Phase 1B non-touch rule

The Phase 1B rule was explicit: do not touch these unless a later dedicated step says so.

- render loop logic
- canvas scale logic
- devicePixelRatio handling
- resolution metadata
- particle math
- particle update
- particle drawing
- brush rendering
- performance tuning

The square grid adjustment was only allowed to keep the visible 16-column / 9-row guide square and readable.

## Inconsistencies found in `fast-real-split-instructions.md`

The first version of the real split instructions was directionally correct but inconsistent with Phase 1B in several places:

1. It called the Insert section `Base Effect Layer`, but Phase 1B uses `Base Layer`.
2. It referred to a generic `Composite dropdown`, but Phase 1B uses `Effect Archetype Assets`.
3. It listed `effect-editor-reapply-phase1b` only as broken/unreliable, but Phase 1B is still a useful UI terminology and acceptance-test reference. It should not be used as the render source, but its menu labels and acceptance checks should be preserved.
4. It did not clearly say that File / Edit / View / Insert / Help must remain in place through the split.
5. It did not explicitly carry forward the `Base Layer` / `Effect Archetype Assets` / `Custom Effect` wording into every affected split step.
6. It did not make the Phase 1B acceptance checks mandatory for every split stage that touches menus, registries, UI, or render.

## Consistency corrections now required

The real split instructions must be read with these corrections:

- Source of truth for working render: `fb-effect-base`.
- Source of truth for menu wording and Insert acceptance checks: Phase 1B docs and Phase 1B UI.
- Do not treat Phase 1B as the render base unless separately verified.
- Do not discard Phase 1B menu terminology.
- Keep the top menus as `File / Edit / View / Insert / Help`.
- Keep Insert sections as `Base Layer`, `Effect Archetype Assets`, and `Custom Effect`.
- Any extracted menu module must preserve `data-menu-id`, `toggleTopMenu`, and defensive dropdown behaviour unless replaced by an equivalent tested system.
- Any split step that touches menus must prove File / Edit / View / Insert / Help still open.
- Any split step that touches presets/composites must prove Base Layer and Effect Archetype Assets still populate from real registries.
- Any split step that touches renderer/canvas must prove the 16-column / 9-row grid appears with square cells and labels remain visible after resizing.

## Corrected Step 1 wording

Step 1 should say:

- Extract `PRESETS_REGISTRY` and `COMPOSITES_REGISTRY`.
- Preserve Insert wording exactly:
  - `Base Layer`
  - `Effect Archetype Assets`
  - `Custom Effect`
- Test that `Base Layer` entries populate.
- Test that `Effect Archetype Assets` entries populate, or show a clear fallback if none exist.
- Test that `Custom Effect` entries populate from local saved effects, or show a clear empty state.

## Corrected Step 2 wording

Step 2 should say:

- Extract menu / Insert logic without changing visible top menu structure.
- Preserve File / Edit / View / Insert / Help.
- Preserve `data-menu-id` / defensive top-menu opening behaviour unless there is a tested direct replacement.
- Preserve the Phase 1B section labels and empty-state behaviour.

## Required recurring acceptance block

For every split step from now on, the report must include whether these still pass:

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

## Bottom line

The real split is still the priority. The consistency rule is: split the monolith, but preserve the Phase 1B menu structure, wording, acceptance tests, and non-touch render restrictions while doing it.
