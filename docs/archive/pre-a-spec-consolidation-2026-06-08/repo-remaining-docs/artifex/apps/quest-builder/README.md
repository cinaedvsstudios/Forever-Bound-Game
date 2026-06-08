# Artifex Quest Builder

## Purpose

Quest Builder authors playable Quest and Side Quest flow: objectives, progression blocks, explicit connections, conditions, flags, rewards, unlocks, Quest-scoped dialogue/Capra feedback and, once implemented, linked saved Puzzle steps.

Quest Builder does not draw scenes, build reusable objects, author puzzle internals or own wider project routes. It gives Quest meaning to content authored elsewhere.

## Required Contracts

Before changing the app or its saved/exported data, inspect:

```text
docs/artifex/07-quest-builder.md
docs/artifex/07a-quest-builder-structured-authoring.md
docs/artifex/07b-puzzle-creator-quest-integration.md
docs/artifex/18-color-and-display-rules.md
docs/artifex/19-project-file-contracts.md
docs/artifex/19a-project-starter-file-schemas.md
artifex/apps/quest-builder/docs/structure.md
artifex/apps/quest-builder/docs/block-taxonomy.md
artifex/apps/quest-builder/docs/todo.md
```

## Locked User-Facing Name

The higher-level structural/Flatplan tool is named **Project Editor**. The current live Quest Builder V1.2.12 Module flyout still contains an older **Project Manager** label; correcting that is a future versioned app edit, not a documentation-only change.

## Ownership Boundary

Quest Builder owns:

- `quests/quest-index.json` and `quests/quest_<slug>.json` once connected-project saving is implemented;
- `sidequests/sidequest-index.json` and `sidequests/sidequest_<slug>.json` once connected-project saving is implemented;
- Quest/Side Quest records, flow blocks and explicit Quest connections;
- progression conditions/flags, outcomes, rewards and unlock references;
- Quest-scoped dialogue, narration and Capra feedback records;
- meaningful future `Puzzle` flow blocks linking to saved Puzzle Creator records by `puzzleId`.

Quest Builder may read/reference but does not own:

- scenes/screens from Scene Editor;
- reusable objects from Archetype Object Creator;
- effects from Effect Editor;
- final media/audio records from Asset Library;
- saved puzzle definitions from Puzzle Creator;
- Flatplan/routes/structure files from Project Editor.

## Puzzle Creator Handoff

Puzzle Creator is a contained gameplay authoring module, not a replacement for Quest Builder. The intended handoff is:

```text
Puzzle Creator saves/registers puzzle_chalice_pedestal
→ Quest Builder adds a Puzzle block with puzzleId: puzzle_chalice_pedestal
→ Quest Builder controls prerequisites, story feedback, flags, rewards and the next Quest step
→ Project Editor may consume a public Quest/flag/puzzle result only where wider route gating needs it
```

Quest Builder must not copy a puzzle's internal grid, symbol layout, feature setup or full puzzle JSON into the Quest record.

## Dialogue and Audio Direction

Quest-specific dialogue and Capra feedback are authored contextually inside Quest Builder for the first version. A separate top-level Dialogue Editor app is not required.

Portrait, voice and feedback sound resources are referenced through final registered `asset_` IDs. Imported and generated sound assets remain in the Asset Library workflow; Quest Builder must not create or use an `archsound_` library.

## Current Live V1.2.12 App Files

```text
artifex/apps/quest-builder/index.html
artifex/apps/quest-builder/v1/quest-builder.css
artifex/apps/quest-builder/v1/src/quest-builder-app.js
artifex/apps/quest-builder/v1/src/module-config.js
artifex/apps/quest-builder/v1/src/block-types.js
artifex/apps/quest-builder/v1/src/quest-schema.js
artifex/apps/quest-builder/v1/src/layout-state.js
artifex/apps/quest-builder/v1/src/ui-bindings.js
artifex/apps/quest-builder/v1/src/canvas-renderer.js
artifex/apps/quest-builder/v1/src/connection-routing.js
artifex/apps/quest-builder/v1/src/dialog-editors.js
artifex/apps/quest-builder/v1/src/export-json.js
```

Older V1.0.8 JavaScript is historical/reference material and must not be loaded by the live app. The current CSS entry still uses older base styling intentionally while active new styling remains in the current stylesheet.

## Current Live Functionality

V1.2.12 currently demonstrates:

- contextual Quest/block inspection;
- popup Quest/block editing;
- START and END endpoint nodes;
- explicit manual Quest connections;
- source-coloured connector lines with smart shortest-edge display routing;
- manually movable workspace cards with optional snap-to-grid;
- floating Quest Flow window behaviour;
- JSON/export previews and existing download workflow.

The user's live screenshot/reply confirmed the V1.2.12 routing/grid presentation appeared acceptable. This does not mean every future connected-project/save feature exists.

## Known Future Implementation Work

The live app is not yet fully aligned to connected-project authoring. Required future versioned work includes:

1. Replace old Quest/Sidequest export index shapes with canonical typed `quests` / `sidequests` collections.
2. Remove the old `projects/<project-id>/` direct-save metadata assumption.
3. Load and deliberately save real connected-project Quest files through the shared project-folder service.
4. Change the live Module flyout label to **Project Editor**.
5. Replace vague free-text authoring with structured operations/conditions/outcomes and Quest-scoped dialogue editing.
6. Add a real `Puzzle` block type and `puzzleId` selector after Puzzle Creator has canonical `puzzles/` registration/loading.
7. Add registered `asset_` audio/voice assignment when the shared asset workflow is connected.

Any live app edit must follow the visible version/cache-key rules in `docs/todo.md`; documentation-only changes do not increment V1.2.12.