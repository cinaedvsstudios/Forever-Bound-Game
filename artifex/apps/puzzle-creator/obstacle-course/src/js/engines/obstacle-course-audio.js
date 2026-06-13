import { OC } from './obstacle-course-state.js';

let ctx = null;
let lastHoof = 0;
let lastMoving = false;

export function ensureAudio() {
  if (ctx) return ctx;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  ctx = new AudioContextClass();
  return ctx;
}

function blip({ freq = 180, duration = 0.05, gain = 0.06, type = 'triangle' } = {}) {
  const audio = ensureAudio();
  if (!audio) return;
  if (audio.state === 'suspended') audio.resume();
  const now = audio.currentTime;
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

export function updateAudio(dt) {
  const speed = Math.max(0, OC.currentSpeed || 0);
  const moving = OC.active && OC.running && !OC.paused && speed > 2;
  if (!moving) { lastMoving = false; return; }
  if (!lastMoving) { lastHoof = 0; lastMoving = true; }
  lastHoof -= dt;
  const interval = Math.max(0.12, 0.42 - speed / 130);
  if (lastHoof <= 0) {
    blip({ freq: 95 + Math.random() * 35, duration: 0.035, gain: 0.035, type: 'square' });
    lastHoof = interval;
  }
}

export function playJumpSound() { blip({ freq: 260, duration: 0.07, gain: 0.05, type: 'triangle' }); }
export function playLandSound() { blip({ freq: 90, duration: 0.08, gain: 0.07, type: 'sawtooth' }); }
export function playCollectSound() { blip({ freq: 640, duration: 0.08, gain: 0.05, type: 'sine' }); }
export function playHitSound() { blip({ freq: 70, duration: 0.13, gain: 0.08, type: 'square' }); }
