// Maze / Labyrinth Door visual asset linking
//
// Owns final registered visual asset references for Door connection records.
// Door movement and connection placement remain owned by maze-connections.js.
// Portal visual/effect selection remains pending the later Portal Registry stage.

import '../../../../../shared/project-folder/project-folder-client.js?v=0.1.0';
import { openRegisteredContentPicker } from '../../../../../shared/registered-content/registered-content-picker.js?v=1.30';

const $ = (id) => document.getElementById(id);
const EDITOR_ID = 'door-visual-link-editor';
const STYLE_ID = 'maze-door-visual-linking-style';

window.addEventListener('DOMContentLoaded', () => {
  injectStyles();
  bindRefreshTriggers();
  refreshDoorVisualEditor();
});

function connections() {
  return window.__artifexMazeConnections || null;
}

function selectedPair() {
  const state = connections();
  return state?.pairs?.find((pair) => pair.id === state.selectedId) || null;
}

function bindRefreshTriggers() {
  window.addEventListener('artifex-maze-connections-updated', () => setTimeout(refreshDoorVisualEditor, 0));
  window.addEventListener('artifex-maze-feature-add-instance', () => setTimeout(refreshDoorVisualEditor, 0));
  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-connection]')) setTimeout(refreshDoorVisualEditor, 0);
  }, true);
}

function ensureEditor() {
  const fields = $('connection-fields');
  if (!fields) return null;
  let editor = $(EDITOR_ID);
  if (!editor) {
    editor = document.createElement('section');
    editor.id = EDITOR_ID;
    editor.className = 'door-visual-editor';
    const help = $('connection-type-help');
    if (help) help.insertAdjacentElement('afterend', editor);
    else fields.prepend(editor);
  }
  return editor;
}

function setLegacyPendingNoteVisibility(pair) {
  const pendingNotes = document.querySelectorAll('#connection-fields .connection-pending-note');
  const legacyVisualNote = Array.from(pendingNotes).find((note) => note.id !== 'portal-registry-status');
  if (legacyVisualNote) legacyVisualNote.hidden = Boolean(pair && pair.type === 'door');
}

function refreshDoorVisualEditor() {
  const pair = selectedPair();
  setLegacyPendingNoteVisibility(pair);
  annotateConnectionList();
  const editor = ensureEditor();
  if (!editor) return;
  if (!pair || pair.type !== 'door') {
    editor.hidden = true;
    return;
  }
  editor.hidden = false;
  const linked = Boolean(pair.visualAssetId);
  editor.innerHTML = `
    <div class="door-visual-title"><strong>Door Visual Asset</strong><small>Final project asset reference for this Door.</small></div>
    <div class="door-visual-link-state ${linked ? 'is-linked' : ''}">
      ${linked
        ? `<strong>${escapeHtml(pair.visualAssetLabel || 'Linked asset')}</strong><small>${escapeHtml(pair.visualAssetId)}</small>`
        : '<strong>No visual asset linked</strong><small>Select a registered asset_ record.</small>'}
    </div>
    <div class="door-visual-actions">
      <button type="button" data-door-link-visual title="Select a registered final asset for this Door visual.">${linked ? 'Replace Visual' : 'Link Visual'}</button>
      ${linked ? '<button type="button" data-door-unlink-visual title="Remove the Door visual reference without deleting the Door or its transfer behaviour.">Unlink</button>' : ''}
    </div>
    <p class="door-visual-honesty-note">This stores the Door appearance reference for export. The current maze preview continues to show the editor endpoint markers.</p>
  `;
  editor.querySelector('[data-door-link-visual]')?.addEventListener('click', () => openDoorVisualPicker(pair.id));
  editor.querySelector('[data-door-unlink-visual]')?.addEventListener('click', () => unlinkDoorVisual(pair.id));
}

function openDoorVisualPicker(pairId) {
  const pair = connections()?.pairs?.find((entry) => entry.id === pairId);
  if (!pair || pair.type !== 'door') return;
  openRegisteredContentPicker({
    initialKind: 'assets',
    kinds: ['assets'],
    title: `Link Visual for ${pair.label}`,
    selectLabel: 'Link Asset',
    contextNote: 'Only registered final asset_ records may be stored as Door visuals.',
    onSelect: ({ item, reference }) => {
      const currentPair = connections()?.pairs?.find((entry) => entry.id === pairId);
      if (!currentPair || currentPair.type !== 'door') return;
      currentPair.visualAssetId = reference.assetId;
      currentPair.visualAssetLabel = item.name;
      currentPair.visualAssetReferenceSource = reference.referenceSource;
      emitChange();
      refreshDoorVisualEditor();
    }
  });
}

function unlinkDoorVisual(pairId) {
  const pair = connections()?.pairs?.find((entry) => entry.id === pairId);
  if (!pair || pair.type !== 'door') return;
  pair.visualAssetId = null;
  pair.visualAssetLabel = null;
  pair.visualAssetReferenceSource = null;
  emitChange();
  refreshDoorVisualEditor();
}

function emitChange() {
  window.dispatchEvent(new CustomEvent('artifex-maze-connections-updated', { detail: connections() }));
}

function annotateConnectionList() {
  const state = connections();
  const list = $('connection-list');
  if (!state || !list) return;
  list.querySelectorAll('[data-connection]').forEach((button) => {
    const pair = state.pairs.find((entry) => entry.id === button.dataset.connection);
    const existing = button.querySelector('.door-visual-list-note');
    if (!pair || pair.type !== 'door' || !pair.visualAssetId) {
      existing?.remove();
      return;
    }
    const text = `Visual: ${pair.visualAssetLabel || pair.visualAssetId}`;
    if (existing) {
      existing.textContent = text;
      return;
    }
    const note = document.createElement('small');
    note.className = 'door-visual-list-note';
    note.textContent = text;
    button.appendChild(note);
  });
}

function injectStyles() {
  if ($(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .door-visual-editor{margin:8px 0;padding:8px;border:1px solid rgba(158,230,164,.18);border-radius:10px;background:rgba(4,18,10,.42)}
    .door-visual-title{display:flex;justify-content:space-between;gap:7px;margin-bottom:7px;align-items:baseline}.door-visual-title strong{color:#eadfc6;font-size:.69rem}.door-visual-title small{color:#a9b59e;font-size:.57rem}
    .door-visual-link-state{padding:7px 8px;border-radius:8px;border:1px dashed rgba(158,230,164,.18);margin-bottom:7px}.door-visual-link-state strong{display:block;color:#d8d0ba;font-size:.64rem}.door-visual-link-state small{display:block;color:#a9b59e;font-size:.57rem;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.door-visual-link-state.is-linked{border-style:solid;border-color:rgba(158,230,164,.36);background:rgba(20,72,37,.22)}.door-visual-link-state.is-linked strong,.door-visual-link-state.is-linked small{color:#9ee6a4}
    .door-visual-actions{display:flex;gap:5px}.door-visual-actions button{min-height:27px;padding:4px 7px;border-radius:7px;border:1px solid rgba(158,230,164,.24);background:rgba(12,54,28,.65);color:#eadfc6;font-size:.6rem;font-weight:700;cursor:pointer}.door-visual-actions button:hover{border-color:rgba(158,230,164,.5)}
    .door-visual-honesty-note{margin:7px 0 0;color:#a9b59e;font-size:.57rem;line-height:1.35}
    .connection-list-item .door-visual-list-note{display:block;color:#9ee6a4;margin-top:2px;font-size:.56rem}
  `;
  document.head.appendChild(style);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}
