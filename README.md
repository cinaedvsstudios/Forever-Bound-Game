# Forever Bound Game

A lightweight browser-based 2D companion game for Forever Bound.

## Current Prototype

This repository currently contains a manual Phase 1–3 prototype:

- title screen
- Play button
- fixed wide phone-style game frame
- placeholder Chronicle 0 forest scene
- placeholder Mel sprite
- keyboard movement
- on-screen NES-style controls
- HUD placeholders
- scene data loaded from JSON

## How to Test Locally

Open `index.html` in a browser.

If the scene JSON does not load from direct file opening, use a local server instead:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## GitHub Pages

For GitHub Pages:

1. Go to repository Settings.
2. Go to Pages.
3. Set Source to Deploy from a branch.
4. Set Branch to `main`.
5. Set Folder to `/ root`.
6. Save.

## Current File Structure

```text
assets/
  branding/
  characters/
    mel/
  scenes/
    ch00/
  ui/
  audio/
    music/
    ambience/
    sfx/
data/
  scenes/
  settings/
docs/
src/
  main.js
  styles.css
index.html
README.md
```

## Design Notes

The prototype uses a 20:9 landscape phone-first frame with a logical base of 2400 × 1080.

The first practical target is not Chronicle 1. The first practical target is a small playable tutorial prototype:

1. title screen
2. scene loading
3. Mel movement
4. map / Stone Marker
5. items
6. dialogue
7. enemies
8. Chronicle 0
