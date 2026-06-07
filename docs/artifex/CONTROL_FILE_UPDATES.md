# Control File Updates for Archive Readiness Correction

Apply these after uploading the correction files.

## Files added / replaced

Replace:

```text
docs/artifex/10A-asset-library.md
```

Add:

```text
docs/artifex/19A-terminology-and-naming.md
docs/artifex/20A-template-game-reference-project.md
docs/artifex/21A-template-system.md
docs/artifex/22A-colour-and-display-rules.md
```

## 0A updates

Add these active reference rows:

| `docs/artifex/19A-terminology-and-naming.md` | Terminology and naming reference. | Active reference consolidating old `09` and `10`. |
| `docs/artifex/20A-template-game-reference-project.md` | Template Game connected reference project specification. | Active reference consolidating old `21`. |
| `docs/artifex/21A-template-system.md` | Template System reference/specification. | Active reference consolidating old `15`. |
| `docs/artifex/22A-colour-and-display-rules.md` | Colour and display rules reference. | Active visual/style reference consolidating old `18`. |

Update old-source/archive rows:

- `09-terminology.md` and `10-naming-brainstorm.md` → consolidated into `19A`; archive after acceptance.
- `15-template-system.md` → consolidated into `21A`; archive after acceptance.
- `18-color-and-display-rules.md` → consolidated into `22A`; archive after acceptance.
- `21-template-game-project-contract.md` → consolidated into `20A`; archive after acceptance.
- `14-asset-library.md` → missing feature detail consolidated into revised `10A`; archive after acceptance.

## 2A updates

Under Asset Library, add:

- support asset groups, including character/animation/portrait sets;
- search/filter by name, tag, type, status, project, character and scene/referring-record usage;
- preview image/audio/procedural-synth assets;
- track usage through the shared reference index;
- edit an existing generated synth through the shared popup where safe.

Add new sections or reference tasks:

### Terminology and Naming

Specification/reference: `docs/artifex/19A-terminology-and-naming.md`

- Resolve not-locked terms such as Station, Stitcher, Archetype Object Creator / Object Library, Actor/Entity and Build Game button text when UI implementation needs them.
- Do not delete naming alternatives until a term is deliberately rejected.

### Template Game Reference Project

Specification/reference: `docs/artifex/20A-template-game-reference-project.md`

- Build the populated connected Template Game after connected save/reference systems are reliable.
- Use the cross-app proof checklist before exposing Template Game as a Creation Guide choice.

### Template System

Specification/reference: `docs/artifex/21A-template-system.md`

- Decide whether Template System remains a maintained shared service or becomes a Creation Guide/Scene Editor feature.
- If retained, implement `artifex/templates/`, `templates.json`, starter scene/screen templates and template-to-project-record workflow.

### Colour and Display Rules

Specification/reference: `docs/artifex/22A-colour-and-display-rules.md`

- Use the exact palette, header, accent, typography, card, button, tooltip and bottom-panel rules during UI standardisation.
- Archive old `18-color-and-display-rules.md` only after `22A` is accepted.

## Archive readiness result

After these files are uploaded and 0A/2A are updated, the old docs named above can be archived as source evidence.
