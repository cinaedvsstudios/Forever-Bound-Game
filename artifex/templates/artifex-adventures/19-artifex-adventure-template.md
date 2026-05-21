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

It should demonstrate structure, not become a full narrative game. The story can suggest a bigger 1912 European thriller, but the playable template should remain a compact train-based slice.

The template should demonstrate:

- one hero
- one kidnapped character / emotional goal
- one murdered mentor / backstory figure
- one active villain force
- one title screen
- one map or structure view
- one Depot
- one Junction
- one Waypoint / Marker
- one playable hub Scene
- one travel Route
- one dialogue example
- one item pickup example
- one locked gate / route condition
- one stealth or enemy sightline example
- one main Quest
- one Side Quest / Branch
- one reward
- one unlock
- one ending / victory Screen
- one Playtest path from start to ending
- one Build Game/export-ready starter project

## Working Template Story

### Working Title

**Artifex Adventures: The Great Omar**

Possible later titles:

```text
Tommy Artifex and the Great Omar
Artifex and the Great Omar
The Great Omar Express
The Artifex Case
```

### Story Premise

In 1912, a young Boy Scout named **Thomas “Tommy” Artifex** is pulled into a deadly feud over the legendary jeweled book **The Great Omar**.

Tommy was raised by his uncle, **Archibald Artifex**, an antique dealer in London. Archibald secretly purchased one stolen page of The Great Omar after the real book was stolen, dismantled, and sold off to wealthy collectors across Europe.

When the enraged book dealer **Gabriel Wells** discovers he was tricked into insuring and losing a fake copy of the book on the Titanic, he hires criminal Trackers to recover the real pieces. They raid Archibald’s shop, murder him, and fail to find the hidden page.

The Trackers believe Tommy knows where the missing pieces are. To force him to recover them, they kidnap his girlfriend **Evelyn Hastings** and threaten to throw her into the Thames unless he gathers the stolen pieces.

Tommy’s first clue leads him to the hotel room where the collector-thief was staying. Inside, he finds postcards from people connected to the Sotheby’s auction. Those people are now fleeing Europe on the same luxury express train from London to Vienna, carrying stolen fragments of The Great Omar.

Tommy must board the train, identify the passengers from the postcards, recover enough pieces of the book, avoid the Trackers, and reach Vienna in time to ransom Evelyn.

### Tone

Pulp adventure, 1912 thriller, Young Indiana Jones energy, luxury train mystery, Boy Scout resourcefulness, light MacGyver-style improvisation, stealth rather than combat.

The template can include ridiculous train cars later if useful, such as an animal car, secret laboratory car, private carriage, or occult scholar sleeper compartment. For the starter version, the train should remain small and reusable.

## Visual Reference Direction

The visual direction should lean toward:

- 1912 luxury express train
- sepia postcards
- brass, leather, polished wood, dark green upholstery
- London antique shop intro
- smoky train corridors
- dinner jackets, bowler hats, waistcoats, period travel clothes
- jewel-encrusted book fragments
- Boy Scout pocket tools, rope, notebook, compass, pins, and improvised gadgets
- tense station-clock ending

The hero should visually resemble a young adventure-film scout type: youthful, observant, nervous but brave, practical clothing, satchel, cap or scout-like accessories if useful.

## Main Cast

### Hero Archetype

```text
id: hero_tommy_artifex
name: Thomas “Tommy” Artifex
category: Character Archetype
role: playable hero
```

Tommy is a young Boy Scout and amateur tinkerer. He is out of his depth but observant, practical, and good at improvising. He should rely on stealth, clues, disguises, distractions, tools, and problem-solving rather than direct combat.

### Kidnapped Character / Emotional Goal

```text
id: npc_evelyn_hastings
name: Evelyn Hastings
category: NPC Archetype / Story Goal Character
role: kidnapped girlfriend / sweetheart
```

