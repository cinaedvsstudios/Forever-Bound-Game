# Object Archetype Icons

Put custom PNG icons for the Archetype Object Creator quick-add/template cards in this folder.

Expected path:

```text
artifex/apps/archetype-object-creator/v1/icons/object-archetypes/
```

The app looks for PNG filenames matching the template IDs below. If a PNG is missing, the creator falls back to the built-in temporary symbol.

## Required PNG filenames

```text
person_static.png
person_npc_basic.png
person_npc_moving.png
person_vendor_job.png
person_companion.png
person_player_full.png
person_foe_human.png
person_thrall.png
person_caster.png
creature_foe.png
boss_bellator.png
static_prop.png
door_exit.png
pickup.png
searchable_cache.png
throwable_object.png
marker.png
hazard.png
```

## Colour groups

```text
people = normal people / normal NPC templates
hero = player / Mel-type templates
hostile-human = guards, bandits, human foes
possessed = possessed NPCs / Thralls
caster = ritualists / spell users
creature = animals / creature foes
boss = Bellator / boss objects
prop = static props
door = doors and exits
pickup = inventory pickups
cache = searchable caches
interactable = throwable or interactable objects
marker = stone markers / map markers
hazard = traps and environmental hazards
```

## Icon guidance

Use transparent PNGs if possible. A square canvas works best, around 256×256 or 512×512. Keep the silhouette readable at small size. Do not put text inside the PNG, because the template card already displays the object name and category.