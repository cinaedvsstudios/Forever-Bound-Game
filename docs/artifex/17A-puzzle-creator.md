# Puzzle Creator Specification

## 2026-06-09 Continuity Update / Next-Chat Prompt

This section is the current continuation record for the active Puzzle Creator work. It supersedes older placeholder-only wording where it conflicts, while preserving the stable V1.35 baseline and the accepted Labyrinth Maze workflow.

Use this prompt to continue the work in a new chat or Codex session:

```text
We are continuing the Artifex Puzzle Creator work for the Forever Bound Game project.

Work only inside the accepted live Puzzle Creator route:

artifex/apps/puzzle-creator/index.html

Do not create a separate permanent preview app. Do not replace the whole module with an older route. Do not revive outdated V1.34 placeholder-only documentation. Preserve the current V1.35 launcher/workflow shell and the accepted Labyrinth Maze workflow.

Read and follow:

docs/artifex/17A-puzzle-creator.md
docs/artifex/01A-project-file-contracts.md
docs/artifex/02A-global-to-do.md
docs/artifex/07A-quest-builder.md
docs/artifex/10A-asset-library.md
docs/artifex/13A-registered-content-picker.md

Current route:
artifex/apps/puzzle-creator/index.html

Current JS entry:
artifex/apps/puzzle-creator/src/js/main.js

Relevant engine/runtime files:
artifex/apps/puzzle-creator/src/js/engines/maze-labyrinth-runtime.js
artifex/apps/puzzle-creator/src/js/engines/potion-match-runtime.js
artifex/apps/puzzle-creator/src/js/engines/horse-forest-runtime.js
artifex/apps/puzzle-creator/src/js/engines/obstacle-course-runtime.js
artifex/apps/puzzle-creator/src/js/engines/*.js
artifex/apps/puzzle-creator/src/js/puzzle-module-briefs.js

Current module list / user-facing launcher choices:
1. Labyrinth Maze
2. Boxing Ring
3. Horse Forest Ride / formerly Flying Practice / underlying Obstacle Course slot
4. Pattern Lock Puzzle
5. Potion Match
6. Underworld Black Oil

Important current truth:
- Labyrinth Maze is the stable implemented workflow and must not regress.
- Pattern Lock Puzzle has a playable prototype for shape-surface symbol placement.
- Potion Match has a playable prototype for ordered ingredient selection and crafting/challenge modes.
- Obstacle Course has been redirected into the Horse Forest Ride prototype, a 2.5D PNG-card runner, not the older broken stretched Three.js texture-plane version.
- Boxing Ring and Underworld Black Oil remain planning placeholders only unless built in a scoped pass.
- The old Flying Practice name is misleading. Rename visible user text to Horse Forest Ride or Obstacle Course where possible, while preserving the underlying `obstacle-course` engine ID unless a deliberate migration is made.
- The most recent Horse Forest fix is V10, intended to replace the broken V3/V4 visual approach. V10 uses CSS sky/horizon/ground layers and PNG cards for trees, bushes, logs, rocks, branches and collectibles.
- The previous bug was that the live page still showed Horse Forest Runner V3 and the sky/ground/horizon were rendered as ugly horizontal bands. This happened because V4/V10 code was not properly committed/live and the runtime file online was incomplete or outdated.
- If the page still says “Horse Forest Runner V3”, the live code has not been replaced with the V10 file.

Immediate next goal:
1. Ensure the live repository contains the complete V10 `horse-forest-runtime.js`.
2. Ensure `main.js` imports `horse-forest-runtime.js` before `obstacle-course-runtime.js`, for example:
   import './engines/horse-forest-runtime.js?v=1.50';
   import './engines/obstacle-course-runtime.js?v=1.38';
3. Ensure clicking the `data-engine="obstacle-course"` launcher opens the Horse Forest Ride / Horse Forest Runner V10 workflow.
4. Ensure the old broken Three.js Obstacle Course does not display instead of the horse runner.
5. Ensure the menu label no longer says Flying Practice once the new runtime loads, or at minimum make the Horse Forest Ride title clear after opening.
6. Use the existing asset folder:
   artifex/apps/puzzle-creator/assets/obstacle-course/horse-forest/
7. Do not generate more images unless explicitly asked. This is now a code/layout/runtime fix task.

Expected visual model for Horse Forest Ride:
- Sky is a CSS/background layer using `sky/forest_sky_clouds_1920x1080.png`.
- Distant forest horizon is a CSS/background strip using `backgrounds/forest_horizon_misty_pines_01_740x493.png` or another provided horizon image.
- Ground is a moving tiled CSS layer using `ground/forest_floor_roots_tile_placeholder_1254.png`.
- Trees and bushes are transparent PNG cards placed at pseudo-depth on the left/right of the route.
- Logs and rocks are transparent PNG obstacle cards.
- Low/overhead branches are transparent PNG hazard cards.
- Flowers, herbs and charms are transparent PNG collectible cards.
- Space jumps.
- WASD/arrows steer.
- Collectibles add score.
- Obstacle hits subtract score / count hits.
- Completion emits local success/failure event keys only; Quest Builder owns actual inventory/reward consequences.

Do not use the stretched Three.js texture-plane approach for this prototype unless deliberately rebuilding the whole engine later. The practical fix is a 2.5D staged runner: CSS layers + positioned PNG cards.

When editing:
- Make small, targeted changes.
- Keep an internal rollback list of touched files and exact changes.
- Do not touch Maze unless necessary.
- Do not remove Pattern Lock or Potion Match prototypes.
- Do not claim a placeholder engine is complete unless it has been browser-tested.
- If GitHub writing fails, provide a zip with `puzzle-creator` as the root folder, containing only the files that need to be replaced, and clearly list the target paths.
```

