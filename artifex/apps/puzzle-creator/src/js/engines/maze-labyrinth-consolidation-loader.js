// Maze / Labyrinth stable module loader
//
// V1.29 Collect Archetype Object linking stage: all active Maze / Labyrinth systems load
// through permanent named modules. Features own content added to the maze; Completion Rules
// validate which added content is mandatory; Wall Form owns joined visual wall rendering.

import './maze-labyrinth-runtime-controls.js?v=1.28';
import './maze-difficulty-report.js?v=1.28';
import './maze-preview-default-layout.js?v=1.28';
import './maze-runtime-status.js?v=1.28';
import './maze-features.js?v=1.29.2';
import './maze-completion-rules.js?v=1.28';
import './maze-ui-polish.js?v=1.28';
import './maze-connections.js?v=1.28';
import './maze-organic-wall-renderer.js?v=1.28';

window.__artifexMazeConsolidation = {
  phase: 'v1_29_collect_archetype_object_linking',
  status: 'stable_modules_only_no_active_versioned_patch_imports',
  next: [
    'live test Collect Link picker connection, empty state and valid archobj_ selection',
    'link Door visuals to registered asset_ records after Collect passes live test',
    'implement Scatter, Traboule and Tunnel work in stable modules only'
  ]
};
