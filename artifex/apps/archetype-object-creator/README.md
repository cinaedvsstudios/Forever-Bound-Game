# Archetype Object Creator

## Purpose

The Archetype Object Creator is the Artifex module for creating reusable non-FX Object Archetypes.

It is not the same thing as the Asset Library. The Asset Library stores raw files and file metadata. The Archetype Object Creator turns those assets into reusable game things with properties, animation sets, behaviours, tags, defaults, collision boxes, interaction zones, and runtime meaning.

It is also not the FX Editor. The FX Editor creates FX Archetypes such as fog, magic glows, particles, audio-reactive vignettes, and video/plate effects. This module creates Object Archetypes such as characters, animals, NPCs, enemies, props, doors, pickups, markers, searchable caches, throwable objects, hazards, and interactable objects.

## Current Build

The current first tool build lives here:

```text
artifex/apps/archetype-object-creator/index.html
artifex/apps/archetype-object-creator/v1/styles.css
artifex/apps/archetype-object-creator/v1/src/
```

The first version deliberately keeps the main editor shell architecture from the Effect Editor: top menu bar, left editor panel, central preview workspace, bottom action panel, local browser save, JSON import/export, templates, validation, and canvas snapshot.

The effect-specific systems have been removed. There are no particle engines, emitter dynamics, colour stops, blend modes, glow controls, FX layers, or effect archetype presets.

## Created Data

This module creates and edits Object Archetypes that are intended to be stored in the active project's object/archetype library, for example:

```text
projects/<project-id>/library/objects.json
```

A Scene Editor should place instances of these Object Archetypes into scenes instead of placing only loose static image files.

## Core Rule

Talk is not a gameplay sprite action.

Dialogue/talking is handled by a separate close-up Dialogue Portrait system. Gameplay sprite sheets only need full-body gameplay actions such as idle, walk, turn, pick up, hold, throw, use item, sing/cast, take damage, death, enter door, or exit door.

If a visible full-body dialogue moment is needed, use gameplay actions such as gesture, give item, receive item, or interact/assist. Do not create a tiny body-sprite mouth-loop action.

## Object Archetype Types

```text
Character / Person
NPC
Enemy / Foe
Creature / Animal
Boss / Bellator
Prop
Door / Exit
Pickup
Marker / Stone Marker
Interactable Object
Searchable Cache
Throwable Object
Hazard
```

## Gameplay Sprite Archetype Categories

```text
Static Background Person
Basic NPC
Moving NPC
Vendor / Job NPC
Major NPC / Companion
Player / Mel-Type
Human Foe / Guard / Bandit
Possessed NPC / Thrall
Caster / Ritualist
Creature Foe
Boss / Bellator
Static Prop
Door / Exit
Pickup Item
Searchable Cache
Throwable Object
Stone Marker / Map Marker
Hazard
```

## Gameplay Sprite Actions

Gameplay sprite actions are full-body actions used in scenes, travel, battle, and interaction.

```text
idle
turn / face direction
walk
patrol / walk
move
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
locked
collect
searched / opened
activate
trigger
reset
land / break
possession overlay
```

## Dialogue Portrait Actions

Dialogue portraits are separate close-up animation sets.

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

## Example Data Created By The Tool

Each Object Archetype may define:

```text
schema version
archetype ID
name
category
role/template
subtype
tags
linked gameplay sprite asset ID
linked dialogue portrait asset ID
default width and height
default scene layer
anchor point
collision type
hitbox
interaction radius
runtime behaviour flags
gameplay sprite actions
portrait actions
placement defaults
export target
notes
```

## Relationship To Other Modules

```text
Asset Library = stores raw files and asset groups.
Archetype Object Creator = creates reusable non-FX Object Archetypes.
Object/Archetype Library = stores the created Object Archetypes.
Scene Editor = places Object Instances into scenes.
FX Editor = creates FX Archetypes, not Object Archetypes.
Build Game = audits, resolves, and compiles archetype references into runtime data.
```

## First-Version Scope

The first version is intentionally a clean, practical shell.

It should support:

```text
choosing an archetype template
editing object identity
editing asset IDs
editing size and scene-layer defaults
editing collision and interaction data
selecting gameplay sprite actions
selecting separate dialogue portrait actions
setting runtime flags
previewing bounds on canvas
validating common mistakes
saving locally in browser
importing JSON
exporting JSON
capturing a preview snapshot
```

It should not yet attempt to:

```text
write directly to GitHub
edit final project object libraries automatically
parse sprite sheets
cut animation frames
connect to the Scene Editor live
create FX archetypes
manage particle systems
replace the Asset Library
```
