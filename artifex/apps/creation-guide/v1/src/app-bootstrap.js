document.write('<script src="./v1/src/module-app.js?v=creation-guide-1.0.8-base"><\/script>');

function patchCreationGuideHero() {
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
