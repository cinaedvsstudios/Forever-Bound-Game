# Horse Forest Runner V3 bundle

Root folder: `puzzle-creator/`

Copy this `puzzle-creator` folder over:

`artifex/apps/puzzle-creator/`

It includes:

- `src/js/engines/obstacle-course-runtime.js` — updated V3 horse forest runner runtime.
- `assets/obstacle-course/horse-forest/` — selected existing forest assets plus generated editable placeholder PNGs.

The runtime loads PNG assets from `./assets/obstacle-course/horse-forest/`. If an image is missing, the module should still run, but that object will not display as intended until the file is added.

Controls in the prototype:

- A/D or Left/Right arrows = steer
- Space, W, or Up = jump
- Collectibles = +5
- Obstacle hit = -1
- Finish route = success/failure by target score
