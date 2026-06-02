# Artifex Master Contract and Project File Rules

Status: Foundation draft for documentation consolidation  
Prepared from current `main` baseline: `184309255347439a5e6ce82a6e6aa1fc99442760`  
Intended final role: the single governing contract for rules that apply across the Artifex suite.

## Purpose

This document is the central Artifex contract. It defines the universal rules that every Artifex module or maintained shared service must follow when it reads, writes, links, validates or builds a project.

Artifex is a reusable game-building system. **Forever Bound / Artifacts Adventures** is a game project that may be authored through Artifex; it is not the definition of Artifex itself.

This contract must not become a running development diary or module to-do list. It owns platform-wide decisions only. Information unique to one module belongs in that module's single specification document. Work still to be done belongs in `docs/GLOBAL_TODO.md`.

## Documentation Authority Model

The active Artifex documentation set follows this rule:

```text
One master contract for universal Artifex rules:
  docs/artifex/1A-project-file-contracts.md

One specification document per actual module or maintained shared service:
  purpose, ownership boundary, active route/baseline, unique interface and module-only rules

One human-readable active work list:
  docs/GLOBAL_TODO.md

Archive:
  historical audits, handovers, superseded baselines, completed implementation records,
  old app-specific todo/status documents and failed-acceptance records
```

A module specification must refer to this contract rather than copying universal save, path, branding, ID, asset, wrapper or documentation-control rules into its own file.

Exact data schemas may remain in subordinate technical references where repeating the full JSON structures here would be impractical. A technical reference provides implementation detail; it must not contradict or independently redefine this contract.

## Required Technical and Module References

The following documents remain valid reference types only where their subject applies:

```text
docs/artifex/19a-project-starter-file-schemas.md
  exact minimum starter JSON shapes and typed empty indexes

docs/artifex/22-sound-archetype-generator.md
  Sound Generator module/service specification and generated-audio workflow

docs/GLOBAL_TODO.md
  all active shared and module-specific work still to be completed
```

Further existing files will either become one module's cleaned specification document, be absorbed where they contain universal rules, or be archived after useful information is transferred. Until the consolidation pass is completed and accepted, existing files on `main` remain historical/source evidence and must be checked rather than silently discarded.

## Locked Project Layers

These three project concepts must not be merged together:

| Term | Meaning | Created or populated by |
|---|---|---|
| **Blank Starter Project** | An empty valid project structure containing starter structural files, required directories and empty indexes, with optional intake setup. | Creation Guide / shared project structure initialiser. |
| **Template Game** | A small populated connected reference project proving that Artifex modules can read, write and reference one another's real files. | The relevant owning modules and later validation/build work. |
| **Artifacts Adventures** | The first real production project to be authored through Artifex once the Template Game integration flow is proven. | Creator through the Artifex toolchain. |

A Template Game uses the same project contract as a real production game. It is populated test/reference content, not a separate file format.

Creation Guide may initialise a Blank Starter Project. It must not populate module-owned scenes, screens, quests, puzzles, archetypes, effects, promoted assets, Health output or Build output merely because the folders exist.

## Locked User-Facing Module Naming

The structural Manifest / Flatplan / route tool is named **Project Editor**.

Existing identifiers, task IDs, historical documents or stored filenames containing `project-manager` are migration cases. New documentation and new user-facing UI must not introduce **Project Manager** as a second official tool name. Stored-file migrations must be deliberate and backward-compatible.

## Universal Module Boundary Rule

Artifex modules communicate through stable IDs, project-relative paths and defined references. One module must not swallow another module's authored content merely because it needs to use or validate it.

At platform level, the ownership boundaries are:

| Module or service | Owns / writes | Must not own or author |
|---|---|---|
| Hub / Artifex Portal | navigation entry points and presentation of available modules/projects where implemented | authored project content |
| Creation Guide | Blank Starter Project initialisation, project registration/setup, starter input-map creation, optional intake setup and setup/readiness reporting | populated scenes, quests, puzzles, object/FX definitions, promoted asset content or build output |
| Project Editor | project structural graph, Flatplan/routes, project-level structure and structural references | scene interiors, quest internals, puzzle internals, object/FX authoring or raw asset promotion |
| Scene Editor | scenes, screens, visual placements and scene instance references | project route structure, quest/puzzle internals or sound-recipe authoring |
| Quest Builder | quests, sidequests, branches, progression conditions/outcomes and quest-scoped story/dialogue content where defined | puzzle internal definitions, visual scene layout, asset media/recipe authoring or project route structure |
| Puzzle Creator | self-contained puzzle definitions, internal challenge rules and puzzle-owned references | whole quest chains, project route graph or copied sound recipes |
| Archetype Object Creator | reusable non-FX object archetypes and references to final registered assets | scene instances, quest/puzzle internals, FX definitions or copied procedural recipes |
| Effect Editor | reusable effect archetypes and their index entries | object archetypes, scene placement or unrelated gameplay structure |
| Asset Library | final registered supplied/generated assets, metadata and groups | gameplay behaviour definitions |
| Sound Generator | procedural sound recipe authoring, preview/playback mapping and request for final Asset Library registration | object, scene, quest or puzzle behaviour records |
| Shared Project Folder Service | browser folder handles, permission state, relative-path reads/writes and shared draft/save guards | decisions about authored module content |
| Shared Health Guide | generated readiness/audit/validation reporting | silent correction or overwriting of authored content |
| Playtest / Runtime Engine | reading authored project data to run or preview playable content | primary authoring ownership |
| Build Game | generated validated runtime/build package output | authoring module internals |

The detailed unique workflow for a module belongs in that module's own specification document; this table establishes the universal separation rule.

## Core Project Data Rules

1. Each module writes only the files for its owned job, plus required index or registration updates for content it legitimately creates.
2. Unique authored content lives in the smallest owned file that needs it; reusable content is registered and referenced rather than copied into unrelated records.
3. The connected project root becomes the normal editable source of truth once writable permission has been granted.
4. Browser-local data is a draft/recovery layer and workspace state, not the permanent project source of truth.
5. IndexedDB may store browser folder handles and permission metadata; project JSON must never store browser handles or private absolute computer paths.
6. Every stored project path is project-relative to the selected connected project root.
7. `intake/` is staging for supplied source material only; permanent authored/runtime content references final registered assets, not intake files.
8. ZIP or download export is backup, transfer and no-permission fallback, not the normal everyday save path once connected-folder saving exists.
9. Health, Build, backup and generated project-task outputs are created only by their owning systems when required.
10. Build Game validates/packages modular authored files; it does not replace the authoring modules.
11. Generated procedural sounds and imported audio are final Asset Library resources referenced by `asset_` IDs; Artifex does not create a parallel `archsound_` library.
12. Puzzle Creator owns self-contained puzzle definitions. Quest Builder may refer to a saved puzzle by stable `puzzle_` ID while owning the quest context and outcomes; it must not copy puzzle internals.

## Connected Project Folder and Save Behaviour

Normal intended editing flow:

```text
Creation Guide creates or opens a project
→ user connects the real project root folder and grants access
→ Creation Guide initialises missing Blank Starter Project foundations only
→ optional intake staging is explained/created
→ each authoring module loads and edits its owned project data
→ local recovery drafts protect work while editing
→ deliberate Save writes owned files into the connected project folder
→ Health / Playtest / Build validates saved data as required
→ backup/export/version-control actions remain deliberate separate actions
```

The shared project-folder service uses browser-supported folder access and stores folder handles/permission state outside project JSON. A known handle may require re-authorisation before writing.

### Universal Save-State Language

Apps that author project data should use the following shared state meanings when the relevant functionality is implemented:

```text
Saved to Project Folder
Local Draft Only
Project File Changed
Conflict
Permission Required
No Folder Connected
Save Failed
```

When a user leaves an app while local-only authored changes have not been written to the connected project folder, the shared navigation guard should offer appropriate choices such as:

```text
Save and Continue
Stay Here
Continue Without Saving
Export Backup
```

A normal web app cannot silently save to an arbitrary typed disk path. A private absolute local disk path may be shown only as user-side planning/reference where still required by older UI, and must not become stored project-file data or an assumed writable save target.

