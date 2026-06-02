(() => {
  'use strict';
  const video = document.getElementById('sourceVideo');
  let animationFrame = 0;
  function refresh() {
    if (video.paused || video.ended) {
      animationFrame = 0;
      return;
    }
    video.dispatchEvent(new Event('timeupdate'));
    animationFrame = requestAnimationFrame(refresh);
  }
  video.addEventListener('play', () => {
    if (!animationFrame) animationFrame = requestAnimationFrame(refresh);
  });
  video.addEventListener('pause', () => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    video.dispatchEvent(new Event('timeupdate'));
  });
})();
