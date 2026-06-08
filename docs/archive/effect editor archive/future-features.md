# Effect Editor Future Features

Status: backlog / future feature notes.
Purpose: capture good ideas that should not interrupt the current render recovery and modular split work.

## Brush Sequence Animation

Idea: allow an effect layer to use a short sequence of PNG brush images instead of a single static brush.

Primary uses:

- fire tongues / flame variation
- energy balls
- magic pulses
- portals
- electric or plasma bursts
- smoke variation if used in random-frame mode

### Basic behaviour

Add support for two brush source modes:

1. `Single Brush`
   - one PNG texture is used for all particles on that layer.

2. `Brush Sequence`
   - a small ordered set of PNG textures is assigned to the layer.
   - likely sequence length: 3 to 8 images, with 5 as the normal target.

Example folder convention:

```text
brushes/fire/fire-01.png
brushes/fire/fire-02.png
brushes/fire/fire-03.png
brushes/fire/fire-04.png
brushes/fire/fire-05.png
```

### Frame selection modes

Support these modes eventually:

- `Random Frame Per Particle`
  - each particle picks one frame at spawn and keeps it.
  - cheapest option.
  - good for smoke, dust, fire variation, ash, magic motes.

- `Lifetime Cycle`
  - particle starts on frame 1 and advances through the sequence as it ages.
  - good for fire, energy pulses, magic bursts.

- `Loop`
  - particle cycles through frames repeatedly while alive.
  - good for energy balls, portals, electric fields.

- `Ping-Pong`
  - particle cycles forward then backward through the frames.
  - good for pulsing energy balls and breathing magic auras.

Optional later:

- `Random Start Frame`
  - prevents particles from animating in lockstep.

- `Frame Speed`
  - controls how quickly frames advance.

- `Blend Between Frames`
  - optional polish pass; not required for first version.
  - could be expensive, so avoid until renderer is stable.

### Suggested UI location

Place this in:

`Effect Layer Appearance -> Brush`

Suggested controls:

- Brush Source: `Single / Sequence`
- Brush Sequence selector
- Frame Mode: `Random / Lifetime / Loop / Ping-Pong`
- Frame Speed
- Random Start Frame toggle

### Runtime notes

Do not add this until after:

1. render base is restored,
2. brush alpha masking works correctly,
3. Shape / Brush / Custom modes are stable,
4. the monolith split is underway or complete.

Implementation should live in renderer/runtime modules, not in preset files.

Preset data should only store the sequence configuration, for example:

```js
visual: {
  shapeMode: 'brush',
  brushMode: 'sequence',
  brushSequence: 'fire-basic-01',
  frameMode: 'lifetime',
  frameSpeed: 1.0,
  randomStartFrame: true
}
```

## Do not do yet

Do not start this while the current bug exists where the grid renders but effect particles do not. This belongs after the render recovery and module split plan.
