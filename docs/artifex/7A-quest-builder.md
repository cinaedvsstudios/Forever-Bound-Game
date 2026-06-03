# Quest Builder Specification

Status: Active module specification draft during documentation consolidation  
Owning module: Quest Builder  
Active route: `artifex/apps/quest-builder/index.html`  
Current verified implementation baseline: `Artifex Quest Builder V1.2.12` on current `main` verified 3 June 2026  
Current-main verification reference: repository state indexed at `394fc9e73b7b83297843d70e55c777c96e7bda84` for the audited Quest Builder files  
Governing universal contract: `docs/artifex/1A-project-file-contracts.md`  
Subordinate exact starter/index schema reference: `docs/artifex/19a-project-starter-file-schemas.md`  
Outstanding work source: `docs/artifex/2A-global-to-do.md`

## Purpose

Quest Builder is the Artifex story and progression authoring surface. It authors Quests and Side Quests as meaningful objective flows: objectives, progression blocks, explicit connections, internal Quest branches, conditions, flags, outcomes, rewards, unlocks, Quest-scoped dialogue/Capra feedback, and later linked saved-puzzle steps.

Quest Builder gives story/progression meaning to references from other modules. Project Editor may read public Quest outputs when wider route structure needs them, but it does not author Quest internals.

This specification owns permanent information unique to Quest Builder. Universal project-file, connected-folder, registered-asset, save-state, branding and documentation-control rules remain owned by the master contract and any confirmed shared-service specifications.

## Ownership Boundary

Quest Builder owns:

- Quest and Side Quest records;
- meaningful flow blocks and explicit connections inside a Quest or Side Quest;
- Quest-internal branching and progression sequencing;
- Quest-level conditions, flags, success/failure outcomes, rewards, unlocks and Codice update triggers;
- Quest-scoped dialogue, narration and Capra feedback used by Quest events;
- Quest-level use of linked scenes, screens, object archetypes, effects, assets and, once implemented, saved puzzles;
- writing and indexing its own final connected-project records once connected-project saving is implemented:

```text
quests/quest-index.json
quests/quest_<slug>.json
sidequests/sidequest-index.json
sidequests/sidequest_<slug>.json
```

Quest Builder must not:

- author scene/screen visual layout or placed scene content owned by Scene Editor;
- author the wider Flatplan, project routes or structural route gates owned by Project Editor;
- create or modify reusable object or effect archetype definitions;
- create or own final image, portrait, voice or audio asset records merely because a Quest refers to them;
- create or modify the internal layout, rules, evaluation or stored definition of a puzzle;
- write `puzzles/`, Scene Editor files, Project Editor structure files, object/effect archetype records, Asset Library metadata, Health output or Build output during ordinary Quest save;
- create a separate top-level Dialogue Editor / Dialogue Library app merely for first-version Quest dialogue authoring;
- treat browser-local save or exported downloads as permanent connected-project authoring once direct saving exists.

## Active Baseline

The live route identifies itself as **Artifex Quest Builder V1.2.12** and loads the modular entry script `v1/src/quest-builder-app.js`. Its current implemented editor is a browser/local-export workflow rather than a connected-project authoring workflow.

The currently accepted presentation baseline is V1.2.12: the live-app evidence records acceptance of the fine-grid, snap-control and smart shortest-edge connector presentation, without claiming connected-project saving or future structured authoring is already implemented.

