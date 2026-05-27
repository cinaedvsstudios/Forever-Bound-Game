# Quest Builder Block Taxonomy

## Purpose

Quest Builder blocks describe quest progression. They should not blur together player tasks, linked content assets, scene locations, and UI feedback.

## Core rule

A block type answers one main question:

```text
scene       = where the quest step happens
activity    = what the player does
content     = what asset is linked
logic       = what condition/flag gates progression
feedback    = what UI or Capra response appears
unlock      = what the player gains or opens
completion  = how the quest resolves
```

## Locked block types

| Type | Meaning | Primary field | Required fields | Source module |
| --- | --- | --- | --- | --- |
| scene | Playable scene/screen reference | sceneId | sceneId | Scene Editor |
| action | Player task such as speak/use/collect/trigger | action | action | Quest Builder |
| travel | Route or movement section | action | action | Project Manager |
| dialogue | Dialogue/audio content asset | dialogueId | dialogueId | Dialogue Library |
| object | Object/NPC interaction | objectId | objectId, action | Archetype Object Creator |
| information | Clue, inspection, discovery, decoded knowledge | action | action | Quest Builder |
| condition | Flag or logic gate | condition | condition | Quest Builder |
| route | Route/map/path unlock | action | action | Project Manager |
| ritual | Ritual sequence, ingredient placement, songspell use | action | action | Quest Builder |
| combat | Combat or foe objective | action | action | Quest Builder |
| companion | Companion-based help or interaction | objectId | objectId, action | Quest Builder |
| cleansing | Cleansing/purifying action | action | action | Quest Builder |
| capra | Capra feedback, hint, reminder, wrong-object response | capraFeedback | capraFeedback | Quest Builder |
| codice | Codice/lore unlock/update | action | action | Codice Library |
| reward | Reward or grant | action | action | Quest Builder |
| ui | UI overlay or popup | uiOverlay | uiOverlay | Quest Builder |
| completion | Quest completion condition | condition | condition | Quest Builder |

## Player action vs dialogue

`Speak With Vitus` is a `Player Action` block because it describes what Mel/player does. It may link to:

```text
objectId: npc_vitus
dialogueId: ch01_q03_vitus_warning
audioId: audio_vitus_warning
action: speak:npc_vitus
```

A `Dialogue Asset` block is for the reusable dialogue/audio asset itself. It should not be used as the main gameplay task unless the quest step is explicitly about playing or unlocking dialogue as content.

## Validation meaning

Required fields are used by the viewing canvas warnings and export validation. Missing required fields should be visible before export.

Examples:

```text
scene block without sceneId = warning
action block without action = warning
object block without objectId or action = warning
dialogue block without dialogueId = warning
completion block without condition = warning
```

## Inspector behaviour

The left contextual inspector uses each block type's `primaryField` to decide what the main quick-edit field should edit.

Examples:

```text
scene       primary edits sceneId
action      primary edits action
dialogue    primary edits dialogueId
object      primary edits objectId
capra       primary edits capraFeedback
ui          primary edits uiOverlay
completion  primary edits condition
```

## Future notes

This taxonomy can be extended, but new types need:

- name
- emoji
- colour
- category
- sourceModule
- primaryField
- linkedFields
- requiredFields
- hint

Do not add vague types that duplicate an existing purpose. If the desired thing is a player task, use `action` and link the content/assets it needs.