Evelyn is Tommy’s kidnapped girlfriend. She does not need to appear in full gameplay at first. She can appear in intro art, ransom note text, dialogue memory, ending screen, or journal entry.

### Murdered Uncle / Mentor Backstory

```text
id: npc_archibald_artifex
name: Archibald Artifex
category: NPC Archetype / Backstory Character
role: murdered antique dealer / uncle
```

Archibald raised Tommy and owned the antique shop. His murder begins the adventure. He left behind the hidden page, journal clues, and the trail of postcards.

### Vengeful Book Dealer

```text
id: npc_gabriel_wells
name: Gabriel Wells
category: Villain Archetype / Off-screen Antagonist
role: enraged rare book dealer
```

Gabriel Wells bought what he believed was The Great Omar and arranged for it to be shipped to New York aboard the Titanic. After discovering the Titanic copy was a fake and the real book was stolen and dismantled, he uses his wealth to hire criminals to recover the real pieces.

### Criminal Mastermind / Active Villain

```text
id: villain_victor_rook_mercer
name: Victor “The Rook” Mercer
category: Villain Archetype
role: Wells’ hired criminal organiser
```

Mercer leads the Trackers on the train. He is the active threat, even if Gabriel Wells is the wealthy force behind the hunt.

### Tracker Enemy Archetype

```text
id: enemy_tracker
name: Tracker
category: Enemy Archetype
role: patrolling mobster / sightline enemy
```

Trackers are mob goons in 1912 suits and bowler hats. They patrol corridors, stations, and baggage areas. If a Tracker spots Tommy, the scene resets to the last checkpoint. This demonstrates enemy sightlines, stealth, caught states, and reset logic without needing combat.

## Historical / Fictional Setup

### The Widener Conspiracy

The story uses a fictionalised version of the Great Omar / Titanic mystery.

Working timeline:

```text
March 29, 1912
Gabriel Wells buys The Great Omar at Sotheby’s in London and arranges to ship it to New York aboard the Titanic.

April 1912
A wealthy collector connected to the Widener circle steals the real book during the transport window between London and Southampton.

April 15, 1912
A brilliant fake copy is loaded into the Titanic’s cargo hold and sinks with the ship.

After the sinking
The real Great Omar has already been dismantled. Rubies, gold clasps, jeweled covers, and illuminated pages are sold privately to secretive buyers across Europe.

After Wells discovers the truth
Wells hires Mercer and the Trackers to recover the real pieces and punish everyone connected to the theft.
```

The template does not need to prove every historical detail. The historical material gives texture and motivation; the playable game remains a compact fictional adventure.

## Great Omar Fragments

The Great Omar pieces are the main collectible objective.

Possible fragment categories:

```text
ruby_cluster
peacock_clasp
illuminated_page
front_title_page
back_cover
hidden_uncle_page
```

For the starter template, only three main targets should be required unless scope expands.

## Target Passengers

These are the full possible targets. The first template should probably use only three of them as active playable targets, with the others marked as future expansion.

### Target 1: The Paranoid Broker

```text
id: npc_silas_vance
name: Silas Vance
category: NPC Archetype / Target Character
trainLocation: Dining Car
piece: ruby_cluster
mechanic: distraction / snatch / pickup
```

Silas Vance is a nervous proxy bidder who represented a rival antiquities firm at Sotheby’s. He bought a cluster of rubies from the book’s spine and intends to sell them on the black market.

He sits in the Dining Car chain-smoking and clutching his briefcase. Tommy must create a distraction, such as tampering with lights or causing a waiter mishap, then snatch the jewels while Vance looks away.

### Target 2: The Vain Aristocrat

```text
id: npc_lady_genevieve_croft
name: Lady Genevieve Croft
category: NPC Archetype / Target Character
trainLocation: First-Class Passenger Cabins
piece: peacock_clasp
mechanic: locked route / ticket or disguise / item swap
```

