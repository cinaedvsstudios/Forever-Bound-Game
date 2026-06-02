export const puzzleModuleBriefs = {
  'maze-labyrinth': {
    displayName: 'Labyrinth Maze',
    launcherDescription: 'Build and test a magical maze with doors, shortcuts and hidden routes.',
    engineLabel: 'Maze / Labyrinth',
    implemented: true
  },
  'arena-trial': {
    displayName: 'Boxing Ring',
    launcherDescription: 'Train against controlled Foe projections for modest rewards.',
    engineLabel: 'Arena Trial',
    status: 'Planning placeholder · not implemented',
    overview: 'An optional training arena where Mel fights controlled Foe projections for modest rewards. It uses Battle Mode rules but does not affect main Quest progress. Losing has no story penalty; winning gives a small reward and triggers a cooldown before the same rewarded fight can be repeated.',
    gameplayLoop: [
      'Mel enters the training space and speaks with a Training Host or Spirit Tutor.',
      'Choose an unlocked opponent or projection to practise against.',
      'Choose a limited loadout of weapons, Supplies, Relics or Songspells.',
      'Fight in a fixed non-scrolling Battle Mode arena.',
      'Resolve victory or defeat, rewards, first-clear bonuses, cooldown state and any new unlocks.',
      'Allow no-reward practice against already-cleared opponents without enabling reward farming.'
    ],
    plannedSystems: [
      ['Training Host / Spirit Tutor', 'Greets Mel, explains the trial, offers opponent selection and delivers win/loss dialogue. Could be a spirit, Oracle-linked figure, old warrior shade, Aetheris guardian or ritual echo.'],
      ['Opponent Select Menu', 'Select a creature, Foe, Guardian or spirit projection; stronger opponents unlock as Mel meets them in the real story.'],
      ['Loadout Select Menu', 'Choose limited weapons, Supplies, Relics or Songspells before entering the fight.'],
      ['Training Battle Arena', 'A fixed Battle Mode arena for contained combat clarity.'],
      ['Reward Logic', 'Modest Silver, ingredients, Supplies, temporary boosts or rare first-clear bonuses; permanent heart rewards remain rare.'],
      ['Cooldown / Anti-Farming', 'After a rewarded win, lock that reward until another Quest step, Errand, scene milestone or Calling is completed.'],
      ['Training Death / Reset Logic', 'Defeat returns Mel to the entrance or host dialogue with no Quest failure, story rollback or permanent punishment.'],
      ['Opponent Unlock Logic', 'Basic enemies early; stronger Foes, Guardians or Bellator-style trials after story encounters.'],
      ['First-Clear Bonus Logic', 'A one-time stronger reward; repeated victories are reduced or wait for cooldown reset.'],
      ['Practice / No-Reward Mode', 'Replay cleared opponents without farming rewards.'],
      ['Training Codice Entry', 'Optional in-world record of defeated trials, unlocked enemies, rewards and Foe lore.'],
      ['Training Scene Entrance', 'Possible shrine, undercroft, ruined ritual circle, dream chamber, sacred amphitheatre or hidden Sanctum.'],
      ['Difficulty Tier Rules', 'Easy, medium, hard and special tiers using existing Foe strength/tier logic.'],
      ['Training Results Screen', 'Show outcome, reward, cooldown and unlocks in in-world wording rather than modern win/lose terminology.']
    ],
    references: [],
    questions: [
      'What is the in-world location and who is the Training Host / Spirit Tutor?',
      'Should the first playable build reuse an existing Battle Mode arena and Foe system, or begin as a standalone prototype?',
      'Which three starter opponents should be available, and what encounter unlocks each later opponent?',
      'Which loadout categories are allowed in training and which are forbidden?',
      'What exact first-clear reward and repeat/cooldown rewards should exist in the first version?',
      'What event resets a rewarded fight cooldown: Quest step, Errand, scene milestone, Calling, or a specific rule?',
      'What in-world words should replace victory/defeat on the results screen?'
    ]
  },
  'obstacle-course': {
    displayName: 'Flying Practice',
    launcherDescription: 'Fly a guided aerial course, dodge obstacles and collect glowing markers.',
    engineLabel: 'Obstacle Course',
    status: 'Planning placeholder · not implemented',
    overview: 'An optional flying training module where Mel manoeuvres through a guided aerial course made from sky, mountains, lake or river, and forest scenery. She follows glowing route markers, avoids obstacles, collects glowing objects for points and tries to finish with the highest score.',
    gameplayLoop: [
      'Mel remains near the centre while the aerial course advances toward her.',
      'Glowing route dots communicate the intended flight path.',
      'Mountains, tree branches, floating rocks or ruins, and storm clouds approach as obstacles.',
      'Glowing collectibles provide score bonuses and reward-tier progress.',
      'The results screen shows total score and any optional tier reward.'
    ],
    scoreRules: [
      ['Follow the glowing flight path', 'No penalty'],
      ['Fly outside the marker path', '-1 point'],
      ['Hit an obstacle', '-1 point'],
      ['Collect glowing object', '+5 points'],
      ['Finish the course', 'Show final score']
    ],
    plannedSystems: [
      ['Course presentation', 'On-rails pseudo-3D flight course; the first build can use ordinary Canvas layers rather than full Three.js.'],
      ['Scenery layers', 'Sky far background, mountains/terrain, lake or river below, and forest/tree branches in the foreground.'],
      ['Obstacle set', 'Mountain peak, tree branch, floating rock or ruin, and storm cloud.'],
      ['Course markers', 'Glowing dots indicate the ideal path.'],
      ['Collectibles', 'Glowing objects provide bonus points.'],
      ['Collision and results', 'Depth-zone collision checks, final score and optional score-tier reward.']
    ],
    references: [
      ['Generated moving-world reference', 'https://threejs.org/examples/#webgl_geometry_minecraft', 'Movement-through-a-generated-world reference, not a cube-art direction.'],
      ['Terrain / mountain reference', 'https://threejs.org/examples/#webgl_geometry_terrain_raycast', 'Heightfield-style terrain reference for mountains and approaching landscape.'],
      ['Glowing collectible reference', 'https://threejs.org/examples/#webgl_lensflares', 'Reference for glowing collectible objects and route-marker emphasis.'],
      ['Ruins / lighting atmosphere reference', 'https://threejs.org/examples/#webgl_lightprobes_sponza', 'Reference for lit ruins, arches or stone course segments.']
    ],
    questions: [
      'Should the first version be side-on, behind-Mel, or a shallow angled forward-flight view?',
      'Should Mel steer freely within the screen or move between a limited number of lanes?',
      'What should the first course environment be: forest/lake, mountains, ruins, or a mix?',
      'Does flying outside the route repeatedly subtract points over time, or only when a marker is missed?',
      'What score tiers and rewards should the first course use?',
      'Should the first implementation use Canvas pseudo-3D, keeping full Three.js as a later visual upgrade?'
    ]
  },
  'symbol-assembly': {
    displayName: 'Pattern Lock Puzzle',
    launcherDescription: 'Arrange or rotate pieces to complete a rune, seal or ritual pattern.',
    engineLabel: 'Symbol Assembly',
    status: 'Planning placeholder · not implemented',
    overview: 'An optional puzzle where the player places, rotates or selects small pieces to complete a larger symbol, seal, rune, mosaic, lock, ritual pattern or magical diagram. It can become a shape-fitting puzzle, rune alignment puzzle, tile placement challenge or complete-the-seal ritual.',
    gameplayLoop: [
      'Present a board with incomplete slots and a collection of selectable pieces.',
      'The player places or rotates pieces according to the selected puzzle rule.',
      'Wrong placements provide visible or narrative feedback without falsely completing the pattern.',
      'Completing the correct pattern triggers the selected completion effect and optional reward.'
    ],
    plannedSystems: [
      ['Puzzle board', 'Seal circle, mosaic square, rune ring or lock plate.'],
      ['Piece interaction', 'Draggable or selectable pieces with optional rotation rules.'],
      ['Validation', 'Correct-pattern checking and wrong-placement feedback.'],
      ['Completion', 'Seal glow, door unlock, relic reveal or another authored outcome.'],
      ['Difficulty', 'Piece count, rotations, distractor pieces and optional limited tries or time.']
    ],
    references: [
      ['Raycast selection reference', 'https://threejs.org/examples/#webgl_instancing_raycast', 'Reference for selecting repeated puzzle pieces; a first version can still be built in 2D Canvas.']
    ],
    questions: [
      'What is the first actual pattern: a rune seal, door lock, ritual diagram or mosaic?',
      'Should the first version use drag-and-drop placement, click-to-slot placement, rotation, or a combination?',
      'Should pieces snap into any slot and then validate, or only allow compatible slots?',
      'What happens after success in the first example: unlock a door, reveal a relic, trigger magic, or complete an optional challenge?',
      'What should wrong-placement feedback look and sound like, and should there be any fail condition?',
      'Should the first build intentionally be simple 2D, with 3D or raycast visuals later?'
    ]
  },
  'item-order-puzzle': {
    displayName: 'Potion Match',
    launcherDescription: 'Select ingredients in the correct order before the brew fails.',
    engineLabel: 'Item Order Puzzle',
    status: 'Planning placeholder · not implemented',
    overview: 'An optional potion-making module where the player must select ingredients in the correct recipe order. Ingredients appear as changing objects; the player must spot and select the right ingredient before it changes. Correct picks advance the recipe, while wrong picks or missed ingredients reduce brew quality or fail the brew.',
    gameplayLoop: [
      'Display the active recipe sequence and a moving or changing pool of ingredient objects.',
      'The player selects the ingredient currently required by the recipe.',
      'Correct selections advance the brew; incorrect or missed selections apply the chosen failure or quality rule.',
      'Completion awards a potion or reward based on recipe and brew quality.'
    ],
    plannedSystems: [
      ['Ingredient pool', 'Possible ingredients include lavender, sage, moonflower, salt, Capra milk, Star Dust, Aetheris water, yarrow, mushrooms and berries.'],
      ['Recipe panel', 'Ordered ingredient sequence for the selected brew.'],
      ['Transformation timer', 'Objects change before selection if the player waits too long.'],
      ['Feedback', 'Correct/wrong click response and brew-quality or score meter.'],
      ['Outcome', 'Fail/win state, created potion or reward, plus speed and recipe-length difficulty settings.']
    ],
    references: [
      ['Interactive object selection reference', 'https://threejs.org/examples/#webgl_interactive_cubes', 'Replace selectable cubes with ingredient sprites or models.']
    ],
    questions: [
      'Which potion should be the first playable recipe and what ingredients must it use in order?',
      'Are ingredients selected by clicking floating objects, objects on a workbench, shelves, or another presentation?',
      'Should ingredient objects transform continuously, or only disappear or change when missed?',
      'Does one wrong ingredient immediately fail the brew, lower quality, or consume an attempt?',
      'What does brew quality change: reward amount, potion strength, final item identity, or only score?',
      'Should first implementation use 2D ingredient art and pointer selection before any 3D object version?'
    ]
  },
  'hazard-puzzle': {
    displayName: 'Underworld Black Oil',
    launcherDescription: 'Avoid, cleanse or contain a spreading corruption hazard.',
    engineLabel: 'Hazard Puzzle',
    status: 'Planning placeholder · not implemented',
    overview: 'An optional Underworld module based around moving, avoiding, cleansing, collecting or escaping living black oil. The visual concept is that blobs of corruption shift, merge, pulse and spread across an area as a dangerous living substance.',
    gameplayLoop: [
      'Place Mel in an Underworld hazard area with living black-oil sources or moving blobs.',
      'The corruption pulses, moves, spreads or blocks paths according to the selected challenge mode.',
      'Mel avoids danger, reaches safety, cleanses sources, contains spread, or survives for a required duration.',
      'Resolve success or failure and optional rewards or story-safe consequences.'
    ],
    plannedSystems: [
      ['Visual behaviour', 'Organic black-oil blobs that shift, merge and pulse.'],
      ['Hazard rules', 'Danger zones, collision or proximity detection, and safe-path logic.'],
      ['Challenge modes', 'Avoid and escape, cleanse sources, containment, or survival timer.'],
      ['Interaction', 'Optional cleansing item or Songspell action.'],
      ['Outcome', 'Score or survival timer plus win/loss state.']
    ],
    references: [
      ['Organic blob visual reference', 'https://threejs.org/examples/#webgl_marchingcubes', 'Reference for shifting, merging living-black-oil behaviour.']
    ],
    questions: [
      'Which first gameplay mode should be built: escape, cleanse sources, containment or survival timer?',
      'Should the first room be top-down, side-view or use the same angled camera language as another module?',
      'Is touching oil instant failure, damage over time, a corruption meter, or a temporary penalty?',
      'How should oil spread: fixed timed pulses, player-triggered expansion, or organic movement only?',
      'What tool can cleanse it in the first version: Songspell, Saltseal, Aetheris relic, or none?',
      'Should the first build use a simpler 2D animated hazard mask before attempting marching-cubes-style visuals?'
    ]
  }
};

export const getPuzzleModuleBrief = (engineId) => puzzleModuleBriefs[engineId] || null;
