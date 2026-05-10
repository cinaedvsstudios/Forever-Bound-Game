# Forever Bound Game

A lightweight browser-based 2D companion game for Forever Bound.

This project is being built slowly in small phases. The first major target is to make Chronicle 0 playable from start to finish, then Quest 0.5, then Chronicle 1.

The game is designed as a scene-based browser game using PNG artwork, simple sprite animation, audio files, JSON data files, and reusable code systems.

## Current Development Goal

The current goal is not to build the full game.

The current goal is to build the foundation:

1. Load the game in a browser.
2. Show a title screen.
3. Load one scene.
4. Display Mel.
5. Move Mel around.
6. Add map travel through Stone Markers.
7. Add objects, inventory, dialogue, enemies, and simple Quest logic.
8. Assemble Chronicle 0.

Chronicle 0 is the first playable target. It acts as both the tutorial and the first proof that the game works.

## Basic Game Structure

The game is built from four main kinds of files:

### Artwork Files

These are the visual files the player sees.

Examples:

- PNG background images
- PNG character sprites
- PNG object images
- PNG UI panels
- PNG icons
- PNG effect overlays
- animated sprite sheets or short image sequences

### Audio Files

These provide sound and music.

Examples:

- music tracks
- forest ambience
- button sounds
- dialogue voice lines
- magic sounds
- enemy sounds
- Calling Fulfilled sound

### Data Files

These tell the game what exists and what should happen.

Examples:

- scene data
- Quest data
- dialogue data
- item data
- enemy data
- map data
- crafting data
- Codice data

### Code Files

These read the artwork, audio, and data files and turn them into a playable game.

The code should be reusable. It should not be rewritten every time a new forest, tunnel, room, enemy, or item is added.

## Directory Structure

