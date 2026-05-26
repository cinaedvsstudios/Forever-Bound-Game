# Artifex Effect Editor V3.0 — Open Items

V3.0 is promoted and live from:

`artifex/apps/effect-editor/index.html`

The V3.0 runtime bundle lives in:

`artifex/apps/effect-editor/v3/`

## Still not done / follow-up items

### 1. Full performance optimisation

Status: partly improved, not fully solved.

Low Performance Mode now reduces particle cap, density, simulation updates, pixel ratio, and redraw rate. The old docs flagged slow full preview performance as a remaining issue, so the remaining work is deeper profiling and optimisation of expensive drawing paths such as glow, blur, shadows, grid, and multi-layer effects.

### 2. Effekseer draft import

Status: not implemented.

The File menu still treats Effekseer draft import as a later compatibility pass. Keep it as a future importer/exporter task, not a V3.0 blocker.

### 3. Real video underlay support

Status: partial.

The UI accepts image/video underlay files, but the current renderer only draws image underlays reliably. Frame-accurate video underlay playback/scrubbing is still a separate renderer task.

### 4. Real brush / asset-folder loader

Status: partial.

Shape, built-in brush, and custom image brush modes exist. A proper asset-library or folder-based brush PNG loader is still future work.

### 5. Menu cleanup pass

Status: cosmetic / UX cleanup.

Some menu entries still behave as info redirects because the actual controls live elsewhere, for example Load Underlay, Settings, and Bring Forward / Send Back. These should either be wired to their actual panels or removed from menus in a future polish pass.

### 6. Help / terminology links

Status: not implemented.

The Help menu still has a placeholder for terminology/guide links. Add a real help dialog or link it to Artifex documentation later.

### 7. Remove test-only branches/folders after a cooldown

Status: wait.

Do not immediately delete the tested branch/folder history. After V3.0 has been stable for a while, remove or archive old branch-only experiments and any remaining test directories that are no longer referenced by the live GitHub Pages path.

## Archived during cleanup

The old split instructions, Phase 1B comparison notes, the old workflow patcher, and the old `OLDindex.html` monolith backup were moved to:

`docs/archive/effect-editor-v3-promotion/`
