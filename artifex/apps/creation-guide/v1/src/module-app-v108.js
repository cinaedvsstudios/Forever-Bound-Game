document.write('<script src="./v1/src/module-app.js?v=creation-guide-1.0.8-base"><\/script>');

function patchCreationGuideHero() {
  const versionBadge = document.getElementById('version-badge');
  if (versionBadge) versionBadge.textContent = 'V1.0.8';

  const title = document.querySelector('title');
  if (title) title.textContent = 'Artifex Creation Guide V1.0.8';

  const status = document.getElementById('status-text');
  if (status && status.textContent.includes('V1.0.7')) {
    status.textContent = status.textContent.replace('V1.0.7', 'V1.0.8');
  }

  const hero = document.querySelector('.project-hero');
  const instructions = document.querySelector('.overview-instructions');
  const ring = document.querySelector('.setup-ring');

  if (hero && instructions && ring && instructions.parentElement !== hero) {
    instructions.classList.add('in-hero');
    hero.insertBefore(instructions, ring);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.setTimeout(() => {
    patchCreationGuideHero();

    const target = document.getElementById('project-overview-panel');
    if (target) {
      const observer = new MutationObserver(() => patchCreationGuideHero());
      observer.observe(target, { childList: true, subtree: true });
    }
  }, 0);
});
