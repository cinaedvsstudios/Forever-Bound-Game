import './engines/maze-labyrinth-runtime.js';
import './engines-ui.js?v=maze';

window.addEventListener('DOMContentLoaded', () => {
  window.setTimeout(() => {
    document.querySelector('[data-engine="maze-labyrinth"]')?.click();
  }, 150);
});
