# Scene Editor Specification

Status: Active module specification during documentation consolidation  
Owning module: Scene Editor  
Active route: `artifex/apps/scene-editor/index.html`  
Current verified implementation baseline: `Artifex Scene Editor v0.37-control-state-inspector-retention`  
Governing universal contract: `docs/artifex/01A-project-file-contracts.md`  
Subordinate schema reference: `docs/artifex/19A-project-starter-schemas.md`  
Outstanding work source: `docs/artifex/02A-global-to-do.md`

## Purpose

Scene Editor is the visual authoring module for scenes and screens.

It owns visual composition: backgrounds, placed visual elements, object/effect references, screen/scene layout, local scene presentation and visual preview behaviour. It is not the Project Editor, Quest Builder, Puzzle Creator, Object Creator or Effect Editor.

## Ownership Boundary

Scene Editor owns:

- visual scene and screen composition;
- scene/screen records and indexes once connected-project saving exists;
- placement of backgrounds, props, object instances, effect instances, overlays and UI elements;
- visual layout, position, scale, layer, opacity and display state;
- scene-local triggers/events only when those are deliberately implemented as Scene Editor-owned scene events;
- visual preview for authored scenes/screens;
- future registered Asset/Object/Effect selection for placed scene content.

Scene Editor must not:

- create final Asset Library records;
- author Object Archetype internals;
- author Effect Archetype internals;
- author Quest or Puzzle internal logic;
- own project Flatplan routes;
- own Build Game output;
- treat fixed manifests, browser drafts or downloaded JSON as permanent project truth once connected saving exists.

## Active Baseline

The accepted current implementation is:

```text
artifex/apps/scene-editor/index.html
Artifex Scene Editor v0.37-control-state-inspector-retention
```

The accepted v0.37 baseline retained the v0.35-v0.37 control and selection fixes and should not be rolled back to older failed states.

Current implementation includes:

- modular visual editor;
- accepted v0.35-v0.37 control/selection fixes;
- local scene/screen workflow;
- local recovery/import/template/download features;
- active-project context display;
- fixed-manifest asset-path picker.

Current implementation does not yet prove connected-project scene/screen save/load as the normal authoring path.

## Canonical Future Project Files

Scene Editor should eventually read and write:

```text
scenes/scene-index.json
scenes/scene_<slug>.json
screens/screen-index.json
screens/screen_<slug>.json
```

Exact schemas are governed by the project-file contract and schema reference.

## Current Implemented Areas

### Visual editing

Scene Editor owns the visual canvas/editor experience. It places visual elements and adjusts display/layout properties.

### Local workflow

Current implementation still includes local scene/screen workflows such as local recovery, import, template and download. These are valid fallback/recovery features, not the final connected-project save authority.

### Fixed-manifest picker

Current placement may still rely on fixed manifest/path-only selection. That should be replaced by stable registered references from Asset Library, Object Creator and Effect Editor where applicable.

## Relationships

### Project Editor

Project Editor owns Flatplan and route structure. Scene Editor owns visual scene/screen contents. Project Editor may link to a scene or screen; Scene Editor edits the record.

### Asset Library

Asset Library owns final assets. Scene Editor should reference `asset_` IDs for final visual/audio resources.

### Archetype Object Creator

Object Creator owns reusable `archobj_` definitions. Scene Editor places instances referencing those definitions.

### Effect Editor

Effect Editor owns reusable `archeffect_` definitions. Scene Editor places or triggers instances referencing those definitions.

### Quest Builder and Puzzle Creator

Quest Builder and Puzzle Creator may reference or trigger scene content through defined contracts, but Scene Editor does not absorb their internal logic.

### Sound Library

Scene Editor may later use Sound Library for ambience, local sound sources and transitions. It should store registered audio `asset_` IDs only.

## Current Gaps

Known gaps include:

- connected-project scene/screen loading, direct saving and typed index registration are not complete;
- save-state UI is not yet standardised against shared connected-folder status;
- fixed-manifest/path-only placement needs replacement with registered content references;
- Sound Library selection is future/provisional;
- Scene Events, Triggers and portal linking require save/reference foundations first;
- old v0.34/v0.35 stabilisation docs should not be reopened as active tasks.

## Source Classification

Old Scene Editor documents, cleanup reports and failed acceptance plans are historical/source evidence after this specification. Current active work belongs in `02A-global-to-do.md`.

## Remaining Work

All current and future Scene Editor work belongs in `docs/artifex/02A-global-to-do.md`. This specification must not become a task list.
