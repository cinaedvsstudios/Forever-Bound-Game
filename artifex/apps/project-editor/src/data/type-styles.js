// Artifex Project Editor node and route type style map
// Step 2 of the Project Editor real split.
//
// This file owns semantic type styling only. It has no DOM dependencies.

export const TYPE_STYLE_MAP = Object.freeze({
  'Completed Screen': {
    badge: 'bg-indigo-950/40 text-indigo-300 border-indigo-500/20',
    color: 'text-indigo-400',
    icon: 'check-circle'
  },
  'Playable Scene': {
    badge: 'bg-orange-950/40 text-orange-300 border-orange-500/20',
    color: 'text-orange-400',
    icon: 'play-circle'
  },
  'Title Screen': {
    badge: 'bg-amber-950/40 text-amber-300 border-amber-500/20',
    color: 'text-amber-400',
    icon: 'heading'
  },
  'Menu Screen': {
    badge: 'bg-cyan-950/40 text-cyan-300 border-cyan-500/20',
    color: 'text-cyan-400',
    icon: 'menu'
  },
  'Ending Screen': {
    badge: 'bg-rose-950/40 text-rose-300 border-rose-500/20',
    color: 'text-rose-400',
    icon: 'flag-triangle-right'
  },
  Quest: {
    badge: 'bg-rose-950/40 text-rose-300 border-rose-500/20',
    color: 'text-rose-400',
    icon: 'award'
  },
  'Side Quest': {
    badge: 'bg-fuchsia-950/40 text-fuchsia-300 border-fuchsia-500/20',
    color: 'text-fuchsia-400',
    icon: 'sparkles'
  },
  Branche: {
    badge: 'bg-sky-950/40 text-sky-300 border-sky-500/20',
    color: 'text-sky-400',
    icon: 'git-branch'
  },
  Depot: {
    badge: 'bg-pink-950/40 text-pink-300 border-pink-500/20',
    color: 'text-pink-400',
    icon: 'hexagon'
  },
  Junction: {
    badge: 'bg-blue-950/40 text-blue-300 border-blue-500/20',
    color: 'text-blue-400',
    icon: 'git-fork'
  },
  Waypoint: {
    badge: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/20',
    color: 'text-emerald-400',
    icon: 'map-pin'
  },
  Route: {
    badge: 'bg-teal-950/40 text-teal-300 border-teal-500/20',
    color: 'text-teal-400',
    icon: 'milestone'
  },
  Station: {
    badge: 'bg-yellow-950/40 text-yellow-300 border-yellow-500/20',
    color: 'text-yellow-400',
    icon: 'square'
  },
  'Placeholder Obj 1': {
    badge: 'bg-zinc-800/40 text-zinc-300 border-zinc-500/20',
    color: 'text-zinc-400',
    icon: 'box'
  },
  'Placeholder Obj 2': {
    badge: 'bg-zinc-800/40 text-zinc-300 border-zinc-500/20',
    color: 'text-zinc-400',
    icon: 'box'
  },
  'Placeholder Obj 3': {
    badge: 'bg-zinc-800/40 text-zinc-300 border-zinc-500/20',
    color: 'text-zinc-400',
    icon: 'box'
  },
  'Placeholder Obj 4': {
    badge: 'bg-zinc-800/40 text-zinc-300 border-zinc-500/20',
    color: 'text-zinc-400',
    icon: 'box'
  },
  'Placeholder Obj 5': {
    badge: 'bg-zinc-800/40 text-zinc-300 border-zinc-500/20',
    color: 'text-zinc-400',
    icon: 'box'
  },
  'Placeholder Obj 6': {
    badge: 'bg-zinc-800/40 text-zinc-300 border-zinc-500/20',
    color: 'text-zinc-400',
    icon: 'box'
  },
  'Placeholder Obj 7': {
    badge: 'bg-zinc-800/40 text-zinc-300 border-zinc-500/20',
    color: 'text-zinc-400',
    icon: 'box'
  },
  'Placeholder Obj 8': {
    badge: 'bg-zinc-800/40 text-zinc-300 border-zinc-500/20',
    color: 'text-zinc-400',
    icon: 'box'
  }
});

export const FALLBACK_TYPE_STYLE = Object.freeze({
  badge: 'bg-yellow-950/40 text-yellow-300 border-yellow-500/20',
  color: 'text-yellow-400',
  icon: 'circle'
});

export function getTypeStyle(type) {
  return TYPE_STYLE_MAP[type] || FALLBACK_TYPE_STYLE;
}
