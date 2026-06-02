/*
  Forever Bound — inscription renderer shell
  The shared UI and canvas behaviour live here.
  Each script tradition owns its atlas mapping and parsing rules in js/languages/.
*/
(function initialiseRendererApp() {
  "use strict";

  const languages = window.ScriptRendererLanguages && window.ScriptRendererLanguages.items;
  if (!languages) {
    throw new Error("No language renderer modules were loaded.");
  }

  const elements = {
    languageSelect: document.querySelector("#language-select"),
    kicker: document.querySelector("#selected-language-kicker"),
    title: document.querySelector("#selected-language-title"),
    description: document.querySelector("#selected-language-description"),
    modeRadios: Array.from(document.querySelectorAll('input[name="input-mode"]')),
    sourceLabel: document.querySelector("#source-label"),
    sourceInput: document.querySelector("#source-input"),
    inputHelp: document.querySelector("#input-help"),
    renderButton: document.querySelector("#render-button"),
    sampleButton: document.querySelector("#sample-button"),
    clearButton: document.querySelector("#clear-button"),
    spriteUpload: document.querySelector("#sprite-upload"),
    spriteStatus: document.querySelector("#sprite-status"),
    assetNote: document.querySelector("#asset-note"),
    canvasSurround: document.querySelector("#canvas-surround"),
    resultCanvas: document.querySelector("#result-canvas"),
    emptyMessage: document.querySelector("#empty-message"),
    recognisedTokens: document.querySelector("#recognised-tokens"),
    renderWarning: document.querySelector("#render-warning"),
    contrastToggle: document.querySelector("#contrast-toggle"),
    contrastLabel: document.querySelector("#contrast-label"),
    glyphSize: document.querySelector("#glyph-size"),
    glyphSizeOutput: document.querySelector("#glyph-size-output"),
    savePng: document.querySelector("#save-png")
  };

  const ctx = elements.resultCanvas.getContext("2d");
  const state = {
    languageId: elements.languageSelect.value || "volkhv-tartessian",
    mode: "renderer",
    image: null,
    parsed: null,
    contrast: "dark",
    glyphHeight: Number(elements.glyphSize.value),
    rendered: false,
    objectUrl: null
  };

  function activeLanguage() {
    return languages[state.languageId];
  }

  function resetWarning() {
    elements.renderWarning.hidden = true;
    elements.renderWarning.textContent = "";
  }

  function showWarning(message) {
    elements.renderWarning.hidden = false;
    elements.renderWarning.textContent = message;
  }

  function setEmptyState(title, detail) {
    elements.resultCanvas.classList.remove("is-visible");
    elements.emptyMessage.style.display = "block";
    elements.emptyMessage.innerHTML = `<strong>${title}</strong><span>${detail}</span>`;
    elements.recognisedTokens.textContent = "—";
    elements.savePng.disabled = true;
    state.rendered = false;
  }

  function releaseObjectUrl() {
    if (!state.objectUrl) return;
    URL.revokeObjectURL(state.objectUrl);
    state.objectUrl = null;
  }

  function setInputMode(mode) {
    state.mode = mode;
    const language = activeLanguage();
    elements.sourceLabel.textContent = mode === "renderer" ? "Renderer input" : "Glyph token sequence";
    elements.inputHelp.textContent = language.inputHelp[mode];
  }

  function loadImageSource(source, statusMessage) {
    const languageWhenRequested = state.languageId;
    const image = new Image();
    image.onload = function handleSheetLoaded() {
      if (languageWhenRequested !== state.languageId) return;
      state.image = image;
      elements.spriteStatus.textContent = statusMessage;
      elements.renderButton.disabled = false;
      if (elements.sourceInput.value.trim()) renderCurrentInput();
    };
    image.onerror = function handleSheetError() {
      if (languageWhenRequested !== state.languageId) return;
      state.image = null;
      elements.spriteStatus.textContent = "Sprite sheet could not be loaded.";
      elements.renderButton.disabled = true;
      showWarning("The sprite sheet could not be opened. Use the project from a local server or upload a matching sheet.");
    };
    image.src = source;
  }

  function loadDefaultSheet(language) {
    releaseObjectUrl();
    state.image = null;
    if (!language.ready || !language.defaultSpriteSheet) {
      elements.spriteStatus.textContent = language.spriteSheetDescription;
      return;
    }
    elements.spriteStatus.textContent = "Loading included sprite sheet…";
    elements.renderButton.disabled = true;
    loadImageSource(language.defaultSpriteSheet, language.spriteSheetDescription);
  }

  function selectLanguage(languageId) {
    const language = languages[languageId];
    if (!language) return;

    state.languageId = languageId;
    state.parsed = null;
    state.image = null;
    elements.languageSelect.value = languageId;
    elements.kicker.textContent = language.kicker;
    elements.title.textContent = language.title;
    elements.description.textContent = language.description;
    elements.sourceLabel.textContent = state.mode === "renderer" ? "Renderer input" : "Glyph token sequence";
    elements.inputHelp.textContent = language.inputHelp[state.mode];
    elements.assetNote.textContent = language.assetNote;
    elements.spriteUpload.disabled = !language.ready;
    elements.renderButton.disabled = !language.ready;
    elements.sampleButton.disabled = !language.ready;
    elements.sourceInput.value = language.ready ? (language.examples[state.mode] || "") : "";
    resetWarning();

    if (language.ready) {
      setEmptyState("Preparing glyph preview…", "The example will appear as soon as the sprite sheet loads.");
    } else {
      setEmptyState("Mapping not added yet.", "This script has its own module ready for its glyph sheet and token map.");
    }
    loadDefaultSheet(language);
  }

  function processTileImage(rect, inkColour) {
    const tileCanvas = document.createElement("canvas");
    tileCanvas.width = rect.w;
    tileCanvas.height = rect.h;
    const tileContext = tileCanvas.getContext("2d", { willReadFrequently: true });
    tileContext.drawImage(state.image, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);
    const imageData = tileContext.getImageData(0, 0, rect.w, rect.h);
    const pixels = imageData.data;
    const ink = inkColour === "white" ? [255, 255, 255] : [0, 0, 0];

    for (let index = 0; index < pixels.length; index += 4) {
      const luminance = (pixels[index] * .2126) + (pixels[index + 1] * .7152) + (pixels[index + 2] * .0722);
      const alpha = Math.max(0, Math.min(255, Math.round((218 - luminance) * 2.75)));
      pixels[index] = ink[0];
      pixels[index + 1] = ink[1];
      pixels[index + 2] = ink[2];
      pixels[index + 3] = alpha;
    }
    tileContext.putImageData(imageData, 0, 0);
    return tileCanvas;
  }

  function linesFromTokens(tokens) {
    const lines = [[]];
    for (const token of tokens) {
      if (token === "linebreak") {
        if (lines[lines.length - 1].length) lines.push([]);
      } else {
        lines[lines.length - 1].push(token);
      }
    }
    return lines.filter((line) => line.length);
  }

  function renderCurrentInput() {
    const language = activeLanguage();
    resetWarning();
    if (!language.ready) return;
    if (!state.image) {
      showWarning("No sprite sheet is loaded for this writing system.");
      return;
    }

    const input = elements.sourceInput.value.trim();
    if (!input) {
      setEmptyState("Ready to render.", "Paste a glyph phrase or load the example.");
      return;
    }

    const parsed = language.parse(input, state.mode);
    state.parsed = parsed;
    const unsupported = parsed.unsupported || [];
    const tokens = parsed.tokens.filter((token) => token === "linebreak" || language.glyphMap[token]);

    if (!tokens.length) {
      setEmptyState("Nothing renderable found.", "The input did not contain mapped glyph tokens.");
      if (unsupported.length) showWarning(`Unrecognised input: ${unsupported.join(" ")}`);
      return;
    }

    let lines = linesFromTokens(tokens);
    if (language.direction === "rtl") {
      lines = lines.map((line) => line.slice().reverse());
    }

    const glyphHeight = state.glyphHeight;
    const tileGap = Math.max(1, Math.round(glyphHeight * .025));
    const lineGap = Math.round(glyphHeight * .29);
    const padding = Math.max(15, Math.round(glyphHeight * .32));
    const measuredLines = lines.map((line) => {
      const widths = line.map((token) => {
        const rect = language.glyphMap[token];
        return Math.round((rect.w / rect.h) * glyphHeight);
      });
      return {
        tokens: line,
        widths,
        width: widths.reduce((total, width) => total + width, 0) + tileGap * Math.max(0, line.length - 1)
      };
    });

    const maxWidth = Math.max(...measuredLines.map((line) => line.width));
    const canvasWidth = maxWidth + padding * 2;
    const canvasHeight = glyphHeight * measuredLines.length + lineGap * Math.max(0, measuredLines.length - 1) + padding * 2;
    elements.resultCanvas.width = canvasWidth;
    elements.resultCanvas.height = canvasHeight;

    const dark = state.contrast === "dark";
    ctx.fillStyle = dark ? "#070709" : "#ffffff";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    const inkColour = dark ? "white" : "black";

    measuredLines.forEach((line, lineIndex) => {
      let x = padding;
      const y = padding + lineIndex * (glyphHeight + lineGap);
      line.tokens.forEach((token, tokenIndex) => {
        const tile = processTileImage(language.glyphMap[token], inkColour);
        const width = line.widths[tokenIndex];
        ctx.drawImage(tile, x, y, width, glyphHeight);
        x += width + tileGap;
      });
    });

    elements.resultCanvas.classList.add("is-visible");
    elements.emptyMessage.style.display = "none";
    elements.savePng.disabled = false;
    state.rendered = true;
    elements.recognisedTokens.textContent = tokens.map((token) => token === "linebreak" ? "↵" : token).join(" · ");
    if (unsupported.length) showWarning(`Ignored unsupported input: ${Array.from(new Set(unsupported)).join(" ")}`);
  }

  function setContrast() {
    const dark = state.contrast === "dark";
    elements.canvasSurround.classList.toggle("is-dark", dark);
    elements.contrastToggle.classList.toggle("is-light", !dark);
    elements.contrastLabel.textContent = dark ? "White on black" : "Black on white";
    elements.contrastToggle.setAttribute("aria-label", dark ? "Switch to black inscription on white background" : "Switch to white inscription on black background");
    if (state.rendered) renderCurrentInput();
  }

  elements.languageSelect.addEventListener("change", () => selectLanguage(elements.languageSelect.value));
  elements.modeRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      if (!radio.checked) return;
      setInputMode(radio.value);
      const language = activeLanguage();
      elements.sourceInput.value = language.ready ? (language.examples[state.mode] || "") : "";
      if (state.image && language.ready) renderCurrentInput();
    });
  });
  elements.renderButton.addEventListener("click", renderCurrentInput);
  elements.sampleButton.addEventListener("click", () => {
    const language = activeLanguage();
    elements.sourceInput.value = language.examples[state.mode] || "";
    renderCurrentInput();
  });
  elements.clearButton.addEventListener("click", () => {
    elements.sourceInput.value = "";
    resetWarning();
    setEmptyState("Ready to render.", "Paste a glyph phrase or load the example.");
  });
  elements.sourceInput.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") renderCurrentInput();
  });
  elements.spriteUpload.addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    releaseObjectUrl();
    state.objectUrl = URL.createObjectURL(file);
    loadImageSource(state.objectUrl, `Using uploaded sheet: ${file.name}`);
  });
  elements.contrastToggle.addEventListener("click", () => {
    state.contrast = state.contrast === "dark" ? "light" : "dark";
    setContrast();
  });
  elements.glyphSize.addEventListener("input", () => {
    state.glyphHeight = Number(elements.glyphSize.value);
    elements.glyphSizeOutput.textContent = String(state.glyphHeight);
    if (state.rendered) renderCurrentInput();
  });
  elements.savePng.addEventListener("click", () => {
    if (!state.rendered) return;
    try {
      const link = document.createElement("a");
      link.download = `${state.languageId}-inscription.png`;
      link.href = elements.resultCanvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      showWarning("PNG export was blocked. Open through a local web server or GitHub Pages rather than directly from a file folder.");
    }
  });

  setContrast();
  selectLanguage(state.languageId);
})();
