export default {
  id: 'arena-trial',
  label: 'Arena Trial',
  icon: '⚔',
  moduleType: 'contained_combat_training',
  mode: 'battle_mode',
  defaultModuleId: 'ch00_optional_arena_trial',
  callingText: 'Survive the fixed arena challenge and defeat the selected foe.',
  purpose: 'Creates a contained training arena using Battle Mode rules, opponent selection, rewards, cooldowns, and reset-on-loss behaviour.',
  fields: [
    { key: 'arenaScene', label: 'Arena Scene ID', type: 'text', value: 'training_ring_scene' },
    { key: 'opponentSet', label: 'Opponent Set', type: 'select', value: 'weak_foes', options: [['weak_foes', 'Weak Foes'], ['forest_foes', 'Forest Foes'], ['roman_foes', 'Roman Foes'], ['custom', 'Custom']] },
    { key: 'rounds', label: 'Rounds', type: 'range', value: 3, min: 1, max: 5, step: 1 },
    { key: 'rewardTier', label: 'Reward Tier', type: 'select', value: 'modest', options: [['modest', 'Modest'], ['supplies', 'Supplies'], ['ingredients', 'Ingredients'], ['rare_small', 'Rare Small Bonus']] },
    { key: 'lossConsequence', label: 'Loss Rule', type: 'select', value: 'reset_no_story_penalty', options: [['reset_no_story_penalty', 'Reset, no story penalty'], ['cooldown_only', 'Cooldown only']] }
  ],
  preview: { kind: 'arena', accent: '#d65f55' }
};
