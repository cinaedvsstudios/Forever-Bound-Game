# Artifex Effect Editor V3.0 — Open Items

V3.0 is promoted and live from:

`artifex/apps/effect-editor/index.html`

The V3.0 runtime bundle lives in:

`artifex/apps/effect-editor/v3/`

## Still not done / follow-up items

### 1. Full performance optimisation

Status: partly improved, not fully solved.

Low Performance Mode now reduces particle cap, density, simulation updates, pixel ratio, and redraw rate. The old docs flagged slow full preview performance as a remaining issue, so the remaining work is deeper profiling and optimisation of expensive drawing paths such as glow, blur, shadows, grid, and heavy multi-layer effects.

### 2. Effekseer draft import

Status: not implemented.

The File menu still treats Effekseer draft import as a later compatibility pass. Keep it as a future importer/exporter task, not a V3.0 blocker.

### 3. Real video underlay support

Status: partial.

The UI accepts image/video underlay files, but the current renderer only draws image underlays reliably. Frame-accurate video underlay playback/scrubbing is still a separate renderer task.

### 4. Help / terminology links

Status: not implemented.

The Help menu still has a placeholder for terminology/guide links. Add a real help dialog or link it to Artifex documentation later.

### 5. Remove test-only branches/folders after a cooldown

Status: wait.

Do not immediately delete the tested branch/folder history. After V3.0 has been stable for a while, remove or archive old branch-only experiments and any remaining test directories that are no longer referenced by the live GitHub Pages path.

## Completed after V3.0 promotion

### Real brush / asset-folder loader

Status: done.

A Brush Asset Library panel now lets users load individual image files or a whole folder of PNG/WebP/JPG brushes. Selecting a loaded brush applies it to the active layer as a Custom Image Brush, so the selected texture is kept in saves and exports.

### Menu cleanup pass

Status: done.

The previous informational menu entries for Load Underlay, Scene / FX Resolution, and Bring Forward / Send Back have been replaced with real actions. Load Underlay opens the underlay picker, Scene / FX Resolution focuses the resolution controls, and layer ordering is now exposed as Move Layer Up / Move Layer Down.

## Archived during cleanup

The old split instructions, Phase 1B comparison notes, the old workflow patcher, and the old `OLDindex.html` monolith backup were moved to:

`docs/archive/effect-editor-v3-promotion/`