## 2026-06-09 Current Puzzle Engine Status Summary

| User-facing module | Underlying engine ID / label | Current status after recent work |
|---|---|---|
| Labyrinth Maze | `maze-labyrinth` / Maze-Labyrinth | Stable implemented playable authoring workflow. Must not regress. |
| Boxing Ring | `arena-trial` / Arena Trial | Planning placeholder. Not a completed combat-training engine. |
| Horse Forest Ride / formerly Flying Practice | `obstacle-course` / Obstacle Course | Experimental playable prototype in progress. The desired current version is Horse Forest Runner V10 using 2.5D PNG cards. |
| Pattern Lock Puzzle | `symbol-assembly` / Symbol Assembly | Playable prototype in progress for rotating shape/surface symbol placement. |
| Potion Match | `item-order-puzzle` / Item Order Puzzle | Playable prototype in progress for ordered ingredient/crafting challenge. |
| Underworld Black Oil | `hazard-puzzle` / Hazard Puzzle | Planning placeholder. Not a completed hazard engine. |

Future work must preserve this distinction. Only Labyrinth Maze is stable. Pattern Lock, Potion Match and Horse Forest Ride are prototypes. Boxing Ring and Underworld Black Oil are still planning placeholders.

## 2026-06-09 Detailed Puzzle Notes

### Labyrinth Maze / Maze-Labyrinth

Labyrinth Maze is the accepted stable Puzzle Creator workflow.

Current behaviour includes the puzzle-type launcher, Setup/Display/Logic/Colors workflow rail, random/blank/reference/import setup actions, maze size/shape/warp/stretch/edge/wall-height/block-spacing controls, 2D overview, diorama/playable preview, Walk Test where supported, local Door and Portal transfer behaviour where already implemented, JSON import/export/download, registered Collect object linking, Door visual asset reference storage and Scatter decoration/light reference storage.

Protected layout decisions:

- Puzzle Creator should open to the puzzle-type chooser, not directly into Maze.
- The workflow rail icons should keep labels under them.
- Surface + Edit must keep Walls, Scatter and Colours visually separated.
- Scatter is decoration-only and must not define objectives, collision, route logic, transfers or completion.
- Maze must not be broken while other engines are added.

### Boxing Ring / Arena Trial

Boxing Ring is a future optional training arena using Battle Mode rules. It is not implemented yet.

Intended components:

- optional training arena where Mel fights controlled Foe projections for modest rewards;
- Training Host / Spirit Tutor who explains the trial and gives win/loss dialogue;
- Opponent Select Menu with enemies unlocking as Mel encounters them in the story;
- Loadout Select Menu for limited weapons, Supplies, Relics or Songspells;
- fixed Battle Mode arena;
- modest reward logic: Silver, ingredients, Supplies, temporary boosts or rare first-clear bonuses;
- cooldown/anti-farming logic;
- no story penalty for losing;
- first-clear bonuses and no-reward practice mode;
- optional Codice entry recording defeated trial opponents and lore;
- difficulty tiers using Foe tier logic;
- in-world results screen, not modern “win/lose” wording.

