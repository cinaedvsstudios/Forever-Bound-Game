# 17A — Quest Builder: Puzzle Outcome Events and Potion Match Integration

## Purpose

This document records how Quest Builder should connect to Puzzle Creator outcome events, especially Potion Match / Crafting Skill outcomes.

Puzzle Creator should define the puzzle interaction and emit an outcome event. Quest Builder should decide what that event does in the game.

This keeps puzzle modules reusable. One Potion Match puzzle can be used in several quests with different item rewards, inventory costs, flags, dialogue, and scene results.

## Required link to Puzzle Creator

Quest Builder must be able to reference a Puzzle Creator module record and listen for its outcome keys.

For Potion Match, the important fields are: puzzle module ID, puzzle type, success event ID, success Quest Builder outcome key, unsuccessful event ID, unsuccessful Quest Builder outcome key, and optional visual preview reference from Puzzle Creator.

The Quest Builder should not duplicate Potion Match ingredient authoring. Ingredients, icons, order, decoys, and puzzle preview belong in Puzzle Creator.

## Quest-owned consequences

Quest Builder owns all permanent results from a puzzle outcome.

For a success outcome, Quest Builder should be able to remove consumed ingredients, add a crafted item, add a spell/tool/ability, set or clear a quest flag, unlock a route, trigger dialogue, trigger a cutscene/scene transition, trigger a reward, or record a Codice/journal update.

For an unsuccessful outcome, Quest Builder should be able to remove some or all used ingredients, add a spoiled/failed item if wanted, trigger smoke/damage/corruption or other response through the scene/effect system, set a quest flag, trigger dialogue, and decide whether the puzzle can be retried or locked.

## Visual result handling

Potion Match may define a visual preview: none, video, or Effects Library effect.

Quest Builder should be able to decide whether to use the puzzle-defined visual, replace it, or add additional scene actions.

The Effects Library should provide the visual effect asset or configuration. The Puzzle Creator should only store the selected effect reference and preview it.

## Example: Lantern Potion craft

Puzzle Creator defines recipe order, success/unsuccessful event IDs, outcome keys, and optional visuals.

Quest Builder defines the success result: remove Aetheris Water x1, remove Ember x1, remove Lavender x1, remove Star Dust x1, add Lantern Potion x1, unlock temporary light tool if required, and set quest flag lantern_potion_created.

Quest Builder defines the unsuccessful result: optionally remove one or more ingredients, optionally add Spoiled Brew x1, set quest flag lantern_potion_failed, and trigger dialogue or retry state.

## Example: Tracking Coin craft

Puzzle Creator defines the ordered selection and emits the outcome key.

Quest Builder decides whether the result adds Tracking Coin, consumes Plain Coin/Salt/Silver Thread/Moonflower, marks a target, opens a tracking UI, or updates a quest step.

## Contract rule

Puzzle Creator is responsible for puzzle structure and preview.

Quest Builder is responsible for game consequences.

Inventory services and registered object services should be used by Quest Builder when applying the outcome, not hardcoded inside the puzzle runtime.
