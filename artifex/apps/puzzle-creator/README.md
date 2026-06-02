# Artifex Puzzle Creator

## Purpose

Puzzle Creator is the Artifex module for authoring a self-contained playable challenge: for example a Maze / Labyrinth, Symbol Assembly, Item Order puzzle, Obstacle Course, Hazard challenge or Arena Trial.

A completed puzzle may be inserted into Quest Builder as a meaningful Quest flow step. Puzzle Creator defines how the challenge works; Quest Builder defines why it happens in the Quest and what story/progression outcomes follow completion.

Required companion contracts:

```text
docs/artifex/07b-puzzle-creator-quest-integration.md
docs/artifex/19-project-file-contracts.md
docs/artifex/19a-project-starter-file-schemas.md
docs/artifex/20-asset-intake-workflow.md
docs/artifex/22-sound-archetype-generator.md
```

## Locked Module Relationship

```text
Puzzle Creator = creates and saves the contained challenge.
Quest Builder = references the saved puzzle by puzzleId as a flow step.
Project Editor = connects wider route/Flatplan structure and may consume public completion results.
```

Use **Project Editor** as the user-facing structural-tool name. Any remaining `Project Manager` labels in older code or documentation are migration items, not the preferred name.

## Ownership Boundary

Puzzle Creator owns:

- puzzle definition and internal playable configuration;
- puzzle-engine type and settings;
- internal layout, route, cells, features, start/exit and local completion rules;
- puzzle-local feedback required during the challenge;
- final referenced assets/archetypes/effects/audio IDs used inside the puzzle;
- eventual puzzle index/content-file registration.

Puzzle Creator must not own:

- whole Quest chains, Calling flow or Quest rewards;
- Quest-level dialogue/Capra narrative surrounding the puzzle;
- Project Editor route/Flatplan structure;
- reusable object/effect definitions owned by their libraries;
- copied media files or procedural audio recipes;
- permanent links to `intake/` source files.

## Canonical Future Project Files

When connected-project saving is implemented, Puzzle Creator must register and save puzzle content under the selected project root:

```text
puzzles/puzzle-index.json
puzzles/puzzle_<slug>.json
```

The canonical empty index created by Creation Guide is:

```json
{
  "schemaVersion": "artifex.puzzles.index.v1",
  "projectId": "project_forever_bound",
  "puzzles": []
}
```

Quest Builder should then select a stable `puzzle_` ID from that index. It must not copy the complete puzzle definition into a Quest block.

## Current Live V1.33 State

Puzzle Creator V1.33 is the accepted live presentation/usability baseline for the existing Maze / Labyrinth authoring workflow. It remains an evolving authoring app rather than completed connected-project integration.

Current functionality includes:

- multiple planned puzzle-engine choices surfaced through the Puzzle menu;
- Maze / Labyrinth editing and preview workflow;
- 2D overview plus rendered playable preview and Walk Test where supported;
- features and completion-rule controls for the currently implemented Maze work;
- Game Logic fields including Puzzle Type, Integration Context, Completion Flag and Calling Text;
- JSON import/export/download workflow;
- registered-content linking for selected current Maze features where implemented and documented in its current todo record;
- accepted V1.33 presentation/usability corrections: correct **Puzzle Creator Module** identity, clearer **Place Markers** Scatter action, amount entry applied without needing Enter before placement, and the **Walls → Scatter → Colours** ordering within Surface + Edit.

Current limitations relevant to integration:

- the app still uses an export/download workflow rather than canonical connected-folder saving to `puzzles/`;
- its current runtime/export format has not yet been converted into the canonical `puzzle_` registration workflow required for Quest Builder picking;
- Quest Builder does not yet contain a live `Puzzle` flow block or `puzzleId` selector.

Do not present the Quest Builder handoff as live until both apps have received the necessary versioned implementation and browser testing.

## V1.34 UI Candidate · Puzzle-Type Landing Screen and Shared Navigation

The current V1.34 implementation branch proposes a UI-shell improvement only:

- first opening Puzzle Creator shows a left-side **Choose a Puzzle Type** launcher instead of automatically presenting the Maze workflow;
- the right viewing area remains blank until a puzzle type is selected;
- the chooser lists the existing registered workflows: Maze / Labyrinth, Arena Trial, Obstacle Course, Symbol Assembly, Item Order Puzzle and Hazard Puzzle;
- after entering a workflow, the shared navigation rail remains in the same position and includes visible text labels beneath the icons: **Setup**, **Display**, **Logic** and **Colors**;
- the Puzzle menu provides a return to the chooser without deliberately deleting in-progress state;
- selecting Maze / Labyrinth enters the accepted V1.33 Maze workflow; other puzzle-engine choices remain their existing early workflow state and must not be represented as completed gameplay editors.

V1.34 must be browser-tested and accepted before it is merged or described as the live baseline. This UI-shell candidate does not implement canonical saving, Quest Builder integration, new puzzle gameplay, or any shared service changes.

## Puzzle Creator to Quest Builder Handoff

Example future use:

```text
Puzzle Creator
  saves puzzle_chalice_pedestal

Quest Builder
  flow block: Solve the Chalice Pedestal
  puzzleId: puzzle_chalice_pedestal
  on complete: set flag_chalice_pedestal_solved, trigger dialogue, grant item, continue Quest
```

Puzzle Creator determines whether its own challenge is complete. Quest Builder consumes that public completion result and authors Quest-level outcomes around it.

For the full handoff rules, including conditions, Capra feedback, public results and validation, use:

```text
docs/artifex/07b-puzzle-creator-quest-integration.md
```

## Asset and Audio References

Puzzle Creator may reference final registered assets and reusable definitions:

```text
asset_       final images/audio/generated sound recipes
archobj_     reusable objects where supported
archeffect_  reusable effects where supported
```

Imported or generated sounds must resolve through `assets/asset-index.json` using `asset_` IDs. Do not create `archsound_` IDs or copy procedural sound recipes into a puzzle file.

## Current Implementation Note

The active Maze / Labyrinth workflow uses permanent named modules only. V1.33 is accepted on `main`; V1.34 is a versioned UI-shell candidate awaiting browser confirmation. Continue the existing cleanup rule: do not stack random patch layers or rebuild the app when a controlled normal-module change is sufficient.

Any live Puzzle Creator UI/data edit must use that app's visible version/cache-key update rule and requires browser confirmation before being described as working.
