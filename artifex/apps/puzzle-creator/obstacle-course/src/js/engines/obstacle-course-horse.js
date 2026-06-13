import { OC } from './obstacle-course-state.js';
import { $ } from './obstacle-course-utils.js';

export function updateHorseSprite() {
  const horse = $('obstacle-horse');
  if (!horse) return;
  const steer = (OC.keys.has('right') ? 1 : 0) - (OC.keys.has('left') ? 1 : 0);
  let frame = 0;
  if (steer < 0) frame = 1;
  if (steer > 0) frame = 2;
  if (!OC.player.grounded) frame = 3;
  if (OC.player.duck) frame = 4;
  horse.style.backgroundPosition = `${-(frame * 100)}% 0`;
  horse.style.transform = `translateY(${-OC.player.y * 18}px)`;
}
