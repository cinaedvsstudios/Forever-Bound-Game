# Sound Generator / Sound Library Specification

Status: Active module/service specification during documentation consolidation  
Owning module/service: Shared Sound Generator / Sound Library  
Active specification file: `docs/artifex/18A-sound-library.md`  
Legacy source file to archive later: `docs/artifex/22-sound-archetype-generator.md`  
Active route: no normal authoring app route; shared popup/component infrastructure with a preview harness  
Current verified implementation baseline on `main`: shared Create Synth Sound popup and Web Audio procedural runtime under `artifex/shared/sound-generator/`, with preview harness at `artifex/apps/sound-generator-preview/`  
Protected active-work note: PR #46, **Build shared Sound Library and redesign Create Synth Sound**, remains open and unmerged; Sound Library selector work from that PR is provisional until accepted  
Governing universal contract: `docs/artifex/01A-project-file-contracts.md`  
Related specifications: `docs/artifex/10A-asset-library.md`, `docs/artifex/11A-connected-project-folder.md`, `docs/artifex/13A-registered-content-picker.md`  
Outstanding work source: `docs/artifex/02A-global-to-do.md`

## Purpose

The Shared Sound Generator / Sound Library provides reusable audio selection and procedural sound creation for Artifex authoring modules.

It lets Object Creator, Scene Editor, Puzzle Creator, Quest Builder, Effect Editor and future UI/event tools assign sounds without creating separate sound ownership systems.

The generator creates and previews game sound effects using browser Web Audio. The Sound Library concept presents imported audio files and generated procedural synth recipes together as normal registered Asset Library audio records.

In project storage, both imported audio and generated procedural sounds are final registered `asset_` records. This system must not create a separate sound-archetype library.

## Ownership Boundary

Sound Generator / Sound Library owns:

- shared Create Synth Sound popup UI;
- Web Audio procedural preview runtime;
- procedural synth controls, presets, randomisation and recipe serialisation;
- generated-audio JSON recipe schema;
- save-and-assign flow for generated audio assets;
- future shared Sound Library modal for selecting imported audio files and generated synth recipes;
- caller-context capture so Save and Assign Here returns the registered audio asset ID to the initiating field/task;
- preview behaviour for registered audio assets where implemented.

Sound Generator / Sound Library must not:

- create `archsound_` IDs;
- create `archetypes/sound-index.json`;
- create `archetypes/sounds/`;
- copy procedural recipes into object, scene, puzzle, quest or effect records;
- silently save the caller's object, scene, puzzle, quest or effect record;
- become the general Asset Library owner for all audio imports;
- replace Asset Library final registration;
- bypass connected-folder save rules;
- treat preview-only generated data as saved project content.

## Core Storage Rule

All saved sounds are final registered Asset Library audio assets.

Generated procedural sound recipe example:

```text
assets/audio/sfx/synth_locked_door_buzz.json
assets/asset-index.json: asset_sfx_locked_door_buzz
```

Imported sound file example:

```text
assets/audio/sfx/sfx_wooden_door_creak.wav
assets/asset-index.json: asset_sfx_wooden_door_creak
```

A calling app stores only the registered asset ID:

```json
{
  "onLocked": "asset_sfx_locked_door_buzz"
}
```

It must not store the full recipe or a copied audio file path as its own module data.

## No Sound-Archetype Library

The term "Sound Archetype" may be useful as user-facing language because a generated sound is reusable and editable.

In project storage, there is no separate sound-archetype module.

Forbidden structures:

```text
archetypes/sound-index.json
archetypes/sounds/
archsound_
```

Correct storage:

```text
assets/asset-index.json
assets/audio/sfx/
asset_sfx_
```

## Current Implemented Baseline on Main

The current shared generator folder exists at:

```text
artifex/shared/sound-generator/
```

The current README identifies this folder as the reusable Create Synth Sound popup and Web Audio preview runtime.

It says generated sounds use the existing Asset Library model, becoming normal registered audio assets with `asset_sfx_` IDs and recipe files under `assets/audio/sfx/`.

It lists active shared files including:

```text
sound-generator-window.js
sound-generator-ui-v1.js
sound-generator-controls.js
sound-generator-presets.js
procedural-synth-schema.js
procedural-synth-runtime.js
sound-generator-store.js
sound-generator.css
```

The current public API is:

```js
import {
  mountSoundGenerator,
  openSoundGeneratorModal
} from "../../shared/sound-generator/sound-generator-window.js";
```

