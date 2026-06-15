import { OC } from './obstacle-course-state.js';
import { ASSETS } from './obstacle-course-assets.js';
import { $, clamp } from './obstacle-course-utils.js';

const HORSE_FRAMES = 7;

export function updateHorseSprite() {
  const horse = $('obstacle-horse');
  if (!horse) return;
  const steer = (OC.keys.has('right') ? 1 : 0) - (OC.keys.has('left') ? 1 : 0);
  let frame = 3;
  let shadowFrame = 0;
  if (steer < 0) {
    frame = 1;
    shadowFrame = 1;
  }
  if (steer > 0) {
    frame = 5;
    shadowFrame = 2;
  }
  if (!OC.player.grounded) {
    frame = 3;
    shadowFrame = 3;
  }
  if (OC.player.duck) {
    frame = 3;
    shadowFrame = 0;
  }
  const position = (frame / (HORSE_FRAMES - 1)) * 100;
  horse.style.backgroundImage = `url("${ASSETS.horse}?v=${OC.cacheVersion}")`;
  horse.style.backgroundSize = `${HORSE_FRAMES * 100}% 100%`;
  horse.style.backgroundPosition = `${position}% 0`;
  horse.style.transform = `translateY(${-OC.player.y * 18}px)`;

  const shadow = $('obstacle-horse-shadow');
  if (!shadow) return;
  const shadowUrl = ASSETS.horseShadows[shadowFrame] || ASSETS.horseShadows[0];
  const lift = clamp(Number(OC.player.y || 0), 0, 4);
  shadow.style.backgroundImage = `url("${shadowUrl}?v=${OC.cacheVersion}")`;
  shadow.style.opacity = String(clamp(0.78 - lift * 0.085, 0.42, 0.78));
  shadow.style.transform = `scale(${clamp(1 + lift * 0.035, 1, 1.14)})`;
}
