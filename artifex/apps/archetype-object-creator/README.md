# Archetype Object Creator

## Purpose

The Archetype Object Creator is the Artifex module for creating reusable non-FX Object Archetypes.

It is not the same thing as the Asset Library. The Asset Library stores raw files and file metadata. The Archetype Object Creator turns those assets into reusable game things with properties, animation sets, behaviours, tags, defaults, and runtime meaning.

It is also not the FX Editor. The FX Editor creates FX Archetypes such as fog, magic glows, particles, audio-reactive vignettes, and video/plate effects. This module creates Object Archetypes such as characters, animals, NPCs, enemies, props, doors, pickups, markers, and interactable objects.

## Created Data

This module should create and edit Object Archetypes that are stored in the active project's object/archetype library, for example:

```text
projects/<project-id>/library/objects.json
```

A Scene Editor should place instances of these Object Archetypes into scenes instead of placing only loose static image files.

## Example Object Archetype Types

```text
Character
NPC
Animal
Enemy
Prop
Door / Exit
Pickup
Marker
Interactable Object
Searchable Cache
UI-linked Object
```

## Character / Creature Animation Role

For characters, animals, and enemies, this module should eventually define:

```text
name
category
tags
default size
visual box
hitbox / collision box
movement rules
facing directions
idle / walk / run / jump / crouch / squat / attack / talk / death animation states
portrait set
default audio hooks
interaction behaviour
scene placement defaults
runtime flags or behaviours
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

## Folder Status

This folder is currently a planning/module placeholder. It exists so the Artifex app hierarchy has a dedicated place for the future Object Archetype creation tool.
