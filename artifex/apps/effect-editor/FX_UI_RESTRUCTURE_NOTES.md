# FX Editor Phase 9B - UI Terminology and Card Layout Cleanup

## Purpose

This pass cleans up the Effect Editor UI language and panel grouping so it matches the Artifex archetype terminology.

## Changed

- Header navigation is now left-aligned beside the Artifex logo/title.
- A vertical divider now separates the logo/title block from the menu buttons.
- Main menu labels now use clearer production language:
  - Archetype
  - Layer
  - Preview
  - Add
  - Help
- The previous left-side control pile has been reduced into three logical cards:
  - Effect Archetype
  - Effect Layer Appearance
  - Effect Layer Dynamics

## Effect Archetype

This replaces the old "Composite Effect" card language. It is for the reusable saved FX asset.

## Effect Layer Appearance

This combines the old "Active Layer Settings" and "Visuals" controls. It contains layer identity, engine/type, shape/custom texture controls, size, colours, glow, blur, edge softness, and blending.

## Effect Layer Dynamics

This combines the old Emitter, Motion/Dynamics, and Timing controls. It contains emitter position/rate/width, speed, direction, spread, gravity, friction, vortex/orbit, and lifespan.

## Not changed yet

This pass does not yet add the built-in brush picker. The next pass should add:
- Particle Source: Shape / Brush / Custom PNG
- built-in brush registry pointing at the brushes folder
- repaired presets using brush PNGs instead of hard shapes


## Menu label correction

The first UI restructure renamed the main menu buttons too aggressively. The top menu has been restored to the expected application language:

- File
- Edit
- View
- Insert
- Help

The menu remains left-aligned after the Artifex logo/title divider. The internal dropdown wording can still use Artifex terminology such as Effect Archetype and Effect Layer, but the visible top-level menu labels should remain conventional so users do not lose File/Edit muscle memory.
