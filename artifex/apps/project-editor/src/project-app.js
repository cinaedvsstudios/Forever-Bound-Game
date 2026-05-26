import { PROJECT_THEME, applyProjectTheme, getProjectThemeTailwindConfig } from './project-theme.js';

// Project Editor app bootstrap.
//
// Step 1 split note:
// This module is intentionally tiny for now. It gives the monolithic runtime a
// safe bridge into the extracted theme tokens before later split steps move the
// state, renderer, canvas, Stitcher, Build Prep, and IO logic into real modules.
//
// When index.html imports this file, it applies the Project / Library gold-green
// theme variables and exposes the theme for temporary compatibility with inline
// scripts that still live in the monolith.

applyProjectTheme();

window.ArtifexProjectTheme = PROJECT_THEME;
window.applyProjectTheme = applyProjectTheme;
window.getProjectThemeTailwindConfig = getProjectThemeTailwindConfig;

const versionTargets = [
  '#projectEditorVersionBadge',
  '[data-project-version-badge]'
];

for (const selector of versionTargets) {
  const el = document.querySelector(selector);
  if (el) el.textContent = PROJECT_THEME.versionLabel;
}

console.info('[Artifex Project Editor] Theme bootstrap loaded:', PROJECT_THEME.id);
