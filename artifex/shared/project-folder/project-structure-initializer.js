(() => {
  'use strict';

  const VERSION = '0.1.2';

  const CORE_DIRECTORIES = Object.freeze([
    'scenes',
    'screens',
    'quests',
    'sidequests',
    'puzzles',
    'archetypes',
    'archetypes/objects',
    'archetypes/effects',
    'assets',
    'assets/groups',
    'assets/images',
    'assets/images/backgrounds',
    'assets/images/characters',
    'assets/images/props',
    'assets/images/ui',
    'assets/sprites',
    'assets/sprites/characters',
    'assets/sprites/objects',
    'assets/sprites/fx',
    'assets/audio',
    'assets/audio/music',
    'assets/audio/sfx',
    'assets/audio/voice',
    'assets/fonts',
    'assets/video',
    'health',
    'build',
    'backups',
    'todos'
  ]);

  const INTAKE_DIRECTORIES = Object.freeze([
    'intake',
    'intake/backgrounds',
    'intake/characters',
    'intake/objects',
    'intake/icons-ui',
    'intake/music',
    'intake/dialogue-sfx'
  ]);

  function folderClient() {
    if (!window.ArtifexProjectFolder) throw new Error('The shared project-folder client is not loaded.');
    return window.ArtifexProjectFolder;
  }

  function slug(value) {
    return String(value || 'untitled-artifex-adventure')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'untitled-artifex-adventure';
  }

  function normalizeProjectInput(input = {}) {
    const gameTitle = String(input.gameTitle || input.projectName || 'Untitled Artifex Adventure').trim();
    const projectSlug = slug(input.projectSlug || input.projectId || gameTitle);
    const projectId = String(input.projectId || `project_${projectSlug.replace(/-/g, '_')}`);
    return {
      projectId,
      projectSlug,
      gameTitle,
      creator: String(input.creator || '').trim(),
      version: String(input.version || '0.1.0'),
      projectLogo: input.projectLogo || null,
      enabledModules: Array.isArray(input.enabledModules) ? input.enabledModules : []
    };
  }

  function indexRefs() {
    return {
      sceneIndex: 'scenes/scene-index.json',
      screenIndex: 'screens/screen-index.json',
      questIndex: 'quests/quest-index.json',
      sidequestIndex: 'sidequests/sidequest-index.json',
      puzzleIndex: 'puzzles/puzzle-index.json',
      objectArchetypeIndex: 'archetypes/object-index.json',
      effectArchetypeIndex: 'archetypes/effect-index.json',
      assetIndex: 'assets/asset-index.json'
    };
  }

  function starterProjectJson(project) {
    return {
      schemaVersion: 'artifex.project.v1',
      projectId: project.projectId,
      projectSlug: project.projectSlug,
      gameTitle: project.gameTitle,
      creator: project.creator,
      version: project.version,
      createdBy: 'creation-guide',
      projectLogo: project.projectLogo,
      startScreenId: null,
      enabledModules: project.enabledModules,
      roots: {
        intake: 'intake/',
        assets: 'assets/',
        scenes: 'scenes/',
        screens: 'screens/',
        quests: 'quests/',
        sidequests: 'sidequests/',
        puzzles: 'puzzles/',
        archetypes: 'archetypes/',
        health: 'health/',
        build: 'build/',
        backups: 'backups/',
        todos: 'todos/'
      },
      fileRefs: {
        logic: 'logic.json',
        layout: 'layout.json',
        registry: 'registry.json',
        libraryLinks: 'library-links.json',
        inputMap: 'input-map.json',
        ...indexRefs(),
        healthReport: 'health/latest-health-report.json'
      }
    };
  }

  function starterLogicJson(project) {
    return {
      schemaVersion: 'artifex.logic.v1',
      projectId: project.projectId,
      nodes: [],
      routes: [],
      conditions: [],
      startScreenId: null
    };
  }

  function starterLayoutJson(project) {
    return {
      schemaVersion: 'artifex.layout.v1',
      projectId: project.projectId,
      camera: { zoom: 1, panX: 0, panY: 0 },
      nodes: [],
      routes: [],
      annotations: []
    };
  }

  function starterRegistryJson(project) {
    return {
      schemaVersion: 'artifex.registry.v1',
      projectId: project.projectId,
      enabledModules: project.enabledModules,
      indexes: indexRefs(),
      customMacros: []
    };
  }

  function starterLibraryLinksJson(project) {
    return {
      schemaVersion: 'artifex.library-links.v1',
      projectId: project.projectId,
      links: []
    };
  }

  function starterInputMapJson(project) {
    return {
      schemaVersion: 'artifex.input-map.v1',
      projectId: project.projectId,
      profileId: 'input_default_gameplay',
      label: 'Default Gameplay Controls',
      createdBy: 'creation-guide',
      actions: [
        { actionId: 'action_move', label: 'Move', category: 'movement', defaultKeyboard: ['ArrowKeys', 'WASD'], defaultGamepad: ['DPad', 'LeftStick'], required: true },
        { actionId: 'action_invoke', label: 'Invoke / Interact', category: 'gameplay', defaultKeyboard: ['E', 'Enter'], defaultGamepad: ['B'], required: true },
        { actionId: 'action_use_active_item', label: 'Use Active Item', category: 'gameplay', defaultKeyboard: ['Space'], defaultGamepad: ['A'], required: true },
        { actionId: 'action_item_scroll_mode', label: 'Item Scroll Mode', category: 'inventory', defaultKeyboard: ['Tab'], defaultGamepad: ['X'], required: false },
        { actionId: 'action_reserved_special', label: 'Reserved Special', category: 'gameplay', defaultKeyboard: [], defaultGamepad: ['Y'], required: false },
        { actionId: 'action_inventory', label: 'Kibisis Pouch', category: 'inventory', defaultKeyboard: ['I'], defaultGamepad: ['Select'], required: true },
        { actionId: 'action_menu', label: 'Codice Cylinder of Yggdrasil', category: 'system', defaultKeyboard: ['Escape'], defaultGamepad: ['Start'], required: true }
      ]
    };
  }

  function emptyIndex(schemaVersion, project, collection) {
    return { schemaVersion, projectId: project.projectId, [collection]: [] };
  }

  function starterFiles(project) {
    return {
      'project.json': starterProjectJson(project),
      'logic.json': starterLogicJson(project),
      'layout.json': starterLayoutJson(project),
      'registry.json': starterRegistryJson(project),
      'library-links.json': starterLibraryLinksJson(project),
      'input-map.json': starterInputMapJson(project),
      'scenes/scene-index.json': emptyIndex('artifex.scenes.index.v1', project, 'scenes'),
      'screens/screen-index.json': emptyIndex('artifex.screens.index.v1', project, 'screens'),
      'quests/quest-index.json': emptyIndex('artifex.quests.index.v1', project, 'quests'),
      'sidequests/sidequest-index.json': emptyIndex('artifex.sidequests.index.v1', project, 'sidequests'),
      'puzzles/puzzle-index.json': emptyIndex('artifex.puzzles.index.v1', project, 'puzzles'),
      'archetypes/object-index.json': emptyIndex('artifex.archetypes.objects.index.v1', project, 'objects'),
      'archetypes/effect-index.json': emptyIndex('artifex.archetypes.effects.index.v1', project, 'effects'),
      'assets/asset-index.json': emptyIndex('artifex.assets.index.v1', project, 'assets')
    };
  }

  function projectReadme(project) {
    return `# ${project.gameTitle}\n\nThis Artifex project was initialised by Creation Guide.\n\nProject ID: \`${project.projectId}\`\n\nProject files use relative paths only. Source material can be staged under \`intake/\` and must be promoted into final \`assets/\` records before scenes or runtime content reference it.\n`;
  }

  function intakeReadme(project) {
    return `# ${project.gameTitle} Intake Folder\n\nThis is the creator-facing drop zone for unfinished or newly supplied source assets. Files here are staging files only; permanent project content must reference approved assets promoted into the final \`assets/\` structure.\n\n## Folders\n\n- \`backgrounds/\` — scene backgrounds, interiors, landscapes and environmental plates.\n- \`characters/\` — player, NPC, interactive character, enemy, portrait and sprite-sheet source art.\n- \`objects/\` — props, pickups, doors, transitions, furniture and interactable-object source art.\n- \`icons-ui/\` — project logo/title mark, icons, markers, HUD and menu source art.\n- \`music/\` — music tracks and stingers.\n- \`dialogue-sfx/\` — voice, narration, ambience and sound effects.\n\n## Recommended Starting Media\n\n- project logo or temporary title mark\n- at least one scene background\n- at least one player-character asset\n- at least one NPC asset\n- at least one interactable object or pickup\n- at least one door, passage or transition object\n- at least one icon/UI placeholder set\n`;
  }

  async function ensureDirectories(directories) {
    const client = folderClient();
    const createdOrConfirmed = [];
    for (const path of directories) {
      await client.ensureDirectory(path);
      createdOrConfirmed.push(path);
    }
    return createdOrConfirmed;
  }

  async function writeIfMissing(path, writer) {
    const client = folderClient();
    if (await client.fileExists(path)) return { path, status: 'existing' };
    await writer();
    return { path, status: 'created' };
  }

  async function initialiseProjectStructure(input = {}, options = {}) {
    const client = folderClient();
    const project = normalizeProjectInput(input);
    const includeIntake = options.includeIntake !== false;
    const directories = await ensureDirectories(CORE_DIRECTORIES);
    if (includeIntake) directories.push(...await ensureDirectories(INTAKE_DIRECTORIES));

    const results = [];
    results.push(await writeIfMissing('README.md', () => client.writeText('README.md', projectReadme(project))));
    for (const [path, value] of Object.entries(starterFiles(project))) {
      results.push(await writeIfMissing(path, () => client.writeJson(path, value)));
    }
    if (includeIntake) results.push(await writeIfMissing('intake/README.md', () => client.writeText('intake/README.md', intakeReadme(project))));

    return {
      project,
      includeIntake,
      directories,
      files: results,
      createdFiles: results.filter(entry => entry.status === 'created').map(entry => entry.path),
      existingFiles: results.filter(entry => entry.status === 'existing').map(entry => entry.path)
    };
  }

  async function initialiseIntakeOnly(input = {}) {
    const client = folderClient();
    const project = normalizeProjectInput(input);
    const directories = await ensureDirectories(INTAKE_DIRECTORIES);
    const readme = await writeIfMissing('intake/README.md', () => client.writeText('intake/README.md', intakeReadme(project)));
    return { project, directories, files: [readme] };
  }

  window.ArtifexProjectStructure = {
    version: VERSION,
    coreDirectories: CORE_DIRECTORIES,
    intakeDirectories: INTAKE_DIRECTORIES,
    normalizeProjectInput,
    starterProjectJson,
    starterFiles,
    initialiseProjectStructure,
    initialiseIntakeOnly
  };

  window.dispatchEvent(new CustomEvent('artifex:project-structure-ready', { detail: window.ArtifexProjectStructure }));
})();
