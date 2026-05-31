# Quest Builder Structured Authoring: Actions, Logic and Dialogue

## Purpose

This document locks the authoring model for the next Quest Builder development stage. The Quest Builder must become a practical way to describe what happens inside a Quest block: what the player does, what is required, what succeeds or fails, what feedback appears, and what progression changes result.

This is a design and implementation contract. It does not mean the current V1.2.12 interface already contains these screens or schemas.

## Locked Decision: No Separate Dialogue Editor App for the First Version

Dialogue required by a Quest is authored from inside Quest Builder.

The creator selects a block and opens its editing interface. Where that block needs NPC speech, Mel dialogue, narration, Capra feedback, or short scripted text, the editor provides a **Dialogue / Feedback** area or an **Open Dialogue Script** sub-screen within Quest Builder.

Do not create a separate top-level Dialogue Library / Dialogue Editor module for the first version merely to enter quest dialogue.

A separate shared dialogue library may be considered later only if repeated dialogue, localisation, global voice recording management, or cross-Quest reuse becomes large enough to justify it. Until then, a second app would create unnecessary file ownership, navigation and saving complexity.

## Ownership Boundary

Quest Builder owns:

- quest and sidequest flow blocks and connections;
- structured player actions inside those blocks;
- requirements, flags, conditions, success outcomes and failure outcomes;
- quest-specific dialogue records and line ordering;
- quest-specific Capra feedback lines and the circumstances in which they appear;
- Calling Fulfilled events, reward grants, Codice update triggers and route/unlock references created by the Quest.

Quest Builder may reference but does not own:

- scenes and screen layouts, owned by Scene Editor;
- reusable NPC/object/Foe/relic definitions, owned by Archetype Object Creator;
- reusable visual effects, owned by Effect Editor;
- promoted portrait images, voice recordings, sound assets and other final media files, owned by the asset/audio workflow once registered;
- Project Editor Flatplan route layout and world-structure data;
- reusable Codice content if a dedicated Codice library is later formalised.

The practical rule is: **Quest Builder owns the script and event use; libraries own reusable asset files or reusable global definitions.**

## Block Versus Internal Event Rule

The flow canvas is for meaningful progression steps, not every microscopic response.

A Quest block represents a meaningful event in the Quest flow, for example:

```text
Speak With Vitus
Give Chalice to Vitus
Cleanse the Shrine
Defeat the Bellator
Calling Fulfilled
```

Inside a block, the editor may store the action, conditions, success results, failure feedback and dialogue lines needed to execute that event.

Do not force each dialogue line, failed-object response or flag assignment to become a separate flow card unless it genuinely represents a visible progression step or branching event the creator needs to arrange on the canvas.

## Standard Block Authoring Model

Every actionable block should be designed around the same authoring sequence:

```text
Trigger / Action
→ Requirements and Conditions
→ Success Outcomes
→ Failure Outcomes / Feedback
→ Dialogue / Presentation when required
```

A block may leave some sections empty, but the structure should remain consistent so a creator does not need to understand code or type raw logic strings for ordinary work.

## Structured Action Editor

The Action area describes what Mel or the game event does. It should use selectable fields rather than a single vague text field once implemented.

Suggested fields:

| Field | Purpose |
|---|---|
| Action type | `speak`, `inspect`, `collect`, `give`, `use`, `activate`, `enter`, `reach`, `defeat`, `survive`, `hide`, `ritual`, `craft`, `buy`, `pay`, `bribe`, `scavenge`, `trigger` |
| Actor | Usually Mel/player; may be companion or system event when required |
| Target type | NPC, object, Foe, scene, route, puzzle, Codice entry, UI event or none |
| Target ID | Stable referenced ID, selected from the owning module where possible |
| Scene/screen context | Where this action is valid, when location matters |
| Active item/relic required | Optional selected item or Songspell needed for the action |
| Quantity/value | Optional amount for Silver, items or collection requirements |
| Description label | Human-readable summary shown on the block and in authoring UI |

Examples:

```text
actionType: speak       targetId: archobj_vitus
actionType: give        targetId: archobj_vitus        requiredItemId: archobj_sacred_chalice
actionType: defeat      targetId: archobj_bellator_executioner
actionType: scavenge    targetId: objinst_hollow_log_03
actionType: activate    targetId: route_south_gate     requiredItemId: archobj_bronze_key
```

## Conditions and Requirements

A Condition is a test. It decides whether the action is available, whether an outcome occurs, whether a branch becomes usable, or whether a Quest can complete.

The creator should build ordinary conditions through structured controls rather than writing raw code. Export may later produce compact strings or objects, but the editing interface should expose readable fields.

Suggested condition parts:

| Part | Meaning |
|---|---|
| Condition type | What is being checked |
| Subject/reference | The relevant item, flag, quest, scene, Foe, puzzle or resource |
| Operator | `is true`, `is false`, `has`, `does not have`, `equals`, `at least`, `complete`, `not complete` |
| Value | Quantity or comparison value where required |
| Combination | All required / any allowed / not |

Initial condition types should cover:

```text
flag true / flag false
has item / missing item
has Silver at least
quest complete / quest not complete
scene visited
object collected
Foe defeated
puzzle complete
Codice clue discovered
Songspell unlocked
world state matches
```

Examples:

```text
has item: archobj_sacred_chalice
flag true: flag_vitus_trusts_mel
Silver at least: 20
Foe defeated: archobj_executioner
all of: has chalice + spoke to Vitus
```

## Success Outcomes

An Outcome is a change that happens after the action succeeds. One block may have more than one success outcome.

