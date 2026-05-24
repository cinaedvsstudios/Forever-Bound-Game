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
The full game-building system. Artifex includes the Runtime Engine, Scene Editor, Project Editor, Creation Guide, Advanced Object Library, Quest Builder, Playtest tools, Build Game/export process, and specialist utility tools such as the FX Editor.

**Runtime Engine**
*(game engine / playable engine / runtime)*
The playable browser game engine underneath the editor. It reads the project files and runs the finished game.

**Artifex Adventures**
*(template game / starter game / sample game)*
The default starter template game. It contains one simple example of every major system so users can duplicate, replace, and expand working examples.

**Project**
*(game project / build project)*
One complete game being built with Artifex. A project includes scenes, screens, objects, quests, assets, routes, settings, effects, and export data.

**Project Manifest**
*(manifest / flow graph / stitcher)*
The central technical file that lists what belongs to the project. It defines project name, start screen, folders, scenes, quests, objects, assets, effects, and build/export settings.

**Scene Editor**
*(editor / scene board / screen designer / visual editor)*
The visual editor already being built. It edits scenes, screens, title screens, menu screens, UI layouts, backgrounds, layers, screen objects, coordinates, buttons, markers, effect placement, and basic asset placement.

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
A temporary asset, object, scene, effect, or setting used until the creator replaces it with final content.

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
The final action that gathers the Runtime Engine, project files, assets, scenes, quests, settings, effects, and export data into a playable browser game.

## FX Editor / Effects Terms

**FX Editor**
*(effects editor / CG effects editor / visual effects editor / effects tool)*
The Artifex utility for creating, previewing, configuring, saving, reusing, placing, timing, and exporting visual effects. The FX Editor creates effects; the Effects Library stores them; the Scene Editor places them; the Runtime Engine plays them.

**Effects Library**
*(FX library / CG effects library / effect preset library)*
The reusable library of saved visual effects. It stores FX Archetypes, presets, textures, particle settings, sprite-sheet effect settings, screen overlays, transitions, and other effect definitions.

**FX Archetype**
*(effect archetype / effect blueprint / effect prefab / reusable effect definition / FX preset)*
A reusable saved effect definition. Example: green corruption smoke, purple Songspell aura, blue Aetheris glow, portal shimmer, audio-reactive vignette, or firelight flicker.

**FX Instance**
*(effect instance / placed effect / scene effect / effect copy)*
A specific use of an FX Archetype inside a scene, object, UI layer, transition, route, or plate project. The instance stores placement, layer, timing, trigger, attachment, and overrides without duplicating the whole archetype.

**FX Runtime**
*(effects runtime / effect renderer / runtime effects engine)*
The part of the Runtime Engine that loads, updates, draws, starts, stops, loops, and destroys effects during gameplay or preview. It reads FX Archetypes and FX Instances from data.

**FX Driver**
*(driver / modifier / dynamic input / value source / animation driver)*
A value source that changes an effect over time. Examples include elapsed time, keyframes, audio bass, audio mids, audio treble, beat pulse, music energy, corruption level, danger level, quest flag, world state, cooldown state, object state, player health, or attached entity movement.

**Emitter**
*(particle emitter / spawn point / spawn area / source)*
The source that creates or positions particles or generated effects. Emitters may be points, lines, areas, paths, screen-space regions, UI elements, objects, characters, or manually tracked points.

**Effect Layer**
*(FX layer / draw layer / visual depth / overlay layer)*
The visual layer where an effect is drawn. Examples include behind characters, in front of characters, foreground fog, screen overlay, UI overlay, transition overlay, and export-only plate layer.

**Game FX Mode**
*(runtime FX mode / scene FX mode / game effects workflow)*
The FX Editor workflow for creating reusable effects that are saved as FX Archetypes and used by the Runtime Engine inside playable games.

**Plate FX Mode**
*(FX plate workflow / video reference workflow / production FX workflow / slated effect idea)*
The FX Editor workflow for uploading a reference video, timing and animating library effects over that video, then exporting only the transparent effect layer for use in an external video editor. The earlier rough idea name was “slated effect,” but FX Plate / Plate FX is clearer.

**FX Plate**
*(plate / reference plate / timing plate / video plate)*
A temporary reference-video workspace used for timing, positioning, tracking, and animating effects. The plate is a guide and should not be included in the normal effect-only export.

**Reference Video**
*(guide video / timing reference / temporary footage / plate footage)*
The uploaded video used as a visual guide in Plate FX Mode. It lets the creator pause, scrub, step frame-by-frame, and align effects. It is not stored as part of the normal effect definition and is not included in the normal FX Pass export.

**FX Plate Project**
*(plate project / effect plate file / production FX project)*
The saved editable project file for Plate FX Mode. It stores reference video metadata, timeline settings, export settings, used FX Archetypes, FX Instances, keyframes, drivers, and notes. It should not normally store the actual video file.

**FX Pass**
*(effect pass / transparent effect layer / overlay pass / production effect export)*
The exported effect-only layer produced from Plate FX Mode. It can be imported into a video editor and composited over final footage.

**Transparent FX Pass**
*(alpha FX pass / transparent overlay / alpha effect export)*
An FX Pass with transparency/alpha, usually exported as a PNG sequence, WebM with alpha, animated WebP, or another transparent-capable format.

**Preview Export**
*(burned preview / reference preview / review export)*
A temporary export that includes the reference video and effects together so timing can be checked or shared. It is not the normal final compositing output.

**Composite Target**
*(final footage / target footage / edit footage)*
The final high-quality footage in an external video editor where the FX Pass will be placed, blended, filtered, and composited.

**Keyframe**
*(animation point / timeline point / property key)*
A saved value at a specific time in Plate FX Mode or animation editing. Keyframes can control position, scale, rotation, opacity, intensity, particle emission, colour, distortion, or other effect properties.

**Audio-Reactive FX**
*(audio-driven effect / EQ-driven effect / music-reactive effect / beat-reactive effect)*
An effect whose properties respond to audio analysis values such as bass, mids, treble, beat pulse, or music energy. Example: a vignette that changes intensity based on the EQ of the music playing.

**Screen Overlay FX**
*(overlay effect / full-screen effect / camera effect)*
An effect drawn across the whole screen or camera view, such as vignette, colour tint, blur, flash, darkness, dream-state overlay, corruption pulse, or cooldown grey overlay.

**Particle FX**
*(particle effect / generated particles / particle system)*
An effect generated from many small particles, such as smoke, dust, sparks, embers, magical glitter, Aetheris motes, Sekhemra spores, floating pollen, rain, or snow.

**Sprite Sheet FX**
*(frame effect / animated effect / sprite effect)*
A frame-based visual effect stored as a sprite sheet or image sequence, such as fireball, portal loop, candle flicker, impact burst, magic ring, lightning pulse, or explosion flash.

**Glow / Aura FX**
*(glow effect / aura effect / light pulse)*
An effect used to make an object, character, relic, UI element, or environment appear magical, active, possessed, holy, dangerous, or charged.

**Transition FX**
*(transition effect / scene transition / route transition)*
An effect used when moving between scenes, screens, routes, or states, such as directional blur, zoom blur, fade, magical dissolve, doorway transition, tunnel transition, or map transition.
