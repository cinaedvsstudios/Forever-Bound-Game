const BOOT_VERSION = 'V3.0.36';
const BOOT_CACHE_VERSION = '3.0.36';

const panel = document.querySelector('.right-panel') || document.body;
const card = document.createElement('article');
card.id = 'obstacle-course-boot-message';
card.className = 'boot-card';
const heading = document.createElement('h2');
const detail = document.createElement('p');
heading.textContent = 'Loading obstacle course';
detail.textContent = `${BOOT_VERSION} modular runtime`;
card.appendChild(heading);
card.appendChild(detail);
panel.innerHTML = '';
panel.appendChild(card);

function showProblem(problem) {
  heading.textContent = 'Obstacle course module problem';
  detail.textContent = problem && problem.message ? problem.message : String(problem || 'Unknown import problem');
}

import(`./engines/obstacle-course-runtime.js?v=${BOOT_CACHE_VERSION}`)
  .then(function(module) {
    card.parentNode && card.parentNode.removeChild(card);
    window.requestAnimationFrame(function() { module.openObstacleCourseWorkflow(); });
  })
  .catch(showProblem);
