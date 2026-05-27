document.write('<script src="./v1/src/module-app.js?v=creation-guide-1.0.8-base"><\/script>');

window.addEventListener('DOMContentLoaded', () => {
  window.setTimeout(() => {
    const versionBadge = document.getElementById('version-badge');
    if (versionBadge) versionBadge.textContent = 'V1.0.8';

    const title = document.querySelector('title');
    if (title) title.textContent = 'Artifex Creation Guide V1.0.8';

    const status = document.getElementById('status-text');
    if (status && status.textContent.includes('V1.0.7')) {
      status.textContent = status.textContent.replace('V1.0.7', 'V1.0.8');
    }
  }, 0);
});
