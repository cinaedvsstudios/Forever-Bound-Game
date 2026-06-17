import { OC } from './obstacle-course-state.js';
import { ASSETS } from './obstacle-course-assets.js?v=3.0.43';

const clips = new Map();
let ctx = null;
let unlocked = false;
let lastMoving = false;
let snortTimer = 8;
let bushTimer = 0;

export function ensureAudio() {
  if (!ctx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) ctx = new AudioContextClass();
  }
  Object.entries(ASSETS.audio).forEach(([key, url]) => getClip(key, url));
  unlockAudio();
  return ctx;
}

function getClip(key, url = ASSETS.audio[key]) {
  if (!url) return null;
  if (clips.has(key)) return clips.get(key);
  const audio = new Audio(`${url}?v=${OC.cacheVersion}`);
  audio.preload = 'auto';
  audio.crossOrigin = 'anonymous';
  audio.volume = 0;
  audio.addEventListener('error', () => console.warn('[ObstacleCourse] audio failed', key, url));
  clips.set(key, audio);
  return audio;
}

function unlockAudio() {
  if (unlocked) return;
  unlocked = true;
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
  clips.forEach((audio) => {
    audio.load();
  });
}

function setLoop(key, shouldPlay, volume) {
  const audio = getClip(key);
  if (!audio) return;
  audio.loop = true;
  audio.volume = Math.max(0, Math.min(1, volume));
  if (shouldPlay) {
    const play = audio.play();
    if (play && typeof play.catch === 'function') play.catch(() => {});
  } else {
    audio.pause();
  }
}

function playClip(key, volume = 0.75) {
  const source = getClip(key);
  if (!source) return false;
  try {
    const audio = source.cloneNode(true);
    audio.volume = Math.max(0, Math.min(1, volume));
    const play = audio.play();
    if (play && typeof play.catch === 'function') play.catch(() => {});
    return true;
  } catch (error) {
    return false;
  }
}

function blip({ freq = 180, duration = 0.05, gain = 0.06, type = 'triangle', delay = 0 } = {}) {
  const audio = ensureAudio();
  if (!audio) return;
  if (audio.state === 'suspended') audio.resume().catch(() => {});
  const now = audio.currentTime + Math.max(0, delay);
  const osc = audio.createOscillator();
  const amp = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  amp.gain.setValueAtTime(0.0001, now);
  amp.gain.exponentialRampToValueAtTime(gain, now + 0.01);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(amp).connect(audio.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

function pickupChime() {
  blip({ freq: 740, duration: 0.09, gain: 0.075, type: 'sine' });
  blip({ freq: 1040, duration: 0.11, gain: 0.055, type: 'triangle', delay: 0.045 });
}

export function updateAudio(dt) {
  const speed = Math.max(0, OC.currentSpeed || 0);
  const moving = OC.active && OC.running && !OC.paused && speed > 2;
  setLoop('forestAmbience', OC.active, 0.2);
  if (!moving) {
    setLoop('gallopSlow', false, 0);
    setLoop('gallopFull', false, 0);
    lastMoving = false;
    return;
  }
  if (!lastMoving) {
    lastMoving = true;
    snortTimer = 6 + Math.random() * 8;
  }
  const fast = speed / Math.max(1, OC.speed) > 0.58;
  setLoop('gallopSlow', !fast, fast ? 0 : 0.42);
  setLoop('gallopFull', fast, fast ? 0.48 : 0);
  snortTimer -= dt;
  if (snortTimer <= 0) {
    playClip('snort', 0.35);
    snortTimer = 10 + Math.random() * 14;
  }
  if (OC.offPathTime > 1.2) {
    bushTimer -= dt;
    if (bushTimer <= 0) {
      playClip('bush', 0.35);
      bushTimer = 2.2 + Math.random() * 2.6;
    }
  }
}

export function playJumpSound() { ensureAudio(); playClip('snort', 0.3); blip({ freq: 260, duration: 0.07, gain: 0.05, type: 'triangle' }); }
export function playLandSound() { ensureAudio(); playClip('land', 0.65); blip({ freq: 90, duration: 0.08, gain: 0.07, type: 'sawtooth' }); }
export function playCollectSound(kind = 'collect') {
  ensureAudio();
  const isMoney = kind === 'money';
  const played = isMoney ? playClip('money', 0.78) : playClip('collect', 0.72);
  if (!played) {
    const fallback = isMoney ? playClip('collect', 0.72) : false;
    if (!fallback) pickupChime();
  }
}
export function playHitSound() { ensureAudio(); playClip('bush', 0.55); blip({ freq: 70, duration: 0.13, gain: 0.08, type: 'square' }); }
