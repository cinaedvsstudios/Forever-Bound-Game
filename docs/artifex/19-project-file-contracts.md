# Project File Contracts and Module Integration Rules

## Purpose

This document is the central Artifex contract for how apps share, read and save project data without swallowing one another or inventing incompatible file structures.

Artifex contains connected authoring modules including Creation Guide, **Project Editor**, Scene Editor, Quest Builder, Puzzle Creator, Effect Editor, Archetype Object Creator, Asset Library, Health Guide, Playtest and Build Game. They operate on one coherent connected project folder with stable ownership, project-relative references, recoverable local drafts and controlled generated output.

## Required Companion Documents

Every app working on project files should inspect this contract together with:

```text
docs/artifex/07a-quest-builder-structured-authoring.md
docs/artifex/07b-puzzle-creator-quest-integration.md
docs/artifex/18-color-and-display-rules.md
docs/artifex/19a-project-starter-file-schemas.md
docs/artifex/20-asset-intake-workflow.md
docs/artifex/21-template-game-project-contract.md
docs/artifex/22-sound-archetype-generator.md
artifex/shared/todo-guide/README.md
artifex/shared/todo-guide/all-apps-todos.json
```

`19a-project-starter-file-schemas.md` defines the exact minimum starter JSON shapes. `20-asset-intake-workflow.md` defines staging/promotion of supplied source assets. `21-template-game-project-contract.md` defines the populated cross-app reference project. `22-sound-archetype-generator.md` defines generated audio as normal registered `asset_` resources. `07a` and `07b` define Quest-owned structured authoring and the Puzzle Creator-to-Quest Builder handoff.

## Locked User-Facing Module Name

The high-level Manifest / Flatplan / route-structure tool is named **Project Editor**.

Existing live code, old handovers, task IDs or stored filenames containing `project-manager` are migration items. Do not introduce new user-facing **Project Manager** labels and do not silently rename stored files without a deliberate compatibility/migration pass.

## Three Distinct Project Layers

| Layer | Meaning | Created/populated by |
|---|---|---|
| **Blank Starter Project** | Empty valid structure with top-level starter files, required folders and empty indexes. | Creation Guide / shared project-structure initializer. |
| **Template Game** | Small populated connected reference project proving cross-app reading, writing and references. | Appropriate owning apps and later validation/build work. |
| **Artifacts Adventures** | First real production game project authored through Artifex after the Template Game flow works. | Creator through the full Artifex workflow. |

Creation Guide must not populate app-owned scene, Quest, puzzle, archetype, effect, asset, Health or Build content merely because folders exist.

## Core Rules

1. Each app writes only the files for its job, plus required index/registration updates for content it creates.
2. Unique content lives in the smallest file that needs it; reusable content belongs in registered indexes/libraries.
3. The connected project root is the normal editable source of truth once writable permission is granted.
4. `localStorage` is an autosave/recovery-draft layer, not the permanent project file.
5. IndexedDB may store browser folder handles and permission metadata; project JSON may not store them.
6. Project files contain project-relative paths only, never private local disk paths.
7. `intake/` is staging only; permanent authored/runtime records reference promoted final `assets/` records or IDs only.
8. ZIP/download export is backup, transfer and no-permission fallback, not everyday saving.
9. Health, Build, backup and generated todo outputs are created by their owning systems when required.
10. Build Game validates/packages modular files; it does not replace authoring apps.
11. Imported audio files and procedural synth sounds are both registered through `assets/asset-index.json` and referenced by `asset_` ID; no `archsound_` library is created.
12. Quest-specific dialogue and Capra feedback may live inside Quest Builder-owned Quest records; referenced portraits, voice and sound files remain external registered assets.
13. Puzzle Creator owns self-contained puzzle definitions; Quest Builder may include a saved puzzle as a meaningful flow block by stable `puzzle_` ID without copying its internals.

## Connected Project Folder and Direct Save

Normal workflow:

```text
Creation Guide creates or selects a project
→ user connects the real project root folder
→ Creation Guide initialises missing blank starter files/folders/empty indexes
→ optional intake staging is explained/created
→ author content in each owning app
→ autosave local recovery drafts while editing
→ deliberate Save writes app-owned files into the connected project folder
→ Health/Audit/Build checks saved data
→ approved changes may be backed up or pushed separately
```

The shared project-folder service uses the browser File System Access API and stores the folder handle in IndexedDB. Apps read/write by project-relative paths. A known handle may require re-authorisation before writing.

### Save Status Language

Apps authoring project data should eventually report:

```text
Saved to Project Folder
Local Draft Only
Project File Changed
Conflict
Permission Required
No Folder Connected
Save Failed
```

When leaving an app with local-only unsaved changes, the shared guard should offer Save and Continue, Stay Here, Continue Without Saving and Export Backup where relevant.

