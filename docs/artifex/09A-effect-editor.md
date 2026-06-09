# Effect Editor Specification

Status: Active module specification draft during documentation consolidation  
Owning module: Effect Editor  
Active accepted route: `artifex/apps/effect-editor/index2.html`  
Current verified implementation baseline: `Artifex Effect Editor INDEX2-CLEAN-0.2.6`  
Accepted route evidence: merged Hub cutover PR #25 and merged Index2 repair/restoration work through PR #33; the later open documentation refresh PR #40 is evidence only, not required authority for this specification  
Governing universal contract: `docs/artifex/01A-project-file-contracts.md`  
Subordinate exact starter/index schema reference: `docs/artifex/19A-project-starter-schemas.md`  
Outstanding work source: `docs/artifex/02A-global-to-do.md`

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


Archived local Effect Editor notes record `INDEX2-CLEAN-0.2.2` at commit `96d0bc06c9f630ecf19bf11145b13423edbacdac` as a known-good rollback checkpoint for blank-screen, menu, canvas, controls or performance regressions during later Index2 integration. That checkpoint is recovery evidence only and does not replace the active route/baseline stated above.

Archived split/refactor notes for `artifex/apps/effect-editor/src/` describe an early preservation-first plan to extract CSS, Tailwind config, presets, engine helpers, UI helpers and import/export helpers before adding new Artifex-specific features. Future refactors should preserve visible behaviour first, but current route authority remains this specification and the global backlog.

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

## Additional UI Contract Notes From Archived Phase Docs

These rules are consolidated from the old Effect Editor phase notes, UI audits, recovery plans and local to-do files. They are retained here as module-specific UI contract guidance, not as separate active documents.

### Authoring layout and wording

- The main authoring cards should remain organised around **Effect Archetype**, **Effect Layer Appearance**, and **Effect Layer Dynamics**.
- The left inspector should behave as the primary FX authoring panel.
- The bottom panel should behave as a composer/layer strip with compact status, not as a tactical diagnostics dashboard.
- Use conventional top menu labels: **File**, **Edit**, **View**, **Insert**, **Help**.
- Dense labels should avoid tactical/defensive wording such as **Tactical HUD**, **Target Schema**, **HUD Reticle**, **Layer Diagnostics**, **Projection Angle** and **Interactive Coordinate Grid**.
- Preferred softer wording includes **Preview Guides**, **JSON Output**, **Emitter Guide**, **Active Layer Summary**, **Direction** and **Preview Grid**.

### Appearance and controls

- Particle Shape / Shape Mode belongs in **Effect Layer Appearance / Visuals**, not in Motion / Dynamics.
- Motion / Dynamics should contain emitter, speed, direction, spread, gravity, friction, orbit, lifetime and related movement controls.
- Slider numeric values should be directly editable where practical and must update the same editor state as the slider.
- Quick Edit Presets, Rotate Shape, capped softness/blur, expanded blend modes, Start/End Alpha values and info tooltips are retained Effect Editor UI capabilities where implemented.
- The brush/texture pipeline should avoid live blur-heavy procedural shapes where brush PNG texture softness is available.
- Brush alpha masking must avoid colouring the whole square PNG block; only the visible brush shape should receive tint/colour.

### Preview, thumbnail and reference media

- Thumbnail capture is an editor/library preview feature. Final project thumbnails should prefer real image files referenced by path rather than large base64 data inside final runtime JSON.
- Reference images or videos are editor guide media unless a deliberate Plate FX export mode is implemented.
- Image underlay and video underlay are not equivalent: frame-accurate video playback/scrubbing remains future work unless current code proves otherwise.
- Low Performance Mode belongs with preview/view controls and must not change saved layer data merely because preview quality is reduced.

### Future visual targets

Confirmed future visual-reference targets include:

```text
Lens flare / light glint
Underworld oil droplets / living black oil
Bloom / HUD glow
Sunlight / god rays
Interactive water
Shockwave / impact ring
Ground fog
Explosion
Storm / weather
```

These targets guide future scoped FX engine work. They do not prove those engines are already implemented.

## Recent FX Engine Prototype Consolidation

The smoke/cloud and shimmer/portal/wormhole work created during the current Effect Editor engine exploration is prototype evidence, not yet live Index2 implementation authority. These engines were deliberately built outside the active Index2 route so the visual behaviour, controls and export shape could be iterated quickly without destabilising the accepted Effect Editor baseline.

The correct interpretation is:

```text
prototype preview app / isolated engine harness = visual and control validation
active Effect Editor Index2 route = accepted authoring surface
future integration = controlled migration into Index2 engine registry and layer UI
```

