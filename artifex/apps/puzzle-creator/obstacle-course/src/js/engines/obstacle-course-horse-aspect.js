export function installHorseAspectFix() {
  if (document.getElementById('oc-horse-aspect-fix-styles')) return;
  const style = document.createElement('style');
  style.id = 'oc-horse-aspect-fix-styles';
  style.textContent = `
    .obstacle-horse-overlay {
      width: 272px !important;
      height: 310px !important;
      margin-left: -136px !important;
      bottom: -77px !important;
      background-size: 700% 100% !important;
    }
  `;
  document.head.appendChild(style);
}