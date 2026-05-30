// Maze / Labyrinth stable module loader
//
// V1.28 approved baseline: all active Maze / Labyrinth systems load through permanent named
// modules. Features own content added to the maze; Completion Rules validate which added
// content is mandatory; Wall Form owns joined visual wall rendering without Walk Test flicker.

import './maze-labyrinth-runtime-controls.js?v=1.28';
import './maze-difficulty-report.js?v=1.28';
import './maze-preview-default-layout.js?v=1.28';
import './maze-runtime-status.js?v=1.28';
import './maze-features.js?v=1.28';
import './maze-completion-rules.js?v=1.28';
import './maze-ui-polish.js?v=1.28';
import './maze-connections.js?v=1.28';
import './maze-organic-wall-renderer.js?v=1.28';

window.__artifexMazeConsolidation = {
  phase: 'v1_28_approved_stable_baseline',
  status: 'stable_modules_only_no_active_versioned_patch_imports',
  next: [
    'build a shared project-backed registered-content picker dependency',
    'link Collect items to registered archobj_ records when the picker exists',
    'link Door visuals to registered asset_ records when the picker exists',
    'implement Scatter, Traboule and Tunnel work in stable modules only'
  ]
};