```text
assets/
  characters/
    mel/
    npcs/
    foes/
    bosses/
  scenes/
    ch00/
    ch01/
  items/
    supplies/
    relics/
    ingredients/
    songspells/
    quest_relics/
  fx/
  ui/
  audio/
    music/
    ambience/
    dialogue/
    sfx/

data/
  scenes/
  quests/
  dialogue/
  items/
  codice/
  map/

docs/

src/
Folder Purposes
assets/

The assets folder contains visual and audio files used by the game.

This includes PNG images, sprites, icons, UI panels, effects, music, ambience, dialogue audio, and sound effects.

assets/characters/

Character artwork and animation frames.

mel/ is for Mel’s playable character sprites, portraits, and animation frames.
npcs/ is for non-player characters.
foes/ is for normal enemies.
bosses/ is for Bellators, Guardians, and major battle enemies.
assets/scenes/

Scene artwork.

Each Chronicle can have its own folder.

Examples:

ch00/ is for Chronicle 0 tutorial scenes.
ch01/ is for Chronicle 1 scenes.

Scene assets may include background images, foreground overlays, doors, Stone Markers, props, searchable objects, environmental layers, and other scene-specific images.

assets/items/

Item icons and item artwork.

supplies/ contains consumable items such as potions, Saltseals, Greek Fire, food, and temporary supplies.
relics/ contains reusable or important magical items.
ingredients/ contains crafting ingredients.
songspells/ contains Songspell icons or related magical assets.
quest_relics/ contains items needed for specific Callings or Quests.
assets/fx/

Reusable visual effects.

Examples:

possession eyes
corruption glow
Aetheris glow
purple Songspell effects
damage flashes
fire flicker
fog
transition blur
cooldown overlays
grayscale defeat effect
assets/ui/

User interface assets.

Examples:

HUD panels
buttons
heart icons
Silver icon
Active Item Box
Status Box
Codice panels
Kibisis Pouch panels
Officina panels
dialogue boxes
menu artwork
assets/audio/

Audio files used by the game.

music/ contains music tracks.
ambience/ contains background environmental audio.
dialogue/ contains spoken dialogue lines.
sfx/ contains sound effects.
data/

The data folder contains JSON files that tell the game what to load and what should happen.

The goal is to keep the game data-driven where possible, so new scenes, items, dialogue, enemies, and Quests can be added without rewriting the whole codebase.

data/scenes/

Scene data files.

These define:

backgrounds
walkable areas
starting positions
exits
pickups
NPCs
Foes
Stone Markers
music
ambience
scene triggers
data/quests/

Quest and Chronicle data.

These define:

Quest IDs
Chronicle IDs
Calling text
completion conditions
rewards
unlocks
progression rules
data/dialogue/

Dialogue text and dialogue line IDs.

Dialogue IDs should match audio filenames when voice audio exists.

Example dialogue IDs:

ch00_q01_capra_intro_01
ch00_q01_mel_scroll_01
ch00_q05_capra_wrong_item_01

Matching audio files would use the same names:

ch00_q01_capra_intro_01.ogg
ch00_q01_mel_scroll_01.ogg
ch00_q05_capra_wrong_item_01.ogg
data/items/

Item definitions.

These define:

item name
item category
item icon
description
whether the item is consumable
whether the item is reusable
whether the item can be used
whether the item can be thrown
whether the item is magical
whether the item is story-locked
data/codice/

Codice Cylinder entries.

These define:

prophecy text
clue updates
translation states
Chronicle entries
Quest entries
discovered lore
Runispeleus / Gaulish / English text states
data/map/

Map of Ostangavia data.

This defines:

map nodes
routes
Stone Marker connections
locked areas
hidden areas
valid travel paths
blocked routes
revealed routes
docs/

Design documentation, planning notes, build phases, production checklists, and game bible material.

This folder is for written planning, not live gameplay code.

src/

The actual game code.

Code should read from assets/ and data/ rather than hardcoding everything directly.

Development Rules

Do not build the full game at once.

Build one small working system at a time.

The first priority is Chronicle 0, not Chronicle 1.

Use placeholder assets when needed.

Do not create asset variations yet.

Do not add complex RPG systems.

Do not add branching dialogue.

Do not add complex alternate Quest solutions.

Do not add companion AI.

Do not add advanced animation.

Do not add large optional areas.

The first version should prove that the core game works.

First Version Scope

The first version should focus on:

Chronicle 0
Quest 0.5
Chronicle 1
basic movement
title screen
fixed game frame
scene loading
HUD
Stone Markers
Map of Ostangavia
Travel Mode
Scene Mode
Battle Mode
Kibisis Pouch
active item use
simple dialogue
Capra feedback
Life Force / hearts
simple Foes
basic combat
one Songspell
Codice Cylinder
Callings
scavenging
Silver rewards
basic Officina crafting
simple Jobs / Errands
Not For First Version

Do not add these during the early build unless specifically requested:

multiple solution paths
complex alternate Quest solutions
full companion AI
permanent companion party system
branching dialogue
alternate endings
advanced character animation
large asset variation sets
complex corruption simulation
large optional dungeons
advanced crafting trees
experience points
character levels
skill trees
Songspell mastery
large RPG stat systems
complex stealth systems
complex physics puzzles
multiplayer
procedural generation
open-world exploration
full real-time lighting
fully animated cutscenes

These can be considered later, after the foundation works.

Build Order

The recommended development order is:

Project shell and title screen.
Fixed game frame and HUD.
Scene loading.
Mel appears and moves.
Stone Marker and Map of Ostangavia test.
Travel Mode prototype.
Pickups and Kibisis Pouch.
Active item use and throwing.
Jump, climb, crouch, hide, and crawl.
Dialogue and Capra feedback.
Life Force and simple Foes.
Basic combat.
First Songspell.
Codice Cylinder and Calling system.
Scavenging, rewards, and Silver.
Officina and basic crafting.
Jobs / Errands.
Assemble Chronicle 0.
Assemble Quest 0.5.
Clean, test, and only then begin Chronicle 1.
Current Milestones
Milestone 1: Project Opens

The game opens in a browser and shows a title screen.

Milestone 2: First Scene Loads

The game loads one test scene with a HUD.

Milestone 3: Mel Moves

Mel appears and can move around the scene without leaving the valid area.

Milestone 4: Map Travel Works

Mel can use a Stone Marker to open the Map of Ostangavia and travel to another scene.

Milestone 5: Objects Work

Mel can pick up an item and see it in the Kibisis Pouch.

Milestone 6: Interaction Works

Mel can talk to an NPC, receive Capra feedback, and interact with scene objects.

Milestone 7: Danger Works

Mel can take damage, lose hearts, defeat a simple Foe, and reset after death.

Milestone 8: Magic Works

Mel can activate one Songspell, trigger a magical effect, and wait for cooldown.

Milestone 9: Quest Logic Works

The Codice displays the active Calling, the Calling can be completed, and the game shows Calling Fulfilled.

Milestone 10: Chronicle 0 Works

Chronicle 0 can be played from start to finish.

Codex Usage Rule

Codex should be given one small phase or one system at a time.

Bad instruction:

Build the Forever Bound game.

Good instruction:

We are in Phase 3. Add Mel movement only. Do not add enemies, inventory, dialogue, combat, crafting, or map travel yet. Use placeholder assets. Mel should move with keyboard controls and the on-screen D-pad. Keep Mel inside the scene boundaries.

Each Codex task should say:

what phase is being worked on
what system is being built
what should not be built yet
which files may be edited
how to test it
what counts as done
Example Codex Task Format
We are in Phase 2.

Task:
Create the fixed gameplay frame, basic HUD, and scene loading system.

Build only:
- fixed 16:9 gameplay frame
- black borders when screen ratio does not match
- placeholder HUD
- placeholder heart display
- placeholder Silver display
- placeholder Active Item Box
- placeholder Status Box
- one test scene loaded from data/scenes/ch00_q00_test_scene.json

Do not build:
- Mel movement
- enemies
- inventory
- dialogue
- combat
- map travel
- crafting

Done when:
The game opens in the browser, the test scene background appears, and the HUD displays placeholder values.
Phase Completion Rule

A phase is not complete when the code exists.

A phase is complete when the feature can be tested in the browser and behaves correctly.

For each phase, confirm:

it loads
it displays correctly
it responds to input
it does not break previous phases
it can be reused later
it is not hardcoded for only one scene unless temporary
it is documented enough to continue
File Naming Rules

Use lowercase filenames.

Do not use spaces in filenames.

Use descriptive names.

Recommended file naming examples:

ch00_q01_forest_path_bg.png
ch00_q01_forest_path_fg.png
ch00_q01_forest_path_scene.json
ch00_q01_capra_intro_01.ogg
ch00_q01_mel_scroll_01.ogg
ch01_q03_church_crypt_bg.png
ch01_q03_church_crypt_scene.json
mel_walk_right_01.png
mel_walk_right_02.png
npc_vitus_portrait.png
npc_vitus_mouth_overlay.png
foe_roman_guard_idle.png
fx_possession_eyes_green.png
fx_aetheris_blue_glow.png
ui_kibisis_panel.png
Placeholder Policy

Placeholders are allowed and encouraged during early production.

A scene should not be blocked just because final art is missing.

Acceptable placeholders include:

rough background
simple coloured box
temporary sprite
temporary icon
temporary sound
temporary dialogue text
simple effect shape
temporary UI panel

Placeholders should be clearly named so they are not mistaken for final assets.

Examples:

placeholder_forest_bg.png
placeholder_guard_sprite.png
placeholder_songspell_icon.png
placeholder_kibisis_panel.png
Data-Driven Design Rule

Whenever possible, the game should use data files rather than hardcoding everything.

Data files may define:

scene layouts
item properties
dialogue lines
Quest conditions
Codice entries
enemy stats
Foe tier values
map routes
Stone Marker connections
shop inventories
Errand rewards
crafting recipes
cooldowns
status effects

This makes the game easier to edit, expand, and balance without rewriting core code every time.

Example Scene Logic

A forest scene might have:

one background image
one Mel sprite
one Stone Marker image
one hollow log image
one weak Foe image
one music track
one scene data file

The scene data file tells the game:

load this forest background
place Mel at this position
place the Stone Marker here
place the hollow log here
place the Foe here
let Mel walk in this area
if Mel presses Invoke near the log, scavenge it
if Mel presses Invoke near the Stone Marker, open the map
if Mel touches the Foe, she loses one heart
if the Foe is defeated, remove it
if Mel reaches the end, load the next scene

This is why data structure matters.

The code should provide reusable behaviour. The data should describe the specific scene.

Testing Checklist

Before moving to the next phase, check:

Does the game open?
Does the scene load?
Does the HUD show?
Can Mel move?
Are boundaries working?
Do buttons respond?
Do keyboard controls respond?
Do on-screen controls respond?
Do scene transitions work?
Do items appear?
Can items be picked up?
Does the inventory update?
Does dialogue trigger?
Can dialogue be advanced?
Can dialogue be skipped line-by-line?
Does Capra feedback appear?
Do enemies damage Mel?
Can enemies be defeated?
Does Life Force update?
Does death/reset work?
Does the Codice update?
Does Calling Fulfilled appear?
Does the next step unlock?
Build Priority Summary

The early build priority is:

Make the project open.
Make the screen display correctly.
Make a scene load.
Make Mel appear.
Make Mel move.
Make the map work.
Make Travel Mode work.
Make objects and inventory work.
Make active item use work.
Make movement abilities work.
Make dialogue and Capra work.
Make damage and enemies work.
Make combat work.
Make Songspells work.
Make the Codice and Callings work.
Make scavenging and Silver work.
Make crafting work.
Make Jobs work.
Assemble Chronicle 0.
Assemble Quest 0.5.
Clean and test.
Begin Chronicle 1.

The game should only grow after the foundation works.

Chronicle 0 is the first real milestone.

Quest 0.5 is the second real milestone.

Chronicle 1 is the third real milestone.
