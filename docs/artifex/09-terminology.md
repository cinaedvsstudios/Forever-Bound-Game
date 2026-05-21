# Artifex Working Terminology

## Format

Terminology should use this format:

**NAME**
*(synonyms / related terms / possible replacement words)*
Explanation.

If the name is not locked yet, mark it clearly:

**NAME — not locked yet**
*(synonyms / related terms / possible replacement words)*
Explanation.

Do not remove words from the synonym lists, even if they are not chosen as the final official term. Preserve alternatives for later comparison.

## Terms

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
