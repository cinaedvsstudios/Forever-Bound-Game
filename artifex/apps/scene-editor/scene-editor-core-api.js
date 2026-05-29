(() => {
  'use strict';

  function createCoreApi(app) {
    return {
      version: app.version,
      getVersion: () => app.version,
      getScene: app.getScene,
      getSelectedId: app.getSelectedId,
      getSelectedKind: app.getSelectedKind,
      getSelectedItem: app.getSelectedItem,
      getAllItems: app.getAllItems,
      select: app.select,
      render: app.render,
      renderWorkAreaOnly: app.renderWorkAreaOnly,
      saveWorkingCopy: app.saveWorkingCopy,
      saveWorkingCopySoon: app.saveWorkingCopySoon,
      clamp: app.clamp,
      toast: app.toast
    };
  }

  window.ArtifexSceneEditorCoreApi = Object.freeze({ createCoreApi });
})();
