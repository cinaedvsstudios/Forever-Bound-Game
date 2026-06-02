# Forever Bound — Inscription Renderer

A compact charcoal, purple and gold HTML/JavaScript renderer for creating screenshotable inscriptions from sprite-sheet tiles. The interface is designed as a centred app-style card: choose a script tradition, paste renderer input, render it, then toggle the result between white-on-black and black-on-white for capture or export.

## Current status

- The interface includes three separated language tabs:
  - **Runispeleus** — Mel's scroll-language display layer; JavaScript placeholder ready for its atlas mapping.
  - **Saga-Demotic** — Egyptian archive display layer; working right-to-left renderer included.
  - **Volkhv–Tartessian** — Nyx's family ritual script; working renderer included.
- `js/languages/volkhv-tartessian.js` contains the complete token parser and cell coordinates for the finished Volkhv–Tartessian glyph chart.
- `js/languages/saga-demotic.js` contains the complete token parser and atlas coordinates for the approved Saga-Demotic glyph chart.
- Each script tradition remains isolated in its own file under `js/languages/`.

## How to run it

The page is static, but use a local web server so the canvas can safely export PNG images from the sprite sheet.

From this folder, run one of:

```bash
python -m http.server 8080
```

or serve it through VS Code Live Server, Vite, GitHub Pages or the Artifex app.

Then open `http://localhost:8080` in the browser.

## Volkhv–Tartessian input modes

### Renderer text

This accepts paste-ready renderer wording, for example:

```text
Khrn paareeoo.
Khro ueronaŕkee.
Khro {Niks}.
```

Rules already implemented:

- Normal spaces render as the break/seal glyph.
- Phrase-final periods render as the break/seal glyph.
- `{...}` creates opening and closing break/seal glyphs without duplicating adjacent seals.
- The renderer normalises `w → u`, `v → b → p-family`, `y → i`, `x → ks`, `c/g → k-family`, `b → p-family`, and `d → t-family`.
- Syllabic tokens use longest-match parsing so `pa`, `ko` and `tu` are chosen before standalone stop signs.

### Glyph tokens

This accepts exact tokens separated by spaces, for example:

```text
k h r n space pa a r e e o o space
```

Use `space`, `seal`, `[space]`, `[seal]`, or `.` to insert the break/seal glyph.

## Saga-Demotic input modes

### Renderer text

This accepts canonical Saga-Demotic transliteration and renders it right-to-left using the approved fixed display signs.

```text
ꜣḫw sḫꜣw rn wn sbꜣ.
```

Implemented signs:

```text
r n m f p b w
y e i ḏ d ṯ ṱ
t k g q š s l
h ḥ ḫ ẖ ꜣ ꜥ
```

The chart's row 4, column 5 is blank and unused. Word gaps are preserved in the reversible display version. Punctuation is not given a decorative display sign.

### Display Encoding Key

The **Glyph tokens** input mode accepts the reversible key format from the Saga-Demotic translator:

```text
RTL: ꜣ-ḫ-w | s-ḫ-ꜣ-w | r-n | w-n | s-b-ꜣ
```

The key remains in logical reading order. The shared renderer reverses the rendered sign order visually because Saga-Demotic is marked as right-to-left.

## Included files

```text
index.html
styles.css
assets/
  volkhv-tartessian-glyph-chart.png
  saga-demotic-glyph-atlas.svg
js/
  app.js
  languages/
    volkhv-tartessian.js
    runispeleus.js
    saga-demotic.js
```

## Replacing a sprite sheet

The Upload/Replace sheet button accepts an image at runtime. It currently expects the same atlas layout and coordinates as the included asset for the selected script tradition. When a new trimmed atlas or a differently arranged sheet is used, update only the relevant `glyphMap` in its file under `js/languages/`.

## UI preview note

`index.html` includes the interface styling inline as well as in `styles.css`, so the page keeps its intended charcoal/purple/gold appearance when opened as a standalone HTML preview. The language parsing and glyph mapping remain separated into their own JavaScript files for editing.