## Canonical Connected Project Folder Hierarchy

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
        synth_<slug>.json       [generated procedural audio only when created]
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
    project-editor-todos.json
```

This hierarchy describes the complete possible connected project package. Blank Starter Project initialisation creates only the valid starter foundations, required directories and typed empty indexes. Populated module records and generated Health/Build/backup/project-task files are produced later by their owners.

Older code or projects may still use `todos/project-manager-todos.json`. Migration to `todos/project-editor-todos.json` must read/recover/convert earlier data deliberately rather than abandoning it silently.

## Canonical Schemas and Typed Indexes

The exact minimum JSON shapes for starter files and typed indexes are defined in:

```text
docs/artifex/19a-project-starter-file-schemas.md
```

Universal schema rules are:

- Creation Guide creates initial starter files only after the user chooses or authorises the connected project root.
- Existing project files are not silently overwritten during initialisation.
- Project Editor may subsequently load, validate and write its owned structure files without inventing a conflicting file shape.
- Typed index collections such as `quests`, `puzzles` and `assets` remain typed; they must not be replaced by generic `items` collections in real project files.
- A Blank Starter Project has `startScreenId: null` until a real registered start screen exists.
- Every file path inside project data is relative to `<project-root>/`.

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

`action_` IDs refer to mapped player controls such as Invoke/Interact. Quest or Puzzle operations such as `speak`, `give`, `collect`, `solve` or `defeat` must not be treated as input-map actions merely because they are actions in plain English.

## Intake, Assets and Procedural Audio

A project's supplied-source staging area is:

```text
<project-root>/intake/
```

The standard first-level intake buckets are:

```text
backgrounds/
characters/
objects/
icons-ui/
music/
dialogue-sfx/
```

Universal rules:

- `intake/` contains incoming/source or in-progress staging material, not final runtime/library references.
- Final authored scene, screen, quest, puzzle, object, effect and runtime content must reference promoted or generated registered assets through final asset records/IDs.
- Asset Library owns final promotion/registration of approved supplied assets and the metadata/groups used to expose them to authoring modules.
- A resource created wholly inside Artifex, such as procedural synth audio, may be registered directly as a final asset without first being written to `intake/`.
- Generated synth audio uses the same Asset Library selector/reference model as imported audio:

```text
assets/audio/sfx/synth_<slug>.json
assets/asset-index.json → asset_sfx_<slug>
```

Calling modules store the final `asset_` ID only. They must not copy a synth recipe into object, scene, quest or puzzle content and must not invent `archetypes/sound-index.json`, `archetypes/sounds/` or `archsound_` IDs.

Detailed Sound Generator controls, recipe/playback behaviour and its registration callback belong in the Sound Generator module specification:

```text
docs/artifex/22-sound-archetype-generator.md
```

## Cross-Module Reference Rules

A module may reference another module's registered output where its own job requires that relationship, but it does not acquire ownership of the referenced content.

Examples of universal boundaries:

- Scene Editor may place an object instance or effect instance and store final sound asset references, but does not author the reusable object/effect/sound recipe itself.
- Quest Builder may use a saved `puzzleId` in quest flow and define prerequisites, story context, outcomes, rewards, flags or dialogue around it, but does not copy the puzzle's grid, feature configuration or completion logic.
- Project Editor may connect scenes/screens/routes and consume public quest/flag/puzzle results where wider structure needs gating, but does not author quest or puzzle internals.
- Health Guide may report a missing reference or save conflict, but does not silently repair the owning module's authored content.
- Build Game may reject or report unresolved referenced resources, but does not become their authoring owner.

Detailed interfaces belong in the owning module specification or, during migration, in the existing source document until its information has been assigned to the correct module spec.

## Universal Artifex UI Branding and Display Rules

These rules apply to Artifex tool surfaces. They govern platform consistency and must not be independently redefined inside each module specification.

### Base Design Frame

```text
Logical size: 2400 × 1080
Aspect ratio: 20:9
Primary intention: horizontal / landscape phone-first layout
Scaling: preserve aspect ratio with black borders where needed
```

Future display presets may include Phone Classic 19.5:9 and Standard Video 16:9. Fill-screen behaviour remains a future option only after fixed-frame behaviour is reliable.

### Global Shell Mark and Header Layout

The shared fallback Artifex mark is the rune `ᚠ` displayed at a 45-degree angle. A valid Artifex image logo may be used when available; a module must not invent a replacement global shell logo because it lacks an image asset.

Every Artifex app header should follow this order:

```text
Logo / app title → version pill → vertical divider → main menu
```

The version appears as a compact pill immediately after the app title, not in a footer, far-right badge or settings area.

### Visual Tone and Accent Meanings

The platform chrome should feel dark, warm, ancient and crafted: near-black/deep-brown surfaces with bronze, copper, parchment, soft-gold and cream text. Module accent colours identify the active tool family and should be used for selection/glow/key state, not as a replacement for the base Artifex chrome.

```text
Hub / global shell: bronze / copper
Project Editor: yellow-gold
Creation Guide / setup tools: grey / neutral
Scene Editor: purple
Quest Builder: green
Puzzle Creator: green
Effect Editor: cyan-blue
Archetype Object Creator: red
```

### Common Dense-Editor Interaction Rules

- Cards use dark surfaces, rounded corners and thin bronze/copper borders.
- Long/dense side-panel cards expose compact collapse controls where needed.
- Buttons are compact, rounded and tactile; active/selected/focused states use the module accent glow or border.
- Toolbars and dense action rows prefer icons, emojis or short labels with informative `title` tooltips.
- Every icon-only button, important input, slider and select must expose a meaningful mouseover tooltip.
- Sliders show numeric output nearby where their value matters.
- Related controls stay grouped rather than being scattered into repeated cards.
- A bottom panel uses one collapse/expand control for the whole panel rather than one collapse control on every bottom card.

The detailed former colour reference can be preserved as source material during migration, but no module may override these universal meanings independently in its own spec.

## Universal Code Ownership and Stability Rules

- App entry files should remain thin; state, UI, renderer, IO, libraries, health and data definitions should live in appropriate permanent owning modules.
- Before adding unrelated functionality, files above 500 lines require review; files above 800 lines are refactor risks unless their size is justified.
- Do not use new patch, rescue, hotfix, enhancer or wrapper layers as the normal route for implementing permanent behaviour.
- A behaviour must have one active owner. A repair is complete only when valid behaviour lives in its permanent owner and obsolete competing paths are safely removed or archived after verification.
- Current `main` is the implementation baseline. Old PRs, branches, audits and failed attempts may be read as evidence but are not implementation bases unless specifically approved.
- Implementation passes must be narrowly scoped, separately approved, tested and stopped for acceptance before unrelated work continues.
- Archive superseded files initially rather than deleting them, and only after inactivity or replacement has been verified.

## Documentation Control Rules

From the point this consolidation is approved:

- Universal platform rules belong only in this master contract.
- Each module/service has one active specification document for its unique permanent information, ownership, active route/baseline and specific interface.
- Current, next, blocked and future work belongs only in `docs/GLOBAL_TODO.md`, organised under **All Apps / Shared Platform** or the relevant module/service section.
- A machine-readable task file may remain where an application actively depends on it, but it must be identified as a machine/runtime dependency and not maintained as a second competing human backlog.
- Dated audits, handovers, status updates, completed pass records and failed-acceptance plans are archive material after their still-valid rules or tasks have been transferred.
- No new app-specific `todo.md`, current-state diary, status-refresh or active dated audit may be treated as another source of truth.
- An archived document must be clearly historical and must not be referenced as the current authority for implementation.

## Migration Note

This file is a new consolidation draft built from existing contract and platform-rule sources. It does not authorise runtime changes, schema rewrites, automatic file movement or archive decisions by itself.

The active migration work still required to adopt this model, reconcile module specifications, revise `docs/GLOBAL_TODO.md`, check machine-readable task dependencies and archive superseded documents belongs in the single global to-do list and must be performed in approved documentation-only passes.