Open decisions before building:

- in-world entrance location;
- Training Host identity;
- first opponent set;
- first reward list;
- whether it belongs in Quest 0.5 or later;
- which Battle Mode runtime is stable enough to reuse.

### Horse Forest Ride / Obstacle Course / Former Flying Practice

The `obstacle-course` slot originally described Flying Practice, but the first desired implementation is now Horse Forest Ride.

The first implementation should be a POV-style horse ride through a forest where the player jumps logs/rocks, avoids branches and collects flowers/herbs/charms. It should not use the broken stretched Three.js texture-plane view.

Correct current approach:

- 2.5D staged runner;
- sky as CSS/background layer;
- distant forest horizon as CSS/background strip;
- ground as moving tiled CSS layer;
- trees, bushes, logs, rocks, branches and collectibles as transparent PNG cards with pseudo-depth scaling;
- Space jumps;
- WASD/arrows steer;
- collectibles add score;
- obstacle hits subtract score/count hits;
- success/failure emits local event keys for Quest Builder.

Required paths:

```text
artifex/apps/puzzle-creator/src/js/engines/horse-forest-runtime.js
artifex/apps/puzzle-creator/src/js/main.js
artifex/apps/puzzle-creator/assets/obstacle-course/horse-forest/
```

Expected import order in `main.js`:

```js
import './engines/maze-labyrinth-runtime.js';
import './engines-ui.js?v=1.36';
import './engines/potion-match-runtime.js?v=1.37';
import './engines/horse-forest-runtime.js?v=1.50';
import './engines/obstacle-course-runtime.js?v=1.38';
```

Important bug note:

If the browser shows “Horse Forest Runner V3” or the view is a blue rectangle with ugly horizontal floor/horizon bands, the live runtime is stale or incomplete. The V10 runtime must replace it.

Asset folder structure:

| Asset type | Path |
|---|---|
| Sky | `assets/obstacle-course/horse-forest/sky/` |
| Horizon/background strip | `assets/obstacle-course/horse-forest/backgrounds/` |
| Ground tile | `assets/obstacle-course/horse-forest/ground/` |
| Trees / treelines | `assets/obstacle-course/horse-forest/trees/` |
| Foreground bushes/foliage | `assets/obstacle-course/horse-forest/foreground/` |
| Logs | `assets/obstacle-course/horse-forest/obstacles/logs/` |
| Rocks | `assets/obstacle-course/horse-forest/obstacles/rocks/` |
| Stumps | `assets/obstacle-course/horse-forest/obstacles/stumps/` |
| Low branches | `assets/obstacle-course/horse-forest/obstacles/branches/` |
| Side/overhead branches | `assets/obstacle-course/horse-forest/branches/` |
| Flower collectibles | `assets/obstacle-course/horse-forest/collectibles/flowers/` |
| Ingredient collectibles | `assets/obstacle-course/horse-forest/collectibles/ingredients/` |
| Charm collectibles | `assets/obstacle-course/horse-forest/collectibles/charms/` |
| FX | `assets/obstacle-course/horse-forest/fx/` |
| Player/horse POV overlay | `assets/obstacle-course/horse-forest/player/` |
| Markers | `assets/obstacle-course/horse-forest/markers/` |

Useful current asset examples:

```text
sky/forest_sky_clouds_1920x1080.png
backgrounds/forest_horizon_misty_pines_01_740x493.png
backgrounds/forest_horizon_deep_pines_02_625x350.png
ground/forest_floor_roots_tile_placeholder_1254.png
trees/treeline_spruce_alpha_2048x1024.png
trees/treeline_pine_alpha_625x350.png
trees/tree_broadleaf_01.png
trees/tree_pine_placeholder_01.png
foreground/foreground_bush_placeholder_01.png
obstacles/stumps/obstacle_stump_tall_01.png
obstacles/stumps/obstacle_stump_low_01.png
obstacles/rocks/obstacle_rock_tall_01.png
obstacles/rocks/obstacle_rock_medium_01.png
obstacles/rocks/obstacle_rock_flat_01.png
obstacles/logs/obstacle_log_cut_01.png
obstacles/logs/obstacle_log_branch_01.png
obstacles/logs/obstacle_log_bark_01.png
obstacles/branches/obstacle_low_branch_01.png
branches/branch_overhead_leafy_01.png
collectibles/flowers/collectible_blue_wildflower_01.png
collectibles/flowers/collectible_pink_wildflower_01.png
collectibles/ingredients/collectible_herb_bundle_01.png
collectibles/charms/collectible_forest_charm_01.png
```

