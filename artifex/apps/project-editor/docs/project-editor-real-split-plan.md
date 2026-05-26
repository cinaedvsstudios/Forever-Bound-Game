# Artifex Project Editor — Real Split Plan

## Purpose

This task is to perform a real split of `artifex/apps/project-editor/index.html`.

The goal is not to add Project Editor features yet.
The goal is not to wrap the existing editor in an iframe.
The goal is not to create unused scaffolds.

The goal is:

> Take the current working monolithic Project Editor, physically extract working code into smaller real files, wire those files into the live editor, and reduce `index.html` until it is a small page shell that directly loads modules.

The final result must still show the Project Editor shell, workspaces, Flatplan canvas, draggable/connected nodes, live JSON preview, Stitcher workspace, Build Prep diagnostics, import/export behaviour, and localStorage persistence.

## Branch

Use one branch:

```text
project-editor-real-split
```

## Known source of truth

Current live file:

```text
artifex/apps/project-editor/index.html
```

Safety backup created before edits:

```text
artifex/apps/project-editor/index.monolith.backup.html
```

The backup is for recovery only. It must not become the final runtime path.

## Branding rule

Project / Library tools use the gold-green module accent.

Project Editor must use:

- Gold / amber for active states, selected borders, helper glows, workspace identity, and primary module UI.
- Soft green for valid/online/coherent status.
- Bronze/copper/parchment as the ancient Artifex base frame.
- Existing category colours may remain inside node badges where they are meaningful, but the module chrome must not stay purple/pink.

Theme tokens live in:

```text
src/project-theme.js
```

## Target structure

```text
artifex/apps/project-editor/
  index.html
  index.monolith.backup.html
  docs/
    project-editor-real-split-plan.md
    real-split-completion-report.md
  src/
    project-app.js
    project-theme.js
    project-state.js
    project-ui.js
    project-canvas.js
    project-renderer.js
    project-stitcher.js
    project-buildprep.js
    project-io.js
    project-debug.js
    data/
      project-defaults.js
      flatplan-catalog.js
      type-styles.js
```

## Non-negotiable rule

Do not call the split complete while a giant monolithic `index.html` still contains most live editor logic.

A wrapper/iframe shell does not count as a real split.
A smoke-test-only shell does not count as a real split.
Scaffold files that are not wired into the live editor do not count as a real split.

## Step 0 / 8 — Safety backup

Version label:

```text
pre-split safety setup
```

Done:

```text
artifex/apps/project-editor/index.monolith.backup.html
```

## Step 1 / 8 — Extract theme / branding tokens

Version label:

```text
v0.1.1 SPLIT-THEME
```

Create and wire:

```text
src/project-theme.js
```

It must export:

```js
export const PROJECT_THEME = { ... };
export function applyProjectTheme(root = document.documentElement) { ... }
export function getProjectThemeTailwindConfig() { ... }
```

Then wire the live editor to import/use this theme without changing behaviour.

Manual test:

1. Open Project Editor URL.
2. Confirm page loads.
3. Confirm Flatplan appears.
4. Confirm nodes render.
5. Confirm route lines render.
6. Confirm workspace switcher still opens.
7. Confirm visible accent begins moving toward gold/green.
8. Confirm browser console has no fatal errors.

Commit message:

```text
Split Project Editor theme tokens
```

## Step 2 / 8 — Extract default data and type styles

Version label:

```text
v0.1.2 SPLIT-DATA
```

Move default mock project data, Flatplan Catalog seed data, and `typeStyleMap` into:

```text
src/data/project-defaults.js
src/data/flatplan-catalog.js
src/data/type-styles.js
```

Manual test:

1. Open page.
2. Confirm default nodes appear.
3. Confirm badges have correct type colours.
4. Confirm Flatplan Catalog still populates.
5. Confirm drag/drop still creates a node.

## Step 3 / 8 — Extract state manager

Version label:

```text
v0.1.3 SPLIT-STATE
```

Move `ArtifexStateManager` and state object ownership into:

```text
src/project-state.js
```

Do not leave duplicate state variables in both `index.html` and `project-state.js`.

Manual test:

1. Open page.
2. Move a node.
3. Reload.
4. Confirm localStorage restores positions.
5. Select node.
6. Edit name/description.
7. Confirm state updates.

## Step 4 / 8 — Extract IO / localStorage / import/export

Version label:

```text
v0.1.4 SPLIT-IO
```

Move into:

```text
src/project-io.js
```

Owns:

- download logic JSON
- upload/import logic JSON
- safe merge helpers
- storage helpers if not owned by state

Manual test:

1. Download JSON.
2. Import JSON.
3. Confirm nodes render.
4. Confirm layout is preserved where possible.
5. Confirm invalid JSON gives a clear error.

## Step 5 / 8 — Extract Flatplan canvas camera/interactions

Version label:

```text
v0.1.5 SPLIT-CANVAS
```

Move into:

```text
src/project-canvas.js
```

Owns:

- panning
- zooming
- reset viewport
- drag/drop coordinate conversion
- temporary link drawing state
- pointer/wheel bindings

Manual test:

1. Pan canvas.
2. Zoom in/out.
3. Reset viewport.
4. Drag node.
5. Drop new node from catalog.
6. Begin drawing route.
7. Route preview follows cursor.

## Step 6 / 8 — Extract node and route renderer

Version label:

```text
v0.1.6 SPLIT-RENDERER
```

Move into:

```text
src/project-renderer.js
```

Owns:

- `renderGraph`
- `drawEdges`
- node DOM rendering
- route SVG rendering
- map projection visibility rules
- selected node/route visual state

Manual test:

1. Nodes render.
2. Routes render.
3. Moving nodes updates route lines.
4. Selecting node shows active border.
5. Selecting route opens route inspector.
6. Map Projection hides developer-only nodes.

## Step 7 / 8 — Extract workspace UI / sidebar / inspector / Stitcher / Build Prep

Version label:

```text
v0.1.7 SPLIT-UI
```

Move into:

```text
src/project-ui.js
src/project-stitcher.js
src/project-buildprep.js
```

Owns:

- workspace switcher
- dynamic sidebar rebuild
- accordion toggles
- inspector display and commit methods
- Stitcher list and selected route form
- Build Prep diagnostics
- toasts

Manual test:

1. Manifest workspace works.
2. Flatplan workspace works.
3. Stitcher workspace works.
4. Build Prep workspace works.
5. Inspector edits node.
6. Inspector edits route.
7. Diagnostics run.
8. Toasts appear.

## Step 8 / 8 — Clean index.html and completion report

Version label:

```text
v0.1.8 SPLIT-CLEAN
```

`index.html` should contain:

- HTML layout
- Tailwind/fonts/style references
- script module imports
- no giant state manager
- no giant renderer
- no Stitcher logic
- no Build Prep logic
- no import/export logic
- no large generated sidebar templates

Create:

```text
docs/real-split-completion-report.md
```

Final manual acceptance:

1. Open Project Editor URL.
2. Version says `v0.1.8 SPLIT-CLEAN`.
3. Flatplan appears.
4. Default nodes appear.
5. Route lines appear.
6. Workspace switcher works.
7. Drag/drop works.
8. Node movement works.
9. Route creation works.
10. Node inspector works.
11. Route inspector works.
12. Live JSON preview works.
13. Stitcher workspace works.
14. Build Prep diagnostics work.
15. Import JSON works.
16. Export JSON works.
17. Reload keeps saved data.
18. Console has no fatal errors.

## Required status report format

```text
Step: X / 8
Version: v0.1.X SPLIT-...
Steps left: Y
Branch: project-editor-real-split
Commit: <sha>

Changed files:
- ...

What changed:
- ...

What was not changed:
- rendering math
- canvas scale
- route logic
- localStorage behavior

Test URL:
...

Manual checks:
1. ...

Result:
PASS / FAIL / NEEDS USER TEST
```
