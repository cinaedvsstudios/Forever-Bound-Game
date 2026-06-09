// Horse Forest Runner V9
// POV horse ride for the Puzzle Creator Obstacle Course slot.
// Uses separate HTML sky/horizon layers and a Three.js foreground runner world.
// This avoids stretching sky/horizon images as floor textures.

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';

const ASSET_ROOT = './assets/obstacle-course/horse-forest/';
const ASSETS = {
  sky: 'sky/forest_sky_clouds_1920x1080.png',
  horizon: 'backgrounds/forest_horizon_misty_pines_01_740x493.png',
  ground: 'ground/forest_floor_roots_tile_placeholder_1254.png',
  trees: [
    'trees/tree_pine_placeholder_01.png',
    'trees/tree_broadleaf_01.png',
    'trees/treeline_pine