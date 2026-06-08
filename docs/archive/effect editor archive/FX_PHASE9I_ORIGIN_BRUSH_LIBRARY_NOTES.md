# FX Editor Phase 9I Notes

## Main changes

- Added emitter axis rotation under the X/Y emitter controls.
- Added Set Origin: click the button, then click the preview to place the emitter.
- Added Point Target: click the button, then click the preview to aim the active layer at that target.
- Added Reverse checkbox next to Point Target for trail-style effects where the visual front/tail orientation needs to flip 180 degrees.
- Editor remembers expanded/collapsed cards, accordion states, sidebar width, and lower panel height in local storage.
- Added File > Save to Local Storage.
- Added File > View Local Files with checkbox selection and multi-download.
- Save Archetype Version now requires a thumbnail unless Emergency Backup is used.
- Replaced the old Preset Archetypes dropdown with Effect Archetype Assets, which opens a thumbnail library window.
- Effect Archetype Assets can either Open an archetype or Add its layers into the current workspace.
- Shape Mode is now Shape / Brush / Custom.
- Added a built-in Brush picker for PNG brush assets.
- Added brush contrast and black cutoff controls for removing boxed PNG backgrounds.
- Fixed brush tinting so the canvas background/grid is not used as the tint mask.

## Brush rendering fix

The previous brush pass tinted the draw rectangle against the whole canvas destination. Because the grid/background already existed beneath the sprite, browser compositing treated the entire rectangular sprite area as valid destination pixels. That caused coloured blocks.

This pass tints brush sprites in an isolated offscreen canvas before drawing them into the main preview. The brush alpha is generated from brightness, then the tinted sprite is drawn back as a proper masked image.

## Notes

Brush PNGs still need to exist in:

`artifex/apps/effect-editor/brushes/`

The editor expects paths like:

`./brushes/Fog001.png`
`./brushes/Line01.png`
`./brushes/Particle02.png`
`./brushes/Thunder10.png`
