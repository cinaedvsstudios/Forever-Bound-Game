# 19. Artifex Adventures Template

## Purpose

This document is the working design file for **Artifex Adventures**, the starter/template game for Artifex.

Artifex Adventures is not Forever Bound. It is a tiny working example game that demonstrates the main Artifex systems once, so a creator can duplicate, replace, rename, connect, and expand working examples instead of starting from nothing.

This file should be updated as the template story, progress structure, object list, quest logic, scene list, and JSON/data needs are developed.

## Template Location

```text
artifex/templates/artifex-adventures/
```

The normal reusable JSON templates live in:

```text
artifex/templates/
```

Those generic templates are starter files for individual screens/scenes. Artifex Adventures should become the small complete starter project built from example screens, scenes, routes, objects, quests, and project data.

## Source Documents

The current design should follow these docs:

```text
docs/artifex/00-index.md
docs/artifex/01-core-vision.md
docs/artifex/02-module-architecture.md
docs/artifex/03-project-editor-flatplan.md
docs/artifex/04-scene-editor.md
docs/artifex/05-creation-guide.md
docs/artifex/06-object-library.md
docs/artifex/07-quest-builder.md
docs/artifex/08-playtest-and-build.md
docs/artifex/09-terminology.md
docs/artifex/15-template-system.md
```

## Core Design Rule

Keep Artifex Adventures small.

It should demonstrate structure, not become a full narrative game. The goal is one clean example of each major system:

- one hero
- one villain
- one title screen
- one map or structure view
- one Depot
- one Junction
- one Waypoint / Marker
- one playable Scene
- one travel Route
- one dialogue example
- one item
- one key / gate example
- one enemy
- one main Quest
- one Side Quest / Branch
- one reward
- one unlock
- one ending / victory Screen
- one Playtest path from start to ending
- one Build Game/export-ready starter project

## Working Template Story

### Working Title

**Artifex Adventures: The Lantern Key**

### Story Premise

A young explorer named **Ari** arrives at the quiet workshop town of **Brindlewick Depot** to repair an old map machine called the **Route Lantern**. The lantern can reveal hidden paths, but its key has been stolen by a mischievous shadow creature called **Murk**.

To finish the tiny adventure, Ari must speak to the town Guide, find the Lantern Key, unlock the old gate, travel through a short forest Route, defeat or bypass Murk, and reach the Beacon Platform.

This story is intentionally simple because it exists to prove the editor systems.

### Tone

Light fantasy, friendly, clear, and reusable. It should feel like a generic starter adventure, not a Forever Bound episode.

## Characters

### Hero Archetype

```text
id: hero_ari
name: Ari
category: Character Archetype
role: playable hero
```

Ari is the default player character. Ari demonstrates player start position, movement, interaction, item pickup, dialogue participation, and Quest completion.

### Guide NPC Archetype

```text
id: npc_mira_guide
name: Mira
category: NPC Archetype
role: helper / tutorial guide
```

Mira introduces the main Quest, explains the first Marker, and gives the player a simple objective.

### Villain / Enemy Archetype

```text
id: enemy_murk
name: Murk
category: Enemy Archetype / Villain Archetype
role: tiny antagonist
```

Murk stole the Lantern Key and blocks the final Route. Murk demonstrates enemy placement, simple battle logic, defeat flag, and ending unlock.

## Core Objects

### Lantern Key

```text
id: item_lantern_key
name: Lantern Key
category: Item Archetype / Key Archetype
```

Demonstrates item collection, inventory reference, quest condition, and route unlock.

### Old Gate

```text
id: door_old_gate
name: Old Gate
category: Door Archetype
condition: has_item:item_lantern_key
```

Demonstrates a locked Route or blocked Station that opens after a condition is met.

### Route Lantern Marker

```text
id: marker_route_lantern
name: Route Lantern Marker
category: Marker Archetype
```

Demonstrates Waypoint / Marker interaction, map access, travel trigger, and route selection.

### Supply Crate

