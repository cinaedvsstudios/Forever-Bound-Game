const CREATION_GUIDE_RUNTIME_VERSION = 'V1.1.12';

// Load the original base module, then normalise the legacy startup text it still emits.
document.write('<script src="./v1/src/module-app.js?v=creation-guide-1.1.12-base-runtime"><\/script>');

function normalizeCreationGuideRuntimeText(value) {
  return String(value ?? '')
    .replaceAll('Creation Guide V1.0.7 loaded.', `Creation Guide ${CREATION_GUIDE_RUNTIME_VERSION} loaded.`)
    .replaceAll('Creation Guide V1.1.10 loaded.', `Creation Guide ${CREATION_GUIDE_RUNTIME_VERSION} loaded.`)
    .replaceAll('Creation Guide V1.1.11 loaded.', `Creation Guide ${CREATION_GUIDE_RUNTIME_VERSION} loaded.`);
}

function patchCreationGuideRuntimeVersion() {
  const badge = document.getElementById('version-badge');
  if (badge && badge.textContent !== CREATION_GUIDE_RUNTIME_VERSION) badge.textContent = CREATION_GUIDE_RUNTIME_VERSION;

  const label = document.getElementById('module-label');
  if (label && label.textContent !== 'Creation Guide') label.textContent = 'Creation Guide';

  const wantedTitle = `Artifex Creation Guide ${CREATION_GUIDE_RUNTIME_VERSION}`;
  if (document.title !== wantedTitle) document.title = wantedTitle;

  document.querySelectorAll('#toast-area > *, .toast').forEach((node) => {
    if (node.textContent && (node.textContent.includes('Creation Guide V1.0.7 loaded.') || node.textContent.includes('Creation Guide V1.1.10 loaded.') || node.textContent.includes('Creation Guide V1.1.11 loaded.'))) {
      node.textContent = normalizeCreationGuideRuntimeText(node.textContent);
    }
  });
}

function patchCreationGuideToastFunction() {
  if (typeof window.toast !== 'function' || window.toast.__creationGuideVersionPatched) return;
  const originalToast = window.toast;
  const patchedToast = function patchedCreationGuideToast(message, ...rest) {
    return originalToast.call(this, normalizeCreationGuideRuntimeText(message), ...rest);
  };
  patchedToast.__creationGuideVersionPatched = true;
  window.toast = patchedToast;
}

function patchCreationGuideHero() {
  const hero = document.querySelector('.project-hero');
  const instructions = document.querySelector('.overview-instructions');
  const ring = document.querySelector('.setup-ring');

  if (hero && instructions && ring && instructions.parentElement !== hero) {
    instructions.classList.add('in-hero');
    hero.insertBefore(instructions, ring);
  }
}

patchCreationGuideToastFunction();

window.addEventListener('DOMContentLoaded', () => {
  patchCreationGuideToastFunction();
  patchCreationGuideRuntimeVersion();

  window.setTimeout(() => {
    patchCreationGuideHero();
    patchCreationGuideRuntimeVersion();

    const overviewTarget = document.getElementById('project-overview-panel');
    if (overviewTarget) {
      const overviewObserver = new MutationObserver(() => {
        patchCreationGuideHero();
        patchCreationGuideRuntimeVersion();
      });
      overviewObserver.observe(overviewTarget, { childList: true, subtree: true });
    }

    const toastTarget = document.getElementById('toast-area');
    if (toastTarget) {
      const toastObserver = new MutationObserver(() => patchCreationGuideRuntimeVersion());
      toastObserver.observe(toastTarget, { childList: true, subtree: true, characterData: true });
    }
  }, 0);
});
