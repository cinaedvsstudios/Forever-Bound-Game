# Effect Editor Specification

Status: Active module specification draft during documentation consolidation  
Owning module: Effect Editor  
Active accepted route: `artifex/apps/effect-editor/index2.html`  
Current verified implementation baseline: `Artifex Effect Editor INDEX2-CLEAN-0.2.6` on current `main`, audited 3 June 2026 from repository state indexed at `394fc9e73b7b83297843d70e55c777c96e7bda84`  
Accepted route evidence: merged Hub cutover PR #25 and merged Index2 repair/restoration work through PR #33; the later open documentation refresh PR #40 is evidence only, not required authority for this specification  
Governing universal contract: `docs/artifex/1A-project-file-contracts.md`  
Subordinate exact starter/index schema reference: `docs/artifex/19a-project-starter-file-schemas.md`  
Outstanding work source: `docs/artifex/2A-global-to-do.md`

## Purpose

Effect Editor is the Artifex reusable visual-effects authoring surface. It creates and edits FX Archetypes: reusable compositions of effect layers, appearance settings, dynamics, specialised effect parameters and preview behaviour that can later be placed as FX Instances in scenes or referenced by other authored systems.

The accepted working editor is the clean Index2 route, not the older default emergency page. This specification records the permanent module boundary and the verified current Index2 capability; it does not treat older V3 recovery documents or the emergency route as current authority.

## Ownership Boundary

Effect Editor owns:

- reusable FX Archetype composition authoring;
- effect layer lists, ordering, visibility, duplication/deletion and per-layer engine/type selection;
- effect appearance data including colour/opacity/size/glow ramps, shape/brush/custom texture selection, tint/blend/fit and direction/spread presentation;
- effect dynamics and engine-specific authoring data including emitter/origin, density, speed, gravity/orbital values, lifetime and specialised parameter controls;
- editor preview interaction, visual guides, local working copies, composition JSON import/export and snapshot output while those are the implemented authoring workflow;
- later direct connected-project writing of its owned reusable effect records and effect index entries:

```text
archetypes/effect-index.json
archetypes/effects/archeffect_<slug>.json
```

- later registered references to final texture, overlay and sound assets required by the saved FX Archetype.

Effect Editor must not:

- place scene-specific FX Instances, object placements or scene transition effects; those belong to Scene Editor when placed in a scene;
- author Quest, Puzzle, Object Archetype or project-level Flatplan internals merely because those systems may later reference an effect;
- own the original source asset library, imported image/media promotion or final audio ownership merely because an effect uses a texture, overlay or sound cue;
- treat localStorage compositions, uploaded-session brush `dataUrl` values or downloaded JSON as canonical connected-project FX asset records;
- treat the old default emergency route or historic patch/recovery chains as the continued implementation baseline;
- copy universal project/save/asset/branding rules from the master contract into competing module-local definitions.

## FX Archetype Versus FX Instance

An **FX Archetype** is a reusable effect definition authored here, such as a magical glow, fog bank, lightning strike, oil droplet burst or shockwave.

An **FX Instance** is a specific placed occurrence of a saved archetype in a scene, with placement, timing, trigger or scene-context values. Scene Editor places the instance and stores the scene-specific relationship; Effect Editor owns the reusable visual-effect definition.

A **Plate FX** workflow may later render or export effects against a temporary visual reference plate for animation/video compositing. The reference plate is a timing or alignment guide and must not be silently embedded as normal game FX output. Plate FX is not an implemented connected-project export workflow in the current Index2 baseline.

## Active Baseline and Route Decision

The accepted current route is:

```text
artifex/apps/effect-editor/index2.html
Visible/cache label: INDEX2-CLEAN-0.2.6
Hub destination: artifex/apps/effect-editor/index2.html?from=hub
```

The older default entry remains present only as reference/rollback material:

```text
artifex/apps/effect-editor/index.html
Visible label on current main: V3.38-emergency
```

