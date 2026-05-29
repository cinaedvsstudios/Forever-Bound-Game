import { initAppearanceParity } from './appearance-parity.js';

window.addEventListener('DOMContentLoaded', () => {
  initAppearanceParity(showToast);
});

function showToast(message, type = 'info') {
  const area = document.getElementById('toast-area');
  if (!area) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  area.append(toast);
  window.setTimeout(() => toast.remove(), 3200);
}
