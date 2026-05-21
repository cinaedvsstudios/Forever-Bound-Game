# Future Game Engine Plan

## Conversation Record

This document records the planning discussion for turning Artifex into a reusable game-building system.

## Core Direction

Yes, this sounds like it would work, and it is probably the cleaner solution.

The important shift is this: **Artifex should not be the Forever Bound editor.** It should be a starter game template plus a visual editor plus a project wizard. Forever Bound then becomes one separate project built with Artifex, not the thing hardcoded into it.

Forever Bound should be treated as a separate finished example made with Artifex, not bundled inside Artifex. That keeps Artifex clean, reusable, and not locked to one story world.

## Template Game

The default template game should be called **Artifex Adventures**.

Artifex Adventures should be very simple. It should contain one example of every important game system so a new creator can see how each thing works, duplicate it, rename it, replace its assets, and build outward from it.

The template should include:

- one hero
- one villain
- one title screen
- one map or structure view
- one playable scene
- one travel route
- one dialogue example
- one item
- one enemy
- one marker / waypoint
- one quest
- one side quest / branch example if practical
- one ending or victory screen
- one example of each core interaction system

The goal is not to make users build an engine from nothing. The engine already exists inside the template/runtime. Users mostly replace, duplicate, connect, and expand working examples.

## Main Architecture

Artifex should consist of:

1. A reusable Runtime Engine.
2. A working template game called Artifex Adventures.
3. A Scene Editor.
4. A Project Editor.
5. A Creation Guide.
6. An Advanced Object Library.
7. A Quest Builder.
8. Playtest tools.
9. A Build Game / Compile / Export process.

## Scene Editor

The Scene Editor is the editor that already exists.

It includes what might otherwise have been called:

- editor
- scene board
- screen designer
- visual editor

The Scene Editor edits visual scenes and screens. This includes playable scenes, title screens, menu screens, UI layouts, backgrounds, layers, objects, buttons, markers, coordinates, and basic asset placement.

The title screen and game screens branch across multiple areas. The Scene Editor creates their visual layout, but the Project Editor and Stitcher/Route logic give them functional meaning.

Example: the Scene Editor can design the title screen visually, but the Project Editor must define what the Start Game button actually loads.

The Scene Editor already contains a basic asset library. That basic asset library is for placing files such as images and audio into scenes/screens.

## Project Editor

The Project Editor is the higher-level game-structure editor.

It should contain:

- Project Manifest
- Flatplan
- Stitcher / route connection logic
- game structure
- start screen assignment
- route logic
- player map projection if needed

The Project Editor is where separate scenes become a connected game.

It answers questions such as:

- What is the game called?
- What is the starting screen?
- Which screens and scenes belong to the project?
- What happens when Start Game is clicked?
- Which routes connect which scenes?
- What conditions unlock or block a route?
- Which quests use which scenes?
- Which files are required for the game to build?

## Project Manifest

The Project Manifest is the central file that tells Artifex what belongs to a project.

Likely filename: `project.json`.

It should include:

- project ID
- game title
- creator/studio name
- version
- template origin
- start screen
- enabled modules
- main folders
- scene index
- screen index
- quest data
- object data
- asset data
- export/build settings

## Flatplan

The Flatplan is the creator-facing structure view of the whole game.

It is not the player’s in-game map.

It should be visualized like a train map rather than a straight linear timeline. It can show a main quest path, optional branches, side quests, dead ends, loops, depots, junctions, waypoints, locked areas, hidden areas, and endings.

The Flatplan should show how all major game parts connect.

## Stitcher / Connection Logic

The Stitcher is the logic tool that connects parts of the Flatplan together.

It defines what happens when one node/station/scene connects to another.

Examples:

- Start Game button loads the first scene.
- Door exit loads a house interior.
- Forest endpoint loads the bridge.
- Map marker opens a travel route.
- Quest complete unlocks a new route.
- Key collected unlocks a door.
- Villain defeated loads the ending screen.

The name Stitcher is not locked yet. Other possible terms include flow graph, manifest, connector, route builder, threader, pathmaker, and linker.

## Creation Guide

The Creation Guide is the combined wizard, timeline, checklist, and health-check system.

The Creation Guide helps the user make a new project without getting lost.

It should:

- guide first project setup
- create a project from Artifex Adventures
- show a recommended build order
- show milestones
- track completion percentages
- warn about missing or broken pieces
- show what still needs to be changed or confirmed

The tasks inside the Creation Guide are called **Milestones**.

A milestone reaches 100% when its required template elements have either been changed from the default or deliberately confirmed by the creator.

The percentage should not require a fixed number of scenes. It should measure whether the user has handled each required starter category at least once.

Example milestones:

