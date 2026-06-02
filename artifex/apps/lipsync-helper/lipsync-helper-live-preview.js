(() => {
  'use strict';

  const video = document.getElementById('sourceVideo');
  let animationFrame = 0;

  function renderDuringPlayback() {
    if (video.paused || video.ended) {
      animationFrame = 0;
      return;
    }
    video.dispatchEvent(new Event('timeupdate'));
    animationFrame = requestAnimationFrame(renderDuringPlayback);
  }

  video.addEventListener('play', () => {
    if (!animationFrame) animationFrame = requestAnimationFrame(renderDuringPlayback);
  });

  video.addEventListener('pause', () => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    video.dispatchEvent(new Event('timeupdate'));
  });
})();
