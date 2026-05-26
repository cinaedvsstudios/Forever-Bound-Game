export const MODULE_SLUG = 'creation-guide';
export const MODULE_LABEL = 'Creation Guide';
export const MODULE_KIND = 'creation-guide';
export const MODULE_VERSION = 'V1.0.2';
export const MODULE_STORAGE_KEY = 'artifex.creationGuide.localSaves';

export const MODULE_THEME = {
  accent: '#8f6dff',
  accentSoft: 'rgba(143, 109, 255, 0.18)',
  accentStrong: '#c7b8ff',
  glow: 'rgba(143, 109, 255, 0.42)'
};

export const MODULE_ACCENTS = {
  'effect-editor': {
    label: 'Effect Editor',
    accent: '#31d7ff',
    accentSoft: 'rgba(49, 215, 255, 0.18)',
    accentStrong: '#9af0ff',
    icon: '✹'
  },
  'scene-editor': {
    label: 'Scene Editor',
    accent: '#8f6dff',
    accentSoft: 'rgba(143, 109, 255, 0.18)',
    accentStrong: '#c7b8ff',
    icon: '▣'
  },
  'project-editor': {
    label: 'Project Editor',
    accent: '#e5c84a',
    accentSoft: 'rgba(229, 200, 74, 0.18)',
    accentStrong: '#fff0a8',
    icon: '⌘'
  },
  'quest-builder': {
    label: 'Quest Builder',
    accent: '#43d36f',
    accentSoft: 'rgba(67, 211, 111, 0.18)',
    accentStrong: '#a3f7b9',
    icon: '✦'
  },
  'object-creator': {
    label: 'Object Creator',
    accent: '#d94a4a',
    accentSoft: 'rgba(217, 74, 74, 0.18)',
    accentStrong: '#ffaaaa',
    icon: '◆'
  },
  'unassigned': {
    label: 'Unassigned / General',
    accent: '#8a7465',
    accentSoft: 'rgba(138, 116, 101, 0.18)',
    accentStrong: '#d9c3ac',
    icon: '◇'
  }
};

export const WORKFLOW_STATES = [
  'unassigned',
  'assigned',
  'started',
  'snoozing',
  'blocked',
  'review',
  'done',
  'archived'
];

export const SUBTASK_STATES = [
  'open',
  'complete',
  'confirmed',
  'blocked',
  'not-needed'
];

export const DESIGN_WIDTH = 1280;
export const DESIGN_HEIGHT = 720;