- Project name set.
- Title screen reviewed.
- Start button connected.
- Main character reviewed.
- First scene reviewed.
- First scene has an exit.
- At least one quest exists.
- First quest has a completion condition.
- Required asset paths are valid.
- Flatplan has a playable route from start to at least one endpoint.

## Advanced Object Library

Advanced Object Library is a placeholder name and is not locked yet.

This module is separate from the basic asset library inside the Scene Editor.

The Scene Editor’s basic asset library is for choosing and placing files.

The Advanced Object Library defines reusable game things and their behaviour.

It should allow the creator to define something once and reuse it many times.

Examples:

- define a character once, then place that character in multiple scenes
- define a key once, then use it in different locks or quests
- define an enemy type once, then place copies in different scenes
- define a marker type once, then place markers around the game
- define a reusable object once, then duplicate it wherever needed

Possible replacement names:

- Object Library
- Archetype Library
- Blueprint Library
- Prefab Library
- Object Forge
- Component Library
- Game Object Library
- Object Workshop

## Quest Builder

The Quest Builder is the overarching story/progression module.

It should include what might otherwise be called the Flag Manager and Condition Builder.

The Quest Builder manages:

- quests
- side quests / branches
- flags
- conditions
- rewards
- unlocks
- progression logic
- completion states

A quest can use scenes, stations/nodes, routes, characters, objects, dialogue, and conditions.

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

Flags and conditions should live inside or under the Quest Builder because they are mostly used for progression.

Examples:

- `key_collected = true`
- `villain_defeated = true`
- `door_unlocked = true`
- `intro_seen = true`
- `side_quest_started = true`
- `has_item: bronze_key`
- `quest_complete: q01_find_key`
- `scene_visited: old_bridge`

## Player Map / Game Map

The player-facing map may be related to the Flatplan, but it is not exactly the same thing.

The Flatplan is the creator’s complete structure view.

The Player Map is what the player sees inside the game.

The Player Map may be generated from selected parts of the Flatplan. Some nodes/stations may appear on the Player Map, while hidden or logic-only nodes may not appear until unlocked.

This may live inside the Project Editor rather than being a separate module.

## Playtest

Playtest lets the creator test the project directly inside Artifex.

It should support:

- play from start
- play selected screen
- play selected scene
- play selected Flatplan node/station
- play selected quest
- play route from point A to point B
- test with fake flags/items enabled
- reset playtest state

Playtest should probably live primarily inside the Project Editor/Flatplan area, because testing is most useful when checking connected pieces.

The Scene Editor should still have a smaller **Preview Scene** button.

The Quest Builder may also have a **Test Quest** option.

## Build Game / Compile / Export

The final packaging step should probably be called **Build Game** as the user-facing button.

Other possible words:

- compile
- export
- publish
- package

Build Game should gather the Runtime Engine, project data, scenes, screens, assets, quests, audio, and settings into a playable browser game.

Before building, it should check:

- are all required files present?
- is the start screen valid?
- are all referenced assets available?
- are there broken scene links?
- are there invalid quest references?
- can the game be played from start to at least one endpoint?

## Backup / Snapshot

Backup/snapshot is not a first-priority module.

A later simple option such as **Export Project Backup ZIP** may be useful, but it does not need to be part of the first version.

The creator can also manage backups through normal file copies or version control.

## Current Simplified Module List

The current simplified Artifex module list is:

1. Runtime Engine.
2. Scene Editor.
3. Project Editor.
4. Creation Guide.
5. Advanced Object Library.
6. Quest Builder.
7. Playtest.
8. Build Game.

## Working Terminology Format

Terminology should use this format:

**NAME**
*(synonyms / related terms / possible replacement words)*
Explanation.

If the name is not locked yet, mark it clearly:

**NAME — not locked yet**
*(synonyms / related terms / possible replacement words)*
Explanation.

Do not remove words from the synonym lists, even if they are not chosen as the final official term. Preserve alternatives for later comparison.

## Working Terminology List

**Artifex**
*(game builder / editor / engine toolkit)*
The full game-building system. Artifex includes the Runtime Engine, Scene Editor, Project Editor, Creation Guide, Advanced Object Library, Quest Builder, Playtest tools, and Build Game/export process.

**Runtime Engine**
*(game engine / playable engine / runtime)*
The playable browser game engine underneath the editor. It reads the project files and runs the finished game.

**Artifex Adventures**
*(template game / starter game / sample game)*
The default starter template game. It contains one simple example of every major system so users can duplicate, replace, and expand working examples.

**Project**
*(game project / build project)*
One complete game being built with Artifex. A project includes scenes, screens, objects, quests, assets, routes, settings, and export data.

**Project Manifest**
*(manifest / flow graph / stitcher)*
The central technical file that lists what belongs to the project. It defines project name, start screen, folders, scenes, quests, objects, assets, and build/export settings.

