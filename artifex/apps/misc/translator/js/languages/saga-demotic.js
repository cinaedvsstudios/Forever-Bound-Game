/*
  Forever Bound — Saga-Demotic renderer module
  --------------------------------------------
  Renders Saga-Demotic transliteration and reversible RTL Display Encoding Keys
  using the approved Demotic-inspired glyph chart. Saga-Demotic remains a
  fictional Forever Bound display system, not a historical Demotic translator.
*/
(function registerSagaDemotic() {
  "use strict";

  window.ScriptRendererLanguages = window.ScriptRendererLanguages || {};
  window.ScriptRendererLanguages.items = window.ScriptRendererLanguages.items || {};

  /*
    Coordinates point at the compact atlas derived from the approved glyph chart.
    Locked chart positions are retained here for reference:
    row 1: r n m f p b w
    row 2: y e i ḏ d ṯ ṱ
    row 3: t k g q š s l
    row 4: h ḥ ḫ ẖ [blank] ꜣ ꜥ
  */
  const glyphMap = {
    r:       { x: 8,   y: 23,  w: 77,  h: 69 },
    n:       { x: 93,  y: 17,  w: 86,  h: 81 },
    m:       { x: 187, y: 13,  w: 72,  h: 88 },
    f:       { x: 267, y: 18,  w: 106, h: 79 },
    p:       { x: 381, y: 23,  w: 78,  h: 68 },
    b:       { x: 467, y: 10,  w: 103, h: 95 },
    w:       { x: 578, y: 8,   w: 86,  h: 99 },
    y:       { x: 672, y: 20,  w: 99,  h: 75 },
    e:       { x: 779, y: 16,  w: 59,  h: 83 },
    i:       { x: 8,   y: 123, w: 57,  h: 89 },
    "ḏ":     { x: 73,  y: 116, w: 62,  h: 103 },
    d:       { x: 143, y: 115, w: 81,  h: 106 },
    "ṯ":     { x: 232, y: 125, w: 119, h: 85 },
    "ṱ":     { x: 359, y: 119, w: 97,  h: 98 },
    t:       { x: 464, y: 140, w: 99,  h: 56 },
    k:       { x: 571, y: 137, w: 101, h: 61 },
    g:       { x: 680, y: 136, w: 108, h: 63 },
    q:       { x: 796, y: 133, w: 75,  h: 70 },
    "š":     { x: 8,   y: 232, w: 77,  h: 97 },
    s:       { x: 93,  y: 241, w: 58,  h: 79 },
    l:       { x: 159, y: 232, w: 67,  h: 97 },
    h:       { x: 234, y: 247, w: 87,  h: 66 },
    "ḥ":     { x: 329, y: 229, w: 61,  h: 103 },
    "ḫ":     { x: 398, y: 248, w: 72,  h: 65 },
    "ẖ":     { x: 478, y: 239, w: 91,  h: 83 },
    "ꜣ":     { x: 577, y: 246, w: 106, h: 69 },
    "ꜥ":     { x: 691, y: 232, w: 79,  h: 97 },
    space:   { x: 778, y: 234, w: 32,  h: 92 }
  };

  const signTokens = [
    "ꜣ", "ꜥ", "b", "p", "f", "m", "n", "r", "h", "ḥ", "ḫ", "ẖ",
    "s", "š", "q", "k", "g", "t", "ṯ", "ṱ", "d", "ḏ", "w", "y",
    "e", "i", "l"
  ];
  const signSet = new Set(signTokens);
  const tokenSet = new Set([...signTokens, "space"]);

  const assetIdAliases = {
    sd_aleph: "ꜣ",
    sd_ayin: "ꜥ",
    sd_b: "b",
    sd_p: "p",
    sd_f: "f",
    sd_m: "m",
    sd_n: "n",
    sd_r: "r",
    sd_h: "h",
    sd_h_dot: "ḥ",
    sd_kh: "ḫ",
    sd_h_under: "ẖ",
    sd_s: "s",
    sd_sh: "š",
    sd_q: "q",
    sd_k: "k",
    sd_g: "g",
    sd_t: "t",
    sd_tj: "ṯ",
    sd_t_final: "ṱ",
    sd_t_pronounced_final: "ṱ",
    sd_d: "d",
    sd_dj: "ḏ",
    sd_w: "w",
    sd_y: "y",
    sd_e: "e",
    sd_i: "i",
    sd_l: "l"
  };

  function pushWordGap(tokens) {
    const last = tokens[tokens.length - 1];
    if (tokens.length > 0 && last !== "space" && last !== "linebreak") {
      tokens.push("space");
    }
  }

  function pushLinebreak(tokens) {
    while (tokens[tokens.length - 1] === "space") tokens.pop();
    if (tokens.length > 0 && tokens[tokens.length - 1] !== "linebreak") {
      tokens.push("linebreak");
    }
  }

  function trimTrailingSeparators(tokens) {
    while (["space", "linebreak"].includes(tokens[tokens.length - 1])) tokens.pop();
  }

  function normaliseText(text) {
    return text.normalize("NFC").toLocaleLowerCase();
  }

  function parseTransliteration(rawText) {
    const text = normaliseText(rawText);
    const tokens = [];
    const unsupported = [];

    for (const character of text) {
      if (signSet.has(character)) {
        tokens.push(character);
      } else if (/\s/.test(character)) {
        character === "\n" ? pushLinebreak(tokens) : pushWordGap(tokens);
      } else if (/[.,;:!?]/.test(character)) {
        pushWordGap(tokens);
      } else if (character !== "-") {
        unsupported.push(character);
      }
    }

    trimTrailingSeparators(tokens);
    return { tokens, unsupported, normalised: text };
  }

  function parseEncodingKey(rawText) {
    const text = rawText.normalize("NFC").replace(/^\s*rtl\s*:\s*/i, "");
    const prepared = text
      .replace(/\r?\n/g, " __linebreak__ ")
      .replace(/\|/g, " space ")
      .replace(/-/g, " ");
    const items = prepared.trim().split(/\s+/).filter(Boolean);
    const tokens = [];
    const unsupported = [];

    for (const rawItem of items) {
      const item = rawItem.toLocaleLowerCase();
      if (rawItem === "__linebreak__") {
        pushLinebreak(tokens);
      } else if (["space", "gap", "[space]", "[gap]"].includes(item)) {
        pushWordGap(tokens);
      } else if (tokenSet.has(item)) {
        tokens.push(item);
      } else if (assetIdAliases[item]) {
        tokens.push(assetIdAliases[item]);
      } else if (item === "rtl:") {
        continue;
      } else {
        unsupported.push(rawItem);
      }
    }

    trimTrailingSeparators(tokens);
    return { tokens, unsupported, normalised: text };
  }

  window.ScriptRendererLanguages.items["saga-demotic"] = {
    id: "saga-demotic",
    title: "",
    kicker: "Saga-Demotic — Archive",
    description: "",
    ready: true,
    direction: "rtl",
    defaultSpriteSheet: "./assets/saga-demotic-glyph-atlas.svg",
    spriteSheetDescription: "Included Saga-Demotic glyph chart atlas loaded.",
    assetNote: "Right-to-left display script. Renderer text accepts canonical transliteration; Glyph tokens accepts a saved RTL Display Encoding Key.",
    glyphMap,
    tokenSeparatorLabel: "space",
    inputHelp: {
      renderer: "Paste canonical Saga-Demotic transliteration, for example “ꜣḫw sḫꜣw rn wn sbꜣ.” The visible glyph line renders right to left.",
      tokens: "Paste a reversible Display Encoding Key, for example “RTL: ꜣ-ḫ-w | s-ḫ-ꜣ-w | r-n | w-n | s-b-ꜣ”."
    },
    examples: {
      renderer: "ꜣḫw sḫꜣw rn wn sbꜣ.",
      tokens: "RTL: ꜣ-ḫ-w | s-ḫ-ꜣ-w | r-n | w-n | s-b-ꜣ"
    },
    parse(input, mode) {
      return mode === "tokens" ? parseEncodingKey(input) : parseTransliteration(input);
    }
  };
})();
