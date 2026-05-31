# Project File Contracts and Module Integration Rules

## Purpose

This document is the central Artifex contract for how apps share, read and save project data without swallowing one another or inventing incompatible file structures.

Artifex contains connected authoring modules including Creation Guide, Project Editor, Scene Editor, Quest Builder, Puzzle Creator, Effect Editor, Archetype Object Creator, Asset Library, Health Guide, Playtest and Build Game. They must operate on one coherent connected project folder, with stable ownership, project-relative references, recoverable local drafts and controlled generated output.

## Required Companion Documents

Every app working on project files should inspect this contract together with:

```text
docs/artifex/18-color-and-display-rules.md
docs/artifex/19a-project-starter-file-schemas.md
docs/artifex/20-asset-intake-workflow.md
docs/artifex/21-template-game-project-contract.md
artifex/shared/todo-guide/README.md
artifex/shared/todo-guide/all-apps-todos.json
```

This document defines ownership, folder paths, save rules and cross-app boundaries. `19a-project-starter-file-schemas.md` defines the exact minimum JSON shapes that Creation Guide creates and Project Editor must retain. `20-asset-intake-workflow.md` defines staging/promotion of source assets. `21-template-game-project-contract.md` defines the later populated cross-app reference project.

## Three Distinct Project Layers

These concepts must stay separate:

| Layer | Meaning | Created/populated by |
|---|---|---|
| **Blank Starter Project** | Empty valid structure with top-level starter files, required folders and empty indexes. | Creation Guide / shared project-structure initializer. |
| **Template Game** | Small populated connected reference project proving cross-app reading, writing and references. | Appropriate owning apps and later validation/generation work. |
| **Artifacts Adventures** | First real production game project authored through Artifex after the Template Game flow works. | Creator through the full Artifex workflow. |

Creation Guide must not populate module-owned scene, quest, puzzle, archetype, effect, asset, health or build content merely because the complete project hierarchy provides places for it.

## Core Rules

1. Each Artifex app owns and writes only the files for its job, plus required index/registration updates for content it creates.
2. Unique content lives in the smallest file that needs it; reusable project content belongs in registered indexes/libraries.
3. The connected project root on the user’s computer becomes the normal editable source of truth once writable access is granted.
4. `localStorage` is an autosave/recovery-draft layer, not the permanent project file.
5. IndexedDB may store browser directory handles and permission metadata; handles never go into project files or GitHub.
6. Project files store project-relative paths only, never private absolute HDD paths.
7. `intake/` is source-material staging only; permanent authored/runtime records reference final promoted `assets/` paths or IDs only.
8. ZIP export remains backup, transfer and no-permission fallback, not the intended everyday save route.
9. Generated Health, Build, backup and app-authored task outputs are created by their owning systems when needed; the blank initializer must not pretend they already exist.
10. Build Game validates and packages modular files; it does not replace authoring apps.

## Connected Project Folder and Direct-Save Contract

### Normal Direction

```text
Create or select a project in Creation Guide
→ Connect the real project root folder
→ Creation Guide initialises missing blank starter files/folders/empty indexes
→ optional intake staging is explained/created
→ author content in the appropriate app
→ autosave local recovery drafts while editing
→ deliberate Save actions write owned files into the connected project folder
→ run Health/Audit/Build checks
→ back up or push approved changes separately
```

### Browser Mechanism

The shared project-folder service uses the browser File System Access API:

```text
Connect Project Folder
→ window.showDirectoryPicker({ mode: "readwrite" })
→ user selects the project root and grants access
→ Artifex stores the FileSystemDirectoryHandle in IndexedDB
→ apps read/write registered files by project-relative path
```

Do not store the directory handle in project JSON or localStorage JSON. A saved handle may later require explicit re-authorisation before writing.

### Relative Paths Only

Valid references include:

```text
project.json
logic.json
scenes/scene_forest_path.json
archetypes/objects/archobj_mel.json
assets/asset-index.json
health/latest-health-report.json
build/runtime-project.json
```

Invalid project data references include private disk locations such as `C:/Users/...` or `E:/Forever Bound/...`.

### Save Status Language

All apps authoring project data should eventually expose:

```text
Saved to Project Folder      Local draft and connected file match.
Local Draft Only              Work exists only in browser recovery data.
Project File Changed          The connected file differs from the draft baseline.
Conflict                      Both draft and connected file changed since sync.
Permission Required           A known folder must be re-authorised.
No Folder Connected           Only local draft/import/export is available.
Save Failed                   A requested write did not complete successfully.
```

### Local Draft and Navigation Guard

Autosave may update local recovery drafts quietly. Writing real project files must be deliberate, such as **Save**, **Save All**, **Save and Continue**, **Build Project**, or confirming creation of a registered item.

When leaving an app with local-only unsaved changes, the user must be warned that work has not been written to the project folder and offered:

```text
Save and Continue
Stay Here
Continue Without Saving
Export Backup   [when write access is unavailable]
```

## Shared Project-Folder Service

Direct folder access is shared platform behaviour. Apps must not independently improvise incompatible permissions or write systems.

Shared responsibilities include:

```text
connect/re-authorise/forget project-folder handle
store/retrieve directory handle in IndexedDB
read/write by project-relative path
create permitted subfolders/files
track save state and errors
compare drafts and project files
support unsaved-navigation guards
provide import/export fallback
```

