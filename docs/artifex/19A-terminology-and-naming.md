# Terminology and Naming Reference

Status: Active reference document during documentation consolidation  
Reference role: controlled terminology, naming alternatives and wording decisions  
Source evidence: `docs/artifex/09-terminology.md` and `docs/artifex/10-naming-brainstorm.md`  
Related documents: all module/service specifications and `docs/artifex/1A-project-file-contracts.md`

## Purpose

This reference preserves Artifex naming decisions and alternative wording.

It is not a module specification and not a task list. It exists because terminology and naming alternatives are useful design evidence and should not be lost when old non-`A` documents are archived.

When a term is final, use it consistently in new user-facing documentation. When a term is not locked, keep the alternatives for later comparison.

Do not delete possible terms too quickly. Preserve useful alternatives unless a decision has deliberately rejected them.

## Current Official / Preferred Terms

| Preferred term | Related / previous terms | Meaning |
|---|---|---|
| Artifex | game builder, editor, engine toolkit | The full reusable game-building system. |
| Project | game project, build project | One complete game being built with Artifex. |
| Creation Guide | wizard, timeline, checklist, roadmap, setup guide | Guided setup and project-progress module. |
| Project Editor | Project Manager, structure editor, Flatplan editor | High-level game-structure and route/Flatplan editor. Project Editor is the official new user-facing name. |
| Scene Editor | visual editor, screen designer | Visual scene/screen authoring module. |
| Quest Builder | progression manager, objective builder | Quest, side quest, branch, flag, condition, reward and progression authoring module. |
| Archetype Object Creator | Advanced Object Library, Object Library, Object Forge | Reusable non-FX object archetype authoring module. |
| Asset Library | file library, asset browser, asset picker | Final registered `asset_` ownership/catalogue layer. |
| Effect Editor | FX Editor, effects editor | Reusable visual effect authoring module. |
| Puzzle Creator | puzzle editor | Self-contained puzzle/challenge authoring module. |
| Sound Generator / Sound Library | Sound Archetype Generator, sound creator | Shared generated/imported audio workflow over registered `asset_` records. |
| Runtime Engine | playable engine, runtime | Playable browser game runtime. |
| Playtest | test play, route test | Shared preview/test workflow. |
| Build Game | compile, export, publish, package | Final packaging/build-output step. |
| Template Game | Artifex Adventures, starter game, reference game | Populated connected reference project proving cross-app flow. |
| Blank Starter Project | starter structure, empty project | Empty valid project foundation created by Creation Guide. |
| Artifacts Adventures | Forever Bound game project | Real production project authored through Artifex after the reference flow is proven. |

## Structure and Route Terms

| Term | Related words | Meaning |
|---|---|---|
| Flatplan | flow graph, structure map, project map | Whole-game planning view. |
| Station — not locked | station, node, stop, stage, story point, location | A visual scene/screen placed into the Flatplan and given game/progression meaning. |
| Depot | hub, central station, base, nexus | Major Station connecting many routes. |
| Junction | split, merge point, decision point | A Station where routes split, merge or redirect. |
| Waypoint | marker, checkpoint, map point, travel point | Navigation/map/travel point. |
| Marker | waypoint, trigger marker, placed marker | General placed trigger object inside a scene. |
| Route | path, connection, link | Connection between Stations. |
| Branch | side quest, optional route, side line | Optional offshoot from the main Quest. |
| Side Quest | branch, optional quest | Player-facing optional quest. |
| Stitcher — not locked | flow graph, connector, route builder, threader, pathmaker, linker | Logic system/form UI that connects Stations through Routes. |
| Manifest | project manifest, index, flow graph | Technical listing of project-owned files and links. |

## Object and Asset Terms

| Term | Related words | Meaning |
|---|---|---|
| Archetype | prefab, blueprint | Reusable definition of a game thing. |
| Instance | placed copy, object instance, scene copy | Specific placed use of an archetype. |
| Actor — not locked | actor, entity | Thing that can act or be acted upon. Useful technically but maybe not friendly UI. |
| Entity — not locked | actor, entity | Technical active thing in the game world. |
| Placeholder | dummy, mockup, temporary object | Temporary asset/object/scene/effect/setting used until final content exists. |
| Asset Group | character group, animation set, portrait set | Related final assets grouped for browsing/selection. |

