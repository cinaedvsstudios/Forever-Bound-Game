const SQUARE_ICON_CARD_CSS = `
.template-card-grid {
  grid-template-columns: repeat(auto-fill, minmax(174px, 186px)) !important;
  align-items: start !important;
  justify-content: start !important;
  gap: 14px !important;
}

.wizard-template-grid,
.wizard-existing-grid {
  grid-template-columns: repeat(auto-fill, minmax(174px, 186px)) !important;
  justify-content: start !important;
  gap: 14px !important;
}

.object-template-card,
.template-card.object-template-card,
.library-card.object-template-card {
  max-width: 186px !important;
  padding: 10px !important;
}

.object-template-card .template-visual,
.template-card > .template-visual,
.library-card > .template-visual {
  width: 100% !important;
  aspect-ratio: 304 / 305 !important;
  min-height: 0 !important;
  height: auto !important;
  overflow: hidden !important;
  margin: 0 0 10px !important;
  padding: 8px !important;
}

.object-template-card .template-icon-img,
.template-card > .template-visual .template-icon-img,
.library-card > .template-visual .template-icon-img {
  width: 62% !important;
  height: 62% !important;
  max-width: none !important;
  max-height: none !important;
  object-fit: contain !important;
}

.object-template-card .template-icon-fallback,
.template-card > .template-visual .template-icon-fallback,
.library-card > .template-visual .template-icon-fallback {
  width: 40% !important;
  height: 40% !important;
  font-size: clamp(28px, 4vw, 46px) !important;
}

.object-template-card h4,
.template-card.object-template-card h4 {
  font-size: 13px !important;
  line-height: 1.2 !important;
  margin-bottom: 5px !important;
}

.object-template-card p,
.template-card.object-template-card p {
  font-size: 11px !important;
  line-height: 1.25 !important;
}

.object-template-card button,
.template-card.object-template-card button {
  width: 100% !important;
  min-height: 38px !important;
  padding: 8px 10px !important;
  font-size: 13px !important;
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
