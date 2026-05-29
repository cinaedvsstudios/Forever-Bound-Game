(() => {
  'use strict';

  const appFactory = window.ArtifexSceneEditorApp;
  if (!appFactory?.createSceneEditorApp) {
    throw new Error('Artifex Scene Editor app module did not load.');
  }

  const app = appFactory.createSceneEditorApp();
  app.start();
})();
