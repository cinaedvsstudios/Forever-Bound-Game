# Atmosphere Volume Engine Debug Prototype

Status: isolated visual prototype only. Not wired into the accepted Effect Editor runtime, preset registry, project-folder save flow or Effects Library.

## Purpose

This page exists so the replacement for the rejected Gas / Smoke / Dust approach can be visually tested before any production Effect Editor integration is attempted.

Prototype route:

```text
artifex/apps/effect-editor/debug/atmosphere-volume/index.html
```

## What this prototype tests

The prototype renders broad moving cloud sheets rather than individual smoke particles. It provides basic controls for:

- fog colour, opacity, density, softness and blend mode;
- ground coverage, overlapping volume layers, turbulence and detail scale;
- horizontal drift, direction and internal roll speed;
- back, middle and foreground depth visibility;
- a small set of preview presets and test backgrounds;
- snapshot output and copied prototype settings JSON.

The back/middle/front test layers are deliberately included to judge whether the eventual effect can sit behind scenery, pass between scene objects and cover foreground feet without the Effect Editor owning final scene placement. Final layering and position remain Scene Editor responsibilities when a saved effect archetype is placed as an effect instance.

## Prototype limits

- This is not yet an FX Archetype save implementation.
- The JSON output is inspection data only and is explicitly marked `debug-prototype-not-runtime-schema`.
- It does not modify or reuse the current rejected `gas`, `refraction`, `heatdistortion`, `lensflare` or `true-lensflare` runtimes.
- It does not connect to asset registration, the project folder, Effect Library thumbnails or Scene Editor placement.
- It does not include video FX asset support or sprite-sheet/flipbook playback.

## Decision gate before integration

Review whether the moving volume looks suitable for ground fog, forest mist, corruption haze and dream veil effects. Only after the visual approach is accepted should production integration be planned as a replacement Atmosphere Volume Engine within the Effect Editor.