# Phase 2 — UI Logic Cleanup

## Goal

Clean up confusing/tactical wording, move Particle Shape into the correct Visuals card, and add the View-menu entry point for Low Performance Mode.

This phase should not change the particle engine, preset data, import/export logic, or saved JSON format.

## 1. Rename confusing labels

Use simple text replacements only.

```text
Layer Diagnostics -> Active Layer Summary
Active View Filters -> Preview Options
Mouse Lock -> Emitter Follows Mouse
HUD Reticle -> Emitter Guide
Floor Bounce -> Preview Floor Collision
Effect Layers -> Layer Stack
Workspace Tools -> Preview Tools
Diagnostics -> Status
Active Grid -> Preview Grid
Target Schema -> JSON Output
Layer Identifier Name -> Layer Name
Engine Architecture -> Effect Engine
Transform Dynamics -> Motion / Dynamics
Projection Angle -> Direction
Visual Configuration -> Visuals
Temporal Duration -> Timing
Interactive Coordinate Grid -> Preview Grid
```

Also update tooltip wording where it sounds tactical:

```text
Toggle center reticle and aiming vectors. -> Toggle the emitter guide and direction preview.
Snap the emitter exactly to where your cursor goes. -> Let the emitter follow your pointer.
Cause falling particles to bounce off the bottom of the grid. -> Preview floor collision for falling particles.
```

## 2. Add Low Performance Mode to View menu

In the View dropdown, add this button near the other preview options:

```html
<button onclick="togglePerformanceMode()" class="w-full text-left px-4 py-1.5 text-xs hover:bg-artifex-gray hover:text-white transition text-slate-300 flex items-center justify-between" title="Reduce preview particles, glow, blur, and high-DPI rendering for faster editing.">
    <span>Low Performance Mode</span> <span id="view-performance-status" class="text-[9px] text-slate-500">OFF</span>
</button>
```

Add this variable near the existing state variables:

```js
let performanceMode = 'full';
```

Add this function near the View/Workspace helpers:

```js
function togglePerformanceMode() {
    performanceMode = performanceMode === 'low' ? 'full' : 'low';
    syncPerformanceModeUI();
    showToast(
        performanceMode === 'low'
            ? 'Low Performance Mode enabled for faster preview.'
            : 'Full Quality preview restored.',
        'info'
    );
}

function syncPerformanceModeUI() {
    const node = document.getElementById('view-performance-status');
    if (!node) return;
    const isLow = performanceMode === 'low';
    node.innerText = isLow ? 'ON' : 'OFF';
    node.className = isLow ? 'text-[9px] text-green-500' : 'text-[9px] text-slate-500';
}
```

For Phase 2, this may be UI-only. The actual renderer throttling can be wired in the later Shape/Runtime phase. If you do wire a simple first pass, keep it small.

Optional simple first-pass throttle inside particle spawning:

```js
const performanceRateMultiplier = performanceMode === 'low' ? 0.45 : 1;
const previewRate = Math.max(0, Math.round(rate * performanceRateMultiplier));
```

Then use `previewRate` instead of `rate` in the spawn loop only. Do not change the saved layer data.

## 3. Move Particle Shape into Visuals

Move the existing Particle Shape block from inside:

```html
<div id="card-body-physics" class="p-4 space-y-4">
```

To the top of:

```html
<div id="card-body-visuals" class="p-4 space-y-4">
```

Important:

```text
Do not rename param-visual-shape.
Do not rename shape-picker-label.
Do not rename shape-picker-grid.
Do not rename toggleShapePicker.
Do not rename selectShape.
Do not change SHAPE_DEFS yet.
```

Only move the existing block.

## What to test

After the change, open the Effect Editor and check:

```text
Page loads.
No red console errors.
View menu opens.
Low Performance Mode appears in View.
Clicking Low Performance Mode toggles ON/OFF.
Particle Shape now appears in Visuals.
Particle Shape no longer appears in Motion / Dynamics.
Changing Particle Shape still changes the effect.
Direction, speed, spread, gravity, friction, and vortex controls still work.
Bottom panel labels feel less tactical.
Insert preset still works.
JSON tab still updates.
Export JSON still works.
```

## Rollback

If anything breaks, undo only the Phase 2 `index.html` edits. The external scaffold files can stay because they are not harmful.