The earlier route-decision audit established that the clean Index2 route was the creator-approved interface and that the Hub had been incorrectly opening the emergency/default route. PR #25 corrected the Hub destination. Later merged Index2 work repaired the previously identified parity gaps and restored the brush library without replacing the accepted route.

| Current area | Baseline status | Current implementation fact |
|---|---|---|
| Accepted route and version | Implemented and protected | `index2.html` identifies `INDEX2-CLEAN-0.2.6` and loads `v3/src/index2-app.js`. |
| Named functional ownership | Implemented in the accepted route | The bootstrap initialises named owners for editor core, appearance controls, brush asset library, workspace UI, dynamics and quick-edit controls rather than restoring the emergency route's rescue chain. |
| FX composition and layer editor | Implemented in local workflow | Composition holds ID, name, tags, design resolution and layers; bottom panel supports layer display, selection, reordering, visibility, duplicate and delete. |
| Local/import/export workflow | Implemented only as local/interchange workflow | File menu imports/exports Composition JSON and saves/loads local effects through browser storage. It does not write canonical connected-project effect files. |
| Effect Archetype Assets card | Present as metadata UI only | The card exposes archetype ID, tags, layer name and engine type; it has no current connected-project Save or indexed effect-library implementation. |
| Quick Edit Helpers | Implemented | Current Index2 exposes colour, appearance and dynamics helper buttons owned by a named quick-edit module. |
| Appearance ramp editing | Implemented | Current Index2 provides editable appearance stops for colour, opacity, size and glow, including position dragging and adding/removing bounded markers. |
| Shape / Brush / custom image selection | Implemented for the editor session/composition | Current Index2 has built-in shape/brush choices plus a Brush / Shape Library which can auto-load repository brushes and session-uploaded image brushes. Session/uploaded data is not final registered Asset Library content. |
| Rotation Direction / Degree Range parity | Implemented | The current Appearance card includes Random Rotation, Within Degree Range and Lock Direction choices bound through the current appearance owner. |
| Gravity scale / Boost / Orbital Force parity | Implemented | Dynamics presents user-facing gravity with `0 = none`, `100 = earth`, optional Boost and Orbital Force. |
| Text effect controls and ALL CAPS parity | Partly implemented; original parity gap complete | Text-specific controls and one ALL CAPS action are present. The model/runtime recognises text emission modes, but visible Once / Loop / Continuous authoring controls are not present in the current text-control list. |
| Search, collapsible cards and resizable layout | Implemented | Search Settings filters editor cards; collapse and panel dimensions persist in local browser layout state. |
| Preview controls and diagnostics | Implemented | Pause/resume, snapshot, zoom, display controls, layer status and diagnostics are present in Index2. |
| Emitter width guide | Implemented | The current renderer draws brace-style emitter-width guide marks when the width is visible. |
| Degree Range cone guide | Not verified as implemented | Current renderer evidence shows direction arrow and emitter width braces, but not the requested cone rendering for the selected spread/range. |
| Reference media / video plate | Not complete in Index2 | Renderer can draw image underlay data, but deliberately skips video reference drawing; frame-accurate video plate authoring remains future work. |
| Connected-project effect saving and index registration | Not implemented | Current persistence is browser localStorage and standalone JSON, not owned-file writes through the connected project service. |

## Current Implemented Interfaces

### Current Index2 composition model

The active editor currently normalises compositions with:

```text
id
name
tags
designWidth / designHeight
createdAt / updatedAt
layers[]
```

The active editor currently uses a design preview size of:

```text
1280 × 720
```

Current layer data includes the implemented editor concepts of:

```text
id / name / visible / locked / engine
appearanceStops and activeAppearanceStopIndex
colour / opacity / size / glow compatibility fields
spawnRate / speedMin / speedMax / angle / spread / gravity / gravityBoost / lifetime
emitterX / emitterY / emitterWidth / emitterRotation / targetX / targetY
appearanceMode / particleShape / builtInBrush / custom texture data
blend / tint / fit / rotation / edge / texture controls
orbital / friction / noise and specialised engine fields
text content / font / spacing / wrapping / reveal / direction / density / delay / scatter / lifetime fields
textEmissionMode in normalised layer state
```

