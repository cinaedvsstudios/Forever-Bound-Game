(() => {
  'use strict';

  function safeParse(text, fallback = null) {
    try {
      return JSON.parse(text);
    } catch {
      return fallback;
    }
  }

  function readJson(key, fallback = null) {
    try {
      return safeParse(localStorage.getItem(key), fallback);
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function loadSettings(key) {
    return readJson(key, {}) || {};
  }

  function saveSettings(key, settings) {
    return writeJson(key, settings || {});
  }

  function readWorkingCopy(key) {
    return readJson(key, null);
  }

  function writeWorkingCopy(key, payload) {
    return writeJson(key, payload);
  }

  function readDownloadStamp(key) {
    return readJson(key, null);
  }

  function writeDownloadStamp(key, payload) {
    return writeJson(key, payload);
  }

  window.ArtifexSceneEditorStorage = Object.freeze({
    safeParse,
    readJson,
    writeJson,
    loadSettings,
    saveSettings,
    readWorkingCopy,
    writeWorkingCopy,
    readDownloadStamp,
    writeDownloadStamp
  });
})();
