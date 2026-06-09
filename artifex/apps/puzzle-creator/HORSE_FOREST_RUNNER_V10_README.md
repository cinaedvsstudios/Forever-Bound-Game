# Horse Forest Runner V10 fixed code

This zip is rooted at:

puzzle-creator/

Copy the contents of this folder into:

artifex/apps/puzzle-creator/

It replaces:

src/js/main.js
src/js/engines/horse-forest-runtime.js

It assumes the existing asset folder is already present at:

assets/obstacle-course/horse-forest/

After upload/commit, test with a cache-busted URL:

https://raw.githack.com/cinaedvsstudios/Forever-Bound-Game/main/artifex/apps/puzzle-creator/index.html?horse-v10-fixed=1

In the app, click the former Flying Practice / Obstacle Course slot.
The menu should be renamed to Horse Forest Ride after the runtime loads.

What changed:
- removed the broken stretched Three.js visual approach
- uses CSS sky/horizon/ground layers
- uses transparent PNG cards for trees, bushes, logs, rocks, branches and collectibles
- keeps the simple runner scoring: collectibles +5, obstacle hit -1
- Space jumps
