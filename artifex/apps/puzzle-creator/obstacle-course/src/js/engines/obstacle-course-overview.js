import { OC } from './obstacle-course-state.js';
import { $ } from './obstacle-course-utils.js';
import { pathCenterAt, pathAlphaAtWorld } from './obstacle-course-ground-path.js';

export function scheduleOverviewDraw() {
  if (OC.overviewRaf) return;
  OC.overviewRaf = requestAnimationFrame(() => { OC.overviewRaf = 0; drawOverview(); });
}

export function worldToOverview(x, z) {
  const c = $('hf-overview');
  const width = c?.width || 280;
  const height = c?.height || 500;
  return { x: width / 2 + x * 5.1, y: height - 28 + z * 0.17 };
}

export function drawOverview() {
  const c = $('hf-overview');
  if (!c) return;
  const height = Math.max(340, Math.min(1800, Math.round((OC.courseLength + 300) / 3.4)));
  if (c.height !== height) c.height = height;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#101914';
  ctx.fillRect(0, 0, c.width, c.height);
  if (OC.overviewPathOverlay) {
    ctx.fillStyle = 'rgba(238,196,90,.25)';
    for (let d = 0; d < OC.courseLength; d += 18) {
      const center = pathCenterAt(d);
      for (let x = center - OC.pathVisualWidth * .5; x <= center + OC.pathVisualWidth * .5; x += 2.2) {
        const alpha = pathAlphaAtWorld(x, d);
        if (alpha !== null && alpha >= OC.pathAlphaThreshold) {
          const p = worldToOverview(x, -d);
          ctx.fillRect(p.x - 1.2, p.y - 1.2, 2.4, 2.4);
        }
      }
    }
  }
  ctx.strokeStyle = '#d09a55';
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let d = 0; d < OC.courseLength; d += 20) {
    const p = worldToOverview(pathCenterAt(d), -d);
    if (d === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
  OC.entities.forEach((e) => {
    if (e.visibleOnOverview === false) return;
    const p = worldToOverview(e.x ?? e.object?.position?.x ?? 0, e.z ?? e.object?.position?.z ?? 0);
    ctx.fillStyle = e.type === 'collectible' ? '#5be5ff' : e.type === 'obstacle' ? '#ff7055' : e.type === 'tree' ? '#2da357' : e.type === 'rock' ? '#9a9388' : '#66bb6a';
    ctx.beginPath();
    ctx.arc(p.x, p.y, e.type === 'tree' ? 3.8 : 3.1, 0, Math.PI * 2);
    ctx.fill();
  });
  const player = worldToOverview(pathCenterAt(OC.distance) + OC.player.x, -OC.distance);
  ctx.fillStyle = '#f4ead4';
  ctx.beginPath();
  ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#eec45a';
  ctx.strokeRect(1, 1, c.width - 2, c.height - 2);
}
