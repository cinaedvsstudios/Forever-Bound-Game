export default {
  id: 'item-order-puzzle',
  label: 'Item Order Puzzle',
  icon: '⚗',
  moduleType: 'ordered_item_sequence',
  mode: 'scene_mode',
  defaultModuleId: 'ch00_optional_item_order_puzzle',
  callingText: 'Select the correct items in the correct order before the sequence fails.',
  purpose: 'Creates an item-order challenge using ordered selection, changing objects, wrong-pick feedback, timers, and completion scoring.',
  fields: [
    { key: 'sequenceLength', label: 'Sequence Length', type: 'range', value: 5, min: 2, max: 12, step: 1 },
    { key: 'itemPool', label: 'Item Pool', type: 'select', value: 'forest_potion', options: [['forest_potion', 'Forest Potion'], ['aetheris_ritual', 'Aetheris Ritual'], ['underworld_antidote', 'Underworld Antidote'], ['custom', 'Custom Pool']] },
    { key: 'transformSpeed', label: 'Transform Speed', type: 'range', value: 45, min: 10, max: 100, step: 5 },
    { key: 'wrongPickRule', label: 'Wrong Pick Rule', type: 'select', value: 'reduce_quality', options: [['reduce_quality', 'Reduce Quality'], ['fail_step', 'Fail Current Step'], ['fail_sequence', 'Fail Sequence']] },
    { key: 'rewardRule', label: 'Reward Rule', type: 'select', value: 'sequence_quality', options: [['sequence_quality', 'Sequence Quality'], ['fixed_reward', 'Fixed Reward'], ['none', 'No Reward']] }
  ],
  preview: { kind: 'item-order', accent: '#684b8f' }
};
