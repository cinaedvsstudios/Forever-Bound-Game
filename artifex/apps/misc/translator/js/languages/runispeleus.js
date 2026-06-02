/*
  Forever Bound — Runispeleus renderer module
  -------------------------------------------
  Runispeleus is Mel's Codice Cylinder writing tradition: reconstructed saga-Gaulish
  is encoded in Elder Futhark-derived Unicode runes by the translator, then pasted
  here as finished rune text for clean image rendering. This module does not translate.
*/
(function registerRunispeleus() {
  "use strict";

  window.ScriptRendererLanguages = window.ScriptRendererLanguages || {};
  window.ScriptRendererLanguages.items = window.ScriptRendererLanguages.items || {};

  const runeTokens = [
    "ᚨ", "ᛒ", "ᛞ", "ᛖ", "ᚠ", "ᚷ", "ᚻ", "ᛁ", "ᚲ", "ᛚ", "ᛗ",
    "ᚾ", "ᛟ", "ᛈ", "ᚱ", "ᛊ", "ᛏ", "ᚢ", "ᛉ", "ᚦ", "ᛜ"
  ];
  const punctuationTokens = [".", ",", ";", ":", "!", "?"];
  const supportedTokens = new Set([...runeTokens, ...punctuationTokens]);
  const glyphMap = {};

  function xmlEscape(value) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function buildNormalFontAtlas() {
    const tileHeight = 126;
    const runeWidth = 88;
    const punctuationWidth = 44;
    const gapWidth = 38;
    const tiles = [...runeTokens, ...punctuationTokens, "space"];
    let cursor = 0;
    const textItems = [];

    tiles.forEach((token) => {
      const width = token === "space" ? gapWidth : punctuationTokens.includes(token) ? punctuationWidth : runeWidth;
      glyphMap[token] = { x: cursor, y: 0, w: width, h: tileHeight };
      if (token !== "space") {
        const fontSize = punctuationTokens.includes(token) ? 58 : 82;
        textItems.push(`<text x="${cursor + (width / 2)}" y="83" text-anchor="middle" font-family="Segoe UI Historic, Noto Sans Runic, Noto Sans Symbols 2, serif" font-size="${fontSize}px" fill="#000">${xmlEscape(token)}</text>`);
      }
      cursor += width;
    });

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cursor}" height="${tileHeight}" viewBox="0 0 ${cursor} ${tileHeight}"><rect width="100%" height="100%" fill="#fff"/>${textItems.join("")}</svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  const normalFontAtlas = buildNormalFontAtlas();

  function pushSpace(tokens) {
    const last = tokens[tokens.length - 1];
    if (tokens.length && last !== "space" && last !== "linebreak") tokens.push("space");
  }

  function pushLinebreak(tokens) {
    while (tokens[tokens.length - 1] === "space") tokens.pop();
    if (tokens.length && tokens[tokens.length - 1] !== "linebreak") tokens.push("linebreak");
  }

  function trimTrailingSeparators(tokens) {
    while (["space", "linebreak"].includes(tokens[tokens.length - 1])) tokens.pop();
  }

  function parseRuneText(rawText) {
    const text = rawText.normalize("NFC");
    const tokens = [];
    const unsupported = [];

    for (const character of text) {
      if (supportedTokens.has(character)) {
        tokens.push(character);
      } else if (character === "\n") {
        pushLinebreak(tokens);
      } else if (/\s/.test(character)) {
        pushSpace(tokens);
      } else if (!["\r"].includes(character)) {
        unsupported.push(character);
      }
    }

    trimTrailingSeparators(tokens);
    return { tokens, unsupported, normalised: text };
  }

  window.ScriptRendererLanguages.items.runispeleus = {
    id: "runispeleus",
    title: "",
    kicker: "Runispeleus — Mel’s Codice Cylinder",
    description: "",
    ready: true,
    direction: "ltr",
    defaultSpriteSheet: normalFontAtlas,
    spriteSheetDescription: "Normal browser rune font renderer loaded.",
    assetNote: "Paste the finished Runispeleus rune text from the translator. This screen does not translate Gaulish into runes; it formats the supplied runes as a copyable image.",
    glyphMap,
    tokenSeparatorLabel: "space",
    inputHelp: {
      renderer: "Paste the actual Runispeleus Unicode runes supplied by the translator. The right panel renders the same runes as an image for copying or PNG export.",
      tokens: "Paste the actual Runispeleus Unicode runes supplied by the translator. Word spacing and punctuation are preserved in the rendered image."
    },
    examples: {
      renderer: "ᛈᛖᚱᛖ ᚨᚾᛗᛟᚾ ᚷᛁᛗᛟᚾᛟᛊ, ᛊᚲᛁᚨᛊ ᚱᛁᛏᚻᛗᚨᛏᚨᛊ ᛒᛚᛟᛊᚨᚾᛏᛁ",
      tokens: "ᛈᛖᚱᛖ ᚨᚾᛗᛟᚾ ᚷᛁᛗᛟᚾᛟᛊ, ᛊᚲᛁᚨᛊ ᚱᛁᛏᚻᛗᚨᛏᚨᛊ ᛒᛚᛟᛊᚨᚾᛏᛁ"
    },
    parse(input) {
      return parseRuneText(input);
    }
  };
})();