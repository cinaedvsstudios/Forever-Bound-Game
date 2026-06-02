/*
  Forever Bound — Volkhv–Tartessian renderer module
  -------------------------------------------------
  Edit this file when the Volkhv–Tartessian atlas or token rules change.
  The supplied atlas coordinates point at the finished chart image included in /assets.
*/
(function registerVolkhvTartessian() {
  "use strict";

  window.ScriptRendererLanguages = window.ScriptRendererLanguages || {};
  window.ScriptRendererLanguages.items = window.ScriptRendererLanguages.items || {};

  const glyphMap = {
    a:     { x: 4,   y: 87,  w: 72, h: 60 },
    e:     { x: 4,   y: 154, w: 72, h: 62 },
    i:     { x: 4,   y: 223, w: 72, h: 57 },
    o:     { x: 4,   y: 287, w: 72, h: 59 },
    u:     { x: 4,   y: 353, w: 72, h: 59 },

    s:     { x: 170, y: 87,  w: 69, h: 60 },
    "ś":   { x: 170, y: 154, w: 69, h: 62 },
    z:     { x: 170, y: 223, w: 69, h: 57 },
    h:     { x: 170, y: 287, w: 69, h: 59 },
    "ŕ":   { x: 170, y: 353, w: 69, h: 59 },
    p:     { x: 171, y: 422, w: 69, h: 59 },

    n:     { x: 338, y: 87,  w: 61, h: 60 },
    m:     { x: 338, y: 154, w: 61, h: 62 },
    l:     { x: 338, y: 223, w: 61, h: 57 },
    r:     { x: 338, y: 287, w: 61, h: 59 },
    k:     { x: 338, y: 353, w: 61, h: 59 },
    t:     { x: 338, y: 424, w: 62, h: 59 },

    ka:    { x: 491, y: 87,  w: 79, h: 60 },
    ke:    { x: 491, y: 155, w: 79, h: 61 },
    ki:    { x: 491, y: 223, w: 79, h: 57 },
    ko:    { x: 491, y: 287, w: 79, h: 59 },
    ku:    { x: 491, y: 353, w: 79, h: 60 },
    space: { x: 493, y: 426, w: 76, h: 57 },

    pa:    { x: 667, y: 87,  w: 70, h: 60 },
    pe:    { x: 667, y: 155, w: 70, h: 61 },
    pi:    { x: 667, y: 223, w: 70, h: 57 },
    po:    { x: 667, y: 287, w: 70, h: 59 },
    pu:    { x: 667, y: 353, w: 70, h: 60 },

    ta:    { x: 838, y: 87,  w: 72, h: 60 },
    te:    { x: 838, y: 155, w: 72, h: 61 },
    ti:    { x: 838, y: 223, w: 72, h: 57 },
    to:    { x: 838, y: 287, w: 72, h: 59 },
    tu:    { x: 838, y: 353, w: 72, h: 60 }
  };

  const twoCharacterTokens = [
    "ka", "ke", "ki", "ko", "ku",
    "pa", "pe", "pi", "po", "pu",
    "ta", "te", "ti", "to", "tu"
  ];
  const oneCharacterTokens = ["a", "e", "i", "o", "u", "s", "ś", "z", "h", "ŕ", "n", "m", "l", "r", "k", "p", "t"];
  const tokenSet = new Set([...twoCharacterTokens, ...oneCharacterTokens, "space"]);

  function normalizeForGlyphs(text) {
    return text
      .normalize("NFC")
      .toLocaleLowerCase()
      .replaceAll("w", "u")
      .replaceAll("v", "b")
      .replaceAll("y", "i")
      .replaceAll("x", "ks")
      .replace(/[cg]/g, "k")
      .replace(/b/g, "p")
      .replace(/d/g, "t");
  }

  function pushSeal(tokens, allowAtBeginning) {
    const last = tokens[tokens.length - 1];
    if (tokens.length === 0 && allowAtBeginning) {
      tokens.push("space");
    } else if (tokens.length > 0 && last !== "space" && last !== "linebreak") {
      tokens.push("space");
    }
  }

  function pushLinebreak(tokens) {
    while (tokens[tokens.length - 1] === "linebreak") {
      tokens.pop();
    }
    if (tokens.length > 0) {
      tokens.push("linebreak");
    }
  }

  function parseRendererText(rawText) {
    const text = normalizeForGlyphs(rawText);
    const tokens = [];
    const unsupported = [];
    let index = 0;

    while (index < text.length) {
      const character = text[index];

      if (character === "{") {
        pushSeal(tokens, true);
        index += 1;
        continue;
      }
      if (character === "}") {
        pushSeal(tokens, false);
        index += 1;
        continue;
      }
      if (character === ".") {
        pushSeal(tokens, false);
        index += 1;
        continue;
      }
      if (character === "\n") {
        pushLinebreak(tokens);
        index += 1;
        continue;
      }
      if (/\s/.test(character)) {
        pushSeal(tokens, false);
        index += 1;
        continue;
      }
      if (character === "-") {
        index += 1;
        continue;
      }

      const pairedToken = twoCharacterTokens.find((token) => text.startsWith(token, index));
      if (pairedToken) {
        tokens.push(pairedToken);
        index += pairedToken.length;
        continue;
      }
      if (oneCharacterTokens.includes(character)) {
        tokens.push(character);
        index += 1;
        continue;
      }

      unsupported.push(character);
      index += 1;
    }

    while (tokens[tokens.length - 1] === "linebreak") {
      tokens.pop();
    }
    return { tokens, unsupported, normalised: text };
  }

  function parseTokenSequence(rawText) {
    const tokens = [];
    const unsupported = [];
    const items = rawText
      .normalize("NFC")
      .replace(/\n/g, " __linebreak__ ")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    for (const rawItem of items) {
      const item = rawItem.toLocaleLowerCase();
      if (rawItem === "__linebreak__") {
        pushLinebreak(tokens);
      } else if (["space", "seal", "[seal]", "[space]", "."].includes(item)) {
        pushSeal(tokens, false);
      } else if (tokenSet.has(item)) {
        tokens.push(item);
      } else {
        unsupported.push(rawItem);
      }
    }
    return { tokens, unsupported, normalised: rawText };
  }

  window.ScriptRendererLanguages.items["volkhv-tartessian"] = {
    id: "volkhv-tartessian",
    title: "",
    kicker: "Volkhv–Tartessian",
    description: "",
    ready: true,
    direction: "ltr",
    defaultSpriteSheet: "./assets/volkhv-tartessian-glyph-chart.png",
    spriteSheetDescription: "Included finished Volkhv–Tartessian chart loaded.",
    assetNote: "Upload a replacement chart only when it uses the same glyph-cell positions, or edit the coordinate map in js/languages/volkhv-tartessian.js.",
    glyphMap,
    tokenSeparatorLabel: "space",
    inputHelp: {
      renderer: "",
      tokens: "Paste tokens separated by spaces, such as “k h r o space n a ŕ ke e space”. Use “space” or “seal” for the break/seal glyph."
    },
    examples: {
      renderer: "Khrn paareeoo.",
      tokens: "k h r n space pa a r e e o o space\nk h r o space n a ŕ ke e space"
    },
    parse(input, mode) {
      return mode === "tokens" ? parseTokenSequence(input) : parseRendererText(input);
    }
  };
})();
