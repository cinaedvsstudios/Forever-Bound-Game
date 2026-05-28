const VERSION_LABEL = 'V3.39-emergency';
const OLD_LABEL_PATTERN = /V3\.(32|33|34|35|36|37|38)(?:-emergency)?/gi;

initV339LabelSync();

function initV339LabelSync() {
  injectStyles();
  syncLabels();
  rewriteExistingToasts();
  observeToasts();
  window.setTimeout(syncLabels, 50);
  window.setTimeout(syncLabels, 250);
  window.setTimeout(syncLabels, 900);
  window.setInterval(() => {
    syncLabels();
    rewriteExistingToasts();
  }, 300);
}

function syncLabels() {
  document.title = `Artifex Effect Editor ${VERSION_LABEL}`;
  const badge = document.getElementById('version-badge');
  if (badge) badge.textContent = VERSION_LABEL;

  const about = document.getElementById('about-button');
  if (about) about.textContent = `About ${VERSION_LABEL}`;

  const diagnostics = document.getElementById('emergency-diagnostics-v335');
  if (diagnostics && !diagnostics.textContent.includes(VERSION_LABEL)) {
    diagnostics.textContent = diagnostics.textContent.replace(/Emergency shell/g, `${VERSION_LABEL} shell`);
  }
}

function rewriteExistingToasts() {
  document.querySelectorAll('#toast-area .toast').forEach((toast) => {
    toast.textContent = rewriteText(toast.textContent || '');
  });
}

function observeToasts() {
  const area = document.getElementById('toast-area');
  if (!area || area.dataset.v339Observed === 'true') return;
  area.dataset.v339Observed = 'true';
  const observer = new MutationObserver(() => rewriteExistingToasts());
  observer.observe(area, { childList: true, subtree: true, characterData: true });
}

function rewriteText(value) {
  return String(value || '').replace(OLD_LABEL_PATTERN, VERSION_LABEL);
}

function injectStyles() {
  if (document.getElementById('v339-label-sync-style')) return;
  const style = document.createElement('style');
  style.id = 'v339-label-sync-style';
  style.textContent = `
    #version-badge { white-space: nowrap; }
    .workspace-toolbar #status-text { max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  `;
  document.head.append(style);
}
