import { DEFAULT_SWATCHES } from './config.js';
import { dom } from './dom.js';
import { state } from './state.js';

export function buildSwatches(onPick) {
  dom.swatchRow.innerHTML = '';
  DEFAULT_SWATCHES.forEach((color) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'swatch-button';
    button.style.background = color;
    button.title = color;
    button.addEventListener('click', () => {
      state.brushColor = color;
      dom.brushColorPicker.value = color;
      onPick?.(color);
    });
    dom.swatchRow.appendChild(button);
  });
}

export function createPatternCanvas(kind, size = 128) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (kind === 'hedge') {
    ctx.fillStyle = '#1f4f35';
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 90; i += 1) {
      ctx.fillStyle = i % 3 === 0 ? '#36764d' : i % 3 === 1 ? '#183f2c' : '#4c8d57';
      ctx.beginPath();
      ctx.arc(Math.random() * size, Math.random() * size, 3 + Math.random() * 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (kind === 'stone') {
    ctx.fillStyle = '#5e5a52';
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = '#2e2b27';
    ctx.lineWidth = 2;
    for (let y = 0; y <= size; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y + (Math.random() - 0.5) * 6);
      ctx.stroke();
    }
    for (let x = 0; x <= size; x += 38) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + (Math.random() - 0.5) * 8, size);
      ctx.stroke();
    }
  }

  if (kind === 'rune') {
    ctx.fillStyle = '#6d441e';
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = '#d6a75a';
    ctx.lineWidth = 2;
    ctx.font = '22px serif';
    const runes = ['ᚨ', 'ᚱ', 'ᚾ', 'ᛏ', 'ᛟ', 'ᛚ', 'ᚦ'];
    for (let y = 16; y < size; y += 32) {
      for (let x = 14; x < size; x += 32) {
        ctx.strokeText(runes[(x + y) % runes.length], x, y);
      }
    }
  }

  if (kind === 'shadow') {
    ctx.fillStyle = '#070908';
    ctx.fillRect(0, 0, size, size);
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 8, size / 2, size / 2, size / 1.2);
    gradient.addColorStop(0, '#173b1d');
    gradient.addColorStop(1, '#020302');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = 'rgba(72, 125, 62, 0.65)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, size * 0.25);
    ctx.bezierCurveTo(size * 0.35, size * 0.1, size * 0.45, size * 0.9, size, size * 0.72);
    ctx.stroke();
  }

  return canvas;
}
