# Artifex Starter Audio Placeholder Library

## Purpose

This `audio/` folder is a generic starter audio placeholder library for Artifex-based game prototypes. It is designed to be copied into `artifex/templates/starter-asset-placeholders/audio/` when a new project needs immediate sound and music hooks.

All MP3 sound effects were generated from scratch using simple synthetic tones, noise, envelopes and sweeps. All MIDI music cues are original small placeholder compositions created for this pack. No uploaded audio, downloaded samples, copyrighted music, voices, branded sounds or existing MIDI files were used.

These are deliberately rough starter assets for testing playback, interface actions, gameplay-event wiring, scene transitions and music looping. They are intended to be replaced or refined as the game develops.

## MP3 Sound Effects

### UI

- `ui/button_start_game.mp3` — Positive cue for selecting Start Game or beginning a prototype.
- `ui/button_confirm.mp3` — General affirmative UI selection cue.
- `ui/button_cancel.mp3` — Soft back, cancel or dismiss cue.
- `ui/menu_open.mp3` — Cue for opening a menu or panel.
- `ui/menu_close.mp3` — Cue for closing a menu or panel.
- `ui/dialogue_advance.mp3` — Subtle tick for advancing dialogue or message text.

### Map

- `map/map_open.mp3` — Airy cue for opening a map or route-selection screen.
- `map/map_cursor_move.mp3` — Tiny pip for moving between selectable map nodes.
- `map/map_destination_select.mp3` — Confirmation cue for selecting a valid destination.
- `map/map_route_locked.mp3` — Muted denial cue for an unavailable route.

### Interaction

- `interaction/interact_prompt.mp3` — Soft attention ping for a nearby interactable.
- `interaction/item_pickup.mp3` — Basic pickup cue for an ordinary item.
- `interaction/collectible_pickup.mp3` — Brighter reward cue for a collectible pickup.
- `interaction/clue_found.mp3` — Discovery chime for finding a clue or important object.
- `interaction/unlock_success.mp3` — Mechanical click and confirmation tone for a successful unlock.
- `interaction/unlock_failed.mp3` — Muted failed-unlock cue.
- `interaction/container_open.mp3` — Synthetic opening cue for a container or searchable prop.
- `interaction/scene_state_change.mp3` — Neutral shift cue for an environmental state change.

### Movement

- `movement/footstep_01.mp3` — First lightweight footstep variation.
- `movement/footstep_02.mp3` — Second lightweight footstep variation.
- `movement/jump.mp3` — Rising cue for beginning a jump.
- `movement/land.mp3` — Soft impact cue for landing.

### Combat

- `combat/player_damage.mp3` — Abstract damage cue for the player, with no voice component.
- `combat/enemy_or_hazard_damage.mp3` — Sharper damage cue for a foe or hazard.
- `combat/enemy_or_hazard_defeat.mp3` — Descending cue for a defeated or deactivated foe/hazard.

### Effects

- `effects/basic_magic_or_special_action.mp3` — Shimmering generic special-action placeholder.
- `effects/transition_whoosh.mp3` — Short whoosh for changing scenes or moving through transitions.
- `effects/reward_complete.mp3` — Celebratory cue for success, rewards or task completion.

## MIDI Music Placeholders

- `music/title_theme_loop.mid` — Warm loop for a generic title screen or opening menu.
- `music/map_screen_loop.mid` — Curious forward-moving loop for map and route screens.
- `music/first_scene_exploration_loop.mid` — Gentle neutral loop for an initial exploration space.
- `music/gentle_mystery_loop.mid` — Quiet uncertain loop for clue or puzzle scenes.
- `music/danger_tension_loop.mid` — Active suspense loop for mild danger or approaching hazards.
- `music/simple_battle_loop.mid` — Rhythmic urgent loop for basic combat testing.
- `music/discovery_reward_sting.mid` — Short non-looping musical reward or discovery sting.
- `music/peaceful_safe_area_loop.mid` — Calm minimal loop for safe areas or dialogue-focused pauses.

## Technical Notes

- The MP3 sound effects are intentionally short, mono, 44.1 kHz and encoded at 64 kbps for browser-friendly prototype use.
- The MIDI files are lightweight, editable music placeholders using small General MIDI instrument arrangements.
- `music/discovery_reward_sting.mid` is intentionally non-looping.
- The other seven MIDI cues are composed as short loopable placeholders.