Current implementation status: Creation Guide V1.1.12 uses a clean current base runtime plus the initial shared folder client and structure initializer to connect a folder, create blank starter structure and optionally create intake folders. Project Editor v0.1.32 CONTRACT has been aligned to the canonical schema shapes and now uses explicit feature registration rather than live nested UI enhancers, but still saves browser drafts until direct-folder integration is built.

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
    objects/
      archobj_<slug>.json
    effects/
      archeffect_<slug>.json

  assets/
    asset-index.json
    groups/
      assetgroup_<slug>.json
    images/
      backgrounds/
      characters/
      props/
      ui/
    sprites/
      characters/
      objects/
      fx/
    audio/
      music/
      sfx/
      voice/
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
    project-manager-todos.json
```

This is the possible complete connected package, not a promise that every listed output file exists immediately. Blank Starter Project initialisation creates starter top-level files, required directories and empty index files only. Intake folders may be a separate optional setup step. Health reports, build outputs, backup manifests and populated app content are produced later by their owners.

## Starter File and Index Schemas

Exact fields and JSON shapes for:

```text
project.json
logic.json
layout.json
registry.json
library-links.json
input-map.json
scene/screen/quest/sidequest/puzzle/object/effect/asset indexes
```

are defined only in:

```text
docs/artifex/19a-project-starter-file-schemas.md
```

Creation Guide and Project Editor must use those shapes. Apps must not replace typed index collections such as `scenes`, `quests` or `assets` with a generic `items` structure when writing actual project files.

A separate implementation decision remains to resolve: a genuinely blank starter project must not point to a start screen record that does not exist. The recommended follow-up is `startScreenId: null` for Blank Starter Project until an actual screen or Template Game is created.

## Asset Intake and Promotion Contract

Every project may have a root-level source staging area:

```text
intake/
  README.md
  backgrounds/
  characters/
  objects/
  icons-ui/
  music/
  dialogue-sfx/
```

Creation Guide owns first-time explanation and optional creation/validation of this structure, including **Create Intake Folders** and **Skip for Now**. Asset Library/import tooling later preserves source metadata, assigns stable `asset_` IDs, copies/renames approved material into final `assets/` destinations and updates registered asset/group records.

No scene, screen, quest, archetype or runtime content may permanently reference `intake/` source files.

## Ownership Matrix

| Module / service | Owns / writes | Must not own |
|---|---|---|
| Creation Guide | initial blank project files/folders/empty indexes, project registration, setup status, future intake explanation and media readiness, starter input map | populated scene/quest/puzzle/archetype/FX/asset/build content |
| Project Editor | structural graph/route/layout/registry/library-link data and project-level structural validation | scene interiors, quest internals, object/FX authoring, raw asset promotion |
| Scene Editor | scenes, screens, layout/placements and scene instance references | project route graph |
| Quest Builder | quests, sidequests, branches, flags, conditions, rewards | visual scene layout |
| Puzzle Creator | puzzle definitions/index records | structural route graph except references it consumes |
| Archetype Object Creator | reusable non-FX object archetypes and index entries | scene instances and FX definitions |
| Effect Editor | reusable effect archetypes and index entries | object archetypes and scene placement |
| Asset Library | promoted final asset files, metadata and groups | gameplay behaviour |
| Shared Project Folder Service | handles, permission state, shared relative-path reads/writes and draft/save guards | decisions about module-authored content |
| Health Guide | generated health/audit reports | silent content correction or overwriting conflicts |
| Build Game | generated runtime/build output | authoring app internals |

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
condition_     Condition expression/rule
puzzle_        Puzzle definition
action_        Gameplay/input action mapping
archobj_       Reusable object archetype
objinst_       Scene instance of object archetype
archeffect_    Reusable effect archetype
fxinst_        Scene instance of effect archetype
asset_         Final registered asset
assetgroup_    Asset group/sprite group
template_      Template project/package item
health_        Health item/report item
assignment_    Creation Guide assignment
milestone_     Creation Guide milestone
```

## Module Code and UI Integration Rules

- Keep app entry files thin; split state, UI, renderer, IO, libraries, health and data definitions into clear modules.
- Review files above 500 lines before adding unrelated features; treat files above 800 lines as refactor risks unless justified.
- No app should keep more than two active transitional patch/wrapper layers.
- Every app should keep shared Module menu names/order stable: Hub, Creation Guide, Project Editor, Scene Editor, Quest Builder, Puzzle Creator, Effect Editor, Archetype Object Creator.
- Every active app README should state what it owns, reads, writes/exports and must not own.

## Template Game Contract Boundary

Template Game is not created merely by running the blank initializer. It is a later populated test/reference project using this same hierarchy and schemas. It should prove real cross-app references through a minimal screen, scene, structural route, promoted assets, app-owned archetype/effect/quest records where included and honest Health/Build validation.

Artifacts Adventures is separate production work and must not be renamed or treated as the Template Game.

## Required Adoption Work

- Resolve the Blank Starter Project start-screen null/reference rule.
- Implement Creation Guide intake/media/logo sections.
- Integrate the connected project-folder service into Project Editor and other authoring apps.
- Implement draft-versus-file state and unsaved-navigation guards consistently.
- Make apps load active project files instead of unrelated demo/default state when a project is connected.
- Build and validate the separate Template Game reference flow.
- Keep ZIP/package exports as backup/fallback rather than normal editing workflow.