### Pattern Lock Puzzle / Symbol Assembly

Pattern Lock Puzzle uses the `symbol-assembly` slot and has a playable prototype in progress.

Core design:

- player chooses a shape;
- engine generates empty surface points/facets;
- player selects symbols/images/text/emojis from a tray;
- player places them onto surface points;
- player rotates the shape to inspect different faces/sides;
- puzzle validates whether the placement matches the authored rule/pattern.

First supported shapes:

```text
Pyramid
Diamond
Cube
Sphere
```

User correction that must be preserved:

The shape should behave like the reference URL: points on each face/surface and the shape can be turned around. It should not be a flat board. Surface-only points are acceptable for the first version; full interior point construction is not first scope.

Example rules/patterns:

- all same symbol type on one face;
- all same colour on one face;
- recreate a reference pattern;
- solve a riddle to decide placement;
- mirror/symmetry sequence;
- ritual seal positions.

Known UI/future needs:

- remove cluttering title text inside the preview area;
- keep display area small enough that it does not run off screen;
- support custom texture for balls/points;
- support configurable point/ball shape;
- decide whether validation is instant or via a check button;
- decide whether feedback gives exact correctness or approximate closeness.

### Potion Match / Item Order Puzzle

Potion Match uses the `item-order-puzzle` slot and has a playable prototype in progress.

It supports two intended modes:

| Mode | Meaning |
|---|---|
| Challenge Potion Puzzle | Scene/Quest puzzle where the player chooses ingredients in the correct order. |
| Crafting Skill | Reusable crafting screen where available ingredients come from character inventory. |

Prototype behaviour already discussed/demonstrated:

- recipe/order slots;
- ingredient tray;
- selecting ingredients in order;
- reset brew;
- show correct order;
- shuffle tray;
- progress count;
- mistake count;
- quality percentage;
- strict/quality behaviour;
- demo recipe such as Healing Tisane;
- default demo ingredients such as yarrow, lavender, Capra milk, star dust, salt, mushroom and moonflower;
- crafting mode using demo inventory;
- challenge mode with decoys.

Required ingredient authoring:

```text
Ingredient ID
Display name
Emoji fallback
Uploaded PNG icon
Object Library / Archetype Object reference
Optional tags
Optional demo inventory count
```

Icon priority:

```text
Object Library / Archetype Object item first
Uploaded PNG second
Emoji fallback third
```

Recipe authoring must support:

```text
recipe order list
add selected ingredient to recipe
remove ingredient from recipe
decoy / extra tray item list
add selected ingredient as decoy
remove decoy
remove defaults / start clean
```

Required outcome fields:

```text
success event ID
success Quest Builder outcome key
success visual type
success video/effect reference if used
success preview text
unsuccessful event ID
unsuccessful Quest Builder outcome key
unsuccessful visual type
unsuccessful video/effect reference if used
unsuccessful preview text
```

Boundary:

Puzzle Creator defines local interaction, ordered sequence and emitted outcome key. Quest Builder defines actual reward, inventory mutation, ability unlock, quest flag, dialogue and story consequence.

Example craft outputs:

```text
Lantern Potion
Tracking Coin
Portal Potion
Salt Ward
Healing Tisane
```

### Underworld Black Oil / Hazard Puzzle

Underworld Black Oil uses the `hazard-puzzle` slot.

Status:

- planning placeholder only;
- not a completed hazard engine;
- not evidence that Maze has generic hazard runtime behaviour.

Intended concept:

- living underworld corruption / black oil / spreading hazard;
- avoid, cleanse or contain the hazard;
- may use pulsing/spreading danger zones;
- may define source count, spread rate, safe path width, cleansing tools, survival/escape/containment modes and win/loss states.

Possible mechanics:

- spreading source;
- timed pulse danger;
- safe-path traversal;
- cleanse tools such as Aetheris, Saltseal, song, relic or ritual action;
- containment seals/barriers;
- escape before hazard overtakes route;
- survival timer;
- purification result event.

Open questions:

- grid puzzle, scene overlay, maze variant or standalone board;
- turn-based, timed or manual spreading;
- direct Mel control or authored route/solution;
- first cleansing tools;
- underworld theme immediately or neutral hazard prototype first.

