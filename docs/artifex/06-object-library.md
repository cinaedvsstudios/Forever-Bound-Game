# Advanced Object Library

## Name Status

Advanced Object Library is a placeholder name and is not locked yet.

Possible replacement names:

- Object Library
- Archetype Library
- Blueprint Library
- Prefab Library
- Object Forge
- Component Library
- Game Object Library
- Object Workshop

## Purpose

The Advanced Object Library defines reusable game things and their behaviours.

It is separate from the basic Asset Library inside the Scene Editor.

The Scene Editor’s Asset Library is for choosing and placing files.

The Advanced Object Library is for defining what a thing is, how it behaves, and how it can be reused.

## What It Manages

The Advanced Object Library should manage:

- characters
- NPCs
- enemies
- villains
- items
- keys
- pickups
- props
- markers
- doors
- interactable objects
- reusable object templates
- object properties
- object behaviours
- object metadata

## Archetype

Archetype is not locked yet.

Possible related terms:

- prefab
- blueprint
- archetype

An Archetype is a reusable definition of a game thing.

Examples:

- Bronze Key
- Locked Door
- Forest Wolf
- Villain
- Merchant NPC
- Save Marker
- Health Potion

Archetype is elegant, but Blueprint may be clearer for beginners.

## Instance

An Instance is a specific placed copy of an Archetype.

Example: Bronze Key is the Archetype. The actual key placed on the table in the forest hut is an Instance.

## Why This Module Matters

The creator should not need to redefine the same object every time it appears.

Examples:

- define a character once, then place that character in multiple scenes
- define a key once, then use it in different locks or quests
- define an enemy type once, then place copies in different scenes
- define a marker type once, then place markers around the game
- define a reusable object once, then duplicate it wherever needed

## Relationship To Scene Editor

The Scene Editor places objects visually.

The Advanced Object Library defines the reusable object data behind those placed objects.

The Scene Editor may place an image of a key.

The Advanced Object Library defines that key as an item with a name, icon, behaviour, quest usage, unlock logic, and reusable identity.

## Relationship To Quest Builder

The Quest Builder should be able to reference objects from the Advanced Object Library.

For example:

- has item: Bronze Key
- defeat enemy: Forest Wolf
- talk to character: Merchant NPC
- unlock object: Locked Door
- activate marker: Save Marker

## Object Categories

Possible object categories:

- Character Archetype
- NPC Archetype
- Enemy Archetype
- Item Archetype
- Door Archetype
- Marker Archetype
- Prop Archetype
- Pickup Archetype
- Quest Object Archetype

## Placeholder / Dummy

Dummy is not locked yet and may be better replaced with Placeholder.

A Placeholder is a temporary asset, object, scene, or setting used until the creator replaces it with final content.
