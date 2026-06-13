import { VERSION } from './engines/obstacle-course-state.js';

const panel = document.querySelector('.right-panel') || document.body;
const card = document.createElement('article');
card.id = 'obstacle-course-boot-message';
card.className = 'boot-card';
const heading = document.createElement('h2');
const detail = document.createElement('p');
heading.textContent = 'Loading obstacle course';
detail.textContent = VERSION;
card.append(heading, detail);
panel.replaceChildren(card);

import('./engines/obstacle-course-runtime.js?v=3.0.0').then((module) => {
  card.remove();
  requestAnimationFrame(() => module.openObstacleCourseWorkflow());
}).catch((problem) => {
  heading.textContent = 'Obstacle course module error';
  detail.textContent = problem && problem.message ? problem.message : 'Unknown import error';
});
