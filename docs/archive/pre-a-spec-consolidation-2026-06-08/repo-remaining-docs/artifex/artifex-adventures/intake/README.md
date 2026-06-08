# Artifex Adventures Intake Folder

This is the creator-facing drop zone for unfinished or newly supplied assets for the playable Artifex Adventures template project.

Put files here first when making or collecting artwork, music, icons, character art, object art, dialogue, ambience or sound effects. Later, Artifex can import them, rename them safely, copy them into the correct final `assets/` folder, create Asset Library records and update game references to the clean final paths.

## Intake Buckets

Use these buckets only:

```text
backgrounds/
characters/
objects/
icons-ui/
music/
dialogue-sfx/
```

| Folder | Put this here |
|---|---|
| `backgrounds/` | Scene backgrounds, interiors, landscapes, title/ending backgrounds and environmental plates. |
| `characters/` | Player character, NPCs, interactive characters, enemies, portraits, reference art and sprite/animation sheets. |
| `objects/` | Props, pickups, doors, passages, transitions, furniture, clue items and interactable object art. |
| `icons-ui/` | Project logo/title mark, inventory/action icons, map markers, HUD/menu elements and UI frames. |
| `music/` | Music tracks and musical stingers. |
| `dialogue-sfx/` | Voice/dialogue, narration, ambience, footsteps, UI sounds and environmental sound effects. |

## Recommended Basic Starting Assets

This is a recommended first-scene checklist, not a hard requirement. Artifex Adventures can be created before all of these exist, but having them makes the first working scene much easier to assemble and test.

| Starting asset | Put it in | Why it is useful |
|---|---|---|
| Project logo or temporary title mark | `icons-ui/` | Gives the project an identity in Creation Guide and title/menu planning. |
| At least 1 scene background | `backgrounds/` | Provides a first playable/test space. |
| At least 1 player-character image or sprite sheet | `characters/` | Provides the player placeholder or final art. |
| At least 1 NPC image or sprite sheet | `characters/` | Allows interaction/dialogue testing. |
| At least 1 interactable object or pickup | `objects/` | Allows object interaction testing. |
| At least 1 door, passage or transition object | `objects/` | Allows movement/transition planning between scenes. |
| At least 1 icon/UI placeholder set | `icons-ui/` | Allows HUD/menu/prompt testing. |

Useful next additions include location music or ambience, a voice/dialogue sample, enemy or hazard art, and magical/effect source art.

## Intake Is Not Final Asset Storage

Do not make permanent scene, object, quest or runtime references directly to files inside `intake/`. Intake files are staging files, not final game assets.

Approved files should be copied/promoted into the final `assets/` structure, given stable asset IDs and registered in the project asset index before other project files reference them.

Full workflow doc:

```text
docs/artifex/20-asset-intake-workflow.md
```