Lady Genevieve Croft is a British socialite who collects beautiful things for status. She bought the central gold-and-emerald peacock clasp and wears it as a brooch.

Tommy must bypass the Ticket Inspector using a First-Class Ticket or Conductor’s Disguise, sneak into her cabin while she is at dinner, and swap the real brooch with a fake from his uncle’s shop.

### Target 3: The Actress

```text
id: npc_madame_camille_rousseau
name: Madame Camille Rousseau
category: NPC Archetype / Target Character
trainLocation: Lounge / Bar Car
piece: front_title_page
mechanic: dialogue / favour / public hand-off
```

Madame Camille Rousseau is a glamorous French stage actress who attended the auction to study the wealthy collectors. She bought the front title page, embedded with gold leaf.

She is too observant for normal sneaking. Tommy must find her lost luggage tag or perform a favour elsewhere on the train. If successful, she slips him the page inside a folded newspaper during a tense public hand-off while the Trackers pass nearby.

### Future Expansion Target: The Occult Scholar

```text
id: npc_professor_alistair_finch
name: Professor Alistair Finch
category: NPC Archetype / Target Character
trainLocation: Sleeper Car
piece: illuminated_pages
mechanic: puzzle-lock / hidden room / journal clue
status: future expansion
```

Professor Finch is an eccentric Oxford academic who wants the poetry and esoteric symbolism, not the jewels. His scene would demonstrate trunk puzzle-lock logic and hidden clues from Archibald’s journal.

### Future Expansion Target: The Smuggler

```text
id: npc_maximilian_roth
name: Maximilian Roth
category: NPC Archetype / Target Character
trainLocation: Baggage Car / Private Carriage
piece: back_cover
mechanic: high-danger stealth / safe lock / guarded route
status: future expansion
```

Maximilian Roth is a wealthy industrialist who buys stolen art to launder money. His scene would demonstrate a harder stealth maze, guard patrols, tunnel darkness timing, and safe lock interaction.

## Starter Scope Decision

Use **three active targets** for the first Artifex Adventures template:

```text
1. Silas Vance — Dining Car — distraction / pickup.
2. Lady Genevieve Croft — First-Class Cabins — locked route / disguise or ticket / item swap.
3. Madame Camille Rousseau — Lounge Car — dialogue favour / hand-off.
```

Keep Finch and Roth as expansion examples unless the project intentionally grows.

## Train Structure

The train is the compact game world.

It is travelling from London to Vienna, which gives the story scale, but most gameplay happens inside reusable train cars.

City stops can be used as story-state changes rather than full explorable city scenes.

Possible stops:

```text
London Departure — intro and boarding.
Calais / Channel crossing — first train state change.
Paris approach — new passengers and dining car shift.
German crossing — more patrol danger.
Vienna arrival — ending screen / ransom drop.
```

## Core Locations

### Title / Intro Screen: Ransacked London Antique Shop

The opening screen or intro scene. Archibald has been murdered, the shop is torn apart, and Tommy finds the first clue.

### Depot: Train Compartment 4B

Tommy’s booked compartment. This is the safe hub where he can read Archibald’s journal, inspect postcards, review inventory, and assemble the recovered fragments.

### Junction: Dining Car

A public social area with passengers, staff, and target clues. It connects to multiple routes and can change state as the journey progresses.

### Travel Route: Passenger Corridor

A reusable stealth/travel route connecting train cars. Trackers patrol the corridor. If Tommy is spotted, the scene resets to the last checkpoint.

### Locked Route: First-Class Door / Ticket Inspector

The route into the First-Class Cabins is blocked by a strict Ticket Inspector. Tommy needs a First-Class Ticket or a Conductor’s Disguise.

### Branch: Baggage Car

A dangerous optional area used for luggage searching, the Uncle’s Pocket Watch side quest, or later Roth expansion content.

### Social Target Scene: Lounge / Bar Car

