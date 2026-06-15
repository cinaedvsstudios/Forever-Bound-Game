import { OC } from './obstacle-course-state.js';
import { GLB_ASSETS } from './obstacle-course-assets.js';
import { buildSliderRow } from './obstacle-course-ui.js';
import { selectObjects } from './obstacle-course-scene.js';
import { signedToFactor, factorToSigned, sliderToVisualFactor, visualFactorToSlider, clamp } from './obstacle-course-utils.js';
import { getGlbDefault } from './obstacle-course-settings.js';
import { applyAllGlbAssetControls } from './obstacle-course-glb.js';

const POSITION_SLIDER_STEP = 0.1;

function offsetFromBase(value, baseValue) { return Math.round(Number(value || 0) - Number(baseValue || 0)); }
function positionSliderFromBase(value, baseValue) { return Math.round((Number(value || 0) - Number(baseValue || 0)) / POSITION_SLIDER_STEP); }
function positionValueFromSlider(value, baseValue) { return Number(baseValue || 0) + (Number(value || 0) * POSITION_SLIDER_STEP); }
function visualOffsetFromBase(value, baseValue) { const base = Number(baseValue || 1); return visualFactorToSlider(Number(value || base) / base); }
function opacityOffsetFromBase(value, baseValue) { return Math.round((Number(value ?? baseValue ?? 1) - Number(baseValue ?? 1)) * 100); }
function tintOffsetFromBase(value, baseValue) { return Math.round((Number(value || 0) - Number(baseValue || 0)) * 100); }

function glbControl(url) {
  if (!OC.glbControls.has(url)) OC.glbControls.set(url, { ...getGlbDefault(url), ...(OC.pendingGlbControls?.[url] || {}) });
  return OC.glbControls.get(url);
}

function addGroupTitle(host, text) {
  const title = document.createElement('p');
  title.className = 'hint-text';
  title.style.margin = '12px 0 6px';
  title.style.fontWeight = '900';
  title.textContent = text;
  host.appendChild(title);
}

function addPositionRows(host, prefix, label, cfg, base, apply) {
  addGroupTitle(host, label);
  buildSliderRow(host, `hf-glb-${prefix}`, 'x', `${label} X`, -100, 100, 1, positionSliderFromBase(cfg[`${prefix}X`], base[`${prefix}X`]), (v) => { cfg[`${prefix}X`] = positionValueFromSlider(v, base[`${prefix}X`]); apply(); });
  buildSliderRow(host, `hf-glb-${prefix}`, 'y', `${label} Y`, -100, 100, 1, positionSliderFromBase(cfg[`${prefix}Y`], base[`${prefix}Y`]), (v) => { cfg[`${prefix}Y`] = positionValueFromSlider(v, base[`${prefix}Y`]); apply(); });
  buildSliderRow(host, `hf-glb-${prefix}`, 'z', `${label} Z`, -100, 100, 1, positionSliderFromBase(cfg[`${prefix}Z`], base[`${prefix}Z`]), (v) => { cfg[`${prefix}Z`] = positionValueFromSlider(v, base[`${prefix}Z`]); apply(); });
}

