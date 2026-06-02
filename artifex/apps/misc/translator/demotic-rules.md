# Demotic

## Saga-Demotic Archive Display Rules

### 1. Purpose and Scope

Demotic is the artefact-inscription system used for Egyptian, Thoth-related, funerary, underworld, temple, curse, relic, corrupted-object and ancient magical material in *Forever Bound*.

It is separate from Mel’s mother’s Gaulish / Runispeleus scroll tradition and separate from Nyx’s Volkhv–Tartessian ritual language.

### 2. Language and Display Layers

The system has two linked layers:

| Layer | Function |
| --- | --- |
| Saga-Demotic transliteration | Canonical wording and meaning, written in Egyptological-style Latin transliteration. |
| Demotic display script | Visible right-to-left artefact inscription, rendered from the fixed approved glyph chart. |

The display script is not a second spoken language or a new translation. It is a reversible visual rendering of the transliteration.

Saga-Demotic is a fictionalized, internally consistent story-language system. The locked glyph chart is inspired by Demotic sign forms, but new game text must not be presented as an academically verified historical Demotic inscription.

### 3. Core Rendering Rules

1. Each approved transliteration sound has exactly one locked display sign.
2. The visible inscription is rendered right-to-left.
3. Stored Display Encoding Keys remain in logical reading order and are not manually reversed.
4. Word gaps remain preserved in the base reversible inscription.
5. Repeated consonants repeat their matching glyph.
6. Do not introduce unapproved ligatures, contextual variants, determinatives or decorative replacement signs.
7. Surface styling may age, crack, stain, burn or corrupt the object, but must not change the underlying sign sequence.
8. Proper names and imported terms use one fixed stored display spelling once introduced.

### 4. Supported Transliteration Characters

The renderer accepts the following locked display signs:

| Transliteration Sound | Glyph Asset ID | Approved Chart Cell |
| --- | --- | --- |
| r | SD_R | row 1, col 1 |
| n | SD_N | row 1, col 2 |
| m | SD_M | row 1, col 3 |
| f | SD_F | row 1, col 4 |
| p | SD_P | row 1, col 5 |
| b | SD_B | row 1, col 6 |
| w | SD_W | row 1, col 7 |
| y | SD_Y | row 2, col 1 |
| e | SD_E | row 2, col 2 |
| i | SD_I | row 2, col 3 |
| ḏ | SD_DJ | row 2, col 4 |
| d | SD_D | row 2, col 5 |
| ṯ | SD_TJ | row 2, col 6 |
| ṱ | SD_T_FINAL | row 2, col 7 |
| t | SD_T | row 3, col 1 |
| k | SD_K | row 3, col 2 |
| g | SD_G | row 3, col 3 |
| q | SD_Q | row 3, col 4 |
| š | SD_SH | row 3, col 5 |
| s | SD_S | row 3, col 6 |
| l | SD_L | row 3, col 7 |
| h | SD_H | row 4, col 1 |
| ḥ | SD_H_DOT | row 4, col 2 |
| ḫ | SD_KH | row 4, col 3 |
| ẖ | SD_H_UNDER | row 4, col 4 |
| ꜣ | SD_ALEPH | row 4, col 6 |
| ꜥ | SD_AYIN | row 4, col 7 |

Row 4, column 5 of the approved chart is blank and unused.

`ṱ` and `ṯ` are separate locked signs and must not be merged.

### 5. Input Modes in the Renderer

#### Renderer Text

Paste the canonical Saga-Demotic transliteration. The renderer converts each recognised sound into its fixed display glyph and draws the visible inscription right-to-left.

Example:

```text
ꜣḫw sḫꜣw rn wn sbꜣ.
```

Spaces preserve word separation. Sentence punctuation ends the phrase but is not rendered as a newly invented decorative sign.

#### Glyph Tokens / Display Encoding Key

Paste the reversible Display Encoding Key supplied by the Demotic translator.

Example:

```text
RTL: ꜣ-ḫ-w | s-ḫ-ꜣ-w | r-n | w-n | s-b-ꜣ
```

Hyphens separate signs within one word. Vertical bars separate words. The renderer draws the sequence right-to-left while the stored key stays in readable logical order.

### 6. Canonical Seed Phrase and Terms

| English Concept | Saga-Demotic Form | Literal Sense |
| --- | --- | --- |
| dead / blessed dead / spirits | ꜣḫw | dead spirits or transformed spirits |
| remember | sḫꜣw | remember or keep in memory |
| name | rn | name or true identity |
| open / opens | wn | open or unseal |
| gate | sbꜣ | gate, portal or sealed entrance |

Canonical seed inscription:

```text
ꜣḫw sḫꜣw rn wn sbꜣ.
```

Literal sense: The spirits remember the name; it opens the gate.

### 7. Proper Names and Sekhemra

Established proper names remain recognisable in transliteration. When a name appears visually on an artefact, it must receive one fixed reusable Display Encoding Key.

`Sekhemra` is the established Forever Bound corruption substance or magical material. Keep the readable name unchanged unless a later locked in-world spelling replaces it.

### 8. Book of Thoth Use

Book of Thoth material should feel forbidden, absolute, ancient and dangerous. Suitable uses include soul-binding curses, corruption warnings, death commands, sealed knowledge and underworld decrees.

Book of Thoth artefacts still use this same locked Demotic display system unless a specific damaged, erased, mirrored or corrupted visual treatment is defined for that object.

### 9. Reverse Translation Chain

Every canonical visible inscription must remain recoverable through this chain:

```text
visible glyph sequence
→ Display Encoding Key
→ Saga-Demotic transliteration
→ literal meaning
→ original English phrase, where recorded
```

Any artwork treatment that breaks that chain is not a canonical base inscription.