A dialogue-heavy scene for Madame Camille Rousseau, public hand-off, and social stealth.

### Ending Screen: Vienna Station Clocktower

The victory endpoint. Tommy delivers the reconstructed Great Omar pieces or ransom bundle, triggering Evelyn’s release and the final escape.

## Flatplan Draft

```text
Title Screen / Ransacked Antique Shop
  |
  v
Train Compartment 4B [Depot]
  |
  v
Passenger Corridor [Travel Route]
  |
  v
Dining Car [Junction]
  |\
  | \__ Optional Branch: Baggage Car / Uncle's Pocket Watch
  |
  |--> Lounge / Bar Car [Camille Target]
  |
  |--> First-Class Door [Locked Route / Ticket Inspector]
          |
          v
      First-Class Cabins [Lady Croft Target]
  |
  v
Return to Compartment 4B / Assemble Fragments
  |
  v
Vienna Station Clocktower [Ending Screen]
```

## Station / Node Draft

### Screen: Title Screen / Ransacked Antique Shop

```text
id: screen_title_antique_shop
kind: Screen
function: Start Game loads Train Compartment 4B or intro transition.
```

Demonstrates title screen layout, intro story setup, and start screen assignment.

### Depot: Train Compartment 4B

```text
id: station_compartment_4b
kind: Depot
linkedSceneId: scene_compartment_4b
```

The central safe location. Used for journal, postcards, inventory review, clue updates, and fragment assembly.

### Travel Route: Passenger Corridor

```text
id: station_passenger_corridor
kind: Station / Route Scene
linkedSceneId: scene_passenger_corridor
```

Demonstrates stealth traversal, patrolling Trackers, and caught/reset state.

### Junction: Dining Car

```text
id: station_dining_car
kind: Junction
linkedSceneId: scene_dining_car
```

Connects to targets, optional branch, and locked first-class route. Also contains Silas Vance.

### Waypoint / Marker: Postcard Table

```text
id: waypoint_postcard_table
kind: Waypoint / Marker
linkedObjectId: marker_postcard_table
```

A placed Marker in Compartment 4B. Opens the postcard/journal clue view.

### Locked Route: First-Class Door

```text
id: route_gate_first_class_door
kind: Route Gate
condition: has_item:first_class_ticket OR has_item:conductors_disguise
```

Demonstrates item-gated route logic.

### Branch: Baggage Car

```text
id: branch_baggage_car
kind: Branch / Side Quest Station
linkedSceneId: scene_baggage_car
```

Optional side area. Can contain the Uncle’s Pocket Watch and future Roth content.

### Target Scene: Lounge / Bar Car

```text
id: station_lounge_car
kind: Station
linkedSceneId: scene_lounge_car
```

Dialogue/favour scene for Madame Camille Rousseau.

### Target Scene: First-Class Cabins

```text
id: station_first_class_cabins
kind: Station
linkedSceneId: scene_first_class_cabins
```

Locked area for Lady Genevieve Croft and the brooch swap.

### Screen: Vienna Station Clocktower

```text
id: screen_vienna_clocktower_ending
kind: Screen
function: victory / ending screen
```

Demonstrates completed game endpoint.

## Main Quest Draft

```text
id: q_main_great_omar_ransom
name: The Great Omar Ransom
kind: Quest
objective: Recover enough Great Omar fragments to ransom Evelyn Hastings before the train reaches Vienna.
startCondition: game_started
completionCondition: flag_true:evelyn_released
```

### Main Quest Steps