These prototypes should not become permanent parallel authoring apps. Their useful renderer logic, preset data, control semantics and export fields should be migrated into the live Effect Editor only after mapping each engine to a stable layer engine type and saving/export schema.

### Smoke / Cloud Engine prototype

The smoke/cloud engine was created as a procedural canvas-based FX preview for fog, smoke, mist, soft cloud puffs and magical atmospheric wisps. The useful design pattern is a layered particle/cloud renderer rather than a single flat blur. It separates broad atmospheric body, drifting wisps, opacity, size, softness, turbulence/curl, colour/tint, speed and density-style controls so a single engine can produce ground fog, smoke plumes, magical haze, cloud puffs and low-lying mist by preset.

The engine should be treated as the future basis for one or more Index2 layer engines such as:

```text
smoke-cloud
fog-bank
mist-volume
wisp-field
atmosphere-soft-particles
```

The important implementation lesson is that smoke/cloud controls must be visually high-impact. Amount, opacity, size, softness, drift, turbulence, curl and colour controls must visibly change the preview, not merely update JSON values. Any low-performance mode should reduce preview resolution or particle count only and must not silently change saved effect data.

The smoke/cloud work is related to, but not identical to, the existing isolated Atmosphere Volume debug prototype. The Atmosphere Volume prototype tests broad fog/mist/haze replacement logic. The smoke/cloud engine is a more author-facing procedural layer concept with reusable controls that can become part of normal FX Archetype composition if integrated properly.

### Shimmer / Portal / Wormhole prototype

The portal/wormhole work was created as a separate preview harness at the prototype app level rather than inside Index2. Its current working package was iterated through the `fx-shimmer-preview` line and reached `V1.24` during visual tuning.

The prototype currently covers four related effect families:

```text
Portal Ring / aperture
Wormhole Tunnel
Heat Shimmer
Transition Tear
```

The engine was created as a procedural canvas renderer with presets, visible controls, a live preview, local image inputs and JSON export. It uses an offscreen/grid-style preview layer, procedural radial/spiral drawing, particles, orbiting cloud puffs, optional PNG overlays, colour/texture inputs and per-layer timing controls. It should be integrated as engine logic and control panels inside Index2, not as a separate permanent editor.

#### Portal Ring

Portal Ring is the most visually approved part of the prototype. Its useful layer model is:

```text
aperture / middle
cloud rim body
thin portal line outline
orbit clouds
particles
optional overlay image
```

The thin portal line outline must remain separate from the cloudy rim. It requires its own controls for thickness, opacity, glow, radius, pulse strength, pulse speed, colour mode, colour A/B and optional image-based colour. The line must render above the cloudy portal body when the user expects a visible clean outline. Colour and gradient controls must affect the visible stroke, not be washed out by additive glow.

The cloudy rim/body remains a different layer from the thin line and should keep its softer magical threshold look.

#### Wormhole Tunnel

Wormhole is still in active tuning and should be treated as promising but not visually final. The better direction is a dark centre with visible rotating nebula arms, staggered orbit clouds, particles and optional centre emission. The current control structure should remain separated into distinct layers:

```text
core / vanishing point
arms / nebula bands
orbit clouds
particles
emission
overlay image
```

Arms and clouds must not share one control card. Arms are spiral nebula bands. Orbit Clouds are larger cloud puffs moving around the wormhole. Particles are small sparks/dots. Emission is a separate centre-out or vacuum/sucked-in particle stream.

Wormhole controls must be visibly connected to the renderer. In particular:

```text
Arm amount
Arm opacity
Arm thickness
Arm radius
Arm definition
Arm softness
Arm rotation speed
Arm curl / turns
Arm pulse strength
Cloud amount
Cloud opacity
Cloud size
Cloud stagger
Cloud pulse strength
Particle amount
Particle opacity
Particle size
Particle speed
Particle pulse strength
Emission amount
Emission opacity
Emission speed
Emission direction
Emission vacuum
Trail length
Trail opacity
```

If a control is visible in the Effect Editor after integration, it must have a visible effect in the preview for the currently selected engine. Controls that are irrelevant to Heat Shimmer or Transition Tear should be hidden or disabled for those engine types.

#### Heat Shimmer and Transition Tear

Heat Shimmer and Transition Tear are useful families in the same preview, but their live editor UI should not show the full portal/wormhole control set. Their controls should be reduced to only relevant settings such as shape/scale, strength, refraction, wave size/speed, noise, glow, colour/tint and playback. Portal line, arms, orbit clouds, wormhole emission and particle controls should not appear for these simpler effects unless a future version genuinely connects them.

### Integration rule for prototype engines

When integrating these prototype engines into the live Effect Editor, the implementation should follow a preservation-first rule:

