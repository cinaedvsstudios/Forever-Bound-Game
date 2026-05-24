(() => {
  'use strict';

  function title(cardId, text) {
    const node = document.querySelector(`[data-card-id="${cardId}"] h2 span`);
    if (node && node.textContent !== text) node.textContent = text;
  }

  function makeBackgroundCard() {
    const basics = document.querySelector('[data-card-id="basics"]');
    const body = basics?.querySelector('.card-body');
    const bgField = document.getElementById('sceneBg')?.closest('.field');
    if (!basics || !body || !bgField) return;
    let card = document.querySelector('[data-card-id="background-v26"]');
    if (!card) {
      card = document.createElement('section');
      card.className = 'panel-card card-basics is-collapsed';
      card.dataset.cardId = 'background-v26';
      card.innerHTML = '<h2><span>Background</span><button class="card-toggle" type="button" data-v26-bg-toggle="true">↕</button></h2><div class="card-body"></div>';
      basics.after(card);
      card.querySelector('[data-v26-bg-toggle]')?.addEventListener('click', () => card.classList.toggle('is-collapsed'));
    }
    const cardBody = card.querySelector('.card-body');
    if (!cardBody.contains(bgField)) cardBody.appendChild(bgField);
    if (card.classList.contains('is-collapsed')) cardBody.style.display = 'none';
    else cardBody.style.display = '';
  }

  function patchTitles() {
    title('basics', 'Scene');
    title('elements', 'Object Layers');
    title('selected', 'Selected Details');
    title('transform-v15', 'Transform Selected');
  }

  function patch() {
    patchTitles();
    makeBackgroundCard();
  }

  document.addEventListener('click', () => requestAnimationFrame(patch), true);
  document.addEventListener('input', () => requestAnimationFrame(patch), true);
  document.addEventListener('change', () => requestAnimationFrame(patch), true);
  window.addEventListener('load', patch);
  setInterval(patch, 800);
  patch();
})();