1. Start Game from the Ransacked Antique Shop title/intro screen.
2. Tommy boards the train and reaches Compartment 4B.
3. Tommy reads Archibald’s journal and finds the postcards.
4. The first postcard identifies Silas Vance in the Dining Car.
5. Tommy sneaks through the Passenger Corridor.
6. Tommy creates a distraction in the Dining Car and obtains the ruby cluster.
7. Tommy obtains the route item needed to access First-Class, such as a First-Class Ticket or Conductor’s Disguise.
8. Tommy enters the First-Class Cabins and swaps Lady Croft’s peacock clasp.
9. Tommy helps Madame Camille Rousseau in the Lounge Car and receives the title page.
10. Tommy returns to Compartment 4B and assembles the ransom bundle.
11. The final route to Vienna Clocktower unlocks.
12. Tommy completes the drop and Evelyn is released.

### Main Quest Flags

```text
intro_seen
archibald_journal_found
postcards_found
main_quest_started
silas_identified
ruby_cluster_collected
first_class_route_unlocked
lady_croft_piece_collected
camille_favour_started
camille_page_collected
great_omar_bundle_ready
vienna_drop_unlocked
evelyn_released
q_main_great_omar_ransom_complete
```

### Main Quest Rewards / Unlocks

```text
unlock: screen_vienna_clocktower_ending
unlock: template_complete_badge
reward: victory_state
```

## Side Quest / Branch Draft

```text
id: q_side_uncle_pocket_watch
name: The Uncle's Pocket Watch
kind: Side Quest / Branch
objective: Recover Archibald Artifex’s stolen pocket watch from the Baggage Car.
startCondition: flag_true:archibald_journal_found
completionCondition: has_item:item_archibald_pocket_watch
```

### Side Quest Purpose

This demonstrates optional Branch logic without changing the main ending.

### Side Quest Steps

1. Tommy finds a journal note mentioning Archibald’s pocket watch.
2. The Baggage Car branch becomes available.
3. Tommy sneaks into the Baggage Car.
4. Tommy searches mobster luggage.
5. Tommy recovers Archibald’s pocket watch.
6. A secret lore entry unlocks about the Titanic switch and Archibald’s role.

### Side Quest Flags

```text
side_quest_started_pocket_watch
baggage_car_unlocked
pocket_watch_hint_found
archibald_pocket_watch_collected
q_side_uncle_pocket_watch_complete
```

### Side Quest Rewards

```text
reward: lore_entry_titanic_switch
reward: optional_completion_marker
```

## Core Objects / Archetypes

### Postcard Clues

```text
id: item_postcard_set
name: Postcard Set
category: Item Archetype / Clue Object
```

Used in the journal/clue UI. Each postcard points to a passenger or train car.

### Archibald’s Journal

```text
id: item_archibald_journal
name: Archibald’s Journal
category: Item Archetype / Journal Object
```

Stores clues, target notes, and puzzle hints.

### Ruby Cluster

```text
id: item_ruby_cluster
name: Ruby Cluster
category: Quest Object Archetype
owner: npc_silas_vance
```

Main Great Omar fragment from Silas Vance.

### Peacock Clasp

```text
id: item_peacock_clasp
name: Peacock Clasp
category: Quest Object Archetype
owner: npc_lady_genevieve_croft
```

Main Great Omar fragment from Lady Croft.

### Title Page

```text
id: item_front_title_page
name: Front Title Page
category: Quest Object Archetype
owner: npc_madame_camille_rousseau
```

Main Great Omar fragment from Madame Camille Rousseau.

### First-Class Ticket

```text
id: item_first_class_ticket
name: First-Class Ticket
category: Key Item Archetype
```

Unlocks the first-class route if used as the chosen first version gate solution.

### Conductor’s Disguise

```text
id: item_conductors_disguise
name: Conductor’s Disguise
category: Key Item Archetype / Disguise Item
```

Alternate locked-route solution. This may be future logic if the first version supports only one route condition.

### Fake Brooch

```text
id: item_fake_brooch
name: Fake Brooch
category: Quest Object Archetype
```

Used to swap Lady Croft’s real peacock clasp.

### Archibald’s Pocket Watch

```text
id: item_archibald_pocket_watch
name: Archibald’s Pocket Watch
category: Optional Quest Object Archetype
```