## Canonical Project Folder Hierarchy

The selected folder itself is `<project-root>/`:

```text
<project-root>/
  project.json
  logic.json
  layout.json
  registry.json
  library-links.json
  input-map.json
  README.md

  intake/
    README.md
    backgrounds/
    characters/
    objects/
    icons-ui/
    music/
    dialogue-sfx/

  scenes/
    scene-index.json
    scene_<slug>.json

  screens/
    screen-index.json
    screen_<slug>.json

  quests/
    quest-index.json
    quest_<slug>.json

  sidequests/
    sidequest-index.json
    sidequest_<slug>.json

  puzzles/
    puzzle-index.json
    puzzle_<slug>.json

  archetypes/
    object-index.json
    effect-index.json
    objects/archobj_<slug>.json
    effects/archeffect_<slug>.json

  assets/
    asset-index.json
    groups/assetgroup_<slug>.json
    images/backgrounds/
    images/characters/
    images/props/
    images/ui/
    sprites/characters/
    sprites/objects/
    sprites/fx/
    audio/music/
    audio/sfx/
      synth_<slug>.json        [generated procedural audio when created]
    audio/voice/
    fonts/
    video/

  health/
    latest-health-report.json

  build/
    runtime-project.json
    build-manifest.json

  backups/
    backup-manifest.json

  todos/
    creation-guide.json
    project-editor-todos.json
```

This hierarchy describes a complete possible connected package. Blank Starter initialisation creates starter top-level files, required directories and empty indexes only. Populated app records and generated Health/Build/backup/todo files are created later by their owners.

### Stored Todo Filename Migration

Older Project Editor work/code may still refer to `todos/project-manager-todos.json`. The preferred new user-facing/storage contract is `todos/project-editor-todos.json`. Changing existing implementations must be a deliberate migration that reads or converts legacy files safely; do not silently strand earlier task files.

## Starter File and Index Schemas

Exact shapes for `project.json`, `logic.json`, `layout.json`, `registry.json`, `library-links.json`, `input-map.json` and typed indexes are canonical only in:

```text
docs/artifex/19a-project-starter-file-schemas.md
```

Creation Guide and Project Editor must use those shapes. Typed index collections such as `quests`, `puzzles` and `assets` must not be replaced with generic `items` when writing real project files.

A Blank Starter Project uses `startScreenId: null` until a real registered start screen exists. The shared initializer already follows this rule; older files are migration cases.

## Asset and Audio Contract

Files in `intake/` are source staging only. Permanent scene, Quest, puzzle, object, effect and runtime data may reference only final promoted or generated registered resources.

A generated procedural sound may be written directly as a final registered asset:

```text
assets/audio/sfx/synth_<slug>.json
assets/asset-index.json → asset_sfx_<slug>
```

Imported audio and generated synth recipes appear through the same Asset Library and are assigned by `asset_` ID. Other apps store only the registered asset ID; they never copy the synth recipe into their content record.

## Object Authoring Status and Staged Frames

Archetype Object Creator object records and matching `archetypes/object-index.json` entries may use:

```json
"authoringStatus": "in_progress"
"authoringStatus": "ready"
```

`in_progress` records are project-backed authoring work. They may include authoring-only staging metadata for uploaded frames under:

```text
intake/objects/<archobj_id>/<requirement_or_action>/<stable_frame_filename>
```

Staged `intake/` files are not final assets and must not be registered in `assets/asset-index.json` or treated as runtime media. `ready` object records must not depend on `dataUrl`, `previewOnly`, `draftSourceName`, `intake/` staging paths, blank required asset IDs or unregistered media IDs. Finalisation promotes required staged media into appropriate `assets/` paths and registers final `asset_` records.


## Quest Dialogue and Puzzle Handoff Contract

Quest Builder may store quest-specific dialogue/narration/Capra records inside its Quest content because those lines are part of that Quest's event script. It may reference portrait or audio `asset_` IDs, but it does not own those reusable files.

Puzzle Creator stores self-contained challenges under:

```text
puzzles/puzzle-index.json
puzzles/puzzle_<slug>.json
```

Quest Builder may expose a meaningful `Puzzle` flow block that references a saved `puzzleId`. It owns the Quest context, prerequisites and resulting outcomes; it does not duplicate the puzzle's internal layout, mechanics or completion rules.

Project Editor may consume public Quest/flag/puzzle results only where wider world structure or route gating needs them. It must not author Quest or puzzle internals.

## Ownership Matrix

