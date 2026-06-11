import { openObstacleCourseWorkflow } from './engines/obstacle-course-runtime.js?v=2.5';
import './engines/obstacle-course-asset-debug.js?v=2.5';

function bootObstacleCourse() {
  requestAnimationFrame(() => openObstacleCourseWorkflow());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootObstacleCourse, { once: true });
} else {
  bootObstacleCourse();
}
