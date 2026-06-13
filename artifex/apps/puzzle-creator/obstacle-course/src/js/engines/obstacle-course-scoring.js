import { OC, VERSION } from './obstacle-course-state.js';

export function makeResult() {
  return {
    sideQuestId: 'obstacle-course',
    engine: 'obstacle-course',
    version: VERSION,
    completed: OC.complete,
    distanceReached: Math.round(OC.distance),
    courseLength: OC.courseLength,
    score: OC.score,
    collectiblesCollected: OC.collected,
    hits: OC.hits,
    jumps: OC.jumps
  };
}
