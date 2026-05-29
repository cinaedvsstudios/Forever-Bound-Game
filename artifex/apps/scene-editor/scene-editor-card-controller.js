(() => {
  'use strict';

  const STORAGE_KEY = 'artifex.sceneEditor.cardCollapse.v20';
  const MANAGED_IDS = ['selected', 'transform-v15', 'visual-v15', 'animation-v15', 'audio-v15'];
  const SUBCARD_IDS = MANAGED_IDS.slice(1);
  const TITLES = {
    selected: 'Object Details',
    'transform-v15': 'Transform',
    'visual-v15': 'Visual Adjustments',
    'animation-v15': 'Animation',
    'audio-v15': 'Audio'
  };

  let applying = false;

  function safeRead() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch { return {}; }
  }

  function safeWrite(value) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); }
    catch {}
  }

  const collapsed = safeRead();

  function card(id) {
    return document.querySelector(`[data-card-id="${id}"]`);
  }

  function selectedCard() {
    return card('selected');
  }

  function subcards() {
    return SUBCARD_IDS.map(card).filter(Boolean);
  }

  function selectedObjectId() {
    return window.ArtifexSceneEditorCore?.getSelectedId?.() || document.getElementById('itemId')?.value || '';
  }

  function applyTitle(node) {
    const id = node?.dataset?.cardId;
    const title = TITLES[id];
    const span = node?.querySelector('h2 span');
    if (span && title) span.textContent = title;
  }

  function persist(id, isCollapsed) {
    collapsed[id] = !!isCollapsed;
    safeWrite(collapsed);
  }

  function restoreCollapse(node) {
    const id = node?.dataset?.cardId;
    if (!id || !Object.prototype.hasOwnProperty.call(collapsed, id)) return;
    node.classList.toggle('is-collapsed', !!collapsed[id]);
  }

  function keepSubcardsVisible() {
    subcards().forEach((node) => {
      node.hidden = false;
      node.style.display = '';
      node.classList.add('v20-independent-card');
    });
  }

  function removeDuplicateCards() {
    MANAGED_IDS.forEach((id) => {
      const nodes = Array.from(document.querySelectorAll(`[data-card-id="${id}"]`));
      if (nodes.length <= 1) return;
      const keep = nodes.find((node) => node.querySelector('.card-body')?.children.length) || nodes[0];
      nodes.forEach((node) => { if (node !== keep) node.remove(); });
    });
  }

  function orderCards() {
    const selected = selectedCard();
    if (!selected) return;
    let anchor = selected;
    SUBCARD_IDS.forEach((id) => {
      const node = card(id);
      if (!node) return;
      if (node.parentElement !== selected.parentElement || node.previousElementSibling !== anchor) {
        anchor.after(node);
      }
      anchor = node;
    });
  }

  function wireCard(node) {
    if (!node) return;
    node.classList.add('v20-managed-card');
    applyTitle(node);
    restoreCollapse(node);
    const button = node.querySelector('.card-toggle');
    if (button) {
      button.dataset.v20CardToggle = node.dataset.cardId || '';
      button.title = `Collapse / expand ${TITLES[node.dataset.cardId] || 'card'}`;
    }
  }

  function enforceCards() {
    if (applying) return;
    applying = true;
    try {
      removeDuplicateCards();
      const selected = selectedCard();
      if (!selected || !selectedObjectId()) return;
      MANAGED_IDS.map(card).filter(Boolean).forEach(wireCard);
      orderCards();
      keepSubcardsVisible();
    } finally {
      applying = false;
    }
  }

  function toggleManagedCard(event) {
    const button = event.target.closest?.('[data-card-id] .card-toggle, [data-card-toggle="selected"]');
    if (!button) return;
    const node = button.closest?.('[data-card-id]');
    const id = node?.dataset?.cardId;
    if (!node || !MANAGED_IDS.includes(id)) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    node.classList.toggle('is-collapsed');
    persist(id, node.classList.contains('is-collapsed'));
    keepSubcardsVisible();
  }

  function schedule() {
    requestAnimationFrame(() => requestAnimationFrame(enforceCards));
  }

  document.addEventListener('click', toggleManagedCard, true);
  document.addEventListener('click', schedule, true);
  document.addEventListener('input', schedule, true);
  document.addEventListener('change', schedule, true);
  document.addEventListener('pointerup', schedule, true);
  window.addEventListener('load', enforceCards);
  setInterval(enforceCards, 900);
  enforceCards();
})();
