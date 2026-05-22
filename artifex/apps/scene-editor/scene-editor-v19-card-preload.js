(() => {
  'use strict';

  const SETTINGS_KEY = 'artifex.sceneEditor.settings.v1';

  try {
    const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    settings.collapsedCards = settings.collapsedCards || {};
    settings.collapsedCards.selected = false;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // If localStorage is unavailable, the Scene Editor can still run.
  }
})();
