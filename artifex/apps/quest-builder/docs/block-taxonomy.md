# Quest Builder Block Taxonomy

## Purpose

Quest Builder blocks describe quest progression. They should not blur together player tasks, referenced assets, scene locations, logic and UI feedback.

For the structured authoring decision behind dialogue, conditions and outcomes, also read:

```text
docs/artifex/07a-quest-builder-structured-authoring.md
```

## Core rule

A block type answers one main question:

```text
scene       = where the quest step happens
activity    = what the player does
content     = what quest text or referenced asset is used
logic       = what condition/flag gates progression
feedback    = what UI, dialogue or Capra response appears
unlock      = what the player gains or opens
completion  = how the quest resolves
```

A canvas block should represent a meaningful Quest event. Ordinary dialogue lines, wrong-item replies, requirement checks and flag results may be authored inside the relevant block rather than being forced into separate flow cards.

## Locked block types

| Type | Meaning | Primary field | Required fields | Source module |
| --- | --- | --- | --- | --- |
| scene | Playable scene/screen reference | sceneId | sceneId | Scene Editor |
| action | Player task such as speak/use/collect/trigger | action | action | Quest Builder |
| travel | Route or movement section | action | action | Project Manager / Project Editor reference |
| dialogue | Quest-scoped conversation, narration or scripted feedback record | dialogueId | dialogueId | Quest Builder |
| object | Object/NPC interaction | objectId | objectId, action | Archetype Object Creator reference |
| information | Clue, inspection, discovery, decoded knowledge | action | action | Quest Builder |
| condition | Flag or logic gate | condition | condition | Quest Builder |
| route | Route/map/path unlock reference | action | action | Project Manager / Project Editor reference |
| ritual | Ritual sequence, ingredient placement, Songspell use | action | action | Quest Builder |
| combat | Combat or Foe objective | action | action | Quest Builder |
| companion | Companion-based help or interaction | objectId | objectId, action | Quest Builder |
| cleansing | Cleansing/purifying action | action | action | Quest Builder |
| capra | Capra feedback, hint, reminder, wrong-object response | capraFeedback | capraFeedback | Quest Builder |
| codice | Codice/lore unlock/update reference | action | action | Quest Builder / Codice reference |
| reward | Reward or grant | action | action | Quest Builder |
| ui | UI overlay or popup | uiOverlay | uiOverlay | Quest Builder |
| completion | Quest completion condition | condition | condition | Quest Builder |

## Player action versus dialogue

`Speak With Vitus` is a `Player Action` block because it describes what Mel/player does. It may link to a Quest-owned dialogue record and referenced reusable NPC/audio assets:

```text
objectId: archobj_vitus
dialogueId: dialogue_ch01_q03_vitus_warning
audioId: asset_voice_ch01_q03_vitus_warning_01
action: speak:archobj_vitus
```

A `Dialogue` block is used only when the conversation or scripted reveal is itself a meaningful visible flow event. For ordinary talk attached to an action, use the Action block and edit the linked dialogue record from its Dialogue / Feedback area.

## Dialogue ownership decision

Quest-specific dialogue, Capra feedback and short scripted lines are authored inside Quest Builder for the first version. They may be stored within the quest file or a Quest Builder-owned companion record explicitly tied to that quest once the export schema is implemented.

Portraits, recorded voice files and sound assets remain referenced reusable assets. Quest Builder does not duplicate binary media or take over Asset Library/audio ownership merely because a Quest uses those files.

Do not create or require a separate top-level Dialogue Library / Dialogue Editor app in the first version. A reusable global dialogue library may be considered later only after actual cross-Quest reuse, localisation or voice-management needs are demonstrated.

## Structured internal authoring direction

When a block is edited, its contextual editor should be able to expose:

```text
Action
Requirements / Conditions
Success Outcomes
Failure / Capra Feedback
Dialogue / Presentation
Linked Assets and IDs
Validation
```

These internal sections do not each need their own canvas block. Use separate connected blocks only when the creator needs to arrange a meaningful progression step or branch on the workspace.

## Validation meaning

Required fields are used by viewing-canvas warnings and export validation. Missing required fields should be visible before export.

Examples:

```text
scene block without sceneId = warning
action block without action = warning
object block without objectId or action = warning
dialogue block without dialogueId or dialogue record = warning
condition block without a usable condition = warning
completion block without condition = warning
referenced dialogue record with no lines = warning
Capra feedback outcome with no displayed message = warning
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

The quick-edit field is not the full structured authoring interface. Detailed action, logic, outcome and dialogue editing should open the selected block's contextual editor rather than expanding the left inspector into a separate application.

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

Do not add vague types that duplicate an existing purpose. If the desired thing is a player task, use `action` and link the content, conditions, outcomes and referenced assets it needs.