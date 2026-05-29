(() => {
  'use strict';

  function dateText(iso) {
    if (!iso) return 'Not recorded';
    try { return new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }); }
    catch { return String(iso); }
  }

  async function importFile(event, handlers) {
    const file = event.target.files?.[0];
    if (!file) return;
    handlers.toast(`Loading local JSON file: ${file.name}...`);
    try {
      handlers.normalize(JSON.parse(await file.text()), file.name);
      handlers.render(false);
    } catch (err) {
      handlers.setStatus(`Import failed: ${err.message}`);
      handlers.toast(handlers.getStatus());
      handlers.render();
    }
  }

  async function importUrl(handlers) {
    const url = prompt('Paste JSON URL:');
    if (!url) return;
    handlers.toast('Loading URL JSON...');
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) throw new Error(response.status);
      handlers.normalize(await response.json(), url.split('/').pop() || 'URL JSON');
      handlers.render(false);
    } catch (err) {
      handlers.setStatus(`URL import failed: ${err.message}`);
      handlers.toast(handlers.getStatus());
      handlers.render();
    }
  }

  async function openTemplates(manifestUrl, handlers) {
    try {
      handlers.toast('Loading template list...');
      const response = await fetch(manifestUrl, { cache: 'no-store' });
      if (!response.ok) throw new Error(response.status);
      handlers.setTemplates((await response.json()).templates || []);
      handlers.setTemplateOpen(true);
      handlers.setImportOpen(false);
      handlers.render();
    } catch (err) {
      handlers.setStatus(`Template list failed: ${err.message}`);
      handlers.toast(handlers.getStatus());
      handlers.render();
    }
  }

  async function loadTemplate(file, handlers) {
    try {
      handlers.toast(`Loading template: ${file}...`);
      const response = await fetch(`../../templates/${file}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(response.status);
      handlers.normalize(await response.json(), file);
      handlers.setTemplateOpen(false);
      handlers.render(false);
    } catch (err) {
      handlers.setStatus(`Template import failed: ${err.message}`);
      handlers.toast(handlers.getStatus());
      handlers.render();
    }
  }

  function download(scene, handlers) {
    if (!scene) {
      handlers.toast('Nothing to download');
      return;
    }
    const blob = new Blob([JSON.stringify(scene, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${scene.id || 'artifex_scene'}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    handlers.markDownloaded();
    handlers.toast('JSON downloaded');
    handlers.render();
  }

  window.ArtifexSceneEditorIO = Object.freeze({
    dateText,
    importFile,
    importUrl,
    openTemplates,
    loadTemplate,
    download
  });
})();
