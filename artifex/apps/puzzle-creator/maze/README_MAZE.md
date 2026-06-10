# Maze module

This folder is an isolated Labyrinth Maze recovery module.

Open `index.html` in a browser. It contains:
- maze-only launcher setup
- recovered maze runtime and consolidation modules
- local texture images
- local schema/sample data

Notes:
- Shared Artifex registered-content imports were patched to safe local no-op fallbacks so this folder can run without the full repository-level `shared/` directory.
- Potion, pattern and horse-ride modules are not loaded from this folder.
