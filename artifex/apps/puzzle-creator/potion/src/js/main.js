import { openPotionMatchWorkflow } from './engines/potion-match-runtime.js?v=2.5';

function openPotion() {
  openPotionMatchWorkflow();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', openPotion, { once: true });
} else {
  openPotion();
}