This is a current editable composition model. It is not yet the accepted canonical connected-project FX Archetype schema; connected-project persistence and prefix/schema alignment must be implemented deliberately.

### Current identifier compatibility issue

The master contract uses the canonical reusable effect prefix:

```text
archeffect_
```

Current Index2 starts new compositions with IDs shaped as:

```text
fx_<generated-value>
```

and its initial visible archetype ID placeholder/value uses `fx_v3_effect_001`. This is a current implementation mismatch to be addressed during canonical connected-project save/index work. This specification does not silently rename existing local/export compositions or declare a migration without implementation and compatibility handling.

### Current local persistence and JSON exchange

Index2 currently uses browser-local storage records:

```text
artifex-index2-effect:<local-id>
artifex-index2-effect-index
artifex-index2-ui-layout
artifex-index2-card-collapse
```

It currently supports:

```text
New Effect Archetype
Import Composition JSON
Export Composition JSON
Save Locally
Load Local Effect
Snapshot PNG
```

These are valid editing/recovery/interchange features. None is a substitute for later direct Save into the active connected project and a canonical effect index.

### Current brush and appearance dependency boundary

The current Brush / Shape Library can present built-in shapes/brushes, auto-load repository images from the Effect Editor `brushes/` folder, or accept a session-loaded image/folder. When selected, a custom image is embedded in the current layer through session/composition texture data.

For a final connected-project FX Archetype, texture and overlay dependencies must resolve through final registered assets according to the master contract and Asset Library ownership. The current brush-session mechanism proves editor preview utility only; it does not define final asset registration.

### Current text-effect boundary

Index2 currently implements bounded text runtime behaviour, text layout caching, reveal/direction/density/delay/scatter/lifetime controls and a single ALL CAPS action. The underlying normalised state and text runtime recognise `once`, `loop` and `continuous` emission modes. The current Effect Specific Controls UI does not expose a visible emission-mode selector, so visible Once/Loop/Continuous authoring remains open work rather than an already-delivered feature.

### Current guide boundary

The current renderer draws the active emitter marker, a direction arrow and brace-style emitter-width guides. It does not provide verified evidence of the live Degree Range cone guide requested in the active backlog. The width-guide portion of that earlier task is therefore complete; the cone/spread visualisation remains a scoped follow-up.

## Module-Specific Fixed Contracts and Dependencies

### Scene Editor relationship

Scene Editor may later place an FX Instance referring to a saved `archeffect_` record and store placement, scene timing, trigger or transition context. It does not redefine the reusable effect layers or visual engine content owned by Effect Editor.

### Object Creator, Quest Builder and Puzzle Creator relationships

Other authoring modules may later refer to stable saved FX Archetype IDs where an object action, quest event or puzzle feedback needs an effect. They do not gain ownership of the reusable effect record or copy its authored layer definition into their own content.

### Asset Library relationship

Textures, overlays, thumbnails and optional audio used by a final saved FX Archetype must resolve through final registered `asset_` records where they are project resources. Effect Editor may choose and reference those records; Asset Library remains the final registration/asset owner except for a deliberately agreed bounded registration handoff.

### Sound Library relationship

Optional effect start, loop, impact or end cues must store registered final `asset_` audio references only. Effect Editor must not create parallel sound-archetype folders, identifiers or copied synth recipes. Sound integration remains future work until the Sound foundation is accepted.

### Runtime / Playtest / Build relationship

Runtime/Playtest consumes saved effects for preview/use and Build validates/packages them. Effect Editor owns authoring, not runtime packaging or build validation ownership.

### Reference-media / Plate FX relationship

Reference images or videos used to align an effect during authoring are editor-only guide inputs unless an explicit Plate FX export mode is later implemented. Normal game FX output must not silently contain the reference plate.

