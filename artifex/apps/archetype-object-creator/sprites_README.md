# Sprites

This folder is a placeholder workspace for sprite-related planning and future helper code inside the Archetype Object Creator.

## Purpose

The Archetype Object Creator will use sprites when building non-FX Object Archetypes such as characters, animals, enemies, NPCs, and animated props.

This folder is not intended to store final project sprite assets directly. Final project assets should live in the active project's asset/library folders. This folder is for the module's own sprite tools, notes, helpers, templates, and test material.

## Important Rule

Talk is not a gameplay sprite action.

Dialogue/talking belongs to the separate close-up Dialogue Portrait system. Full-body gameplay sprite sheets should not waste rows on tiny mouth movement that will not be readable in scene gameplay.

## What belongs here later

```text
sprite-sheet parsing helpers
animation-state mapping helpers
preview/test sprite sheets
sprite metadata examples
character animation templates
movement/action state templates
dialogue portrait mapping examples
```

## Related systems

```text
Asset Library = stores raw sprite files and sprite sheet metadata.
Archetype Object Creator = maps those sprites into Object Archetype animation states.
Dialogue Portrait system = handles close-up speech, mouth loops, blink, and expressions.
Scene Editor = places instances of those Object Archetypes.
FX Editor = handles FX sprite sheets such as explosions, sparks, fog, magic bursts, and other visual effects.
```

## Gameplay sprite action examples

```text
idle
turn / face direction
walk
jump
crouch / hide
pick up
hold / carry
throw
use item
gesture
give item
receive item
interact / assist
sing / magic cast
cast / ritual
channel
attack
special attack
take damage
stunned
phase change
death / disappear
enter door
exit door
open
close
collect
activate
```

## Dialogue portrait action examples

```text
neutral
mouth loop
blink
happy
angry
worried
shocked
sad
green eye overlay
custom expression
```
