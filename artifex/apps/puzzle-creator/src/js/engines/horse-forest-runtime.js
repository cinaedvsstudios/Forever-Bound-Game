// Horse Forest Runner V7
// POV horse ride using separate static sky/horizon layers and moving world objects.
// Fixes the broken V6 truncation and the V3/V4 stretched texture band problem.

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';

const ROOT = './assets/obstacle-course/horse-forest/';
const ASSETS = {
  sky: 'sky/forest_sky_clouds_1920x108