import { OC, VERSION } from './obstacle-course-state.js';
import { applySettingsObject } from './obstacle-course-settings.js';
import { setResult } from './obstacle-course-ui.js';

export function exportJsonSettings() {
  const config = {
    engine: 'obstacle-course',
    version: VERSION,
    templateId: OC.templateId,
    difficulty: OC.difficulty,
    courseLength: OC.courseLength,
    sceneryDistance: OC.sceneryDistance,
    vanishX: OC.vanishX,
    vanishY: OC.vanishY,
    cameraAngle: OC.cameraAngle,
    backgroundZoom: OC.backgroundZoom,
    visual: { brightness: OC.screenBrightness, contrast: OC.screenContrast, saturation: OC.screenSaturation, tint: OC.screenTint, tintStrength: OC.screenTintStrength },
    pathSegments: OC.pathSequence.map((seg) => ({ id: seg.key, start: seg.start, end: seg.end, distance: seg.distance })),
    layers: Object.fromEntries(Array.from(OC.layers).map(([id, layer]) => [id, { visible: layer.visible, opacity: layer.opacity, x: layer.x, y: layer.y, z: layer.z, scale: layer.scale, order: layer.order, brightness: layer.brightness, contrast: layer.contrast, saturation: layer.saturation, tint: layer.tint, tintStrength: layer.tintStrength }])),
    glbControls: Object.fromEntries(OC.glbControls),
  };
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `obstacle-course-settings-${VERSION.toLowerCase().replace(/\./g, '-')}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export async function importJsonSettings(event, { rebuild }) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    applySettingsObject(JSON.parse(await file.text()));
    rebuild?.();
    setResult('Imported obstacle course JSON settings.', 'success');
  } catch (error) {
    setResult(`JSON import failed: ${error.message}`, 'failure');
  } finally {
    event.target.value = '';
  }
}
