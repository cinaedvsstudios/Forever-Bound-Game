/*
  Forever Bound — language-specific reference controls
  ----------------------------------------------------
  Keeps each inscription renderer linked to its own translator chat and
  reference document without changing the shared canvas rendering engine.
*/
(function initialiseReferenceTools() {
  "use strict";

  const languageSelect = document.querySelector("#language-select");
  const translatorChatButton = document.querySelector("#translator-chat-button");
  const rulesButton = document.querySelector("#rules-button");
  const rulesDialog = document.querySelector("#rules-dialog");
  const rulesTitle = document.querySelector("#rules-dialog-title");
  const rulesLink = document.querySelector("#rules-md-link");
  const rulesContent = document.querySelector("#rules-content");
  const inputMode = document.querySelector(".mode-switch");
  const sourceLabel = document.querySelector("#source-label");
  const assetBox = document.querySelector(".asset-box");

  if (!languageSelect || !translatorChatButton || !rulesButton || !rulesDialog || !rulesContent) return;

  const referenceMap = {
    "volkhv-tartessian": {
      label: "Volkhv–Tartessian",
      chatUrl: "https://chatgpt.com/share/6a1f37fa-0614-83eb-af1d-98a373bdb4ae",
      rulesUrl: "./volkhv-tartessian-rules.md",
      rulesTitle: "Volkhv–Tartessian Rules"
    },
    "saga-demotic": {
      label: "Demotic",
      chatUrl: "https://chatgpt.com/share/6a1f38ec-5a18-83eb-8bbd-2732652b24d8",
      rulesUrl: "./demotic-rules.md",
      rulesTitle: "Demotic Rules"
    },
    runispeleus: {
      label: "Runispeleus",
      chatUrl: "https://chatgpt.com/share/6a1f6248-6b84-83eb-bfd8-1b0d3196c0e1",
      rulesUrl: "./runispeleus-rules.md",
      rulesTitle: "Runispeleus Rules"
    }
  };

  const markdownCache = new Map();

  function currentReference() {
    return referenceMap[languageSelect.value] || null;
  }

  function updateReferenceControls() {
    const reference = currentReference();
    const hasChat = Boolean(reference && reference.chatUrl);
    const hasRules = Boolean(reference && reference.rulesUrl);
    const directRuneInput = languageSelect.value === "runispeleus";
    translatorChatButton.hidden = !hasChat;
    translatorChatButton.setAttribute("aria-label", hasChat ? `Open ${reference.label} translator chat` : "No translator chat available");
    rulesButton.hidden = !hasRules;
    if (inputMode) inputMode.hidden = directRuneInput;
    if (assetBox) assetBox.hidden = directRuneInput;
    if (sourceLabel && directRuneInput) sourceLabel.textContent = "Rune text";
    if (hasRules) {
      rulesButton.setAttribute("aria-label", `Open ${reference.rulesTitle}`);
      rulesTitle.textContent = reference.rulesTitle;
      rulesLink.href = reference.rulesUrl;
    }
  }

  async function openRulesForCurrentLanguage(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const reference = currentReference();
    if (!reference || !reference.rulesUrl) return;
    rulesTitle.textContent = reference.rulesTitle;
    rulesLink.href = reference.rulesUrl;
    rulesContent.innerHTML = '<p class="rules-loading">Loading rules…</p>';
    try {
      let markdown = markdownCache.get(reference.rulesUrl);
      if (!markdown) {
        const response = await fetch(reference.rulesUrl);
        if (!response.ok) throw new Error(`Rules document unavailable (${response.status}).`);
        markdown = await response.text();
        markdownCache.set(reference.rulesUrl, markdown);
      }
      /* app.js exposes no formatter; its simple markdown result is reproduced safely below. */
      rulesContent.innerHTML = markdownToHtml(markdown);
    } catch (error) {
      rulesContent.innerHTML = '<p class="warning">The rules document could not be loaded.</p>';
    }
    rulesDialog.showModal();
  }

  function openTranslatorChat() {
    const reference = currentReference();
    if (!reference || !reference.chatUrl) return;
    window.open(reference.chatUrl, "foreverBoundTranslatorChat", "popup=yes,width=560,height=860,resizable=yes,scrollbars=yes");
  }

  function escapeHtml(value) {
    return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }

  function renderInlineMarkdown(value) {
    return escapeHtml(value)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>");
  }

  function tableRow(line) {
    return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
  }

  function markdownToHtml(markdown) {
    const lines = markdown.replace(/\r\n/g, "\n").split("\n");
    const html = [];
    let index = 0;
    let paragraph = [];
    let listType = null;
    let listItems = [];
    let codeLines = [];
    let inCodeBlock = false;

    function flushParagraph() {
      if (paragraph.length) {
        html.push(`<p>${renderInlineMarkdown(paragraph.join(" "))}</p>`);
        paragraph = [];
      }
    }
    function flushList() {
      if (listType && listItems.length) {
        html.push(`<${listType}>${listItems.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</${listType}>`);
        listType = null;
        listItems = [];
      }
    }
    function flushCode() {
      if (codeLines.length) {
        html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        codeLines = [];
      }
    }

    while (index < lines.length) {
      const trimmed = lines[index].trim();
      if (/^```/.test(trimmed)) {
        flushParagraph();
        flushList();
        if (inCodeBlock) flushCode();
        inCodeBlock = !inCodeBlock;
        index += 1;
        continue;
      }
      if (inCodeBlock) {
        codeLines.push(lines[index]);
        index += 1;
        continue;
      }
      if (trimmed.startsWith("|") && index + 1 < lines.length && /^\|?\s*:?-{3,}/.test(lines[index + 1].trim())) {
        flushParagraph();
        flushList();
        const headings = tableRow(trimmed);
        index += 2;
        const rows = [];
        while (index < lines.length && lines[index].trim().startsWith("|")) {
          rows.push(tableRow(lines[index]));
          index += 1;
        }
        html.push(`<div class="rules-table-wrap"><table><thead><tr>${headings.map((heading) => `<th>${renderInlineMarkdown(heading)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${renderInlineMarkdown(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
        continue;
      }
      if (!trimmed) {
        flushParagraph();
        flushList();
        index += 1;
        continue;
      }
      if (/^---+$/.test(trimmed)) {
        flushParagraph();
        flushList();
        html.push("<hr>");
        index += 1;
        continue;
      }
      if (/^###\s+/.test(trimmed)) {
        flushParagraph(); flushList(); html.push(`<h3>${renderInlineMarkdown(trimmed.replace(/^###\s+/, ""))}</h3>`); index += 1; continue;
      }
      if (/^##\s+/.test(trimmed)) {
        flushParagraph(); flushList(); html.push(`<h2>${renderInlineMarkdown(trimmed.replace(/^##\s+/, ""))}</h2>`); index += 1; continue;
      }
      if (/^#\s+/.test(trimmed)) {
        flushParagraph(); flushList(); html.push(`<h1>${renderInlineMarkdown(trimmed.replace(/^#\s+/, ""))}</h1>`); index += 1; continue;
      }
      if (/^-\s+/.test(trimmed)) {
        flushParagraph(); if (listType && listType !== "ul") flushList(); listType = "ul"; listItems.push(trimmed.replace(/^-\s+/, "")); index += 1; continue;
      }
      if (/^\d+\.\s+/.test(trimmed)) {
        flushParagraph(); if (listType && listType !== "ol") flushList(); listType = "ol"; listItems.push(trimmed.replace(/^\d+\.\s+/, "")); index += 1; continue;
      }
      flushList();
      paragraph.push(trimmed);
      index += 1;
    }
    flushCode();
    flushParagraph();
    flushList();
    return html.join("");
  }

  translatorChatButton.addEventListener("click", openTranslatorChat);
  rulesButton.addEventListener("click", openRulesForCurrentLanguage, true);
  languageSelect.addEventListener("change", updateReferenceControls);
  updateReferenceControls();
})();