**Scene Editor**
*(editor / scene board / screen designer / visual editor)*
The visual editor already being built. It edits scenes, screens, title screens, menu screens, UI layouts, backgrounds, layers, screen objects, coordinates, buttons, markers, and basic asset placement.

**Scene**
*(visual scene / layout / screen layout)*
The visual/layout version of a game space or screen. A scene becomes more functional once it is connected to game logic in the Project Editor.

**Screen**
*(UI screen / menu screen / non-playable scene)*
A non-playable or UI-focused scene, such as title screen, options screen, credits screen, pause menu, inventory screen, profile screen, or ending screen.

**Playable Scene**
*(level area / game scene / interactive scene)*
A scene where the player can move, interact, fight, explore, collect objects, or trigger events.

**Project Editor**
*(structure editor / project structure editor / game editor)*
The high-level game-structure editor. It contains the Manifest, Flatplan, Stitcher/connection logic, routes, game flow, project structure, and possibly player-map projection.

**Flatplan**
*(flow graph / structure map / project map)*
The whole-game planning view. It should look like a train map: main quest routes, branches, optional paths, junctions, waypoints, depots, side quests, and endings.

**Station — not locked yet**
*(station / node / depot / actor / entity / dummy)*
Placeholder term for a scene that has been placed into the Flatplan and given game logic. A basic visual scene becomes a Station when it has connections, conditions, quest relevance, routes, or progression meaning.

**Depot**
*(hub / central station / base / nexus)*
A major Station that connects to many other Routes. A Depot can be a town, home base, central menu, world map area, or recurring location that many parts of the game return to.

**Junction**
*(split / merge point / decision point)*
A Station where routes split, merge, or redirect. This is useful for choice points, branching paths, alternate routes, or places where the player can choose between different next steps.

**Waypoint**
*(marker / checkpoint / map point / travel point)*
A smaller navigation point, marker, checkpoint, map point, exit point, save point, or travel trigger. A waypoint may exist inside a scene or on the Flatplan/player map.

**Marker**
*(waypoint / trigger marker / placed marker)*
A placed object inside a scene that triggers interaction, navigation, saving, travel, map access, or quest logic. Waypoint is stronger for navigation; Marker is more general for placed trigger objects.

**Route**
*(path / connection / link)*
A connection between Stations. A Route defines how the player moves from one Station to another. Routes can be open, locked, hidden, one-way, two-way, quest-gated, item-gated, optional, or part of the main Quest.

**Quest**
*(line / mainline / objective path)*
A main structured objective path through the Flatplan. A Quest can pass through multiple Stations and Routes. Quest is preferred over Line as the official term.

**Branch**
*(side quest / side line / optional route)*
An optional offshoot from the main Quest. A Branch may contain side quests, optional scenes, lore, rewards, hidden objects, extra fights, or alternative routes.

**Side Quest**
*(branch / optional quest)*
A player-facing optional quest. In the Project Editor, it may be represented structurally as a Branch.

**Stitcher — not locked yet**
*(flow graph / manifest / connector / route builder / threader / pathmaker / linker)*
The logic system that connects Stations through Routes and decides what happens when the player moves, clicks, unlocks, completes a Quest, or triggers a condition.

**Creation Guide**
*(wizard / timeline / checklist / roadmap / setup guide)*
The guided setup and project-progress system. It includes the wizard, timeline, checklist, project health checks, and milestone tracking.

**Milestone**
*(task / step / checkpoint / creation step)*
A required or recommended step inside the Creation Guide. Examples: create project, replace title screen, define hero, connect first route, create first quest, test first playable path, build game.

**Checklist**
*(task tracker / completion tracker)*
The detailed task tracker inside the Creation Guide. It shows whether each template item has been changed, confirmed, left as template default, or broken.

**Timeline**
*(build order / production path / roadmap)*
The recommended production order inside the Creation Guide. This is not the story timeline. It is the creator’s build path.

**Project Health Check**
*(validator / project check / health scan)*
The validation part of the Creation Guide. It checks for missing files, broken routes, duplicate IDs, unconnected Stations, invalid quests, missing start screen, and broken asset references.

**Advanced Object Library — not locked yet**
*(object library / archetype library / blueprint library / prefab library / object forge / component library / game object library / object workshop)*
The higher-level reusable game-object manager. This is separate from the Scene Editor’s basic asset library. It defines reusable characters, enemies, items, doors, pickups, markers, props, and object behaviour.

**Asset Library**
*(file library / asset browser / file picker)*
The basic file browser/picker inside the Scene Editor. It is used to choose images, audio, backgrounds, sprites, icons, UI panels, and other files for placement.

