import { OC } from './obstacle-course-state.js';

export const DEFAULT_SETTINGS = {
  templateId: 'horse_forest_easy',
  difficulty: 3,
  courseLength: 1500,
  sceneryDistance: 8,
  vanishX: 0,
  vanishY: 0,
  cameraAngle: 0,
  backgroundZoom: 1.1,
  visual: { brightness: 1, contrast: 1, saturation: 1, tint: '#000000', tintStrength: 0 }
};

export function applySettingsObject(data = DEFAULT_SETTINGS) {
  if (data.templateId) OC.templateId = data.templateId;
  if (data.difficulty !== undefined) OC.difficulty = Number(data.difficulty);
  if (data.courseLength !== undefined) OC.courseLength = Number(data.courseLength);
  if (data.sceneryDistance !== undefined) OC.sceneryDistance = Number(data.sceneryDistance);
  if (data.vanishX !== undefined) OC.vanishX = Number(data.vanishX);
  if (data.vanishY !== undefined) OC.vanishY = Number(data.vanishY);
  if (data.cameraAngle !== undefined) OC.cameraAngle = Number(data.cameraAngle);
  if (data.backgroundZoom !== undefined) OC.backgroundZoom = Number(data.backgroundZoom);
  if (data.pathSegments) OC.customPathSequence = data.pathSegments;
  if (data.visual) {
    OC.screenBrightness = data.visual.brightness ?? OC.screenBrightness;
    OC.screenContrast = data.visual.contrast ?? OC.screenContrast;
    OC.screenSaturation = data.visual.saturation ?? OC.screenSaturation;
    OC.screenTint = data.visual.tint ?? OC.screenTint;
    OC.screenTintStrength = data.visual.tintStrength ?? OC.screenTintStrength;
  }
}

export function applyDefaultSettings() { applySettingsObject(DEFAULT_SETTINGS); }
