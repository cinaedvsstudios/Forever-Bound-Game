/* Keeps the ARTIFEX logo visible after live appearance overrides are applied. */
(() => {
  'use strict';

  const STYLE_ID = 'artifex-logo-fix-style';

  function installLogoFix() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }

    style.textContent = `
      .artifex-brand::before,
      .artifex-topbar h1:first-child::before,
      .editor-topbar h1:first-child::before {
        content: "" !important;
        display: inline-block !important;
        width: 36px !important;
        height: 36px !important;
        flex: 0 0 36px !important;
        border-radius: 10px !important;
        border: 1px solid rgba(240, 154, 98, 0.68) !important;
        background-image:
          url("../assets/branding/ARTIFEXlogo.png"),
          radial-gradient(circle at 35% 24%, rgba(168, 92, 255, 0.95), rgba(53, 18, 80, 0.92) 48%, rgba(21, 10, 8, 0.96)) !important;
        background-repeat: no-repeat !important;
        background-position: center !important;
        background-size: contain, cover !important;
        box-shadow:
          inset 0 0 8px rgba(0, 0, 0, 0.48),
          0 0 12px rgba(168, 92, 255, 0.42) !important;
      }
    `;
  }

  document.addEventListener('DOMContentLoaded', installLogoFix);
  window.addEventListener('load', installLogoFix);
  new MutationObserver(installLogoFix).observe(document.documentElement, { childList: true, subtree: true });
  installLogoFix();
})();