## Quest and Logic Terms

| Term | Related words | Meaning |
|---|---|---|
| Quest | line, mainline, objective path | Main structured objective path. Quest is preferred over Line. |
| Flag | state, boolean, progress flag | Saved true/false state. |
| Condition | rule, requirement, gate condition | Rule that checks whether something can happen. |
| Reward | prize, unlock reward | Something granted after gameplay/progression. |
| Unlock | opened path, released content | Change that makes content available. |
| Calling | quest prompt, objective call | Story-facing prompt or request that initiates/frames a Quest. |
| Capra feedback | helper response, goat response | Capra-facing puzzle/quest feedback where used. |

## FX / Effects Terms

| Term | Related words | Meaning |
|---|---|---|
| FX Archetype | effect archetype, effect blueprint, FX preset | Reusable saved effect definition. |
| FX Instance | placed effect, effect copy | Specific use of an FX Archetype in a scene/object/UI/transition. |
| FX Runtime | effects runtime, effect renderer | Runtime layer that plays effects. |
| FX Driver | modifier, dynamic input, value source | Value source changing an effect over time. |
| Emitter | spawn point, spawn area, source | Source that creates or positions particles/effects. |
| Effect Layer | FX layer, draw layer | Visual layer where an effect is drawn. |
| Game FX Mode | runtime FX mode, scene FX mode | Workflow for game/runtime visual effects. |
| Plate FX Mode | production FX workflow, reference video workflow | Workflow for timing effects over a temporary reference plate. |
| FX Plate | plate, reference plate | Temporary reference-video workspace. |
| FX Pass | transparent effect layer, overlay pass | Exported effect-only layer. |
| Preview Export | burned preview, reference preview | Temporary export with reference video plus effects for review. |

## Publishing / Magazine Terms Kept for Inspiration

Possible words:

```text
Flatplan
spread
page plan
dummy
masthead
folio
layout
issue
proof
galley
paste-up
run sheet
```

Useful notes:

- Flatplan works well for the whole-game structure view.
- Dummy can mean a mock-up, but may sound too rough for UI.
- Proof may be useful for testing/previewing.
- Run sheet may be useful for ordered production steps or build sequences.
- Masthead may fit branding/project identity, but may be too publishing-specific.

## Game Development Terms Kept for Inspiration

Possible words:

```text
scene
level
world
prefab
blueprint
actor
entity
trigger
state
flow graph
build
event
object
component
system
```

Useful notes:

- Scene is already correct for visual scenes.
- Prefab, Blueprint and Archetype all refer to reusable definitions.
- Actor and Entity are technically useful but may be too engine-like for user-facing UI.
- Trigger is good for invisible logic zones.
- State is useful for save/progression logic.
- Flow Graph is useful for visual logic connections, but may sound technical.
- Build is good for the final exported game.

## Transport / Logistics Terms Kept for Inspiration

Possible words:

```text
route
line
branch
station
junction
terminal
hub
depot
waypoint
manifest
itinerary
dispatch
network
interchange
transfer
```

Useful notes:

- Route is strong for connections between Stations/Nodes.
- Branch is strong for optional side paths or side quests.
- Station may work as a better word than Node, but is not locked yet.
- Junction is good for split/merge points.
- Depot is currently preferred as the replacement for Hub.
- Waypoint is good for navigation points or map markers.
- Manifest is strong for the project index because it lists what belongs to the project.
- Terminal could describe an ending point.
- Interchange could describe a major junction where several routes meet.
- Dispatch may work for build/export, but is less clear than Build Game.

## Current Unresolved Naming Groups

These need later decision or continued consistency checks:

```text
Station / Node / Depot / Actor / Entity / Dummy
Stitcher / Flow Graph / Manifest / Route Builder
Advanced Object Library / Archetype Object Creator
Archetype / Prefab / Blueprint
Actor / Entity / Dummy
Marker / Waypoint
Build Game / Compile / Export / Publish / Package
```

## Source Classification

`docs/artifex/09-terminology.md` and `docs/artifex/10-naming-brainstorm.md` are consolidated into this reference. After this file is accepted, both old files can become archive/source evidence rather than active documents.
