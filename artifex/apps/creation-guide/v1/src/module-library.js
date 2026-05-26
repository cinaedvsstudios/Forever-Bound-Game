export const STARTER_TEMPLATES = [
  {
    id: 'template_scene_assignment',
    name: 'Scene Editor Assignment',
    description: 'Build or review a scene layout, placement, exits, and visual composition.',
    assignment: {
      title: 'Create First Forest Scene',
      icon: '▣',
      description: 'Build the first playable scene shell and confirm it can be tested.',
      state: 'unassigned',
      primaryModule: 'scene-editor',
      relatedModules: ['project-editor', 'quest-builder'],
      priorityDefault: 4,
      effortDefault: 3,
      milestoneId: 'milestone_first_playable',
      chronicleId: 'ch00',
      questId: 'q00',
      zoneId: 'forest',
      sceneId: 'ch00_q00_forest_route',
      linkedFile: 'data/scenes/ch00/ch00_q00_forest_route_scene.json',
      tags: ['scene', 'layout', 'prototype'],
      subtasks: [
        'Add background or placeholder.',
        'Place Mel start position.',
        'Add at least one exit.',
        'Place one searchable cache.',
        'Test scene JSON import.'
      ]
    }
  },
  {
    id: 'template_quest_assignment',
    name: 'Quest Builder Assignment',
    description: 'Define a Chronicle, Quest, Calling, clue, or completion condition.',
    assignment: {
      title: 'Define First Calling Completion Condition',
      icon: '✦',
      description: 'Create the first clear completion condition for a Quest or Calling.',
      state: 'unassigned',
      primaryModule: 'quest-builder',
      relatedModules: ['project-editor'],
      priorityDefault: 5,
      effortDefault: 2,
      milestoneId: 'milestone_first_quest',
      chronicleId: 'ch00',
      questId: 'q00',
      callingId: 'calling_first_route',
      tags: ['quest', 'calling', 'completion'],
      subtasks: [
        'Write Calling text.',
        'Define final completion flag.',
        'Add Codice update note.',
        'Confirm Calling Fulfilled text.'
      ]
    }
  },
  {
    id: 'template_effect_assignment',
    name: 'Effect Editor Assignment',
    description: 'Create or tune an FX, overlay, transition, damage flash, weather, or magic effect.',
    assignment: {
      title: 'Add Fog Overlay Effect',
      icon: '✹',
      description: 'Create a reusable atmospheric effect for a scene or gameplay state.',
      state: 'unassigned',
      primaryModule: 'effect-editor',
      relatedModules: ['scene-editor'],
      priorityDefault: 3,
      effortDefault: 2,
      milestoneId: 'milestone_first_scene',
      zoneId: 'forest',
      tags: ['fx', 'overlay', 'atmosphere'],
      subtasks: [
        'Create placeholder FX settings.',
        'Preview on dark and light backgrounds.',
        'Export effect JSON.',
        'Link effect to scene assignment.'
      ]
    }
  },
  {
    id: 'template_object_assignment',
    name: 'Object Creator Assignment',
    description: 'Create an archetype object, prop, pickup, door, cache, Foe, NPC, vendor, or job object.',
    assignment: {
      title: 'Create Searchable Cache Object',
      icon: '◆',
      description: 'Define a reusable object archetype for scavenging and rewards.',
      state: 'unassigned',
      primaryModule: 'object-creator',
      relatedModules: ['scene-editor', 'quest-builder'],
      priorityDefault: 4,
      effortDefault: 2,
      milestoneId: 'milestone_first_interaction',
      tags: ['object', 'cache', 'interaction'],
      subtasks: [
        'Choose object type.',
        'Set interaction name.',
        'Set reward logic placeholder.',
        'Confirm icon and category.'
      ]
    }
  },
  {
    id: 'template_project_assignment',
    name: 'Project Editor Assignment',
    description: 'Edit project structure, Flatplan, map routes, manifest, screen order, or build structure.',
    assignment: {
      title: 'Connect First Route on Flatplan',
      icon: '⌘',
      description: 'Place the first playable route into the project structure and connect it to the next screen.',
      state: 'unassigned',
      primaryModule: 'project-editor',
      relatedModules: ['scene-editor', 'quest-builder'],
      priorityDefault: 5,
      effortDefault: 3,
      milestoneId: 'milestone_first_route',
      chronicleId: 'ch00',
      questId: 'q00',
      tags: ['flatplan', 'route', 'structure'],
      subtasks: [
        'Add start screen to Flatplan.',
        'Add first route screen.',
        'Connect route to endpoint.',
        'Confirm playable path.'
      ]
    }
  }
];

export function getTemplate(templateId) {
  return STARTER_TEMPLATES.find((template) => template.id === templateId) || null;
}

export function cloneTemplateAssignment(templateId) {
  const template = getTemplate(templateId);
  if (!template) return null;
  return JSON.parse(JSON.stringify(template.assignment));
}
