export default {
  id: 'recipe-sequence',
  label: 'Recipe Sequence',
  icon: '⚗',
  moduleType: 'timed_ingredient_selection',
  mode: 'scene_mode',
  defaultModuleId: 'ch00_optional_recipe_sequence',
  callingText: 'Select the correct ingredients in order before they change.',
  purpose: 'Creates a potion or ritual recipe challenge using ordered ingredient selection, changing objects, wrong-pick feedback, timers, and brew-quality scoring.',
  fields: [
    { key: 'recipeLength', label: 'Recipe Length', type: 'range', value: 5, min: 2, max: 12, step: 1 },
    { key: 'ingredientPool', label: 'Ingredient Pool', type: 'select', value: 'forest_potion', options: [['forest_potion', 'Forest Potion'], ['aetheris_ritual', 'Aetheris Ritual'], ['underworld_antidote', 'Underworld Antidote'], ['custom', 'Custom Pool']] },
    { key: 'transformSpeed', label: 'Transform Speed', type: 'range', value: 45, min: 10, max: 100, step: 5 },
    { key: 'wrongPickRule', label: 'Wrong Pick Rule', type: 'select', value: 'reduce_quality', options: [['reduce_quality', 'Reduce Brew Quality'], ['fail_step', 'Fail Current Step'], ['fail_brew', 'Fail Brew']] },
    { key: 'rewardRule', label: 'Reward Rule', type: 'select', value: 'brew_quality', options: [['brew_quality', 'Brew Quality'], ['fixed_reward', 'Fixed Reward'], ['none', 'No Reward']] }
  ],
  preview: { kind: 'recipe', accent: '#684b8f' }
};
