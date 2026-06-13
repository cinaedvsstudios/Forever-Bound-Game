import { openObstacleCourseWorkflow } from './engines/obstacle-course-runtime.js?v=3.0.0';
import { VERSION } from './engines/obstacle-course-state.js';

requestAnimationFrame(() => openObstacleCourseWorkflow());
export { VERSION };