```text
do not replace Index2
do not revive the emergency route
do not create another parallel editor app
do not break existing layer composition, local save/import/export or brush library behaviour
do add engine modules and control cards behind the existing Index2 layer/editor architecture
```

Each prototype engine should become an Index2 layer engine type with:

```text
engine identifier
default preset values
normalised layer state fields
engine-specific controls
renderer function
preview diagnostics
JSON import/export compatibility
future canonical archeffect_ save mapping
```

Until connected-project saving exists, prototype-derived data may continue through local Composition JSON export/import, but it must not be described as final connected-project persistence.

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

The following Effect Editor documents were inspected for this extraction. Their permanent module-specific information is represented here; actual remaining work belongs in `02A`.

| Existing source | Relevant information transferred or classified | Intended treatment after `09A` acceptance |
|---|---|---|
| `docs/artifex/13-effects-library.md` | FX Archetype/Instance, Game FX/Plate FX and module-boundary concepts. Its older prototype/current-state claims do not define Index2. | Supersede/archive as overlapping prior module specification once any unique future Plate FX requirement is retained here/`02A`. |
| `artifex/shared/todo-guide/audits/2026-06-01-effect-editor-route-decision-audit.md` | Accepted Index2 route decision and Hub cutover evidence; its original `0.2.3`/missing-parity statements are superseded by current `0.2.6`. | Consolidated here as route-decision evidence; archive as source evidence, not a parallel spec. |
| Open PR #40's refresh of the route/master/stabilisation records | Correct evidence that PRs #27–#33 delivered Index2 parity and Brush/Shape restoration. | Do not merge merely as current authority; any unique useful content is captured in `09A`/`02A`. |
| `artifex/apps/effect-editor/docs/todo.md` | My Settings requirements and approved visual target references. | Useful rules consolidated into `09A` and unfinished work into `02A`; archive after acceptance. |
| `future-features.md` | Future Brush Sequence Animation concept only. | Deferred idea added to `02A`; archive as source evidence. |
| `v3-roadmap-open-items.md` | Old-route V3 follow-up history and unfinished items, including route-status conflict, performance, Effekseer import, video underlay and Help links. | Unfinished work moved to `02A`; do not treat `index.html` as live accepted route until current repo truth is confirmed. |
| `docs/effect-editor/index2-integration-work-started.md` | Earlier Index2 0.2.2 checkpoint/history. | Historical evidence only after `09A`; current baseline is 0.2.6. |
| `compare-versions.md`, `current-vs-stable-ui-inventory.md`, `UI_STRUCTURE_AUDIT.md`, `PHASE_1_SAFE_FILE_SPLIT.md`, `PHASE_2_UI_CLEANUP.md` | Default-route recovery/refactor/design evidence, plus UI wording/layout rules now consolidated into this file. | Archive/history after extraction; not active specifications or backlog authorities. |
| `FX_UI_RESTRUCTURE_NOTES.md`, `FX_UI_CONTROLS_PASS_NOTES.md`, `FX_QUICK_EDIT_BRUSH_AND_REFERENCE_NOTES.md`, `FX_QUICK_EDIT_FIX_NOTES.md`, `FX_PHASE9I_ORIGIN_BRUSH_LIBRARY_NOTES.md`, `FX_PHASE9J_RESOLUTION_NOISE_NOTES.md`, `PHASE_8_LIBRARY_IMPORT_NOTES.md`, `PRESET_LIBRARY_AUDIT.md` | Older default-route phased delivery notes and preset audit material. Stable module-specific UI rules are consolidated into this file; unfinished/preset follow-up work is in `02A`. | Archive/history after extraction; do not assume all old-route features exist in Index2. |
| `artifex/apps/effect-editor/src/README.md` | Old split/refactor evidence identifying `index.html` as live. | Superseded/historical after `09A`; inaccurate as current route authority. |
| `docs/archive/effect-editor-v3-promotion/**` and archived handoff records | Already historical default-route/V3 promotion evidence. | Remain archive evidence only. |
| Current smoke/cloud and shimmer/portal/wormhole prototype work | Recent isolated canvas-engine prototypes for smoke/cloud, Portal Ring, Wormhole Tunnel, Heat Shimmer and Transition Tear. Captured as prototype evidence and integration guidance only, not as accepted Index2 implementation. | Use as source material for future Index2 engine modules; do not treat prototype preview apps as permanent parallel authoring routes. |
| Merged PR #49 Atmosphere Volume debug prototype | Isolated later visual experiment, explicitly outside live Index2. | Record as prototype evidence and future decision input only. |

## Remaining Work

All current and future Effect Editor tasks are owned by `docs/artifex/02A-global-to-do.md`. This specification must not accumulate task checklists.