The current `sound-generator-window.js` exposes:

```text
mountSoundGenerator(container, options)
openSoundGeneratorModal(options)
window.ArtifexSoundGenerator.mount
window.ArtifexSoundGenerator.openModal
```

The current UI implementation identifies itself as V1.17 and imports controls, presets, procedural schema, runtime, project-folder client and save/import/export helpers.

The preview harness exists at:

```text
artifex/apps/sound-generator-preview/
```

That preview harness is only a browser test page. It imports the shared popup and logs assigned `assetId` values. It does not contain the synth engine, presets, runtime, save logic or shared CSS.

## Current Generated Audio Record Shape

A generated audio asset record uses:

```text
schemaVersion: artifex.audio.procedural-synth.v1
assetId: asset_sfx_<safe_slug>
assetKind: procedural-synth
resourcePath: assets/audio/sfx/synth_<safe_slug>.json
playbackEngine: web-audio
```

The recipe JSON preserves both editable creator-facing control values and runtime-ready synthesis values.

This is important because slider mappings may improve later while saved sound playback remains stable.

## Current Sound Generator UI Direction

The current Create Synth Sound UI is practical game-SFX oriented, not a raw synthesizer lab.

It supports:

- Use Example;
- Start New;
- sound identity fields;
- waveform choice;
- Pitch Change controls using Drops, Steady and Rises;
- frequency graph;
- Play and Stop preview;
- Random Sound;
- Variation;
- Reset;
- Export JSON;
- Import JSON;
- Save to Library;
- Save and Assign Here;
- visible simple controls;
- advanced SFXR-style controls.

The advanced control groups currently include:

```text
Envelope
Frequency
Vibrato
Arpeggiation
Duty Cycle
Retrigger
Flanger
Low-Pass Filter
High-Pass Filter
Output
```

The user-facing language should stay practical. Avoid exposing only technical synthesis terms when a plain game-sound label is clearer.

## Save Behaviour

### Save to Library

Save to Library deliberately writes two connected-project changes:

```text
assets/audio/sfx/synth_<slug>.json
assets/asset-index.json
```

The recipe file stores the generated procedural synth definition. The asset index record registers it as a normal audio asset.

### Save and Assign Here

Save and Assign Here performs the same save, then returns the registered `asset_sfx_` ID to the captured caller callback.

The popup must not silently write the caller's object, scene, puzzle, quest or effect record. The caller remains responsible for its own normal Save action.

### Caller Target Capture

When a popup opens from a caller field, it must remember the initiating target. If the user changes selection in the caller UI while the popup is open, Save and Assign Here must still return the new `asset_` ID to the initiating field/task, not to whatever is currently selected.

This rule is especially important for Archetype Object Creator sound assignments.

## Sound Library Concept

The Sound Library is the shared selector for registered audio assets.

It should list both:

```text
Imported Audio File
Generated Synth
```

from the same Asset Library source:

```text
assets/asset-index.json
```

The selector should return only registered `asset_` IDs.

It must not create a parallel sound library. It is an audio-facing view over final registered Asset Library records.

## PR #46 Provisional Work

Open PR #46 is still unmerged.

It proposes and partially implements:

- shared Sound Library modal API `openSoundLibraryModal(...)`;
- audio filtering over `assets/asset-index.json`;
- preview for imported audio files and generated synth recipes;
- Create New Synth Sound from the Sound Library;
- constrained Random Variation;
- temporary history and favourites;
- focused save-confirmation flow;
- preview harness changes;
- Playwright smoke test for imported and generated audio listing, preview, save and select;
- adoption tasks for caller apps.

Because PR #46 is open and not merged, its Sound Library selector architecture remains provisional. It should be treated as likely direction, not accepted baseline, until merged or explicitly approved.

## Relationships

### Asset Library

Asset Library owns final `asset_` records and final audio files/recipes.

Sound Generator may create a generated procedural recipe and request/save the corresponding Asset Library registration through a deliberate save action. That does not make Sound Generator the general Asset Library.

Imported audio file promotion belongs to Asset Library.

Generated procedural audio created inside Artifex may go directly to final `assets/audio/sfx/` because it is created and approved in the tool rather than supplied as external intake material.

### Connected Project Folder Service

Saving a generated synth requires connected-project writes:

```text
assets/audio/sfx/synth_<slug>.json
assets/asset-index.json
```

