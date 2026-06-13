import { OC } from './obstacle-course-state.js';
import { $ } from './obstacle-course-utils.js';

const HORSE_FRAMES = 7;

export function updateHorseSprite() {
  const horse = $('obstacle-horse');
  if (!horse) return;
  const steer = (OC.keys.has('right') ? 1 : 0) - (OC.keys.has('left') ? 1 : 0);
  let frame = 3;
  if (steer < 0) frame = 1;
  if (steer > 0) frame = 5;
  if (!OC.player.grounded) frame = 3;
  if (OC.player.duck) frame = 3;
  const position = (frame / (HORSE_FRAMES - 1)) * 100;
  horse.style.backgroundSize = `${HORSE_FRAMES * 100}% 100%`;
  horse.style.backgroundPosition = `${position}% 0`;
  horse.style.transform = `translateY(${-OC.player.y * 18}px)`;
}
