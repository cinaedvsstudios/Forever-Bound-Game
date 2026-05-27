# Colour and Display Rules

## Purpose

This document preserves the starter colour and display rules from the older docs folder and adds the current Artifex UI branding rules used by the editor modules.

## Base Display

Default design frame:

- Logical size: 2400 × 1080
- Aspect ratio: 20:9
- Intended use: horizontal / landscape phone-first layout
- Scaling: preserve aspect ratio with black borders when needed

## Future Display Presets

- Phone Wide: 20:9
- Phone Classic: 19.5:9
- Standard Video: 16:9
- Fill Screen: future option, only after the fixed-frame version works

## Starter Colour Scheme

- Background black: `#070506`
- Deep brown panel: `#1f1410`
- Dark purple: `#240d36`
- Purple: `#583487`
- Copper: `#b66a3c`
- Light copper / peach: `#e89068`
- Bronze / gold: `#a97a36`
- Parchment: `#f8f0c8`
- Text cream: `#fff6d9`
- Corruption green: `#29e36c`
- Holy blue: `#87dfff`
- Danger red: `#cc3131`
- Job yellow: `#d6a24c`

## Colour Meaning

- Green = evil, corruption, possession, Lethemar
- Purple = Mel, Songspells, good personal magic
- Bright blue = Aetheris, holy energy, healing
- Red = boss danger
- Yellow = Jobs, Errands, rewards, Silver activity
- Copper / bronze = ancient UI, title branding, borders

## Artifex Tool UI Branding Rules

These rules apply to Artifex editor tools, including Project Manager, Creation Guide, Scene Editor, Quest Builder, Puzzle Creator, Effect Editor, Archetype Object Creator, Sprite Wizard, and future mini-apps.

### Global app mark / fallback logo

The shared Artifex app logo is the rune `ᚠ` displayed at a 45 degree angle.

Use the proper image logo when a module has a valid Artifex logo asset available. If no image logo is available, use the rotated `ᚠ` mark as the fallback logo instead of inventing a new symbol or leaving the logo space blank.

Recommended CSS pattern:

```css
.artifex-logo-fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transform: rotate(45deg);
  font-family: serif;
  font-weight: 700;
  line-height: 1;
}
```

The fallback mark belongs to the whole Artifex app shell. Module-specific icons may still be used beside menus, cards, libraries, or tool labels, but they should not replace the shared Artifex logo mark.

### Standard app header layout

Every Artifex app should use the same header order:

```text
Logo / app title → version pill → vertical divider → main menu
```

The version must always appear as a compact pill immediately after the app title, before the divider and before the main menu. Do not place the version badge at the far right, in the footer, or inside a settings panel.

The main menu should use compact pill-style menu buttons where space allows.

### Overall UI tone

- The UI should feel ancient, magical, crafted, and slightly arcane, not flat or generic.
- Panels should use dark brown / near-black surfaces with parchment, bronze, copper, and soft gold text.
- The default editor chrome should remain dark and warm: black, deep brown, bronze, gold, parchment, and muted cream.
- Module-specific accent colours identify the current tool family. They must not become a user-facing theme picker unless that is explicitly required.

### Module accent colours

Use these exact module accent meanings:

```text
Project Manager / Project Editor: yellow-gold accent
Creation Guide / creator setup tools: grey / neutral accent
Scene Editor: purple accent
Quest Builder: green accent
Puzzle Creator: green accent
Effect Editor: cyan-blue accent
Archetype Object Creator: red accent
Hub / global shell: bronze / copper Artifex accent unless a specific hub treatment is defined
```

The earlier phrase “Project / Library tools: gold-green accent” should not be used because it is ambiguous. Project Manager is yellow/gold. Quest and Puzzle tools are green. Shared library surfaces inside Project Manager may use the Project Manager gold chrome while showing green status/details for quest or puzzle content where useful.

Accent colour should appear on active states, selected borders, glowing indicators, helper dots, and key module identity details. It should not replace the base bronze/gold Artifex look.

### Typography and text size

- Main tool title: large serif fantasy title, usually `ARTIFEX`.
- Section/card titles: serif, uppercase, letter-spaced, around 13px in dense editor panels.
- Labels, compact controls, helper buttons, outputs, and side-panel body text: around 11px.
- Small metadata, hints, diagnostics, and secondary notes: around 9–10px.
- Text should be consistent inside a panel. Do not mix multiple arbitrary sizes in the same control group.
- Use minimal text on controls wherever the icon/emoji plus tooltip is clear enough.

### Cards and panels

- Cards should use rounded corners, dark surfaces, and thin bronze/copper borders.
- Standard editor cards should use roughly 14–16px border radius.
- Card headers should include a collapse/expand control when the card is long or part of a dense side panel.
- Collapse buttons should use compact emoji/double-arrow style controls, with mouseover tooltips.
- Related helper presets should be grouped into one card, separated by internal section headers, not scattered across multiple separate cards.

### Buttons and controls

- Buttons should be rounded and tactile, normally around 10–13px border radius.
- Tiny utility buttons may use around 8px radius.
- Buttons should use dark bronze/brown gradients by default.
- Active buttons should glow using the current module accent colour.
- Selected cards, active objects, chosen layers, selected brush thumbnails, active ramp handles, focused inputs, and chosen controls should use the current module accent border/glow.
- Destructive buttons may use red/pink text or border accents but should still fit the Artifex theme.

### Emoji / minimal text rule

- Toolbars and dense action rows should prefer emojis, icons, or very short labels.
- Use an emoji or symbol when the action is simple: pause/play, snapshot, clear, save, delete, underlay, performance mode, collapse, expand, move up, move down, duplicate, show/hide, reset, zoom target, etc.
- If text is needed, keep it short, such as `BG`, `Guides`, `Save`, `Library`, or `SNAP`.
- Avoid long button labels in dense panels. Move explanation into the tooltip.
- Every button, icon-only control, slider, select, and important input must have a mouseover tooltip via the `title` attribute.

### Slider and input rules

- Sliders should have visible numeric output nearby when the value matters.
- Every slider must have a tooltip explaining what it controls.
- Direction/rotation sliders may include snap toggles when useful.
- Snap controls should be clear and compact, such as `SNAP`, with tooltip text explaining the snap behaviour.
- Input/select focus state should use the module accent border/glow.

### Background / guides / underlay controls

- Background controls should stay compact. Use `BG` as the label and use visual state to show dark, white, or underlay/rainbow mode.
- Guide controls should say `Guides`; the active state should be shown by glow, not by appending `On` or `Off` in the button text.
- Underlay load controls should use a compact image emoji button, for example `🖼️`, with a tooltip.

### Bottom panel rules

- The bottom panel should have one collapse/expand control for the whole panel, not separate collapse controls on every bottom card.
- Layer actions in the bottom panel should prefer compact icons or emoji instead of wordy buttons.
- Keep related controls together: playback/export controls, layer controls, diagnostics.

## Reference Image

The old docs folder also contains:

```text
docs/color_palette_reference.jpg
```

Keep that image as a visual palette reference or archive it with the older docs once the documentation migration is complete.
