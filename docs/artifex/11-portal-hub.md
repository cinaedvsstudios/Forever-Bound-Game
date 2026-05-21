# Portal Hub

## Purpose

The Artifex Portal is the front door of the Artifex toolkit.

It should open before individual tools such as Scene Editor, Project Editor, Utilities, Settings, and Help.

The portal/hub is the front screen. Each wedge opens either a tool, a project-management area, or a utility module.

## Current Portal Status

The Artifex split has begun.

Completed so far:

- `artifex/` folder exists.
- `artifex/index.html` exists.
- radial hub portal front screen exists.
- portal visual identity is established.
- portal audio works after browser audio unlock.
- portal fog and sparks are animated procedurally.
- wedge hover glow and bulge effects work.
- centre hub image bug has been fixed.
- portal wedges now have functional actions/placeholders.
- `CINAEDVS` opens the external Cinaedvs Studios page in a new tab.
- `SCENE` opens the new Scene Editor route.
- `artifex/apps/scene-editor/` exists.
- `artifex/apps/scene-editor/index.html` exists and currently loads the existing standalone editor engine from the repo root.

The portal now has a clear visual identity:

- hammered copper
- carved icons
- dark dungeon atmosphere
- purple arcane energy
- animated fog
- animated sparks

The next portal work should focus on function, not further visual redesign.

## Correct Portal Asset Map

Important corrected asset logic:

```text
menudial.png      = full large radial dial
artifexlogo.png   = centre hub image
menudialglow.png  = glow/electric overlay for the centre hub image
```

A generated/code-review assumption previously invented or assumed:

```text
centerhub.png
```

That caused the centre image of the dial not to appear.

Lesson:

Do not trust generated file names or architecture claims without checking the actual repository and asset folder.

## Current Portal Button Behaviour

Current temporary wedge layout:

```text
ABOUT
HELP
CINAEDVS
SETTINGS
FONT
SCENE
```

Current behaviour:

```text
SCENE     → opens apps/scene-editor/
CINAEDVS  → opens https://cinaedvsstudios.github.io/cinaedvs/ in a new tab
ABOUT     → placeholder panel
HELP      → placeholder panel
SETTINGS  → placeholder panel
FONT      → placeholder panel
```

## Planned Portal Layout Revision

The current six-wedge portal works as the first functional version, but the long-term information architecture should change.

Planned long-term wedge layout:

```text
SCENE EDITOR
UTILITIES
PROJECT MANAGER / PROJECT EDITOR
SETTINGS
ABOUT / CINAEDVS
future major module
```

The Help function should move out of the main wheel and become a smaller corner button, probably in the bottom corner of the screen.

Reason:

Help is useful, but it should not take one of the main radial wedges. The main wedges should be reserved for major production tools.

## Centre Hub / Active Project Selector

The centre hub should become functional later.

Purpose:

The centre hub controls the active Artifex project.

Behaviour:

```text
Click centre hub
Open Project Selector
Auto-load last active project from localStorage
If no project exists, prompt to create one
Selecting a project updates all tool defaults
Active project name appears subtly somewhere on the portal
```

The centre hub should not open a normal tool. It should behave like the project core / project switcher.

Example stored local state:

```json
{
  "activeProjectId": "forever_bound",
  "lastOpenedAt": "2026-05-20T00:00:00.000Z"
}
```

## Utilities Wedge / Expanding Sub-Wheel

The current Font wedge should probably become:

```text
UTILITIES
```

When clicked, it should open a secondary wedge, sub-wheel, or radial fan coming out of that section.

Possible Utilities submenu items:

```text
CG Effects Library
Asset Library
Font Packer
Sprite Wizard
Frame Extractor
Audio/SFX Utility
Palette / Theme Utility
JSON Validator / Cleaner
Sprite Sheet / Atlas Builder
Image Optimizer / Resizer
```

The Utilities wedge should become the home for tools that help prepare, convert, or organize assets rather than editing game scenes directly.

Design idea:

- click Utilities.
- current wheel either rotates/opens a sub-wheel, or a smaller radial fan expands from that wedge.
- selecting a utility opens the matching module or placeholder panel.
- Back returns to the main Artifex portal.

Do not build this immediately until the Scene Editor route is tested.

## Proposed Wedge Destinations

Earlier proposed temporary destinations:

```text
SCENE     → Scene Editor
FONT      → Font Packer placeholder/app
SETTINGS  → Artifex Settings placeholder/panel
HELP      → Help / usage guide placeholder/panel
ABOUT     → About Artifex placeholder/panel
CINAEDVS  → Studio/about/repo link or placeholder/panel
```

The centre dial/core should stay decorative for now unless a clear function is needed later.

Long term, the centre hub should become the active project selector.

## Function Wiring Batch

The next portal changes should focus on function.

Suggested Batch 1: Portal Function Wiring

Purpose:

Turn the portal from a visual mock-up into a functional hub.

Changes:

- add a clean button/action map in the portal JavaScript.
- make each wedge trigger a real action.
- Scene opens the Scene Editor destination.
- unfinished tools open placeholder panels/pages instead of doing nothing.
- keep hover/audio/particle logic unchanged.

Pause/test after this batch.

## Immediate Portal Priorities

1. Test the current portal after Scene Editor folder setup.
2. Confirm `SCENE` opens `artifex/apps/scene-editor/`.
3. Confirm `CINAEDVS` opens `https://cinaedvsstudios.github.io/cinaedvs/` in a new tab.
4. Keep the current portal visuals unless something is broken.
5. Plan the centre hub active project selector.
6. Plan the future Utilities wedge.
7. Plan the future Project Manager / Project Editor wedge.