export function createGlbAssetSliders(host) {
  const urls = Array.from(new Set(OC.glbInstances.map((obj) => obj.userData.glbAssetUrl).filter(Boolean)));
  if (!urls.length) {
    host.innerHTML = '<p class="hint-text">No optional GLB assets loaded yet.</p>';
    return;
  }
  if (!OC.selectedGlbAssetUrl || !urls.includes(OC.selectedGlbAssetUrl)) OC.selectedGlbAssetUrl = urls[0];
  const row = document.createElement('label');
  row.className = 'field-block';
  row.innerHTML = `<span>GLB Asset</span><div class="hf-glb-select-row"><select id="hf-glb-asset-select">${urls.map((url) => `<option value="${url}">${url.split('/').pop()}</option>`).join('')}</select><button id="hf-glb-open-picker" type="button">Browse</button></div>`;
  host.appendChild(row);
  const select = row.querySelector('select');
  select.value = OC.selectedGlbAssetUrl;
  select.addEventListener('change', (event) => {
    OC.selectedGlbAssetUrl = event.target.value;
    host.innerHTML = '';
    createGlbAssetSliders(host);
    refreshGlbSelection();
  });
  row.querySelector('#hf-glb-open-picker')?.addEventListener('click', () => openGlbPicker(host));
  const cfg = glbControl(OC.selectedGlbAssetUrl);
  const base = getGlbDefault(OC.selectedGlbAssetUrl);
  const apply = () => { applyAllGlbAssetControls(); refreshGlbSelection(); };

  addGroupTitle(host, 'All copies');
  buildSliderRow(host, 'hf-glb-all', 'x', 'All X', -100, 100, 1, positionSliderFromBase(cfg.x, base.x), (v) => { cfg.x = positionValueFromSlider(v, base.x); apply(); });
  buildSliderRow(host, 'hf-glb-all', 'y', 'All Y', -100, 100, 1, positionSliderFromBase(cfg.y, base.y), (v) => { cfg.y = positionValueFromSlider(v, base.y); apply(); });
  buildSliderRow(host, 'hf-glb-all', 'z', 'All Z', -100, 100, 1, positionSliderFromBase(cfg.z, base.z), (v) => { cfg.z = positionValueFromSlider(v, base.z); apply(); });
  addPositionRows(host, 'left', 'Left side', cfg, base, apply);
  addPositionRows(host, 'right', 'Right side', cfg, base, apply);

  buildSliderRow(host, 'hf-glb', 'scaleOffset', 'Scale', -100, 100, 1, factorToSigned((cfg.scale || 1) / (base.scale || 1)), (v) => { cfg.scale = Number(base.scale || 1) * signedToFactor(v); apply(); });
  buildSliderRow(host, 'hf-glb', 'opacityOffset', 'Opacity', -100, 100, 1, opacityOffsetFromBase(cfg.opacity, base.opacity), (v) => { cfg.opacity = clamp(Number(base.opacity ?? 1) + (v / 100), 0, 1); apply(); });
  buildSliderRow(host, 'hf-glb', 'brightnessOffset', 'Bright', -100, 100, 1, visualOffsetFromBase(cfg.brightness, base.brightness), (v) => { cfg.brightness = Number(base.brightness || 1) * sliderToVisualFactor(v); apply(); });
  buildSliderRow(host, 'hf-glb', 'contrastOffset', 'Contrast', -100, 100, 1, visualOffsetFromBase(cfg.contrast, base.contrast), (v) => { cfg.contrast = Number(base.contrast || 1) * sliderToVisualFactor(v); apply(); });
  buildSliderRow(host, 'hf-glb', 'saturationOffset', 'Saturation', -100, 100, 1, visualOffsetFromBase(cfg.saturation, base.saturation), (v) => { cfg.saturation = Number(base.saturation || 1) * sliderToVisualFactor(v); apply(); });
  buildSliderRow(host, 'hf-glb', 'tintStrength', 'Tint Amt', -100, 100, 1, tintOffsetFromBase(cfg.tintStrength, base.tintStrength), (v) => { cfg.tintStrength = clamp(Number(base.tintStrength || 0) + (v / 100), 0, 1); apply(); });
  buildSliderRow(host, 'hf-glb', 'order', 'Order', -100, 100, 1, offsetFromBase(cfg.order, base.order), (v) => { cfg.order = Number(base.order || 0) + v; apply(); });
}

function openGlbPicker(host) {
  const existing = document.getElementById('hf-glb-picker-modal');
  if (existing) existing.remove();
  const modal = document.createElement('section');
  modal.id = 'hf-glb-picker-modal';
  modal.className = 'hf-glb-picker-modal';
  const loaded = new Set(OC.glbInstances.map((obj) => obj.userData.glbAssetUrl).filter(Boolean));
  modal.innerHTML = `<div class="hf-glb-picker-card"><button type="button" class="hf-glb-picker-close">Close</button><h3>GLB Asset Selector</h3><div class="hf-glb-picker-grid">${GLB_ASSETS.map((asset) => `<button type="button" class="hf-glb-tile ${loaded.has(asset.url) ? 'is-loaded' : 'is-missing'}" data-url="${asset.url}"><span class="hf-glb-thumb">${asset.type === 'rock' ? '◆' : asset.type.includes('Detail') ? '⌁' : asset.type.includes('Tree') ? '▲' : '●'}</span><strong>${asset.label}</strong><small>${asset.url.split('/').pop()} · ${loaded.has(asset.url) ? 'loaded' : 'missing'}</small></button>`).join('')}</div></div>`;
  document.body.appendChild(modal);
  modal.querySelector('.hf-glb-picker-close')?.addEventListener('click', () => modal.remove());
  modal.querySelectorAll('.hf-glb-tile').forEach((tile) => tile.addEventListener('click', () => {
    const url = tile.dataset.url;
    if (!loaded.has(url)) return;
    OC.selectedGlbAssetUrl = url;
    host.innerHTML = '';
    createGlbAssetSliders(host);
    refreshGlbSelection();
    modal.remove();
  }));
}

export function refreshGlbSelection() {
  selectObjects(OC.glbInstances.filter((obj) => obj.userData.glbAssetUrl === OC.selectedGlbAssetUrl));
}
