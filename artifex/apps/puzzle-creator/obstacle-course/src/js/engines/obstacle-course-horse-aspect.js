export function installHorseAspectFix() {
  if (document.getElementById('oc-horse-aspect-fix-styles')) return;
  const style = document.createElement('style');
  style.id = 'oc-horse-aspect-fix-styles';
  style.textContent = `
    .obstacle-horse-overlay {
      width: 340px !important;
      height: 387px !important;
      margin-left: -170px !important;
      bottom: -96px !important;
      background-size: 700% 100% !important;
    }
    .obstacle-horse-shadow {
      width: 340px !important;
      height: 210px !important;
      margin-left: -170px !important;
      bottom: -66px !important;
    }
  `;
  document.head.appendChild(style);
}
