import { chromium } from 'playwright';

const previewUrl = process.env.ARTIFEX_SOUND_PREVIEW_URL || 'http://127.0.0.1:5173/artifex/apps/sound-generator-preview/index.html';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', (error) => errors.push(error.message));

await page.goto(previewUrl, { waitUntil: 'networkidle' });
await page.evaluate(() => {
  const files = new Map();
  files.set('assets/audio/sfx/synth_existing.json', {
    schemaVersion: 'artifex.audio.procedural-synth.v1',
    assetId: 'asset_sfx_existing_chime',
    name: 'Existing Chime',
    category: 'sfx',
    tags: ['procedural'],
    assetKind: 'procedural-synth',
    playbackEngine: 'web-audio',
    resourcePath: 'assets/audio/sfx/synth_existing.json',
    engine: { id: 'web-audio', version: '1.0.0' },
    source: { createdBy: 'smoke-test' },
    editor: {
      controlsVersion: '1.0.0',
      controls: { name: 'Existing Chime', category: 'sfx', tags: 'procedural', tone: 15, pitch: 70, pitchChange: 'rises', brightness: 85, length: 20, static: 0, echo: 20, wobble: 0, impact: 40, pattern: 'single', pace: 70, volume: 40, loop: false }
    },
    recipe: {
      masterGain: 0.1,
      durationMs: 120,
      tone: { waveform: 'sine', startFrequencyHz: 440, endFrequencyHz: 660, attackMs: 5, releaseMs: 30 },
      filter: { type: 'lowpass', frequencyHz: 5000, resonance: 1 },
      noise: { enabled: false, level: 0 },
      modulation: { rateHz: 1, depthHz: 0 },
      echo: { enabled: false, delayMs: 80, feedback: 0, mix: 0 },
      pattern: { mode: 'single', steps: 1, paceMs: 80, loop: false },
      safety: { previewGainCap: 0.26 }
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  const index = {
    schemaVersion: 'artifex.assets.index.v1',
    projectId: 'blank-starter-smoke',
    assets: [
      { id: 'asset_audio_registered_click', name: 'Registered Click WAV', type: 'audio', category: 'sfx', file: 'assets/audio/click.wav', status: 'ready', tags: ['ui', 'imported'], mimeType: 'audio/wav' },
      { id: 'asset_sfx_existing_chime', name: 'Existing Chime', type: 'sound-effect', assetKind: 'procedural-synth', playbackEngine: 'web-audio', category: 'sfx', file: 'assets/audio/sfx/synth_existing.json', status: 'ready', tags: ['generated', 'magic'] }
    ]
  };
  window.ArtifexProjectFolder = {
    folderStatus: { CONNECTED: 'connected', PERMISSION_REQUIRED: 'permission-required' },
    getState: () => ({ folderStatus: 'connected', folderName: 'Disposable Blank Starter Project' }),
    readJson: async (path) => path === 'assets/asset-index.json' ? structuredClone(index) : structuredClone(files.get(path)),
    writeJson: async (path, value) => {
      if (path === 'assets/asset-index.json') {
        index.assets = value.assets;
        return path;
      }
      files.set(path, structuredClone(value));
      return path;
    },
    readBytes: async () => new Uint8Array([82, 73, 70, 70, 36, 0, 0, 0, 87, 65, 86, 69, 102, 109, 116, 32, 16, 0, 0, 0, 1, 0, 1, 0, 64, 31, 0, 0, 64, 31, 0, 0, 1, 0, 8, 0, 100, 97, 116, 97, 0, 0, 0, 0]),
    connectProjectFolder: async () => ({ folderStatus: 'connected' }),
    reauthoriseProjectFolder: async () => ({ folderStatus: 'connected' })
  };
});

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function selectedLibraryCount() {
  return page.locator('.sound-library-item.is-selected').count();
}

// Normal preview opens directly into the caller-neutral Sound Library.
await page.getByRole('heading', { name: 'Sound Library', exact: true }).waitFor();
await page.getByText('Create New Synth Sound').waitFor();
assert(await page.locator('[data-debug-panel]').isHidden(), 'Debug target controls must not be visible in the normal preview.');
const normalLibraryText = await page.locator('.sound-library-modal').textContent();
assert(!normalLibraryText.includes('Object Action Sound') && !normalLibraryText.includes('Quest Completed Sound') && !normalLibraryText.includes('FX Loop Sound'), 'Normal Sound Library must not expose simulated caller contexts.');
await page.locator('[data-library-act="refresh"]').click();
await page.locator('.sound-type-badge.audio-file').waitFor();
await page.locator('.sound-type-badge.generated-synth').waitFor();
assert(await selectedLibraryCount() === 0, 'Sound Library should open without a default selected asset.');
assert(await page.locator('[data-library-act="assign"]').isDisabled(), 'Choose Sound should be disabled before explicit selection.');
await page.locator('.sound-library-item', { hasText: 'Registered Click WAV' }).locator('[data-library-preview]').click();
assert(await selectedLibraryCount() === 0, 'Preview must not select the previewed asset.');
assert(await page.locator('[data-library-act="assign"]').isDisabled(), 'Choose Sound should remain disabled after preview-only playback.');

// Create Synth Sound is reached from inside the normal Sound Library.
await page.getByText('Create New Synth Sound').click();
await page.getByRole('heading', { name: 'Create Synth Sound', exact: true }).waitFor();
const body = await page.locator('.sound-generator-card').textContent();
if (body.includes('Generated Sound Asset') || body.includes('Generated JSON')) throw new Error('Normal synth view still exposes generated asset/JSON panel.');
if (body.includes('Simple sound-shaping controls') || body.includes('Small positive UI acknowledgement.')) throw new Error('Synth editor still exposes removed explanatory blocks.');
assert(await page.locator('.sound-top-actions').count() === 1, 'Synth editor must expose one compact top action toolbar.');
await page.locator('.sound-advanced summary').click();
await page.locator('[data-frequency-graph]').waitFor();
assert(await page.locator('[data-curve-points] .curve-point').count() === 5, 'Frequency editor must expose five draggable curve points.');
const steadyCurve = await page.locator('[data-curve-line]').getAttribute('points');
await page.locator('[data-pitch="rises"]').click();
const risingCurve = await page.locator('[data-curve-line]').getAttribute('points');
assert(risingCurve !== steadyCurve, 'A frequency movement preset must visibly change the editable curve.');
const durationBefore = await page.locator('[data-play-time]').textContent();
await page.locator('[data-field="length"]').evaluate((input) => {
  input.value = '94';
  input.dispatchEvent(new Event('input', { bubbles: true }));
});
const durationAfter = await page.locator('[data-play-time]').textContent();
assert(durationAfter !== durationBefore && !durationAfter.endsWith('/ 0.00 sec'), 'Duration readout must update from the sound length control.');
await page.getByPlaceholder('coin, locked, quest, portal…').fill('Pickup');
await page.getByText('Pickup / Coin').click();
for (let index = 0; index < 3; index += 1) await page.locator('[data-act="variation"]').click();
await page.getByText('Variation 4 of 4').waitFor();
await page.locator('[data-act="favorite"]').click();
await page.getByText('⭐ Variation 4').waitFor();
await page.locator('[data-act="prev"]').click();
await page.getByText('Variation 3 of 4').waitFor();
await page.locator('[data-act="save"]').click();
await page.locator('[data-save-name]').fill('Smoke Test Pickup');
await page.locator('[data-save-form] button[type="submit"]').click();
await page.getByText('Smoke Test Pickup').waitFor();
await page.getByText('Choose Sound').click();
assert(await page.locator('#returned-asset').textContent() === 'asset_sfx_smoke_test_pickup', 'Normal library selection must return the saved synth asset ID.');

// Caller-context ownership remains available only through the optional debug panel.
await page.locator('[data-show-debug]').click();
await page.locator('[data-debug-panel]').waitFor();
await page.getByRole('button', { name: 'Object Action Sound' }).click();
await page.locator('[data-library-act="refresh"]').click();
await page.locator('.sound-type-badge.audio-file').waitFor();
await page.evaluate(() => {
  [...document.querySelectorAll('[data-change-target]')]
    .find((button) => button.dataset.changeTarget === 'Preview Harness > Quest Completed Sound')
    ?.click();
});
await page.locator('#external-target').filter({ hasText: 'Preview Harness > Quest Completed Sound' }).waitFor();
await page.locator('.sound-library-item', { hasText: 'Registered Click WAV' }).locator('[data-library-select]').click();
await page.getByText('Choose Sound').click();
const captureLog = await page.locator('#event-log li').first().textContent();
assert(captureLog.includes('asset_audio_registered_click'), 'Callback log should include the selected registered asset ID.');
assert(captureLog.includes('captured target Preview Harness > Object Action Sound'), 'Callback must report the original captured Object Action Sound target.');
assert(captureLog.includes('External simulated target is currently Preview Harness > Quest Completed Sound'), 'Callback log should show the external target changed while the modal was open.');
if (errors.length) throw new Error(errors.join('\n'));
await page.screenshot({ path: '/tmp/sound-library-preview-smoke.png', fullPage: true });
await browser.close();
console.log(`Sound Library preview smoke passed at ${previewUrl}`);
console.log('Screenshot: /tmp/sound-library-preview-smoke.png');