```text
id: prop_supply_crate
name: Supply Crate
category: Prop Archetype / Pickup container
```

Demonstrates searchable or interactable props and optional reward placement.

### Bright Berry

```text
id: item_bright_berry
name: Bright Berry
category: Pickup / Reward Item
```

Demonstrates Side Quest reward collection and simple optional object logic.

## Flatplan Draft

The Flatplan should look like a tiny train-map structure.

```text
Title Screen
  |
  v
Brindlewick Depot
  |
  v
Guide Waypoint / Route Lantern Marker
  |
  v
Old Gate Junction
  |\
  | \__ Optional Branch: Berry Nook
  |
  v
Forest Route
  |
  v
Murk Clearing
  |
  v
Beacon Platform Ending
```

## Station / Node Draft

### Screen: Title Screen

```text
id: screen_title
kind: Screen
function: Start Game button loads Brindlewick Depot
```

Demonstrates Scene Editor screen layout and Project Editor start screen assignment.

### Depot: Brindlewick Depot

```text
id: station_brindlewick_depot
kind: Depot
linkedSceneId: scene_brindlewick_depot
```

The central safe location. Connects to the guide, old gate, and optional branch.

### Waypoint / Marker: Route Lantern Marker

```text
id: waypoint_route_lantern
kind: Waypoint / Marker
linkedObjectId: marker_route_lantern
```

Demonstrates placed Marker logic and map/travel triggering.

### Junction: Old Gate Junction

```text
id: junction_old_gate
kind: Junction
linkedObjectId: door_old_gate
```

Splits the main route and optional branch. The main route is locked until Ari has the Lantern Key.

### Branch: Berry Nook

```text
id: branch_berry_nook
kind: Branch / Side Quest Station
linkedSceneId: scene_berry_nook
```

Optional tiny side area. Demonstrates Branch logic, optional reward, and non-main progression.

### Playable Scene: Forest Route

```text
id: station_forest_route
kind: Station
linkedSceneId: scene_forest_route
```

Demonstrates Travel Mode, route movement, endpoint transition, and optional pickup.

### Battle / Encounter Scene: Murk Clearing

```text
id: station_murk_clearing
kind: Station
linkedSceneId: scene_murk_clearing
```

Demonstrates enemy encounter, defeat flag, and unlock to ending.

### Screen: Beacon Platform Ending

```text
id: screen_beacon_platform_ending
kind: Screen
function: victory / ending screen
```

Demonstrates completed game endpoint.

## Route Draft

```text
route_title_to_depot
source: screen_title
target: station_brindlewick_depot
type: open
condition: Start Game selected
```

```text
route_depot_to_marker
source: station_brindlewick_depot
target: waypoint_route_lantern
type: open
```

```text
route_marker_to_gate
source: waypoint_route_lantern
target: junction_old_gate
type: open
```

```text
route_gate_to_forest
source: junction_old_gate
target: station_forest_route
type: item-gated
condition: has_item:item_lantern_key
```

```text
route_gate_to_berry_branch
source: junction_old_gate
target: branch_berry_nook
type: optional
condition: side_quest_started:q_side_bright_berry
```

```text
route_forest_to_murk
source: station_forest_route
target: station_murk_clearing
type: open
```

```text
route_murk_to_ending
source: station_murk_clearing
target: screen_beacon_platform_ending
type: quest-gated
condition: enemy_defeated:enemy_murk
```

## Main Quest Draft

```text
id: q_main_lantern_key
name: The Lantern Key
kind: Quest
objective: Find the Lantern Key, open the Old Gate, and reach the Beacon Platform.
startCondition: game_started
completionCondition: flag_true:beacon_reached
```

### Main Quest Steps

1. Start Game from Title Screen.
2. Arrive at Brindlewick Depot.
3. Speak to Mira.
4. Receive objective: find the Lantern Key.
5. Pick up Lantern Key.
6. Use Route Lantern Marker.
7. Open Old Gate Junction.
8. Travel through Forest Route.
9. Defeat Murk or complete the Murk encounter.
10. Reach Beacon Platform Ending.