---

Status: Active module specification during documentation consolidation  
Owning module: Puzzle Creator  
Active route: `artifex/apps/puzzle-creator/index.html`  
Current verified implementation baseline: `Artifex Puzzle Creator V1.35` on current `main`  
Accepted implementation evidence: merged PR #48 / merge `f707beb781a63165da29e145f5b8c4deeeada6ec`  
Protected workstream note: Puzzle Creator has been active recently; do not overwrite its current truth from older V1.34 documentation or open status-refresh PRs  
Governing universal contract: `docs/artifex/01A-project-file-contracts.md`  
Related module specification: `docs/artifex/07A-quest-builder.md`  
Related shared-service specifications: `docs/artifex/13A-registered-content-picker.md`, `docs/artifex/10A-asset-library.md`, `docs/artifex/11A-connected-project-folder.md`  
Outstanding work source: `docs/artifex/02A-global-to-do.md`

## Purpose

Puzzle Creator is the Artifex authoring module for self-contained playable challenges.

A puzzle is a contained interactive challenge with its own internal rules, layout, feedback and completion logic. A completed puzzle may later be referenced by Quest Builder as one meaningful Quest flow step, but Quest Builder must not absorb or duplicate the puzzle's internal authored mechanics.

Puzzle Creator owns how the challenge works. Quest Builder owns why the challenge happens in a Quest and what story/progression outcomes follow.

## Ownership Boundary

Puzzle Creator owns:

- puzzle definition and internal playable configuration;
- puzzle-engine type and engine-specific settings;
- puzzle layout, cells, pieces, features, start/exit, internal doors, local portals, hazards, collectibles and local transfer rules where supported by the selected engine;
- puzzle-local feedback required during the challenge;
- puzzle-local completion rules and internal evaluation;
- final referenced assets, archetypes, effects and audio IDs used inside the puzzle;
- canonical puzzle index/content-file registration once connected-project saving is implemented.

Puzzle Creator must not own:

- whole Quest chains, Calling flow, Quest rewards or Quest-level dialogue;
- Quest-level Capra narration around the puzzle unless it is purely immediate internal puzzle feedback;
- Project Editor route/Flatplan structure;
- reusable object or effect definitions owned by their authoring modules;
- final media ownership or Asset Library promotion except through approved registered references;
- copied media files, raw intake files, procedural audio recipes or browser-only uploads as permanent puzzle content;
- general runtime/build packaging.

## Canonical Future Project Files

When connected-project saving is implemented, Puzzle Creator must save and register puzzle content under:

```text
puzzles/puzzle-index.json
puzzles/puzzle_<slug>.json
```

The canonical empty puzzle index shape is:

```json
{
  "schemaVersion": "artifex.puzzles.index.v1",
  "projectId": "project_forever_bound",
  "puzzles": []
}
```

Quest Builder should select a stable `puzzle_` ID from `puzzles/puzzle-index.json`. It must not copy a puzzle's grid, symbol board, internal feature list, rule set or full JSON into a Quest block.

## Active Baseline

The current live route identifies itself as:

```text
Artifex Puzzle Creator V1.35
```

V1.35 was introduced by merged PR #48. It changed the launcher/content layer by replacing the generic engine names with the recovered Forever Bound module names, while preserving the accepted Labyrinth Maze workflow.

The six current launcher modules are:

| User-facing module | Underlying engine ID / label | Current status |
|---|---|---|
| Labyrinth Maze | `maze-labyrinth` / Maze-Labyrinth | Current implemented playable authoring workflow |
| Boxing Ring | `arena-trial` / Arena Trial | Planning placeholder, not completed gameplay engine |
| Flying Practice | `obstacle-course` / Obstacle Course | Planning placeholder, not completed gameplay engine |
| Pattern Lock Puzzle | `symbol-assembly` / Symbol Assembly | Planning placeholder, not completed gameplay engine |
| Potion Match | `item-order-puzzle` / Item Order Puzzle | Planning placeholder, not completed gameplay engine |
| Underworld Black Oil | `hazard-puzzle` / Hazard Puzzle | Planning placeholder, not completed gameplay engine |

This distinction is protected. The launcher may surface all six choices, but only Labyrinth Maze is currently the accepted playable workflow. The other pages are readable planning placeholders and must not be described as finished editors.

## Current Implemented Labyrinth Maze Baseline

