// Maze / Labyrinth stable module loader
//
// V1.32 Scatter placement modes stage: all active Maze / Labyrinth systems load through
// permanent named modules. Scatter positions may be authored before optional registered visual
// assets are linked; each light/decoration slot owns its distribution mode.

import './maze-labyrinth-runtime-controls.js?v=1.28';
import './maze-difficulty-report.js?v=1.28';
import './maze-preview-default-layout.js?v=1.28';
import './maze-runtime-status.js?v=1.28';
import './maze-features.js?v=1.29.2';
import './maze-completion-rules.js?v=1.28';
import './maze-ui-polish.js?v=1.32';
import './maze-connections.js?v=1.30.1';
import './maze-door-visual-linking.js?v=1.30.2';
import './maze-organic-wall-renderer.js?v=1.28';
import './maze-scatter-decorations.js?v=1.32';

window.__artifexMazeConsolidation = {
  phase: 'v1_32_scatter_placement_modes',
  status: 'stable_modules_only_no_active_versioned_patch_imports',
  next: [
    'live test Random, Equal Distribution and Around Main Solution Path placement modes',
    'retain Scatter placeholder-first authoring and existing Maze regressions',
    'implement Traboule as a hidden pass-through wall feature'
  ]
};
