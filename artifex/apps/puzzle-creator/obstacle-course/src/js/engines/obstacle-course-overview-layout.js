export function installOverviewLayout() {
  if (document.getElementById('oc-overview-layout-styles')) return;
  const style = document.createElement('style');
  style.id = 'oc-overview-layout-styles';
  style.textContent = `
    .hf-overview-wrap {
      max-height: 380px;
      overflow-y: auto;
      overflow-x: hidden;
      border: 1px solid rgba(238,196,90,.28);
      border-radius: 12px;
      background: #101914;
      margin-top: 10px;
    }
    .hf-overview {
      display: block;
      width: 100%;
      height: auto !important;
      max-height: none !important;
      border: 0 !important;
      border-radius: 0 !important;
      margin: 0 !important;
      background: #101914;
    }
  `;
  document.head.appendChild(style);
}
