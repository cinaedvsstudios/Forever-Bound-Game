import './engines/obstacle-course-asset-debug.js?v=2.6.0';

function mountBootMessage(message, detail = '') {
  const rightPanel = document.querySelector('.right-panel') || document.body;
  let host = document.getElementById('obstacle-course-boot-message');
  if (!host) {
    host = document.createElement('section');
    host.id = 'obstacle-course-boot-message';
    host.style.cssText = 'margin:14px;border:1px solid rgba(238,196,90,.45);border-radius:16px;background:rgba(7,14,22,.88);padding:16px;color:var(--cream,#f4ead4);font-family:Inter,Segoe UI,Arial,sans-serif;';
    rightPanel.appendChild(host);
  }
  host.innerHTML = `<p style="margin:0 0 6px;color:var(--green,#9ee6a4);font-size:.68rem;font-weight:900;letter-spacing:.14em;text-transform:uppercase">Obstacle Course · V2.6</p><h2 style="margin:0 0 8px;font-family:Cinzel,Georgia,serif">${message}</h2>${detail ? `<pre style="white-space:pre-wrap;color:#eec45a;font-size:.72rem;line-height:1.35">${detail}</pre>` : ''}`;
}

async function bootObstacleCourse() {
  mountBootMessage('Loading obstacle course…');
  try {
    const module = await import('./engines/obstacle-course-runtime.js?v=2.6.0');
    document.getElementById('obstacle-course-boot-message')?.remove();
    requestAnimationFrame(() => module.openObstacleCourseWorkflow());
  } catch (error) {
    mountBootMessage('Obstacle Course did not load', error?.stack || error?.message || String(error));
    console.error('[ObstacleCourse] runtime failed to load', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootObstacleCourse, { once: true });
} else {
  bootObstacleCourse();
}
