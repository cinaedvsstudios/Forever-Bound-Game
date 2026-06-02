# Runispeleus

## Codice Cylinder Display Rules

### 1. Purpose and Scope

Runispeleus is the writing tradition used for **Mel’s mother’s Codice Cylinder of Yggdrasil** and associated scroll material in *Forever Bound*.

It is separate from Nyx’s Volkhv–Tartessian ritual dialect and separate from the Saga-Demotic artefact-inscription system.

### 2. Language and Script Relationship

Runispeleus is **not** a separate spoken language.

| Layer | Function |
| --- | --- |
| Reconstructed saga-Gaulish | The underlying spoken/written wording used for Mel’s mother’s scroll tradition. |
| Runispeleus script | A Norse-derived, Elder Futhark-based phonetic rune encoding of the saga-Gaulish wording. |

The translator creates the Gaulish wording and its Runispeleus rune text. The renderer does not translate or transliterate: it displays already-produced Unicode rune text as a clean copyable image.

### 3. In-Game Translation Logic

At the beginning of the game, Codice material may be displayed in Runispeleus runes. As Mel gains knowledge or relevant information, the same material may progressively reveal:

1. Runispeleus / Elder Futhark-derived runes.
2. Gaulish in Latin characters.
3. Ordinary English meaning once understood or required for gameplay.

### 4. Renderer Input

For the **Runispeleus** screen, paste the actual rune text supplied by the translator into the **Rune text** box.

Example:

```text
ᛈᛖᚱᛖ ᚨᚾᛗᛟᚾ ᚷᛁᛗᛟᚾᛟᛊ, ᛊᚲᛁᚨᛊ ᚱᛁᛏᚻᛗᚨᛏᚨᛊ ᛒᛚᛟᛊᚨᚾᛏᛁ
```

The right-hand panel displays the same runes in a clean normal rune font for **Copy image** or **Export PNG**.

Do not paste English or Gaulish Latin text into the renderer expecting it to convert the wording. Translation and rune conversion occur in the linked Runispeleus translator chat.

### 5. Fixed Translator Rune Mapping

The linked translator uses this fixed phonetic mapping when converting the Gaulish 0+ Latin-script line into Runispeleus:

| Gaulish Latin Sound | Runispeleus Rune |
| --- | --- |
| A | ᚨ |
| B | ᛒ |
| D | ᛞ |
| E | ᛖ |
| F | ᚠ |
| G | ᚷ |
| H | ᚻ |
| I | ᛁ |
| K / C | ᚲ |
| L | ᛚ |
| M | ᛗ |
| N | ᚾ |
| O | ᛟ |
| P | ᛈ |
| R | ᚱ |
| S | ᛊ |
| T | ᛏ |
| U / W / V | ᚢ |
| X | ᛉ |
| TH | ᚦ |
| NG | ᛜ |

`TH` and `NG` are combined sound mappings and should be handled before individual characters when the translator builds rune text.

### 6. Direction, Spacing and Punctuation

1. Runispeleus is displayed in the same left-to-right logical order as the stored Unicode rune string.
2. Spaces between words are preserved.
3. Existing punctuation in the pasted rune text is preserved in the rendered image.
4. The renderer does not replace, reinterpret or add rune signs.
5. The renderer does not perform Gaulish grammar or English translation.

### 7. Standard Scroll Example

| Layer | Text |
| --- | --- |
| English meaning | By winter’s breath, The counted shadows shall bloom. |
| Gaulish 0+ | Pere anmon gimonos, scias rithmatas blosanti |
| Runispeleus | ᛈᛖᚱᛖ ᚨᚾᛗᛟᚾ ᚷᛁᛗᛟᚾᛟᛊ, ᛊᚲᛁᚨᛊ ᚱᛁᛏᚻᛗᚨᛏᚨᛊ ᛒᛚᛟᛊᚨᚾᛏᛁ |

### 8. Separation from the Other Renderer Screens

| Screen | Used For | Renderer Input |
| --- | --- | --- |
| Runispeleus | Mel’s mother’s Codice Cylinder scrolls | Finished Unicode rune text |
| Demotic | Egyptian, Thoth-related, funerary and underworld artefacts | Saga-Demotic transliteration or saved Display Encoding Key |
| Volkhv–Tartessian | Nyx’s family spells, ritual tools and magical inscriptions | Renderer-ready ritual wording or glyph tokens |
