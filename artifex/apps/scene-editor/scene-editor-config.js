(() => {
  'use strict';

  const VERSION = 'v0.36-selection-display-clear-selection';
  const SETTINGS_KEY = 'artifex.sceneEditor.settings.v1';
  const WORKING_COPY_KEY = 'artifex.sceneEditor.workingCopy.v1';
  const DOWNLOAD_KEY = 'artifex.sceneEditor.lastDownload.v1';
  const repoPrefix = location.pathname.includes('/Forever-Bound-Game/') ? '/Forever-Bound-Game/' : '/';
  const brandLogo = '../../artifexlogo.png';
  const brandTitle = '../../artifextitle.png';
  const templateManifest = '../../templates/templates.json';
  const typeOptions = ['prop', 'pickup', 'player_start', 'npc', 'foe', 'door', 'exit', 'overlay', 'background_layer', 'foreground_layer', 'hazard', 'searchable', 'marker', 'effect', 'ui'];

  window.ArtifexSceneEditorConfig = Object.freeze({
    VERSION,
    SETTINGS_KEY,
    WORKING_COPY_KEY,
    DOWNLOAD_KEY,
    repoPrefix,
    brandLogo,
    brandTitle,
    templateManifest,
    typeOptions
  });
})();