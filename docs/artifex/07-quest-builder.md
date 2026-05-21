# Quest Builder

## Purpose

The Quest Builder is the overarching story/progression module.

It manages quests, side quests, branches, flags, conditions, rewards, unlocks, and progression logic.

## Module Boundary

The Quest Builder is its own app/module.

It is not inside the Project Editor.

The Project Editor can reference quests, branches, flags, and conditions when connecting the Flatplan, but the actual authoring of quest/progression logic belongs here.

Example:

- Quest Builder defines `q01_find_key`.
- Quest Builder defines the flag `key_collected`.
- Project Editor uses `quest_complete:q01_find_key` or `flag_true:key_collected` as a Route condition.

The quest/progression logic is authored here, then reused by Project Editor, Playtest, and Build Game.

## What It Includes

The Quest Builder should include what might otherwise be called:

- Quest Module
- Flag Manager
- Condition Builder
- Progression Manager
- Objective Builder

The Flag Manager and Condition Builder should live inside or under the Quest Builder because they are mostly used for progression.

## Quest

A Quest is a main structured objective path through the Flatplan.

A Quest can pass through multiple Stations/Nodes and Routes.

Quest is preferred over Line as the official term.

## Side Quest / Branch

A Side Quest is a player-facing optional quest.

A Branch is the structural Flatplan term for an optional offshoot from the main Quest.

A Branch may contain optional scenes, lore, rewards, hidden objects, extra fights, or alternative routes.

## Quest Data

A quest should define:

- quest ID
- quest title
- objective text
- start condition
- required scene or scenes
- required character
- required object
- required item
- required dialogue
- completion condition
- flags set by the quest
- rewards
- unlocks
- next quest
- optional/side quest status

## Flags

A Flag is a saved true/false state.

Examples:

- `key_collected = true`
- `villain_defeated = true`
- `door_unlocked = true`
- `intro_seen = true`
- `side_quest_started = true`

## Conditions

A Condition is a rule that checks whether something can happen.

Examples:

- `has_item: bronze_key`
- `quest_complete: q01_find_key`
- `scene_visited: old_bridge`
- `flag_true: door_unlocked`
- `enemy_defeated: forest_wolf`

Conditions can control:

- whether a Route is open
- whether a Quest can start
- whether a dialogue option appears
- whether an item can be used
- whether a scene/object/branch is unlocked

## Rewards

A Reward is something given after a Quest, Branch, battle, object interaction, or milestone.

Rewards may include:

- item
- route unlock
- scene unlock
- currency
- lore
- health
- powerup
- ending access

## Unlocks

An Unlock is a change that makes a new Route, Station, item, Quest, Branch, or screen available.

## Relationship To Flatplan / Project Editor

The Quest Builder connects to the Flatplan because quest progress can unlock or block Flatplan connections.

A Quest can use selected Stations and Routes from the Flatplan.

A Branch can be visualized as an optional offshoot from a Quest path.

The Project Editor should reference quest IDs, branch IDs, flags, and conditions, but not replace the Quest Builder.

## Relationship To Object Library

The Quest Builder should reference reusable objects from the Advanced Object Library.

Examples:

- collect item: Bronze Key
- defeat enemy: Forest Wolf
- speak to character: Merchant NPC
- unlock object: Locked Door

## Test Quest

The Quest Builder should eventually have a Test Quest option.

This should let the creator test the quest with fake flags/items enabled, reset quest state, or jump to a relevant Station/Node.
