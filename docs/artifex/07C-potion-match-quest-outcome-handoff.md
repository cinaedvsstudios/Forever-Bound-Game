# Potion Match Quest Outcome Handoff

## Purpose

This note records the intended handoff between **Puzzle Creator** and **Quest Builder** for the Potion Match / Item Order Puzzle module.

Potion Match can be used in two ways:

1. **Challenge Potion Puzzle** — a scene or quest puzzle where the player must choose ingredients in the correct order.
2. **Crafting Skill** — a reusable crafting interface where the available ingredients come from the character inventory and the completed recipe creates a potion, spell, tool or ability item.

In both cases, Puzzle Creator owns the internal puzzle/crafting interaction. Quest Builder owns the story and progression consequences.

## Ownership Boundary

Puzzle Creator owns the reusable puzzle definition:

- challenge/crafting mode;
- recipe order and decoy ingredients;
- internal success/failure evaluation;
- local quality/mistake/strict-mode behaviour;
- ingredient definitions for the puzzle authoring context;
- background image and ingredient icon references;
- optional success/failure visual preview, such as a video or Effects Library reference.

Quest Builder owns the outcome of using that puzzle inside a quest:

- inventory transactions