| Current area | Baseline status | Current implementation fact |
|---|---|---|
| Modular live app | Implemented | Live HTML loads the V1 module entry and focused source modules for config, block types, schema, layout, bindings, rendering, routing, dialogs and export. |
| Quest and block authoring shell | Implemented | Includes quest list/status inspector, Quest/block popup editing, New Quest Wizard and starter templates. |
| START / END flow model | Implemented | Quest flow contains explicit START and END nodes. |
| Explicit Quest connections | Implemented | Connections are authored independently from block list order and are included in export/validation. |
| Workspace layout | Implemented | Cards can be moved in the fixed workspace; browser layout state stores positions, zoom/pan, flow-window state and optional snap-to-grid. |
| Smart connector presentation | Implemented and presentation-accepted | Connector routing evaluates left/right/top/bottom edges and displays the shortest visible route while preserving explicit logical connections. |
| Current block taxonomy | Implemented for present types | Present code includes scene, action, travel, dialogue, object, information, condition, route, ritual, combat, companion, cleansing, capra, codice, reward, UI and completion blocks. |
| JSON/export workflow | Implemented but not canonical connected save | Exports a bundle and split Quest/Sidequest JSON downloads; current exported index shape/path metadata still needs canonical alignment. |
| Validation | Partly implemented | Reports missing IDs/required block fields, duplicate IDs, invalid/missing connection endpoints, unconnected flow and missing START/END reachability. |
| Local browser save | Implemented | Uses browser storage for local Quest Builder save state and layout state. |
| Connected-project load/save | Not implemented | Does not yet load/save live Quest/Sidequest records through the shared connected-project-folder workflow. |
| Structured action/condition/outcome editor | Not implemented | Current editor still primarily exposes simple text fields. |
| Quest-scoped dialogue record editor | Not implemented | Current UI exposes dialogue/audio fields, but not the agreed ordered Quest-scoped dialogue/feedback authoring model. |
| Linked Puzzle block by `puzzleId` | Not implemented | Current live block taxonomy does not yet include the planned Puzzle block. |

## Current Implemented Interfaces

### Current local Quest document model

The current V1.2.12 in-browser document provides Quests with basic identity, Calling text, references and flow data including:

```text
id
thumbnail
name
type
chronicleId
callingText
sceneIds[]
objectIds[]
completionFlag
rewards[]
codiceUpdates[]
notes
blocks[]
connections[]
```

Current flow blocks contain basic fields including:

```text
id
name
type
thumbnail
sceneId
objectId
dialogueId
audioId
condition
action
uiOverlay
capraFeedback
notes
```

Connections store source and destination node IDs, an optional condition/label and `routingMode: "smart-shortest"`. These current fields are implementation evidence for V1.2.12, not a completed structured connected-project schema for future Quest authoring.

### Current browser workspace state

The live app currently uses browser storage keys:

```text
artifex_quest_builder_local_saves
artifex_quest_builder_layout_v109
```

Layout state currently includes panel/flow-window position, collapse/orientation state, zoom, pan, snap-to-grid and workspace card positions. This is current editor layout/recovery behaviour only; it is not project authored-data truth.

### Current export and validation boundary

V1.2.12 already exports Quest/Sidequest content and checks its current export bundle. It emits files using these relative content categories:

```text
quests/quest-index.json
quests/quest_<slug>.json
sidequests/sidequest-index.json
sidequests/sidequest_<slug>.json
```

However, current export metadata still states a `projects/<project-id>/` target and current index output uses older `items`/schema naming rather than the canonical typed `quests` / `sidequests` collections required by the project-file contract. Therefore current download/export is a useful implemented interchange workflow, but not accepted as canonical direct connected-project saving.

## Module-Specific Fixed Contracts and Dependencies

### Meaningful flow-block rule

A Quest Builder canvas block represents a meaningful visible story/progression event or branch, such as entering a scene, speaking with an NPC, completing a significant puzzle, receiving a reward or fulfilling a Calling. Ordinary dialogue lines, failed-object replies, individual condition checks and simple flag assignments do not automatically become separate flow cards; they belong inside the relevant block unless the author needs a visible arranged progression step.

### Structured block-authoring contract

When structured authoring is implemented, a selected actionable block must support the module-owned concepts of:

```text
Action / Trigger
Requirements / Conditions
Success Outcomes
Failure / Capra Feedback
Dialogue / Presentation
Linked Assets and IDs
Validation
```

The editor must use readable selectors/rule-building fields for normal authoring rather than requiring raw logic strings. This is a Quest Builder-specific authoring contract; its unimplemented UI/schema work is tracked only in `2A`.

### Quest-scoped dialogue and Capra contract