**Archetype — not locked yet**
*(prefab / blueprint / archetype)*
A reusable definition of a game thing. For example: Bronze Key, Locked Door, Forest Wolf, Villain, Merchant NPC, Save Marker, Health Potion. Archetype is elegant, but Blueprint may be clearer for beginners.

**Instance**
*(placed copy / object instance / scene copy)*
A specific placed copy of an Archetype. Example: Bronze Key is the Archetype; the actual key placed on the table in the forest hut is an Instance.

**Actor — not locked yet**
*(actor / entity / dummy)*
A thing that can act or be acted upon in the game. This could be a character, NPC, enemy, object, trigger, or interactive element. This may be more technical than user-facing.

**Entity — not locked yet**
*(actor / entity / dummy)*
A technical word for any active thing in the game world. Useful internally, but probably not friendly enough for visible Artifex UI.

**Dummy — not locked yet**
*(dummy / placeholder / mockup / test object)*
A temporary object used for testing. Placeholder is probably better for the UI because Dummy sounds rough.

**Placeholder**
*(dummy / mockup / temporary object)*
A temporary asset, object, scene, or setting used until the creator replaces it with final content.

**Quest Builder**
*(quest module / progression manager / objective builder)*
The module that manages quests, side quests, branches, flags, conditions, rewards, unlocks, and progression logic.

**Flag**
*(state / boolean / progress flag)*
A saved true/false state. Example: `key_collected`, `door_opened`, `villain_defeated`, `intro_seen`.

**Condition**
*(rule / requirement / gate condition)*
A rule that checks whether something can happen. Example: a Route opens only if the player has an item, completed a Quest, visited a Station, or triggered a Flag.

**Reward**
*(prize / unlock reward / quest reward)*
Something given after a Quest, Branch, battle, object interaction, or milestone. Could be item, route unlock, scene unlock, currency, lore, health, powerup, or ending access.

**Unlock**
*(opened path / released content / progression unlock)*
A change that makes a new Route, Station, item, Quest, Branch, or screen available.

**Player Map**
*(game map / in-game map / visible map)*
The in-game map shown to the player. It may be generated from selected parts of the Flatplan, but it should not show everything the creator sees.

**Map Projection**
*(player map projection / visible map layer)*
The subset of the Flatplan that becomes visible on the Player Map. Hidden Stations, secret Branches, and logic-only nodes may be excluded until unlocked.

**Playtest**
*(test play / route test / game test)*
The testing system. It lets the creator test from the start, from a selected Station, from a selected scene, from a selected Quest, or along a selected Route.

**Preview Scene**
*(scene test / local preview)*
A smaller test mode inside the Scene Editor. It tests one scene visually/functionally without needing to run the whole game.

**Build Game**
*(compile / export / publish / package)*
The final action that gathers the Runtime Engine, project files, assets, scenes, quests, and settings into a playable browser game.

## Current Transport-Style Logic

The current metaphor is:

- The Flatplan contains Stations connected by Routes.
- Some Stations are Depots.
- Some Stations are Junctions.
- Some points are Waypoints.
- A Quest is the main playable objective path through selected Stations and Routes.
- A Branch is an optional side quest/path.
- The Stitcher/Route Builder defines how those connections work.

## Terms Still Needing Better Names

The terms that still need final naming work are:

- Station / Node / Depot / Actor / Entity / Dummy
- Stitcher / Flow Graph / Manifest
- Advanced Object Library
- Archetype / Prefab / Blueprint
- Actor / Entity / Dummy
- Marker / Waypoint
- Build Game / Compile / Export / Publish / Package

## Naming Sources To Explore

Future naming discussion should look at terminology from:

### Magazine / Publishing

Possible useful words:

- Flatplan
- spread
- page plan
- dummy
- masthead
- folio
- layout
- issue
- proof
- galley
- paste-up
- run sheet

### Game Development

Possible useful words:

- scene
- level
- world
- prefab
- blueprint
- actor
- entity
- trigger
- state
- flow graph
- build
- event
- object
- component
- system

### Transport / Logistics

Possible useful words:

- route
- line
- branch
- station
- junction
- terminal
- hub
- depot
- waypoint
- manifest
- itinerary
- dispatch
- network
- interchange
- transfer

## Current Best Understanding

The best current structure is:

- Scene Editor edits visual screens and scenes.
- Project Editor manages the whole game structure.
- Flatplan shows the branching game flow.
- Stitcher defines how screens and scenes connect.
- Creation Guide guides the creator through setup and tracks milestones.
- Advanced Object Library defines reusable characters, items, enemies, props, and markers.
- Quest Builder handles objectives, flags, conditions, rewards, and progression.
- Playtest tests connected game flow.
- Build Game packages the finished playable game.

This structure keeps Artifex generic while allowing Forever Bound to remain a separate finished game made with the tool.