| Module / service | Owns / writes | Must not own |
|---|---|---|
| Creation Guide | initial blank project files/folders/empty indexes, project registration, setup status, starter input map, optional intake setup | populated scene/Quest/puzzle/archetype/FX/asset/build content |
| Project Editor | structural graph/route/layout/registry/library-link data and project-level structural validation | scene interiors, Quest internals, puzzle internals, object/FX authoring, raw asset promotion |
| Scene Editor | scenes, screens, placements and scene instance references including sound asset IDs | project route graph; Quest or puzzle internals; sound recipe creation internals |
| Quest Builder | quests, sidequests, branches, progression flags/conditions, structured outcomes, quest-scoped dialogue/Capra records, linked `puzzleId` steps, rewards/unlocks | visual scene layout; puzzle definitions; asset media/recipes; Project Editor structure |
| Puzzle Creator | puzzle definitions/index records, internal challenge rules/features and referenced final assets/archetypes/audio IDs | whole Quest chains; Project Editor route graph except references consumed; copied sound recipes |
| Archetype Object Creator | reusable non-FX object archetypes and referenced final asset IDs for object behaviours | scene instances, Quest/puzzle internals, FX definitions and copied procedural recipes |
| Effect Editor | reusable effect archetypes and index entries | object archetypes and scene placement |
| Asset Library | promoted final supplied asset files, metadata/groups and registered generated audio recipes | gameplay behaviour |
| Shared Procedural Sound Generator | synth recipe authoring, preview/playback mapping and asset-registration requests | object/scene/Quest/puzzle behaviour records |
| Shared Project Folder Service | handles, permission state, relative-path reads/writes and draft/save guards | decisions about module-authored content |
| Health Guide | generated health/audit reports | silent content correction or overwriting conflicts |
| Build Game | generated runtime/build output and final validation | authoring app internals |

## Canonical ID Prefixes

```text
project_       Project package ID
scene_         Playable scene
screen_        UI/title/menu/ending screen
node_          Project Editor Flatplan node
route_         Project Editor route/connection
quest_         Quest Builder quest
sidequest_     Quest Builder side quest
branch_        Quest/route branch
flag_          Progression flag
condition_     Saved/reusable condition expression where implemented
puzzle_        Puzzle Creator puzzle definition
dialogue_      Quest-scoped dialogue record where implemented
action_        Input/gameplay control mapping in input-map.json
archobj_       Reusable object archetype
objinst_       Scene instance of an object archetype
archeffect_    Reusable effect archetype
fxinst_        Scene instance of an effect archetype
asset_         Final registered asset, including generated synth audio recipes
assetgroup_    Asset group/sprite group
template_      Template project/package item
health_        Health item/report item
assignment_    Creation Guide assignment
milestone_     Creation Guide milestone
```

`action_` IDs are reserved for mapped controls such as Invoke/Interact. Quest/Puzzle authoring operations such as `speak`, `collect`, `solve`, `defeat` or `give` must be represented through their structured event fields, not confused with input-map actions.

## Module Code and UI Integration Rules

- Keep app entry files thin; split state, UI, renderer, IO, libraries, health and data definitions into clear modules.
- Review files above 500 lines before adding unrelated features; treat files above 800 lines as refactor risks unless justified.
- No app should keep more than two active transitional patch/wrapper layers.
- Every app should use this core Module menu name/order: Hub, Creation Guide, Project Editor, Scene Editor, Quest Builder, Puzzle Creator, Effect Editor, Archetype Object Creator.
- Every active app README should state what it owns, reads, writes/exports and must not own.
- Shared embedded tools such as the Procedural Sound Generator or a contextual Quest dialogue screen may open within calling apps without becoming navigation modules.

## Template Game Contract Boundary

Template Game is a later populated test/reference project using this hierarchy and these schemas. It should prove real cross-app references through a minimal screen, scene, structural route, promoted assets, app-owned object/effect/Quest records and, when integration exists, a saved Puzzle linked into a Quest step.

When procedural audio playback and Asset Library registration exist, Template Game should preferably include one generated synth sound assigned through `asset_` ID.

## Required Adoption Work

- Migrate remaining user-facing **Project Manager** labels to **Project Editor** in controlled versioned app passes and safely migrate legacy stored todo filename use.
- Implement Creation Guide intake/media/logo sections.
- Integrate the connected project-folder service into Project Editor and remaining authoring apps.
- Implement draft-versus-file state and unsaved-navigation guards consistently.
- Make apps load active project files rather than unrelated demo/default state when a project is connected.
- Align Quest Builder export/index output and add structured Quest/dialogue/Puzzle-link authoring according to `07a` and `07b`.
- Align Puzzle Creator to canonical `puzzles/` index/content saving before Quest Builder selects saved puzzles.
- Build the shared Procedural Sound Generator and `asset_` audio assignment workflow.
- Build and validate the separate Template Game reference flow.
- Keep ZIP/package exports as backup/fallback rather than normal editing workflow.