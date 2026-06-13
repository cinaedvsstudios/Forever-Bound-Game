import { OC } from './obstacle-course-state.js';
import { clamp, $ } from './obstacle-course-utils.js';
import { pathStatus } from './obstacle-course-ground-path.js';

export function updateHud() {
  const speed = Math.max(0, Math.round(OC.currentSpeed));
  const max = Math.max(1, Math.round(OC.speed));
  const gait = !OC.active ? 'Stopped' : speed < 3 ? 'Stopped' : speed < max * 0.45 ? 'Trot' : speed < max * 0.75 ? 'Canter' : 'Gallop';
  const badge = $('obstacle-speed-badge');
  if (badge && !badge.dataset.ready) {
    badge.dataset.ready = '1';
    badge.innerHTML = `<div class="oc-powerbar-wrap"><div class="oc-powerbar-empty"></div><div class="oc-powerbar-full-clip"><div class="oc-powerbar-full"></div></div></div><div class="oc-speed-label"><span id="oc-speed-state"></span><b id="oc-speed-value"></b></div><div id="oc-offpath-label" class="oc-offpath-label"></div>`;
  }
  const clip = document.querySelector('.oc-powerbar-full-clip');
  if (clip) clip.style.width = `${clamp(speed / max, 0, 1) * 100}%`;
  if ($('oc-speed-state')) $('oc-speed-state').textContent = gait;
  if ($('oc-speed-value')) $('oc-speed-value').textContent = `${speed}/${max}`;
  if ($('obstacle-distance-readout')) $('obstacle-distance-readout').textContent = `Distance ${Math.max(0, Math.round(OC.distance))} / ${Math.round(OC.courseLength)}`;
  if ($('obstacle-score-readout')) $('obstacle-score-readout').textContent = `Score ${OC.score} · Collected ${OC.collected} · Hits ${OC.hits}`;
  if ($('oc-top-info')) $('oc-top-info').textContent = `Distance ${Math.max(0, Math.round(OC.distance))}/${Math.round(OC.courseLength)} · Score ${OC.score}`;
  if ($('obstacle-status')) $('obstacle-status').textContent = OC.complete ? 'Complete' : OC.running ? 'Running' : OC.paused ? 'Paused' : OC.requiredReady ? 'Ready' : 'Loading';
  $('obstacle-start')?.classList.toggle('is-running', OC.running);
  $('obstacle-pause')?.classList.toggle('is-paused', OC.paused);
}

export function updateOffPathWarning() {
  const arrow = $('oc-offpath-arrow');
  if (!arrow) return;
  const status = pathStatus();
  const show = status === 'off' && OC.offPathTime > 2;
  arrow.classList.toggle('is-visible', show);
  arrow.classList.toggle('dir-left', OC.pathHintDirection === 'left');
  arrow.classList.toggle('dir-right', OC.pathHintDirection !== 'left');
  const label = $('oc-offpath-label');
  if (label) label.textContent = show ? `Return ${OC.pathHintDirection}` : '';
}

export function showSpinner(show, title = 'Loading assets') {
  const node = $('oc-loading-horse');
  if (!node) return;
  node.hidden = !show;
  if ($('oc-loading-horse-title')) $('oc-loading-horse-title').textContent = title;
}
