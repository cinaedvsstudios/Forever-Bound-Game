# Sound Library + Create Synth Sound Preview Harness

This standalone preview app is the only runtime surface for the shared audio foundation pass. It proves the Sound Library-first workflow without integrating any caller app.

Open locally with Vite and visit:

```text
/artifex/apps/sound-generator-preview/index.html
```

Use a disposable Blank Starter Project folder for save tests. The harness should never be pointed at the real Forever Bound project folder.

## What the harness proves

- Sound Library opens with supplied caller-context labels:
  - `Preview Harness > Object Action Sound`
  - `Preview Harness > Quest Completed Sound`
  - `Preview Harness > FX Loop Sound`
- The selector reads registered audio from `assets/asset-index.json` through the shared project-folder/registered-content ownership.
- Imported audio-file assets and generated synth recipe assets are displayed together with distinct **Audio File** and **Generated Synth** badges.
- Selecting an item returns only the registered `asset_` ID to the callback output.
- Create New Synth Sound opens from inside Sound Library.
- Saving a synth writes `assets/audio/sfx/synth_<slug>.json` and registers `asset_sfx_...` in `assets/asset-index.json`.
- The newly saved synth returns to Sound Library selected and can be assigned back to the preview callback.
- The simulated external-target controls verify ownership capture: changing the external target while Sound Library is open must not redirect the returned assignment.

## Disposable project test data

For manual testing, create a Blank Starter Project with an `assets/asset-index.json` that contains at least one existing imported audio-file record and one generated synth record. The generated synth recipe file should live under `assets/audio/sfx/` and use the procedural synth schema.

If no canonical import-new-audio owner exists, this harness must not add one. Registering new external WAV/MP3/OGG files remains an Asset Library task tracked in the global todo guide.

## Automated smoke test

After starting Vite, run the Playwright smoke test from the repository root:

```bash
ARTIFEX_SOUND_PREVIEW_URL=http://127.0.0.1:5173/artifex/apps/sound-generator-preview/index.html node artifex/apps/sound-generator-preview/smoke-test.mjs
```

The smoke test mocks a disposable Blank Starter Project in the browser page, verifies imported/generated registered audio rows, confirms assignment returns `asset_` IDs, opens Create Synth Sound from Sound Library, checks the redesigned normal view, exercises constrained variation history/favourites and verifies a saved synth appears as a registered selectable item.
