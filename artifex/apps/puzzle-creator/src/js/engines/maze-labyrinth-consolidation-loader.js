// Maze / Labyrinth stable module loader
//
// V1.34 Puzzle Creator shell stage: the stable Maze / Labyrinth systems remain permanent named
// modules. The app now starts in a puzzle-type chooser before entering the existing workflow.

import './maze-labyrinth-runtime-controls.js?v=1.28';
import './maze-difficulty-report.js?v=1.28';
import './maze-preview-default-layout.js?v=1.28';
import './maze-runtime-status.js?v=1.28';
import './maze-features.js?v=1.29.2';
import './maze-completion-rules.js?v=1.28';
import './maze-ui-polish.js?v=1.34';
import './maze-connections.js?v=1.30.1';
import './maze-door-visual-linking.js?v=1.30.2';
import './maze-organic-wall-renderer.js?v=1.28';
import './maze-scatter-decorations.js?v=1.32';

window.__artifexMazeConsolidation = {
  phase: 'v1_34_puzzle_type_chooser_and_shared_navigation',
  status: 'stable_modules_only_no_active_versioned_patch_imports',
  next: [
    'browser test launcher-to-Maze workflow entry and return-to-chooser navigation',
    'retain accepted V1.33 Scatter and Surface + Edit behaviour',
    'implement later puzzle engines only in their own approved scopes'
  ]
};
