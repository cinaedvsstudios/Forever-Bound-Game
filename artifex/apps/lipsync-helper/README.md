# Artifex Lip-Sync Helper — Patch Workflow Prototype V0.1

## Purpose

This is an isolated Artifex-style production prototype for repairing occasional broken lip-sync fragments in generated Forever Bound video clips.

The prototype is not connected to the Artifex Hub, Scene Editor, Effect Editor, Object Creator, Puzzle Creator, or game runtime. It adds a standalone test route only:

`artifex/apps/lipsync-helper/index.html`

## What V0.1 proves

V0.1 is a controlled manual proof of workflow. It allows the creator to:

1. Upload a browser-supported video file.
2. Scrub and step through the video using a chosen working FPS.
3. Mark `In` and `Out` timecodes for a failed word or short phrase.
4. Enter the intended fragment, such as `End`, `Laughter`, `Ohhh`, or `it be`.
5. See an approximate visible mouth-shape / viseme sequence for the typed text.
6. Build a donor-frame filmstrip sampled from the same uploaded clip.
7. Select a donor frame and drag a crop around a usable mouth shape.
8. Preview that donor mouth as a feathered patch over the selected bad range.
9. Move, scale, rotate, feather and fade the patch manually.
10. Save locally or download a JSON repair plan.

## Deliberate V0.1 limits

V0.1 does not automatically detect faces or lips. It does not rank donor frames. It does not produce a final repaired MP4. It does not yet support a changing multi-patch mouth sequence across a complete word.

The current overlay is a single-patch proof suitable for testing sustained shapes such as `Ohhh` and testing whether mouth-region compositing can look acceptable on the source footage.

Words with changing mouth positions, such as `Laughter` or `it be`, require the next prototype stage: multiple timed patch keyframes within one repair region.

## Planned technical progression

### V0.2 — Multi-patch word repair

Add several timed mouth patches within a single repair region, so a phrase can change from one visible mouth position to another while retaining per-patch transform and feather controls.

### V0.3 — Landmark-assisted placement

Add face/mouth tracking so donor crop and target placement can be suggested automatically while remaining manually adjustable.

### V0.4 — Donor candidate matching

Analyse usable frames, classify visible mouth shapes, and rank candidate donors by mouth shape, head angle, scale, light and sharpness.

### V0.5 — Video render/export

Composite accepted repairs into frames and export a repaired video while retaining the original audio.

## Manual test flow

1. Open `artifex/apps/lipsync-helper/index.html`.
2. Upload a short video.
3. Find a faulty fragment and use `Set In` and `Set Out`.
4. Type its correct word or phrase and select `Add Repair Region`.
5. Choose a donor-frame thumbnail showing a useful mouth shape.
6. Drag around the donor mouth in the video preview.
7. The preview jumps to the faulty region with the patch attached.
8. Use `Position Patch`, X/Y, Scale, Rotate, Feather and Opacity to judge whether the replacement blends convincingly.
9. Use `Loop Selected` to evaluate the repaired segment repeatedly.
10. Download the JSON repair plan.

## Safety of this prototype

This prototype is intentionally isolated and does not overwrite accepted Artifex editor routes or data formats. It stores only browser-local working data and user-exported JSON. It does not send uploaded video anywhere and does not modify the source video.
