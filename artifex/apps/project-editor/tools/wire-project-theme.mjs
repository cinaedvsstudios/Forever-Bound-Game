#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const appDir = resolve(__dirname, '..');
const indexPath = resolve(appDir, 'index.html');

let html = await readFile(indexPath, 'utf8');
let changed = false;

function insertOnce(marker, insertion, label) {
  if (html.includes(insertion.trim())) return;
  if (!html.includes(marker)) {
    throw new Error(`Cannot wire ${label}: marker not found: ${marker}`);
  }
  html = html.replace(marker, `${insertion}${marker}`);
  changed = true;
}

function replaceOnce(from, to, label) {
  if (!html.includes(from)) return;
  html = html.replace(from, to);
  changed = true;
  console.log(`updated ${label}`);
}

insertOnce(
  '    <script>\n        tailwind.config = {',
  '    <link rel="stylesheet" href="./src/project-theme-overrides.css">\n',
  'theme override stylesheet'
);

insertOnce(
  '</body>',
  '    <script type="module" src="./src/project-app.js"></script>\n',
  'project app bootstrap module'
);

replaceOnce("neonViolet: '#a855f7'", "neonViolet: '#d6a24c'", 'Tailwind neonViolet -> project gold');
replaceOnce("neonVioletGlow: '#c084fc'", "neonVioletGlow: '#f4c76a'", 'Tailwind neonVioletGlow -> soft gold');
replaceOnce("neonPink: '#ec4899'", "neonPink: '#9fba5a'", 'Tailwind neonPink -> project green');
replaceOnce("neonPinkGlow: '#f472b6'", "neonPinkGlow: '#c4df79'", 'Tailwind neonPinkGlow -> soft green');
replaceOnce("accentDark: '#221133'", "accentDark: '#5a3a12'", 'Tailwind accentDark -> deep gold');
replaceOnce(
  "'neon-glow': '0 0 15px rgba(168, 85, 247, 0.45)'",
  "'neon-glow': '0 0 15px rgba(214, 162, 76, 0.45)'",
  'Tailwind neon glow -> gold glow'
);
replaceOnce(
  "'neon-glow-pink': '0 0 15px rgba(236, 72, 153, 0.45)'",
  "'neon-glow-pink': '0 0 15px rgba(159, 186, 90, 0.35)'",
  'Tailwind pink glow -> green glow'
);

replaceOnce('background: #a855f7;', 'background: #d6a24c;', 'scrollbar hover colour');
replaceOnce('rgba(168, 85, 247, 0.08)', 'rgba(214, 162, 76, 0.08)', 'first grid colour');
replaceOnce('rgba(168, 85, 247, 0.08)', 'rgba(214, 162, 76, 0.08)', 'second grid colour');
replaceOnce('border-color: #a855f7;', 'border-color: #d6a24c;', 'active card border');
replaceOnce('box-shadow: 0 0 12px rgba(168, 85, 247, 0.35);', 'box-shadow: 0 0 12px rgba(214, 162, 76, 0.35);', 'active card glow');

if (!changed) {
  console.log('Project Editor theme wiring already up to date.');
  process.exit(0);
}

await writeFile(indexPath, html, 'utf8');
console.log(`Wired Project Editor gold theme into ${indexPath}`);
