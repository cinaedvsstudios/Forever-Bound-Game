# Phase 2 — UI Logic Cleanup

## Goal

Clean up confusing/tactical wording, move Particle Shape into the correct Visuals card, align the Effect Editor header branding with the Scene Editor, add editable numeric value boxes beside sliders, and add the View-menu entry point for Low Performance Mode.

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

## 2. Align top-left branding with Scene Editor

The Effect Editor top-left header should use the same logo/title image pattern as the Scene Editor instead of the current square SVG mark and text-only ARTIFEX title.

Scene Editor source reference:

```js
const brandLogo = '../../artifexlogo.png';
const brandTitle = '../../artifextitle.png';
```

Recommended Effect Editor header assets:

```text
../../artifexlogo.png
../../artifextitle.png
```

Replace the current top-left square icon + ARTIFEX text block with an image-based brand block:

```html
<div class="flex items-center gap-3">
    <img src="../../artifexlogo.png" alt="Artifex logo" class="h-11 w-11 object-contain drop-shadow-[0_0_10px_rgba(158,1,206,0.55)]">
    <div class="flex flex-col justify-center min-w-0">
        <img src="../../artifextitle.png" alt="Artifex" class="h-7 object-contain object-left max-w-[180px]">
        <div class="flex items-center gap-2 mt-0.5">
            <p class="text-[9px] text-artifex-goldMuted font-semibold tracking-wider uppercase font-serif">Visual Effects Editor</p>
            <span class="bg-artifex-purpleAccent/20 border border-artifex-purpleAccent text-purple-200 text-[8px] font-bold px-1.5 py-0.5 rounded-full font-sans tracking-normal shadow-[0_2px_5px_rgba(0,0,0,0.6)]">v2.3.0 ALPHA</span>
        </div>
    </div>
</div>
```

Important:

```text
Keep the same header height.
Do not make the title image too tall.
Use object-contain so the art does not squash.
If the images fail to load, alt text should still identify the brand.
```

## 3. Add editable number inputs beside slider values

Every slider value shown as a number should be directly editable. The user should be able to click the number, type a new value, press Enter or blur the input, and have the slider and effect update.

Current problem:

```text
Many slider values are display-only spans such as id="val-emitter-rate".
```

Target behaviour:

```text
Dragging the slider updates the number input.
Typing into the number input updates the slider.
Both paths call the same update function so JSON/state stays correct.
Value is clamped to the slider min/max.
Step values are respected where possible.
Invalid typed values revert to the current slider value.
```

Preferred markup pattern:

```html
<input type="number" id="val-emitter-rate" class="w-14 bg-artifex-dark border border-artifex-border rounded-md px-1 py-0.5 text-artifex-gold font-mono text-xs text-right" min="0" max="30" step="1" value="5">
```

Preferred helper pattern:

```js
function bindSliderNumber(sliderId, numberId, onChange) {
    const slider = document.getElementById(sliderId);
    const number = document.getElementById(numberId);
    if (!slider || !number) return;

    const clampValue = (value) => {
        const min = Number(slider.min || -Infinity);
        const max = Number(slider.max || Infinity);
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) return Number(slider.value || 0);
        return Math.min(max, Math.max(min, numeric));
    };

    const sync = (value, source) => {
        const next = clampValue(value);
        slider.value = String(next);
        number.value = String(next);
        if (typeof onChange === 'function') onChange(next, source);
    };

    slider.addEventListener('input', () => sync(slider.value, 'slider'));
    number.addEventListener('change', () => sync(number.value, 'number'));
    number.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') number.blur();
    });

    sync(slider.value, 'init');
}
```

Apply this to all slider/value pairs, including but not limited to:

```text
Emitter Rate
Emitter Width
Speed Min
Speed Max
Direction
Angle Spread
Gravity Y
Friction
Vortex Orbit
Size Start
Size End
Blur / Edge Softness
Glow Radius
Duration Min
Duration Max
```

Do not make this a visual-only change. The typed number must update the same layer setting as the slider.

## 4. Add Low Performance Mode to View menu

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

## 5. Move Particle Shape into Visuals

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
Top-left brand uses the same Artifex logo/title image style as the Scene Editor.
Branding does not stretch, squash, or make the top bar taller.
View menu opens.
Low Performance Mode appears in View.
Clicking Low Performance Mode toggles ON/OFF.
Particle Shape now appears in Visuals.
Particle Shape no longer appears in Motion / Dynamics.
Changing Particle Shape still changes the effect.
Every slider value can be clicked and typed into.
Typing a value updates the slider.
Dragging a slider updates the typed value.
Typed values are clamped to valid min/max.
Direction, speed, spread, gravity, friction, and vortex controls still work.
Bottom panel labels feel less tactical.
Insert preset still works.
JSON tab still updates.
Export JSON still works.
```

## Rollback

If anything breaks, undo only the Phase 2 `index.html` edits. The external scaffold files can stay because they are not harmful.
