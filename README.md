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