For first-version Quest authoring, NPC speech, Mel dialogue, narration and Capra feedback required by a Quest are authored contextually inside Quest Builder from the relevant Quest block. A larger **Open Dialogue / Feedback** workspace may be introduced inside Quest Builder, but it is not a separate top-level module.

Quest Builder owns the ordered Quest use/text and feedback circumstances. Portraits, recorded voice and sound cues remain references to final registered `asset_` records owned by the Asset Library workflow. A global reusable dialogue library is considered only later if proven cross-Quest reuse, localisation or voice-management requirements justify a separate owner.

### Puzzle Creator handoff contract

A puzzle is a self-contained challenge owned and saved by Puzzle Creator. Quest Builder may later expose one meaningful `Puzzle` flow block whose required primary reference is:

```text
puzzleId
```

Quest Builder owns why the puzzle occurs in the Quest, any prerequisites, story-facing success/failure outcomes, dialogue, Capra response, reward or Quest-created flag after it resolves. It must not copy puzzle cells, symbol layout, internal features, completion evaluation or full puzzle JSON into Quest content.

Quest Builder may read and validate saved puzzle records from:

```text
puzzles/puzzle-index.json
puzzles/puzzle_<slug>.json
```

It must not write those files. The linked Puzzle block can only become a real implemented authoring feature after Puzzle Creator provides canonical connected-project puzzle registration/loading or as part of a deliberately staged prerequisite integration pass.

### Project Editor public-output boundary

Project Editor may read stable Quest/Sidequest IDs, completion results, Quest-created flags and deliberately public puzzle/Quest results when a wider structural route requires them. Quest Builder must not write Project Editor-owned `logic.json`, `layout.json`, `registry.json` or `library-links.json`, and Project Editor must not edit Quest internal flow, dialogue, outcomes or rewards.

### External reference boundary

Quest Builder may read/reference stable records owned elsewhere, including:

```text
scenes/scene-index.json
screens/screen-index.json
archetypes/object-index.json
archetypes/effect-index.json
assets/asset-index.json
puzzles/puzzle-index.json
```

Reading or linking those records does not transfer ownership. Permanent Quest references must resolve through stable IDs and final registered assets rather than intake files or duplicated reusable media.

### Audio reference contract

Quest-owned voice, feedback, reward or completion cues reference registered `asset_` IDs. Quest Builder must not create an `archsound_` identifier family, `archetypes/sounds/` folder or separate sound-archetype index. Any later in-context generated-sound flow must return a registered Asset Library audio ID for storage in Quest-owned data.

## Current Compatibility and Transition Notes

The current live V1.2.12 Module flyout still exposes **Project Manager** and an old `../project-manager/` route. The agreed user-facing name is **Project Editor**; correcting the live menu requires a normal versioned implementation edit and safe compatibility handling where old identifiers are read or written.

The current code also still marks `dialogue` block metadata as sourced from `dialogue-library`, although the agreed first-version contract is Quest-scoped dialogue inside Quest Builder. That metadata must be deliberately aligned during structured authoring implementation; it is not evidence that a separate Dialogue Library module should exist.

The current live taxonomy does not contain the planned `puzzle` block even though the module contract defines its future boundary. This must remain listed as unimplemented work, not described as a live capability.

Existing Quest Builder documents contain overlapping current rules and task material:

```text
docs/artifex/07-quest-builder.md
docs/artifex/07a-quest-builder-structured-authoring.md
docs/artifex/07b-puzzle-creator-quest-integration.md
artifex/apps/quest-builder/README.md
artifex/apps/quest-builder/docs/structure.md
artifex/apps/quest-builder/docs/block-taxonomy.md
artifex/apps/quest-builder/docs/todo.md
```

The permanent module-specific rules from those sources are consolidated into this specification. Still-live implementation work belongs in `2A`; after acceptance and confirmation that no unique requirement remains, the older overlapping documents are eligible for archive treatment rather than continued maintenance as competing authority.

## Remaining Work

All current and future Quest Builder tasks are owned by `docs/artifex/2A-global-to-do.md`. This specification must not accumulate task checklists.