Initial outcome types should cover:

```text
set flag true / false
give or remove item
give or remove Silver
add ingredient or supply
add Codice clue / advance translation state
unlock route, scene, screen, Stone Marker or next Quest
trigger dialogue
show Calling Fulfilled
show reward or UI notice
begin battle or transition
restore or remove Life Force where story/gameplay requires it
```

Examples:

```text
Give Chalice to Vitus
  success → remove archobj_sacred_chalice
  success → set flag_chalice_returned true
  success → trigger dialogue_ch01_q03_vitus_chalice_returned
  success → add Codice clue
  success → unlock quest_church_crypt
```

## Failure Outcomes and Capra Feedback

A failed action should normally explain why it failed rather than silently doing nothing. Failure feedback is not always a new Quest block; it is usually an event stored inside the attempted block.

Initial failure cases should cover:

```text
wrong object used
required object missing
not enough Silver
wrong location
locked route or inaccessible scene
condition not yet met
magical action blocked by Null Zone
hazardous/corrupted action warning
```

Capra is the normal in-world feedback voice for failed puzzle/item attempts, reminders and warnings. A failed outcome may trigger a Capra line, a normal dialogue line, a status message, an audio cue or a UI notice.

Most failed puzzle attempts should not hurt Mel. Damage is used only where the authored event is intentionally dangerous, such as touching Sekhemra, entering a trap or attempting a harmful magical interaction.

## Dialogue / Feedback Screen Inside Quest Builder

The Dialogue / Feedback editor is a contextual screen opened from the selected Quest block. It is not a new top-level module.

The screen should allow the creator to author a short ordered exchange and link it back to the block. It should support:

| Field | Purpose |
|---|---|
| Dialogue record ID | Stable Quest-scoped ID, such as `dialogue_ch01_q03_vitus_warning` |
| Line ID | Unique line ID used for text/audio matching, such as `ch01_q03_vitus_warning_01` |
| Speaker | Mel, NPC, Capra, narrator or system |
| Speaker/object reference | Stable object/NPC ID where available |
| Text | Displayed dialogue line |
| Portrait reference | Optional registered portrait/asset reference |
| Audio reference | Optional registered voice/audio reference |
| Display mode | Normal dialogue popup, Capra popup, small Capra corner reminder, narration or UI notice |
| Conditions | When this record/line appears, if conditional |
| On complete | Outcomes triggered after the dialogue finishes, when required |

Dialogue presentation rules for the first version:

- dialogue is short and linear;
- Mel's replies are automatic;
- no large branching conversation system is required;
- topic-selection or optional lore questions may be considered later;
- the same system is used for normal NPC dialogue and Capra feedback, with Capra-specific display behaviour where appropriate;
- portraits and audio are referenced assets, not duplicated into quest data.

## Quest-Scoped Dialogue Storage Rule

For the first implementation, quest-specific dialogue records should be stored with the Quest or Side Quest that uses them, or in a Quest Builder-owned companion record explicitly tied to that quest if file size later requires separation.

Do not require a new global `dialogue/` project area merely for first-version authoring. Do not introduce a Dialogue Library ownership contract until there is a proven need for reusable shared dialogue across several quests.

Recommended initial direction:

```text
quests/quest_<slug>.json
  flow blocks
  actions / conditions / outcomes
  dialogueRecords[]
  capraFeedbackRecords[] or dialogueRecords[] with displayMode: capra
```

This is an authoring direction, not a final locked JSON schema. The exact field structure must be defined together with export validation when implementation begins.

## Contextual Editor Layout Direction

The existing Quest Builder block editor should grow into a structured editor rather than spawning separate apps.

Recommended selected-block editing areas:

```text
Summary
Action
Requirements / Conditions
Success Outcomes
Failure / Capra Feedback
Dialogue / Presentation
Linked Assets and IDs
Validation
```

For a simple block, only the relevant areas need to be opened. For example, a `Defeat Foe` block may not need dialogue; a `Speak With Vitus` block may rely heavily on dialogue and flags.

A button such as **Open Dialogue / Feedback** may open a larger workspace inside Quest Builder for writing ordered lines without crowding the block popup.

## Validation Requirements

Before exporting real quest content, validation should report at least:

```text
missing required target ID for a structured action
missing condition subject/value where required
completion block without a completion condition
outcome referring to an unknown flag, item, quest, route or scene
block referring to a missing dialogue record
dialogue record with no lines
line referring to an unknown portrait/audio asset where asset validation is available
Capra failure feedback with no displayed message
unconnected required flow block
```

The app must distinguish between a missing external referenced asset and missing quest-owned dialogue content.

## Implementation Order

The next authoring implementation should proceed in controlled stages:

1. Preserve the existing visual flow and explicit connection model.
2. Define the export-safe structured action, condition and outcome draft shape.
3. Convert the existing block editor fields into structured contextual sections without creating a new module.
4. Add Quest-scoped Dialogue / Feedback record editing from relevant blocks.
5. Add validation for missing conditions, outcomes and dialogue links.
6. Integrate connected-project-folder saving and canonical Quest/Sidequest indexes according to the project-file contracts.
7. Consider shared dialogue-library extraction only after real repeated-content needs are demonstrated.

## Scope Protection

Do not build in the first pass:

- a separate Dialogue Library app;
- a branching conversation engine;
- voice recording management system;
- localisation pipeline;
- global reusable dialogue extraction;
- complex scripting language;
- automatic conversion of every failure response into a flow card.

The first goal is a usable Quest Builder that lets the creator author complete, understandable Quest steps in one place.