Labyrinth Maze is the current developed workflow.

Current implemented Maze behaviour includes:

- puzzle-type launcher that can open Labyrinth Maze;
- labelled workflow rail: Setup, Display, Logic and Colors;
- retained accepted Maze authoring behaviour from earlier V1.33/V1.34 work;
- random/blank/reference/import setup actions;
- maze size, shape, warp, stretch, edge style, wall height and block-spacing controls;
- 2D overview, diorama/playable preview and Walk Test where supported;
- Game Logic fields such as Puzzle Type, Integration Context, Difficulty, Completion Flag and Calling Text;
- JSON import/export/download workflow;
- local Door and Portal transfer behaviour in Walk Test where already implemented;
- registered-content linking where implemented for Collect objects, Door visuals and Scatter visual references;
- Surface + Edit workflow where Walls, Scatter and Colours remain distinct;
- Scatter marker authoring as decoration-only, not objective/collision/completion logic.

The Maze workflow must remain stable while additional engines or connected saving are added.

## Current Implemented Registered-Content Links

Puzzle Creator already uses the shared registered-content reader/picker in some Maze workflows.

Implemented retained linking behaviour includes:

- Collect rows can link to valid registered `archobj_` Archetype Object records.
- A selected Door can store a registered final `asset_` visual reference as `visualAssetId`, `visualAssetLabel` and `visualAssetReferenceSource`.
- Scatter decoration/light slots can optionally link to registered final `asset_` records.
- The shared picker must reject intake files, browser-only paths, external URLs, legacy unpromoted catalogue paths and invalid IDs.

These links are stored/exported references. Not every selected visual is rendered in the playable preview yet.

## Current Planning Placeholder Modules

### Boxing Ring / Arena Trial

The current Boxing Ring page describes a future contained combat-training puzzle using Battle Mode rules, opponent selection, loadout selection, modest rewards, cooldowns, reset-on-loss behaviour and unlockable opponent tiers.

It is planning content only. It is not a completed battle/training engine.

### Flying Practice / Obstacle Course

The current Flying Practice page describes a future aerial route course with route markers, obstacles, collectibles, scoring and tiered results.

It is planning content only. It is not a completed flying engine.

### Pattern Lock Puzzle / Symbol Assembly

The current Pattern Lock page describes a future rune, seal, mosaic, lock or ritual diagram puzzle using pieces, slots, optional rotation, validation and completion effects.

It is planning content only. It is not a completed symbol-assembly engine.

### Potion Match / Item Order Puzzle

The current Potion Match page describes a future ordered ingredient/item selection puzzle with sequence length, item pool, transform speed, wrong-pick rule and reward/quality logic.

It is planning content only. It is not a completed potion-matching engine.

### Underworld Black Oil / Hazard Puzzle

The current Underworld Black Oil page describes a future living hazard puzzle with spreading/pulsing danger, source count, spread rate, safe path width, cleansing tools, survival/escape/containment modes and win/loss state.

It is planning content only. It is not a completed hazard engine.

## Puzzle Creator to Quest Builder Handoff

Puzzle Creator and Quest Builder are related but separate.

Puzzle Creator determines whether its own challenge is complete. Quest Builder consumes a public puzzle completion result and authors Quest-level outcomes around it.

A future Quest Builder `Puzzle` block should use:

```text
puzzleId
```

Example future relationship:

```text
Puzzle Creator
  saves puzzle_chalice_pedestal

Quest Builder
  flow block: Solve the Chalice Pedestal
  puzzleId: puzzle_chalice_pedestal
  on complete: set flag_chalice_pedestal_solved, trigger dialogue, grant item, continue Quest
```

Puzzle Creator owns the contained challenge. Quest Builder owns prerequisites, dialogue, rewards, flags, Capra feedback and branch outcomes around that challenge.

Project Editor may consume public Quest or puzzle completion results only where needed for wider route/Flatplan structure.

## Internal Puzzle Rules Versus Quest Outcomes

Puzzle-local completion checks belong to Puzzle Creator.

Examples:

```text
exit reached
required collect found
correct symbol sequence entered
correct item order completed
hazard survived
```

Quest-level outcomes belong to Quest Builder.

Examples:

```text
set flag_chalice_pedestal_solved
trigger dialogue
grant item
continue to next Quest block
show Capra story feedback
unlock Quest reward
```

