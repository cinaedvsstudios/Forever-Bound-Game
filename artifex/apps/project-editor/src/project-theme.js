// Artifex Project Editor theme tokens
// Step 1 of the Project Editor real split.
//
// This file owns the Project / Library tool-family accent colours.
// It is intentionally small and DOM-safe so later split steps can import it
// from the app shell, UI module, renderer module, and canvas module without
// creating circular dependencies.

export const PROJECT_THEME = Object.freeze({
  id: 'project-gold-green',
  moduleFamily: 'Project / Library',
  versionLabel: 'v0.1.1 SPLIT-THEME',

  base: {
    backgroundBlack: '#070506',
    obsidian: '#0a0a0f',
    deepBrown: '#1f1410',
    darkPanel: '#12121a',
    cardPanel: '#181824',
    darkPurple: '#240d36',
    parchment: '#f8f0c8',
    textCream: '#fff6d9'
  },

  metals: {
    bronze: '#a97a36',
    copper: '#b66a3c',
    lightCopper: '#e89068',
    softGold: '#f4c76a',
    jobGold: '#d6a24c'
  },

  accent: {
    primary: '#d6a24c',
    primarySoft: '#f4c76a',
    primaryDeep: '#5a3a12',
    primaryGlow: 'rgba(214, 162, 76, 0.45)',
    primaryGrid: 'rgba(214, 162, 76, 0.08)',
    secondary: '#9fba5a',
    secondarySoft: '#c4df79',
    secondaryGlow: 'rgba(159, 186, 90, 0.35)'
  },

  semantic: {
    corruptionGreen: '#29e36c',
    holyBlue: '#87dfff',
    dangerRed: '#cc3131',
    validGreen: '#22c55e',
    warningOrange: '#f59e0b'
  }
});

export function applyProjectTheme(root = document.documentElement) {
  if (!root) return;

  const vars = {
    '--project-bg-black': PROJECT_THEME.base.backgroundBlack,
    '--project-obsidian': PROJECT_THEME.base.obsidian,
    '--project-deep-brown': PROJECT_THEME.base.deepBrown,
    '--project-panel': PROJECT_THEME.base.darkPanel,
    '--project-card': PROJECT_THEME.base.cardPanel,
    '--project-parchment': PROJECT_THEME.base.parchment,
    '--project-text-cream': PROJECT_THEME.base.textCream,
    '--project-bronze': PROJECT_THEME.metals.bronze,
    '--project-copper': PROJECT_THEME.metals.copper,
    '--project-gold': PROJECT_THEME.accent.primary,
    '--project-gold-soft': PROJECT_THEME.accent.primarySoft,
    '--project-gold-deep': PROJECT_THEME.accent.primaryDeep,
    '--project-gold-glow': PROJECT_THEME.accent.primaryGlow,
    '--project-grid': PROJECT_THEME.accent.primaryGrid,
    '--project-green': PROJECT_THEME.accent.secondary,
    '--project-green-soft': PROJECT_THEME.accent.secondarySoft,
    '--project-green-glow': PROJECT_THEME.accent.secondaryGlow
  };

  Object.entries(vars).forEach(([name, value]) => {
    root.style.setProperty(name, value);
  });

  root.dataset.artifexModuleFamily = PROJECT_THEME.moduleFamily;
  root.dataset.artifexTheme = PROJECT_THEME.id;
}

export function getProjectThemeTailwindConfig() {
  return {
    colors: {
      obsidian: PROJECT_THEME.base.obsidian,
      slateDark: PROJECT_THEME.base.darkPanel,
      cardDark: PROJECT_THEME.base.cardPanel,
      projectGold: PROJECT_THEME.accent.primary,
      projectGoldGlow: PROJECT_THEME.accent.primarySoft,
      projectGreen: PROJECT_THEME.accent.secondary,
      projectBronze: PROJECT_THEME.metals.bronze,
      projectCopper: PROJECT_THEME.metals.copper,
      projectParchment: PROJECT_THEME.base.parchment,
      accentDark: PROJECT_THEME.accent.primaryDeep
    },
    boxShadow: {
      'project-glow': `0 0 15px ${PROJECT_THEME.accent.primaryGlow}`,
      'project-glow-green': `0 0 15px ${PROJECT_THEME.accent.secondaryGlow}`,
      'card-glow': '0 4px 20px rgba(0, 0, 0, 0.6)'
    }
  };
}
