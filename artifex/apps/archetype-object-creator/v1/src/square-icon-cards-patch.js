const SQUARE_ICON_CARD_CSS = `
.template-card-grid {
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)) !important;
  align-items: start !important;
}

.wizard-template-grid,
.wizard-existing-grid {
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)) !important;
}

.object-template-card .template-visual,
.template-card > .template-visual,
.library-card > .template-visual {
  width: 100% !important;
  aspect-ratio: 304 / 305 !important;
  min-height: 0 !important;
  height: auto !important;
  overflow: hidden !important;
  margin: -2px -2px 14px !important;
  padding: 10px !important;
}

.object-template-card .template-icon-img,
.template-card > .template-visual .template-icon-img,
.library-card > .template-visual .template-icon-img {
  width: 88% !important;
  height: 88% !important;
  max-width: none !important;
  max-height: none !important;
  object-fit: contain !important;
}

.object-template-card .template-icon-fallback,
.template-card > .template-visual .template-icon-fallback,
.library-card > .template-visual .template-icon-fallback {
  width: 46% !important;
  height: 46% !important;
  font-size: clamp(36px, 8vw, 72px) !important;
}
`;

function injectSquareIconCardStyles() {
  if (document.getElementById('object-template-square-icon-card-styles')) return;
  const style = document.createElement('style');
  style.id = 'object-template-square-icon-card-styles';
  style.textContent = SQUARE_ICON_CARD_CSS;
  document.head.appendChild(style);
}

window.addEventListener('DOMContentLoaded', injectSquareIconCardStyles);
