# Procedural Sound Generator Preview Harness

## Purpose

This is a thin browser-test host for the shared **Create Synth Sound** popup in `artifex/shared/sound-generator/`. It is not a new core Artifex module and it does not replace in-context opening from Archetype Object Creator, Scene Editor or Puzzle Creator.

## Entry Point

```text
artifex/apps/sound-generator-preview/index.html
```

The page presents simulated caller fields so the shared popup can be opened with realistic source labels while caller-app wiring remains separate work.

## What This Host Tests

```text
shared popup mounting and closing
caller-context source labels
Web Audio preview and Stop behaviour
Use Example and Start New flows
JSON import/export
connected-folder Save to Library behaviour
Save and Assign callback returning a registered asset_sfx_ ID
```

## Save Behaviour

On deliberate save, the shared popup writes generated sound data through the connected project-folder service:

```text
assets/audio/sfx/synth_<slug>.json        generated procedural recipe
assets/asset-index.json                   registered asset_sfx_ record
```

**Save and Assign Here** returns the registered asset ID to this preview host only. The host does not write an object, scene or puzzle record.

## Ownership Boundary

This harness does not own sound recipes, asset registration, caller app data or project-file contracts. Those responsibilities remain in the shared sound-generator component, Asset Library model and the appropriate calling editor.
