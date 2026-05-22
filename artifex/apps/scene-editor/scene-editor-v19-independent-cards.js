(() => {
  'use strict';

  const INDEPENDENT_IDS = ['transform-v15', 'visual-v15', 'animation-v15', 'audio-v15'];
  const collapsed = {};
  let applying = false;

  function selectedCard() {
    return document.querySelector('[data-card-id="selected"]');
  }

  function independentCards() {
    return INDEPENDENT_IDS.map((id) => document.querySelector(`[data-card-id="${id}"]`)).filter(Boolean);
  }

  function rememberStates() {
    INDEPENDENT_IDS.forEach((id) => {
      const card = document.querySelector(`[data-card-id="${id}"]`);
      if (card) collapsed[id] = card.classList.contains('is-collapsed');
    });
  }

  function restoreStates() {
    INDEPENDENT_IDS.forEach((id) => {
      const card = document.querySelector(`[data-card-id="${id}"]`);
      if (card && Object.prototype.hasOwnProperty.call(collapsed, id)) {
        card.classList.toggle('is-collapsed', !!collapsed[id]);
      }
    });
  }

  function stopSelectedCoreCollapse(event) {
    const button = event.target.closest?.('[data-card-toggle="selected"], [data-card-id="selected"] .card-toggle');
    if (!button) return;
    const card = selectedCard();
    if (!card) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    card.classList.toggle('is-collapsed');
    independentCards().forEach((subcard) => {
      subcard.style.display = '';
      subcard.hidden = false;
    });
  }

  function wireIndependentToggles() {
    independentCards().forEach((card) => {
      const button = card.querySelector('.card-toggle');
      if (!button || button.dataset.v19IndependentToggle === 'true') return;
      button.dataset.v19IndependentToggle = 'true';
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        card.classList.toggle('is-collapsed');
        collapsed[card.dataset.cardId] = card.classList.contains('is-collapsed');
      }, true);
    });
  }

  function ensureCardsStayAfterSelected() {
    if (applying) return;
    applying = true;
    try {
      const selected = selectedCard();
      if (!selected) return;
      const cards = independentCards();
      let anchor = selected;
      cards.forEach((card) => {
        if (card.previousElementSibling !== anchor) anchor.after(card);
        card.style.display = '';
        card.hidden = false;
        anchor = card;
      });
      restoreStates();
      wireIndependentToggles();
    } finally {
      applying = false;
    }
  }

  document.addEventListener('pointerdown', rememberStates, true);
  document.addEventListener('click', stopSelectedCoreCollapse, true);
  document.addEventListener('click', () => requestAnimationFrame(ensureCardsStayAfterSelected), true);
  document.addEventListener('input', () => requestAnimationFrame(ensureCardsStayAfterSelected), true);
  document.addEventListener('change', () => requestAnimationFrame(ensureCardsStayAfterSelected), true);
  document.addEventListener('pointerup', () => requestAnimationFrame(ensureCardsStayAfterSelected), true);
  window.addEventListener('load', ensureCardsStayAfterSelected);
  setInterval(ensureCardsStayAfterSelected, 800);
  ensureCardsStayAfterSelected();
})();
