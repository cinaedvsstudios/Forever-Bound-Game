# 16A — Puzzle Creator: Potion Match, Crafting Skill and Outcome Events

Potion Match is the Puzzle Creator module for ordered ingredient puzzles and crafting-style interactions.

It supports two modes.

Challenge Potion Puzzle is an authored puzzle. The creator defines the ingredients, decoys, order, hint, mistake rules, background, icons, and completion event keys.

Crafting Skill is the reusable crafting screen. The tray should come from the character inventory, so Mel can only use ingredients she has picked up, bought, earned, or been given.

## Ingredient authoring

The editor must allow creators to add, edit, and remove ingredients. Default ingredients are examples only and must be removable from any puzzle.

Each ingredient should support: Ingredient ID, display name, emoji fallback, uploaded PNG icon, Object Library / Archetype Object reference, optional tags, and optional demo inventory count.

Icon priority should be Object Library / Archetype Object item first, uploaded PNG second, and emoji fallback third.

The Object Library selector may start with demo entries, but the contract should be ready to bind to the real Archetype Object Creator / registered object library once that service is stable.

## Recipe authoring

The editor must let creators build the recipe from the active ingredient list. It should support a recipe order list, add selected ingredient to recipe, remove ingredient from recipe, decoy / extra tray item list, add selected ingredient as decoy, remove decoy, and remove defaults / start clean.

The recipe order is the validation sequence. Decoys are visible options that can be selected incorrectly in challenge mode, or inventory-owned items that are not part of the active craft in crafting mode.

## Visual authoring

Potion Match should support a background PNG, background opacity / darken control, background blur, and ingredient icons from Object Library, PNG, or emoji fallback.

## Outcome events

Puzzle Creator should define event keys and visual previews. It should not own permanent quest consequences.

Each Potion Match puzzle should define a success event ID, success Quest Builder outcome key, success visual type, success video/effect reference if used, success preview text, unsuccessful event ID, unsuccessful Quest Builder outcome key, unsuccessful visual type, unsuccessful video/effect reference if used, and unsuccessful preview text.

Puzzle Creator may preview the visual result. Quest Builder owns the actual inventory changes, quest flags, ability unlocks, dialogue, scene changes, and rewards.

## Quest Builder boundary

Quest Builder must decide what happens when a Potion Match event fires. Examples include adding a crafted item, removing consumed ingredients, unlocking a spell/tool/ability, setting or clearing a quest flag, opening a scene route, triggering dialogue, triggering reward, or triggering an unsuccessful response.

This separation keeps Potion Match reusable. The same ordered ingredient puzzle can create a Lantern Potion in one quest, a Tracking Coin in another, or a different result when connected to another Quest Builder outcome.

## Example craft outputs

Examples that can be authored in Potion Match and resolved through Quest Builder include Lantern Potion, Tracking Coin, Portal Potion, Salt Ward, and Healing Tisane.

## Current status

The current prototype has demonstrated ordered ingredient selection, decoys, quality loss, strict mode, crafting mode, demo inventory, background PNG upload, ingredient PNG icons, Object Library placeholders, removable default examples, and author-controlled ingredient / recipe lists.

Next step: add explicit success and unsuccessful event fields to the Potion Match UI and include those fields in the exported puzzle JSON.
