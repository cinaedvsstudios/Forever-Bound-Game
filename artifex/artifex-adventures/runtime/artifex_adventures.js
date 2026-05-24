(() => {
  'use strict';

  const root = document.querySelector('#aa-game-root');
  const manifestPath = 'data/game_manifest.json';
  let manifest = {
    startupScreen: 'data/screens/startup_screen.json',
    firstScene: 'data/scenes/ch01_train_heist.json'
  };
  let activeScreen = null;
  let playerX = 48;
  let playerY = 82;
  const keys = new Set();

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
  const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value || 0)));

  async function loadJson(path, fallback) {
    try {
      const response = await fetch(path, { cache: 'no-store' });
      if (!response.ok) throw new Error(path);
      return await response.json();
    } catch (error) {
      console.warn('Artifex Adventures JSON fallback', path, error);
      return JSON.parse(JSON.stringify(fallback));
    }
  }

  function playSound(src, volume = 0.75) {
    if (!src) return;
    const audio = new Audio(src);
    audio.volume = volume;
    void audio.play().catch(() => {});
  }

  function showNotice(message) {
    document.querySelector('.fb-notice-toast')?.remove();
    const node = document.createElement('div');
    node.className = 'fb-notice-toast';
    node.textContent = message;
    document.querySelector('.fb-game-frame')?.appendChild(node);
    setTimeout(() => node.remove(), 2600);
  }

  function renderStartup(data) {
    activeScreen = data;
    const branding = data.branding || {};
    root.innerHTML = '<div class="fb-game-shell"><main class="fb-game-frame"><section class="fb-screen fb-title-screen"><div class="fb-title-content"><div class="fb-studio-mark"><img class="fb-studio-icon" alt=""><span></span></div><div class="fb-logo-stack"><img class="fb-main-logo" alt=""><h1 class="fb-fallback-logo"></h1><p></p></div><div class="fb-title-buttons"></div><footer class="fb-title-footer"><span></span></footer></div></section></main></div>';

    const titleScreen = document.querySelector('.fb-title-screen');
    if (data.theme?.backgroundImage) titleScreen.style.backgroundImage = `url("${data.theme.backgroundImage}")`;
    else if (data.theme?.backgroundGradient) titleScreen.style.background = data.theme.backgroundGradient;

    const studioIcon = document.querySelector('.fb-studio-icon');
    studioIcon.src = branding.studioIcon || '';
    studioIcon.onerror = () => { studioIcon.style.display = 'none'; };
    document.querySelector('.fb-studio-mark span').textContent = branding.studioName || 'ARTIFEX Template Game';

    const logo = document.querySelector('.fb-main-logo');
    const fallback = document.querySelector('.fb-fallback-logo');
    logo.src = branding.mainLogo || '';
    logo.alt = branding.fallbackTitle || 'Artifex Adventures';
    fallback.textContent = branding.fallbackTitle || 'Artifex Adventures';
    fallback.style.display = 'none';
    logo.onerror = () => { logo.style.display = 'none'; fallback.style.display = 'block'; };
    document.querySelector('.fb-logo-stack p').textContent = branding.tagline || '';
    document.querySelector('.fb-title-footer span').textContent = data.footer?.text || '';

    const buttons = document.querySelector('.fb-title-buttons');
    (data.buttons || []).forEach((buttonData) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'fb-button';
      button.textContent = buttonData.label || buttonData.id || 'Button';
      button.addEventListener('click', () => handleStartupButton(buttonData));
      buttons.appendChild(button);
    });
  }

  async function handleStartupButton(buttonData) {
    const audio = activeScreen?.audio || {};
    playSound(buttonData.sound || audio.buttonPressSound, Number(audio.sfxVolume ?? 0.75));
    if (buttonData.action === 'startGame') {
      playSound(audio.startSound, Number(audio.sfxVolume ?? 0.75));
      const sceneData = await loadJson(buttonData.targetScene || manifest.firstScene, fallbackScene());
      renderScene(sceneData);
      return;
    }
    showNotice(buttonData.notice || `${buttonData.label || 'This'} is not connected yet.`);
  }

  function visualFilter(visual = {}) {
    const brightness = clamp(Number(visual.brightness ?? 100) + Number(visual.exposure ?? 0), 0, 300);
    const contrast = clamp(visual.contrast ?? 100, 0, 300);
    const saturation = clamp(Number(visual.saturation ?? 100) + Number(visual.vibrance ?? 0) * 0.35, 0, 300);
    const hue = clamp(visual.hue ?? 0, -360, 360);
    const glow = clamp(visual.glowStrength ?? 0, 0, 100);
    const filters = [`brightness(${brightness}%)`, `contrast(${contrast}%)`, `saturate(${saturation}%)`, `hue-rotate(${hue}deg)`];
    if (glow > 0) filters.push(`drop-shadow(0 0 ${Math.round(3 + glow * 0.24)}px rgba(95,199,157,.75))`);
    return filters.join(' ');
  }

  function renderObject(item) {
    if (item.visible === false) return '';
    const visual = item.visual || {};
    const image = item.image || item.sprite || '';
    const transform = `scale(${item.flipX ? -1 : 1},${item.flipY ? -1 : 1}) rotate(${Number(item.rotation || 0)}deg) skew(${Number(item.skewX || 0)}deg,${Number(item.skewY || 0)}deg)`;
    const style = [
      `left:${Number(item.x ?? 0)}%`,
      `top:${Number(item.y ?? 0)}%`,
      `width:${Number(item.width ?? 10)}%`,
      `height:${Number(item.height ?? 10)}%`,
      `z-index:${Number(item.z ?? item.layer ?? 5)}`,
      `opacity:${clamp(visual.opacity ?? item.opacity ?? 100, 0, 100) / 100}`,
      `filter:${visualFilter(visual)}`,
      `transform:${transform}`,
      `mix-blend-mode:${visual.blendMode || 'normal'}`
    ].join(';');
    if (image) return `<div class="fb-scene-object" style="${style}"><img src="${escapeHtml(image)}" alt=""></div>`;
    if (item.text) return `<div class="fb-scene-object" style="${style}"><div class="fb-object-text">${escapeHtml(item.text)}</div></div>`;
    return '';
  }

  function controlsMarkup() {
    return '<div class="fb-controls"><div class="fb-dpad"><button class="fb-control-button fb-dpad-up" data-key="ArrowUp">U</button><button class="fb-control-button fb-dpad-down" data-key="ArrowDown">D</button><button class="fb-control-button fb-dpad-left" data-key="ArrowLeft">L</button><button class="fb-control-button fb-dpad-right" data-key="ArrowRight">R</button><div class="fb-dpad-center"></div></div><div class="fb-center-pad"><button class="fb-control-button">Map</button><button class="fb-control-button">Notes</button></div><div class="fb-action-pad"><button class="fb-control-button fb-button-x">X</button><button class="fb-control-button fb-button-y">Y</button><button class="fb-control-button fb-button-b">B</button><button class="fb-control-button fb-button-a">A</button></div></div>';
  }

  function renderScene(data) {
    const player = data.player || {};
    playerX = (Number(player.startX ?? 240) / 1920) * 100;
    playerY = (Number(data.travel?.groundY ?? player.startY ?? 790) / 1080) * 100;
    const objects = [...(data.elements || []), ...(data.objects || [])].map(renderObject).join('');
    root.innerHTML = `<div class="fb-game-shell"><main class="fb-game-frame"><section class="fb-screen fb-play-screen"><div class="fb-scene-bg"></div>${objects}<div class="fb-vignette"></div><div class="fb-hud"><div class="fb-hud-panel fb-hearts">BADGES</div><div class="fb-hud-panel"><div class="fb-status-title">${escapeHtml(data.name || data.id || 'Artifex Adventures')}</div><div class="fb-status-line">${escapeHtml(data.calling || data.quest || '')}</div></div><div class="fb-hud-panel fb-active-item"><div class="fb-active-item-label">Held Item</div><div class="fb-active-item-name">Pocketknife</div></div></div><div class="fb-player"></div>${controlsMarkup()}</section></main></div>`;
    const bg = document.querySelector('.fb-scene-bg');
    if (bg && data.background?.image) bg.style.backgroundImage = `url("${data.background.image}")`;
    const playerNode = document.querySelector('.fb-player');
    if (playerNode) {
      if (player.image || player.sprite) playerNode.style.backgroundImage = `url("${player.image || player.sprite || ''}")`;
      playerNode.style.width = `${Number(player.widthPercent ?? 11.5)}%`;
    }
    bindControls();
    updatePlayer();
  }

  function bindControls() {
    document.querySelectorAll('[data-key]').forEach((button) => {
      const key = button.dataset.key;
      button.onpointerdown = (event) => { event.preventDefault(); keys.add(key); button.classList.add('is-pressed'); };
      button.onpointerup = button.onpointerleave = () => { keys.delete(key); button.classList.remove('is-pressed'); };
    });
  }

  window.addEventListener('keydown', (event) => keys.add(event.key));
  window.addEventListener('keyup', (event) => keys.delete(event.key));

  function updatePlayer() {
    const node = document.querySelector('.fb-player');
    if (!node) return;
    node.style.left = `${playerX}%`;
    node.style.top = `${playerY}%`;
  }

  function moveLoop() {
    if (document.querySelector('.fb-player')) {
      if (keys.has('ArrowLeft') || keys.has('a')) playerX -= 0.35;
      if (keys.has('ArrowRight') || keys.has('d')) playerX += 0.35;
      if (keys.has('ArrowUp') || keys.has('w')) playerY -= 0.25;
      if (keys.has('ArrowDown') || keys.has('s')) playerY += 0.25;
      playerX = clamp(playerX, 8, 92);
      playerY = clamp(playerY, 42, 92);
      updatePlayer();
    }
    requestAnimationFrame(moveLoop);
  }

  function fallbackScene() {
    return { name: 'Fallback Scene', background: {}, player: {}, travel: { groundY: 790 }, elements: [], objects: [] };
  }

  async function boot() {
    root.innerHTML = '<div class="fb-game-shell"><main class="fb-game-frame"><div class="fb-loading">Loading Artifex Adventures...</div></main></div>';
    manifest = await loadJson(manifestPath, manifest);
    const startup = await loadJson(manifest.startupScreen, { branding: { fallbackTitle: 'Artifex Adventures' }, buttons: [{ label: 'Start Adventure', action: 'startGame' }] });
    renderStartup(startup);
    requestAnimationFrame(moveLoop);
  }

  boot().catch((error) => {
    console.error(error);
    root.innerHTML = `<div class="fb-game-shell"><main class="fb-game-frame"><div class="fb-error"><strong>Artifex Adventures could not load.</strong><br>${escapeHtml(error.message)}</div></main></div>`;
  });
})();