### Main Quest Flags

```text
intro_seen
mira_spoken_to
main_quest_started
lantern_key_collected
old_gate_opened
forest_route_completed
murk_defeated
beacon_reached
q_main_lantern_key_complete
```

### Main Quest Rewards

```text
reward: ending_access
unlock: screen_beacon_platform_ending
unlock: template_complete_badge
```

## Side Quest / Branch Draft

```text
id: q_side_bright_berry
name: The Bright Berry
kind: Side Quest / Branch
objective: Find a Bright Berry for Mira.
startCondition: flag_true:mira_spoken_to
completionCondition: has_item:item_bright_berry AND returned_to:npc_mira_guide
```

### Side Quest Purpose

This demonstrates optional Branch logic without changing the main ending.

### Side Quest Steps

1. Mira mentions a Bright Berry near the Old Gate.
2. Optional Branch appears from Old Gate Junction.
3. Ari visits Berry Nook.
4. Ari picks up Bright Berry.
5. Ari returns to Mira.
6. Mira gives a small reward.

### Side Quest Flags

```text
side_quest_started_bright_berry
berry_nook_unlocked
bright_berry_collected
bright_berry_returned
q_side_bright_berry_complete
```

### Side Quest Rewards

```text
reward: small_health_boost
reward: guide_lore_note
unlock: optional_completion_marker
```

## Required Scene / Screen JSON Draft

The Artifex Adventures folder will eventually need example project data such as:

```text
project.json
logic.json
layout.json
catalog.json
objects.json
quests.json
flags.json
conditions.json
rewards.json
screens/title_screen.json
screens/ending_screen.json
scenes/brindlewick_depot.json
scenes/berry_nook.json
scenes/forest_route.json
scenes/murk_clearing.json
dialogue/mira_intro_dialogue.json
map/player_map_projection.json
```

These should be based on the generic templates in:

```text
artifex/templates/
```

## Module Demonstration Checklist

### Runtime Engine

Artifex Adventures demonstrates the Runtime Engine by being playable from title screen to ending through project data.

### Scene Editor

Demonstrated by title screen, Depot scene, forest travel scene, battle/encounter scene, optional branch scene, and ending screen.

### Project Editor

Demonstrated by Flatplan structure, Stations, Depot, Junction, Waypoint, Routes, locked route, optional Branch, and ending connection.

### Creation Guide

Demonstrated by a template completion path: replace title, define hero, connect route, create quest, place object, test path, build game.

### Object Library

Demonstrated by reusable Archetypes and placed Instances: hero, NPC, villain/enemy, item, key, door, marker, prop, reward pickup.

### Quest Builder

Demonstrated by one main Quest, one Side Quest / Branch, flags, conditions, rewards, unlocks, and next-step logic.

### Playtest

Demonstrated by play from start, play from Depot, test selected Route, test main Quest, test Side Quest, and fake flag/item tests.

### Build Game

Demonstrated by a tiny export-ready browser game with valid project files and a complete path from start to ending.

## Open Design Questions

1. Should the default hero name stay Ari, or should it be even more generic like Hero?
2. Should the guide NPC be named Mira, Guide, or Mentor?
3. Should Murk be a villain, enemy, or both for template purposes?
4. Should the template support combat defeat, non-combat bypass, or only one simple defeat condition?
5. Should the optional Branch reward be an item, lore note, health boost, or route shortcut?
6. Should the template JSON be split into many small files or kept as a few easy starter files first?

## Current Progress Log

### 2026-05-22

- Created first working design document for Artifex Adventures.
- Established that the template is separate from Forever Bound.
- Set initial tiny story premise: Ari, Mira, Murk, Lantern Key, Old Gate, Forest Route, Beacon Platform.
- Drafted main Flatplan structure with Depot, Junction, Waypoint, Branch, Route, and Ending.
- Drafted one main Quest and one Side Quest / Branch.
- Drafted first Object Library Archetype list.
- Added initial scene/screen/data needs list.
