let installed = false;

export function installButtonFeedback() {
  if (installed) return;
  installed = true;
  if (!document.getElementById('oc-button-feedback-styles')) {
    const style = document.createElement('style');
    style.id = 'oc-button-feedback-styles';
    style.textContent = `
      .oc-clickable-feedback:active,
      .oc-click-feedback-active {
        transform: translateY(1px) scale(0.97);
        box-shadow: 0 0 0 2px rgba(238,196,90,.45), 0 0 18px rgba(238,196,90,.35) !important;
        filter: brightness(1.25);
      }
      .oc-clickable-feedback {
        transition: transform .08s ease, box-shadow .12s ease, filter .12s ease;
      }
    `;
    document.head.appendChild(style);
  }
  document.addEventListener('click', (event) => {
    const button = event.target?.closest?.('button');
    if (!button || button.disabled) return;
    button.classList.add('oc-clickable-feedback', 'oc-click-feedback-active');
    window.setTimeout(() => button.classList.remove('oc-click-feedback-active'), 140);
  }, true);
  document.querySelectorAll('button').forEach((button) => button.classList.add('oc-clickable-feedback'));
}
