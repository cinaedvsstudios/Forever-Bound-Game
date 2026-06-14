import { OC } from './obstacle-course-state.js';
import { isTextEntryTarget } from './obstacle-course-utils.js';

function normalizeKey(event) {
  const key = String(event.key || '').toLowerCase();
  const code = String(event.code || '').toLowerCase();
  if (key === 'w' || key === 'arrowup' || code === 'keyw' || code === 'arrowup') return 'forward';
  if (key === 's' || key === 'arrowdown' || code === 'keys' || code === 'arrowdown') return 'back';
  if (key === 'a' || key === 'arrowleft' || code === 'keya' || code === 'arrowleft') return 'left';
  if (key === 'd' || key === 'arrowright' || code === 'keyd' || code === 'arrowright') return 'right';
  if (key === ' ' || key === 'spacebar' || key === 'space' || code === 'space') return 'jump';
  if (key === 'control' || code === 'controlleft' || code === 'controlright') return 'duck';
  return null;
}

export function bindKeyboard() {
  if (OC.keyboardBound) return;
  OC.keyboardBound = true;
  document.addEventListener('keydown', (event) => {
    if (isTextEntryTarget(event)) return;
    const key = normalizeKey(event);
    if (!key) return;
    OC.keys.add(key);
    if (key === 'duck') OC.player.duck = true;
    event.preventDefault();
  }, true);
  document.addEventListener('keyup', (event) => {
    if (isTextEntryTarget(event)) return;
    const key = normalizeKey(event);
    if (!key) return;
    OC.keys.delete(key);
    if (key === 'duck') OC.player.duck = false;
    event.preventDefault();
  }, true);
}
