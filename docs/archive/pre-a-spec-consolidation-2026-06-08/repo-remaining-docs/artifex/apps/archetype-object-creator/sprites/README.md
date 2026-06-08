# Sprites

This folder is a placeholder workspace for sprite-related planning and future helper code inside the Archetype Object Creator.

## Purpose

The Archetype Object Creator will use sprites when building non-FX Object Archetypes such as characters, animals, enemies, NPCs, and animated props.

This folder is not intended to store final project sprite assets directly. Final project assets should live in the active project's asset/library folders. This folder is for the module's own sprite tools, notes, helpers, templates, and test material.

## What belongs here later

```text
sprite-sheet parsing helpers
animation-state mapping helpers
preview/test sprite sheets
sprite metadata examples
character animation templates
movement/action state templates
```

## Related systems

```text
Asset Library = stores raw sprite files and sprite sheet metadata.
Archetype Object Creator = maps those sprites into Object Archetype animation states.
Scene Editor = places instances of those Object Archetypes.
FX Editor = handles FX sprite sheets such as explosions, sparks, fog, magic bursts, and other visual effects.
```

## Example object animation states

```text
idle
walk
run
jump
crouch
squat
talk
attack
hurt
death
special
```