A puzzle's internal completion rule should not become a collection of free-text rules inside a Quest block.

## Asset, Object, Effect and Audio Reference Rules

Puzzle Creator may reference stable final records such as:

```text
asset_       final images, icons, sounds, generated audio or other media
archobj_     reusable object archetypes where supported
archeffect_  reusable effect archetypes where supported
```

Puzzle Creator must not:

- store final links to `intake/`;
- store final links to `artifex/assets-library/` legacy catalogue paths;
- store data URLs, blob URLs or absolute local paths as permanent puzzle references;
- create `archsound_` records or a separate sound-archetype index;
- copy generated sound recipes into puzzle files.

Sound and audio feedback must resolve to registered `asset_` IDs once Sound Library / Asset Library support exists.

## Scatter and Decoration Rules

Scatter is decoration-only.

Scatter may define authored decorative markers, visual slots and placeholder positions. It does not define objectives, collision, route logic, transfers or completion conditions.

Scatter marker positions may exist without linked final art. Placeholder-first authoring is valid. Optional visuals must later resolve to registered final `asset_` records.

The planned Secondary Light Set is a second decorative-light layer only. It depends on existing primary light positions and should fill underlit corridor areas while avoiding the primary light set, start, exit, Collect objects, Door endpoints and Portal endpoints.

## Door, Portal, Traboule, Foe and Hazard Boundaries

Doors currently own local transfer/movement behaviour through Maze connection logic. Door visuals may reference registered `asset_` IDs, but selected Door artwork is not fully rendered in playable preview yet.

Local Portals currently exist as interim transfer behaviour. Global/shared Portal Registry integration is future cross-module work and must involve Scene Editor, Project Editor, Quest Builder, Health/Build and the portal endpoint design.

Traboule remains a planned hidden pass-through wall behaviour until implemented.

Foe and Hazard placement/setup/runtime behaviour remain disabled or unimplemented unless real behaviour is added and browser-tested.

Underworld Black Oil is a separate future hazard-puzzle engine page, not evidence that generic Maze Hazard runtime behaviour exists.

## Potion Match / Crafting Skill Boundary

Potion Match belongs inside Puzzle Creator as the ordered ingredient puzzle / crafting-style interaction module.

It supports two intended modes:

| Mode | Meaning |
|---|---|
| Challenge Potion Puzzle | A scene or Quest puzzle where the player chooses ingredients in the correct order. |
| Crafting Skill | A reusable crafting screen where available ingredients should come from character inventory, so Mel can only use ingredients she has picked up, bought, earned or been given. |

Puzzle Creator owns the internal Potion Match interaction:

- challenge/crafting mode;
- ingredient authoring;
- recipe order;
- decoy / extra tray item list;
- strict mode, mistake rules and local quality behaviour;
- internal success/failure evaluation;
- background image and ingredient icon references;
- local visual preview;
- success and unsuccessful event IDs / outcome keys emitted to Quest Builder.

Potion Match ingredient authoring should support:

```text
Ingredient ID
Display name
Emoji fallback
Uploaded PNG icon
Object Library / Archetype Object reference
Optional tags
Optional demo inventory count
```

Icon priority should be:

```text
Object Library / Archetype Object item first
Uploaded PNG second
Emoji fallback third
```

The Object Library selector may start with demo entries, but the contract should be ready to bind to real Archetype Object Creator / registered object records once that service is stable.

Recipe authoring should support:

```text
recipe order list
add selected ingredient to recipe
remove ingredient from recipe
decoy / extra tray item list
add selected ingredient as decoy
remove decoy
remove defaults / start clean
```

The recipe order is the validation sequence. Decoys are visible options that can be selected incorrectly in challenge mode, or inventory-owned items that are not part of the active craft in crafting mode.

Potion Match visual authoring should support a background PNG, background opacity/darken control, background blur and ingredient icons from Object Library, PNG or emoji fallback.

## Potion Match Outcome Events

Puzzle Creator should define event keys and visual previews. It should not own permanent Quest consequences.

Each Potion Match puzzle should define:

```text
success event ID
success Quest Builder outcome key
success visual type
success video/effect reference if used
success preview text
unsuccessful event ID
unsuccessful Quest Builder outcome key
unsuccessful visual type
unsuccessful video/effect reference if used
unsuccessful preview text
```

Puzzle Creator may preview the visual result. Quest Builder owns the actual inventory changes, quest flags, ability unlocks, dialogue, scene changes and rewards.