### Atmosphere Volume prototype relationship

A separate merged debug prototype exists at:

```text
artifex/apps/effect-editor/debug/atmosphere-volume/index.html
```

It tests a possible replacement broad fog/mist/haze approach and is deliberately isolated from Index2. It does not create saved FX Archetypes, write project files or prove that an Atmosphere Volume engine has been accepted into the live Effect Editor. If the visual approach is approved later, integration remains a separate implementation task.

## Document Consolidation and Source Classification

The following Effect Editor documents were inspected for this extraction. Their permanent module-specific information is represented here; actual remaining work belongs in `2A`.

| Existing source | Relevant information transferred or classified | Intended treatment after `9A` acceptance |
|---|---|---|
| `docs/artifex/13-effects-library.md` | FX Archetype/Instance, Game FX/Plate FX and module-boundary concepts. Its older prototype/current-state claims do not define Index2. | Supersede/archive as overlapping prior module specification once any unique future Plate FX requirement is retained here/`2A`. |
| `artifex/shared/todo-guide/audits/2026-06-01-effect-editor-route-decision-audit.md` | Accepted Index2 route decision and Hub cutover evidence; its original `0.2.3`/missing-parity statements are superseded by current `0.2.6`. | Retain as decision evidence or archive after controlled extraction; not a parallel spec. |
| Open PR #40's refresh of the route/master/stabilisation records | Correct evidence that PRs #27–#33 delivered Index2 parity and Brush/Shape restoration. | Do not merge merely as current authority; any unique useful content is captured in `9A`/`2A`. |
| `artifex/apps/effect-editor/docs/todo.md` | My Settings requirements and approved visual target references. | Retain as source evidence now; archive/replace by `9A` + `2A` after acceptance. |
| `future-features.md` | Future Brush Sequence Animation concept only. | Keep as deferred idea or archive after adding a deliberate low-priority item if approved; not current module authority. |
| `v3-roadmap-open-items.md` | Old-route V3 follow-up history; some items checked against Index2. | Historical/superseded after `9A`; do not treat `index.html` as live accepted route. |
| `docs/effect-editor/index2-integration-work-started.md` | Earlier Index2 0.2.2 checkpoint/history. | Historical evidence only after `9A`; current baseline is 0.2.6. |
| `compare-versions.md`, `current-vs-stable-ui-inventory.md`, `UI_STRUCTURE_AUDIT.md`, `PHASE_1_SAFE_FILE_SPLIT.md`, `PHASE_2_UI_CLEANUP.md` | Default-route recovery/refactor/design evidence, not current Index2 truth. | Archive/history after extraction; not active specifications or backlog authorities. |
| `FX_UI_RESTRUCTURE_NOTES.md`, `FX_QUICK_EDIT_BRUSH_AND_REFERENCE_NOTES.md`, `FX_QUICK_EDIT_FIX_NOTES.md`, `FX_PHASE9I_ORIGIN_BRUSH_LIBRARY_NOTES.md`, `FX_PHASE9J_RESOLUTION_NOISE_NOTES.md`, `PHASE_8_LIBRARY_IMPORT_NOTES.md` | Older default-route phased delivery notes. Current Index2 capability was verified directly before being recorded here. | Archive/history after extraction; do not assume all old-route features exist in Index2. |
| `artifex/apps/effect-editor/src/README.md` | Old split/refactor evidence identifying `index.html` as live. | Superseded/historical after `9A`; inaccurate as current route authority. |
| `docs/archive/effect-editor-v3-promotion/**` and archived handoff records | Already historical default-route/V3 promotion evidence. | Remain archive evidence only. |
| Merged PR #49 Atmosphere Volume debug prototype | Isolated later visual experiment, explicitly outside live Index2. | Record as prototype evidence and future decision input only. |

## Remaining Work

All current and future Effect Editor tasks are owned by `docs/artifex/2A-global-to-do.md`. This specification must not accumulate task checklists.