The Connected Project Folder Service owns permission, project-relative path writes and save-state reporting.

### Registered Content Service / Picker

The Registered Content Service supports general final asset selection.

The Sound Library is an audio-specific selector over final registered assets. It may reuse registered-content concepts, but it should filter for audio-file and procedural-synth records and provide audio preview behaviour.

### Caller Apps

Object Creator may use sounds for pickup, interact, open, locked, idle and machine events.

Scene Editor may use sounds for scene enter, ambience, local triggers, portal/machinery areas and transitions.

Puzzle Creator may use sounds for correct input, wrong input, sequence step, timer warning, unlock, completion and failure.

Quest Builder may use sounds for quest start, completion, failure, reward, dialogue, feedback and Capra response.

Effect Editor may use sounds for optional effect start, loop, impact and end cues.

All caller apps store only registered `asset_` IDs and remain responsible for their own records.

### Runtime / Playtest

Runtime and Playtest must eventually play both imported audio files and procedural synth recipe assets.

Imported audio playback reads the final audio file.

Procedural synth playback executes the saved JSON recipe through the shared Web Audio runtime.

### Health and Build Game

Health and Build should validate:

- missing audio `asset_` IDs;
- missing recipe files;
- invalid procedural-synth schema;
- unsupported playback engine values;
- final records pointing to missing files;
- caller records that copied recipes instead of storing IDs;
- forbidden `archsound_` or sound-archetype structures;
- permanent references to intake audio files.

## Current Gaps

Known gaps include:

- PR #46 Sound Library modal is open and unmerged;
- caller-app adoption remains future work for Object Creator, Scene Editor, Puzzle Creator, Quest Builder and Effect Editor;
- Asset Library imported-audio promotion is not complete;
- runtime/playtest integration for procedural recipes is not fully proven across the full game runtime;
- Health/Build validation for procedural-synth assets is not complete;
- Template Game does not yet include a validated generated procedural sound;
- usage tracking for editing a generated sound used in multiple places is not implemented;
- shared Sound Library preview of imported and generated audio should remain protected until PR #46 is accepted;
- no caller should store recipe copies or create sound-archetype records.

## Source Classification

`docs/artifex/22-sound-archetype-generator.md` remains source evidence only. Its valid permanent rules are consolidated into this new `18A` specification. The old file should be archived later rather than replaced.

`artifex/shared/sound-generator/README.md` is current implementation evidence for the shared Create Synth Sound popup, Web Audio runtime, active files, generated audio record shape and save behaviour.

`artifex/shared/sound-generator/sound-generator-window.js` is current implementation evidence for the public popup API.

`artifex/shared/sound-generator/sound-generator-ui-v1.js` is current implementation evidence for the V1.17 UI, controls, project-folder import and save helpers.

`artifex/apps/sound-generator-preview/README.md` and `sound-generator-preview-host.js` are current evidence for the preview harness only. They are not the shared engine.

PR #46 is current open work for the Sound Library selector and redesigned sound workflow. It should not be treated as merged baseline until accepted.


## Starter Placeholder Audio Notes

Archived starter-placeholder audio notes identify the template audio pack as rough, original synthetic prototype material for UI actions, map actions, interactions, movement, combat, generic effects, scene transitions, reward stings and lightweight MIDI music loops. These placeholders are for wiring playback and loop behaviour only; production audio must still be promoted into final project audio paths and registered through the owning Asset Library / Sound Library workflow before it is referenced by gameplay data.

The old placeholder README listed short mono MP3 sound effects and lightweight General MIDI cues as browser-friendly testing assets. That list is archive evidence, not a second active Sound Library catalogue.

## Required Future Work

The active backlog, not this specification, owns implementation tasks. The main known work is:

- decide and merge or reject the PR #46 Sound Library selector architecture;
- finish or confirm shared Sound Library modal over registered audio assets;
- finish imported-audio promotion through Asset Library;
- adopt Choose Sound / Create Synth Sound / Save and Assign Here hooks in Object Creator, Scene Editor, Puzzle Creator, Quest Builder and Effect Editor through separate owner-led passes;
- validate initiating-target capture in each caller integration;
- implement runtime/playtest playback of procedural-synth recipe assets where needed;
- extend Health and Build validation for generated audio;
- add at least one generated procedural sound to Template Game once involved systems are ready.

## Remaining Work

All current and future Sound Generator / Sound Library work belongs in `docs/artifex/02A-global-to-do.md`. This specification must not become a task list.
