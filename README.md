# Forever Bound Game

A lightweight browser-based 2D companion game for Forever Bound.

## Project Goal

This game is a small scene-based adventure game built for browser play. It uses a fixed 16:9 game frame, simple controls, PNG assets, audio files, and JSON data files.

The game should be built slowly in reusable phases.

## Technical Direction

- Vite + TypeScript
- HTML Canvas for gameplay
- HTML/CSS overlays for menus where useful
- Fixed 16:9 gameplay frame
- Black bars instead of stretched display
- Data-driven scenes, quests, dialogue, items, enemies, and map data
- Placeholder assets are allowed during early development

## First Build Target

The first build target is not Chronicle 1.

Build order:

1. Project shell and title flow
2. Display frame, HUD, and basic scene loading
3. Mel appears and moves
4. Map of Ostangavia and Stone Marker test
5. Travel Mode prototype
6. Basic objects, pickups, and inventory
7. Active item and throwing system
8. Movement abilities
9. Dialogue and Capra feedback
10. Life Force, damage, and simple Foes
11. Basic combat
12. Songspell and magic prototype
13. Codice Cylinder and Calling system
14. Scavenging, rewards, and Silver
15. Officina, ingredients, and basic crafting
16. Jobs / Errands prototype
17. Chronicle 0 assembly
18. Quest 0.5 assembly
19. Polish, testing, and cleanup
20. Begin Chronicle 1

## Scope Rules

Do not build the full game at once.

Do not add:
- branching dialogue
- multiple solution paths
- full companion AI
- advanced animation
- large crafting trees
- RPG stats
- XP
- open-world exploration
- procedural generation
- multiplayer
- complex physics

Build one small working system at a time.

## Codex Instruction Rule

Codex should only be given one phase or one task at a time.

Each Codex task must say:
- what phase this is
- what system is being built
- what must not be built yet
- which files may be edited
- how to test it
- what counts as done
