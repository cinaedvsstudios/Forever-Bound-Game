# Artifex Quest Builder

## Purpose

Quest Builder is the Artifex module for assembling playable Quest flow from scenes, placed archetype objects, dialogue, Capra feedback, Codice updates, UI overlays, triggers, conditions, rewards, route unlocks, and completion flags.

It does not draw scenes. The Scene Editor owns physical scene layout. Quest Builder gives scene objects meaning inside a specific Quest.

## Accent

Quest Builder uses the green Artifex accent:

```text
#3eb489
```

Green is reserved here for progression, assembly, Calling logic, and Quest flow.

## Current V1 Scaffold

The first scaffold includes:

- `index.html` entry point
- `v1/styles.css` green Artifex shell
- `v1/src/module-config.js` module config
- `v1/src/module-state.js` Quest JSON state model
- `v1/src/module-app.js` UI wiring
- `v1/src/module-io.js` import/export helpers
- `v1/src/module-renderer.js` canvas flow preview

## Current Working Loop

The V1 scaffold can:

1. create a Quest file
2. add a Quest
3. edit Quest metadata
4. add/edit/delete Quest blocks
5. preview the Quest block flow visually
6. show live JSON preview
7. import/export JSON

## Locked Boundary

Scene Editor = where things are.

Archetype Object Creator = what normal things are.

Effects Editor = what visual / magical effects are.

Quest Builder = what those things do in this Quest.

Project Manager = how all parts connect into the full game.
