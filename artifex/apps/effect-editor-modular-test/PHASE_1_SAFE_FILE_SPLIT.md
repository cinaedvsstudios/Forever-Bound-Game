# Phase 1 — Baseline + Safe File Split

## Goal

Wire the existing Effect Editor page to the extracted stylesheet and Tailwind config without changing runtime logic.

## Already created

```text
artifex/apps/effect-editor/styles.css
artifex/apps/effect-editor/src/config/tailwind.config.js
```

## Manual snippet for index.html

Replace the inline Tailwind config block and inline `<style>` block in the `<head>` with this:

```html
<!-- Tailwind CSS for modern responsive design -->
<script src="https://cdn.tailwindcss.com"></script>
<script src="./src/config/tailwind.config.js"></script>

<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Fira+Code:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="./styles.css">
```

## What must not change in this phase

```text
Do not move body HTML.
Do not move the main inline app script.
Do not rename IDs.
Do not rename functions.
Do not change the particle renderer.
Do not change the presets.
```

## Test checklist

After the change, open the Effect Editor and check:

```text
Page loads.
No red console errors.
Visual style looks the same.
Fonts still load.
Gold/purple/dark colours still match.
Top menus open.
Insert menu opens.
A preset can be inserted.
Particles still render.
Selecting a layer updates the inspector.
Changing a slider changes the effect.
JSON tab still updates.
Export JSON still downloads.
```

## Rollback

If anything breaks, restore the original inline Tailwind config and inline `<style>` block in `index.html`.