Side Quest reward found in the Baggage Car.

### Tracker Sightline

```text
id: hazard_tracker_sightline
name: Tracker Sightline
category: Enemy / Hazard Archetype
```

Defines detection zones for stealth scenes. If Tommy enters the active sightline, the caught/reset state triggers.

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
screens/title_antique_shop.json
screens/vienna_clocktower_ending.json
scenes/compartment_4b.json
scenes/passenger_corridor.json
scenes/dining_car.json
scenes/lounge_car.json
scenes/first_class_cabins.json
scenes/baggage_car.json
dialogue/archibald_journal_entries.json
dialogue/silas_vance_dialogue.json
dialogue/lady_croft_dialogue.json
dialogue/camille_rousseau_dialogue.json
map/train_route_projection.json
```

These should be based on the generic templates in:

```text
artifex/templates/
```

## Module Demonstration Checklist

### Runtime Engine

Artifex Adventures demonstrates the Runtime Engine by being playable from title screen to ending through project data.

### Scene Editor

Demonstrated by title/intro screen, Compartment 4B Depot, Passenger Corridor travel/stealth route, Dining Car Junction, optional Baggage Car Branch, Lounge dialogue scene, First-Class locked route scene, and Vienna ending screen.

### Project Editor

Demonstrated by Flatplan structure, Stations, Depot, Junction, Waypoint, Routes, locked route, optional Branch, and ending connection.

### Creation Guide

Demonstrated by a template completion path: replace title, define hero, connect route, create quest, place object, test path, build game.

### Object Library

Demonstrated by reusable Archetypes and placed Instances: hero, kidnapped NPC/story goal, murdered mentor, villain, target NPCs, item fragments, key item, disguise item, fake swap item, Tracker enemy, sightline hazard, Marker, prop, and optional quest object.

### Quest Builder

Demonstrated by one main Quest, one Side Quest / Branch, flags, conditions, rewards, unlocks, and next-step logic.

### Playtest

Demonstrated by play from start, play from Depot, test selected Route, test main Quest, test Side Quest, test with fake items/flags, and caught/reset stealth testing.

### Build Game

Demonstrated by a tiny export-ready browser game with valid project files and a complete path from start to ending.

## Open Design Questions

1. Should the game title be **Artifex Adventures: The Great Omar**, **Tommy Artifex and the Great Omar**, or something else?
2. Should the first version use First-Class Ticket only, Conductor’s Disguise only, or support both as alternate route conditions?
3. Should Gabriel Wells appear directly, or remain off-screen while Victor Mercer and the Trackers act as the visible threat?
4. Should the template include three active targets only, or expand to include Professor Finch and Maximilian Roth later?
5. Should the train stops be actual small scenes or only story-state changes?
6. Should the caught state reset the whole scene or return Tommy to Compartment 4B?
7. Should the Uncle’s Pocket Watch side quest give only lore, or also a small mechanical advantage?

## Current Progress Log

### 2026-05-22

- Created the first working design document for Artifex Adventures.
- Replaced the original generic fantasy placeholder concept with the 1912 Great Omar train thriller premise.
- Locked current hero as **Thomas “Tommy” Artifex**.
- Locked current kidnapped girlfriend as **Evelyn Hastings**.
- Locked uncle as **Archibald Artifex**.
- Established Gabriel Wells as the vengeful rare book dealer.
- Established Victor “The Rook” Mercer and the Trackers as the active criminal threat.
- Established the train from London to Vienna as the compact game world.
- Drafted the Widener Conspiracy backstory.
- Drafted five possible target passengers, with three active starter-scope targets and two future expansion targets.
- Drafted main Flatplan structure with Depot, Junction, Waypoint, Branch, Route, locked route, and Ending.
- Drafted one main Quest and one Side Quest / Branch.
- Drafted first Object Library Archetype list for the new concept.
- Added initial scene/screen/data needs list.
