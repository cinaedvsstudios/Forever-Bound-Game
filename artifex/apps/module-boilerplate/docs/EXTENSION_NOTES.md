# Extension Notes

## Recommended Conversion Workflow

When converting this blank boilerplate into a real Artifex module:

1. Rename the folder.
2. Update `module-config.js`.
3. Rename visible UI labels in `index.html`.
4. Replace the generic record schema in `module-state.js`.
5. Replace the side-panel fields in `module-ui.js`.
6. Replace the canvas preview in `module-renderer.js`.
7. Replace starter templates in `module-library.js`.
8. Update this README with module-specific rules.

## Keep From Boilerplate

The following pieces are meant to survive across most modules:

- File / Edit / View / Insert / Help menu pattern
- left inspector panel
- central workspace
- bottom record list
- toast area
- import JSON
- export JSON
- browser-local save
- browser-local manager
- state normalisation
- selected-record workflow
- simple renderer loop

## Replace Per Module

The following pieces should usually become module-specific:

- JSON schema
- record categories
- inspector fields
- validation rules
- preview rendering
- library templates
- export naming
- help text

## Naming Convention

Use lowercase folder names with hyphens.

Good:

```text
font-packer
sprite-wizard
map-node-editor
dialogue-portrait-editor
```

Avoid:

```text
Font Packer
new_tool
ModuleTest
```

## Scope Rule

A new module should start with a small working loop:

```text
create one record
edit one record
preview one record
export JSON
import JSON
save locally
reload locally
```

After that works, add specialised features.