Example craft outputs that can be authored in Potion Match and resolved through Quest Builder include:

```text
Lantern Potion
Tracking Coin
Portal Potion
Salt Ward
Healing Tisane
```

The current prototype has demonstrated ordered ingredient selection, decoys, quality loss, strict mode, crafting mode, demo inventory, background PNG upload, ingredient PNG icons, Object Library placeholders, removable default examples and author-controlled ingredient / recipe lists.

The next Potion Match implementation step is to add explicit success and unsuccessful event fields to the Potion Match UI and include those fields in the exported puzzle JSON.

## Current Gaps

Known gaps include:

- canonical connected-project puzzle saving is not implemented;
- `puzzles/puzzle-index.json` and `puzzles/puzzle_<slug>.json` writing is not implemented;
- Quest Builder `Puzzle` block and `puzzleId` selector are not implemented;
- other launcher modules are planning placeholders, not completed engines;
- Secondary Light Set / coverage-fill placement is not implemented;
- selected Door images are not yet rendered in playable preview;
- linked Scatter asset images and real light effects are not yet rendered in playable preview;
- Portal registered visual/effect selection and global Portal Registry integration are not implemented;
- Completion Rule enforcement during Walk Test/game runtime is not complete;
- Foe, Hazard and Traboule runtime behaviour is not implemented;
- Tunnel Mode, real first-person/3D renderer and helper pendant/crystal are not implemented;
- registered sound-feedback selection depends on the accepted Sound Library / Asset Library foundation.

## Source Classification

`artifex/apps/puzzle-creator/index.html` is the current route and visible V1.35 baseline evidence.

`artifex/apps/puzzle-creator/README.md` contains valid permanent purpose, ownership and handoff material, but its current-state section still describes V1.34 and is superseded by the V1.35 route/PR evidence. Its enduring boundary rules are consolidated into this specification.

`docs/artifex/07b-puzzle-creator-quest-integration.md` contains valid Puzzle Creator / Quest Builder handoff rules and is consolidated into this specification and `07A`.

`artifex/shared/todo-guide/puzzle-creator-maze-labyrinth-update-steps.md` contains useful Maze baseline and outstanding Maze task evidence. It is not a permanent module specification.

`artifex/apps/puzzle-creator/src/js/puzzle-module-briefs.js` is current implementation evidence for the V1.35 user-facing launcher modules and placeholder planning content.

`artifex/apps/puzzle-creator/src/js/engines/*.js` is current implementation evidence for registered engine IDs, module type labels, default module IDs, purpose text and planning fields.

Open PR #44 is a V1.34 documentation refresh and must not be merged as a parallel current-status authority after V1.35. Any still-useful V1.34 boundary content is already represented here.

`16A-puzzle-creator-potion-match-crafting-and-events.md` is not an active separate module spec. Its Potion Match / Crafting Skill rules have been consolidated into this file and Quest Builder handoff rules belong in `07A-quest-builder.md`.

`17A-quest-builder-puzzle-outcome-events.md` is not an active separate module spec. Its Quest consequences belong in `07A-quest-builder.md`; Puzzle Creator keeps only the puzzle-side event/output boundary.

Merged PR #48 is the current V1.35 implementation baseline for the recovered module planning pages.

## Required Future Work

The active backlog, not this specification, owns implementation tasks. The main known Puzzle Creator work is:

- implement canonical connected-project puzzle save/index registration;
- define and validate final puzzle record schema and stable public puzzle results;
- coordinate Quest Builder `Puzzle` block and `puzzleId` selection after saved puzzle records exist;
- implement Secondary Light Set / coverage-fill if it remains the next approved Maze scope;
- render linked Door visuals and Scatter visual/light assets in playable preview;
- implement Portal registered visual/effect selection and global endpoint registry integration;
- implement Traboule, Foe, Hazard, Tunnel Mode, first-person/3D and helper pendant/crystal only through scoped versioned passes;
- build each non-Maze puzzle engine separately and do not present placeholders as completed engines;
- add explicit Potion Match success and unsuccessful event fields and include them in exported puzzle JSON when Potion Match moves from planning/prototype into implementation;
- add registered sound feedback selection only after Sound Library / Asset Library foundation is accepted.

## Remaining Work

All current and future Puzzle Creator work belongs in `docs/artifex/02A-global-to-do.md`. This specification must not become a task list.
