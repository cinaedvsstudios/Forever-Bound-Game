/* Artifex Effect Editor composite effect registry.
 * Split from presets.js so built-in base and composite archetypes can live in src/presets/.
 */
(function () {
    'use strict';

    window.ARTIFEX_FX_COMPOSITES = [
            {
                id: "magic-cold", name: "Magic Cold Crystals", tags: "ice, cold, magic, snow",
                layers: [
                    {
                        layerName: "Icy Mist Base", isVisible: true, effectType: "gas",
                        emitter: { rate: 8, width: 40, widthUnit: "%" },
                        physics: { speedMin: 0.5, speedMax: 1.5, angle: 270, spread: 30, gravityY: -0.02, friction: 0.99, orbitalForce: 0.05 },
                        visual: { shape: "circle", sizeStart: 10, sizeEnd: 30, colors: ["#00a1d7", "#ffffff", "#0f0d0e"], alphas: [0.0, 0.7, 0.0], blur: 8, glow: 15, composite: "screen" },
                        life: { durationMin: 50, durationMax: 90 }
                    },
                    {
                        layerName: "Rising Snowflakes", isVisible: true, effectType: "particles",
                        emitter: { rate: 5, width: 30, widthUnit: "%" },
                        physics: { speedMin: 3, speedMax: 7, angle: 270, spread: 45, gravityY: 0.05, friction: 0.98, orbitalForce: 0 },
                        visual: { shape: "star", sizeStart: 6, sizeEnd: 2, colors: ["#ffffff", "#00a1d7"], alphas: [0.0, 1.0, 0.0], blur: 0, glow: 20, composite: "lighter" },
                        life: { durationMin: 30, durationMax: 60 }
                    }
                ]
            },
            {
                id: "magic-dark", name: "Dark Magic Void", tags: "dark, magic, void, evil",
                layers: [
                    {
                        layerName: "Void Core Ring", isVisible: true, effectType: "ring",
                        emitter: { rate: 0, width: 1, widthUnit: "PX" },
                        physics: { speedMin: 1, speedMax: 2, angle: 0, spread: 360, gravityY: 0, friction: 0.95, orbitalForce: 2.0 },
                        visual: { shape: "circle", sizeStart: 40, sizeEnd: 5, colors: ["#000000", "#ef4444", "#4e1452"], alphas: [0.0, 1.0, 0.0], blur: 0, glow: 20, composite: "source-over" },
                        life: { durationMin: 40, durationMax: 80 }
                    },
                    {
                        layerName: "Shadow Mist", isVisible: true, effectType: "gas",
                        emitter: { rate: 6, width: 20, "widthUnit": "PX" },
                        physics: { speedMin: 1, speedMax: 3, angle: 0, spread: 360, gravityY: -0.05, "friction": 0.96, "orbitalForce": 1.5 },
                        visual: { shape: "circle", sizeStart: 5, sizeEnd: 25, colors: ["#4e1452", "#171210"], alphas: [0.0, 0.5, 0.0], blur: 10, glow: 5, composite: "screen" },
                        life: { durationMin: 50, durationMax: 90 }
                    }
                ]
            },
            {
                id: "magic-fire-2", name: "Explosive Hellfire", tags: "fire, explosion, chaos",
                layers: [
                    {
                        layerName: "Impact Shockwave", isVisible: true, effectType: "ring",
                        emitter: { rate: 0, width: 1, widthUnit: "PX" },
                        physics: { speedMin: 8, speedMax: 12, angle: 0, spread: 360, gravityY: 0, friction: 0.92, orbitalForce: 0 },
                        visual: { shape: "circle", sizeStart: 5, sizeEnd: 40, colors: ["#ffffff", "#ef4444", "#171719"], alphas: [1.0, 0.0], blur: 0, glow: 25, composite: "lighter" },
                        life: { durationMin: 15, durationMax: 30 }
                    },
                    {
                        layerName: "Rolling Flames", isVisible: true, effectType: "gas",
                        emitter: { rate: 8, width: 15, widthUnit: "PX" },
                        physics: { speedMin: 2, speedMax: 5, angle: 270, spread: 40, gravityY: -0.1, friction: 0.95, orbitalForce: 0 },
                        visual: { shape: "circle", sizeStart: 10, sizeEnd: 35, colors: ["#fbbf24", "#ef4444", "#171210"], alphas: [0.0, 1.0, 0.0], blur: 6, glow: 15, composite: "screen" },
                        life: { durationMin: 30, durationMax: 60 }
                    },
                    {
                        layerName: "Crystal Shrapnel", isVisible: true, effectType: "particles",
                        emitter: { rate: 10, width: 10, widthUnit: "PX" },
                        physics: { speedMin: 6, speedMax: 15, angle: 270, spread: 360, gravityY: 0.2, friction: 0.97, orbitalForce: 0 },
                        visual: { shape: "shard", sizeStart: 8, sizeEnd: 1, colors: ["#ffffff", "#fbbf24", "#ef4444"], alphas: [1.0, 1.0, 0.0], blur: 0, glow: 20, composite: "lighter" },
                        life: { durationMin: 20, durationMax: 40 }
                    }
                ]
            },
            {
                id: "magic-heal-1", name: "Kirakira Heal Sparkles", tags: "heal, magic, sparkle, star",
                layers: [
                    {
                        layerName: "Healing Aura", isVisible: true, effectType: "ring",
                        emitter: { rate: 0, width: 1, widthUnit: "PX" },
                        physics: { speedMin: 2, speedMax: 4, angle: 0, spread: 360, gravityY: 0, friction: 0.98, orbitalForce: 0 },
                        visual: { shape: "circle", sizeStart: 2, sizeEnd: 35, colors: ["#ffffff", "#22c55e", "#0f0d0e"], alphas: [0.0, 0.8, 0.0], blur: 0, glow: 20, composite: "screen" },
                        life: { durationMin: 40, durationMax: 70 }
                    },
                    {
                        layerName: "Cross-Star Motes", isVisible: true, effectType: "particles",
                        emitter: { rate: 6, width: 30, widthUnit: "%" },
                        physics: { speedMin: 1, speedMax: 3, angle: 270, spread: 25, gravityY: -0.05, friction: 0.99, orbitalForce: 0 },
                        visual: { shape: "cross-star", sizeStart: 6, sizeEnd: 0.5, colors: ["#ffffff", "#86efac", "#22c55e"], alphas: [0.0, 1.0, 0.0], blur: 0, glow: 15, composite: "lighter" },
                        life: { durationMin: 45, durationMax: 80 }
                    }
                ]
            },
            {
                id: "magic-heal-2", name: "Rising Holy Photons", tags: "heal, photon, light, aura",
                layers: [
                    {
                        layerName: "Base Rune Glow", isVisible: true, effectType: "ring",
                        emitter: { rate: 0, width: 1, widthUnit: "PX" },
                        physics: { speedMin: 0.5, speedMax: 1.5, angle: 0, spread: 360, gravityY: 0, friction: 0.95, orbitalForce: 0 },
                        visual: { shape: "circle", sizeStart: 10, sizeEnd: 40, colors: ["#ffffff", "#00a1d7", "#0f0d0e"], alphas: [0.0, 0.9, 0.0], blur: 0, glow: 30, composite: "screen" },
                        life: { durationMin: 50, durationMax: 90 }
                    },
                    {
                        layerName: "Photon Pillars", isVisible: true, effectType: "particles",
                        emitter: { rate: 8, width: 40, widthUnit: "PX" },
                        physics: { speedMin: 4, speedMax: 8, angle: 270, spread: 5, gravityY: -0.1, friction: 0.99, orbitalForce: 0 },
                        visual: { shape: "capsule", sizeStart: 12, sizeEnd: 2, colors: ["#ffffff", "#38bdf8", "#0284c7"], alphas: [0.0, 1.0, 0.0], blur: 0, glow: 25, composite: "lighter" },
                        life: { durationMin: 25, durationMax: 45 }
                    }
                ]
            },
            {
                id: "magic-water-droplets", name: "Splash Aqua Droplets", tags: "water, splash, droplet, blue",
                layers: [
                    {
                        layerName: "Water Ripple", isVisible: true, effectType: "ring",
                        emitter: { rate: 0, width: 1, widthUnit: "PX" },
                        physics: { speedMin: 4, speedMax: 6, angle: 0, spread: 360, gravityY: 0, friction: 0.96, orbitalForce: 0 },
                        visual: { shape: "circle", sizeStart: 2, sizeEnd: 25, colors: ["#ffffff", "#3b82f6", "#0f0d0e"], alphas: [1.0, 0.0], blur: 0, glow: 15, composite: "screen" },
                        life: { durationMin: 20, durationMax: 40 }
                    },
                    {
                        layerName: "Bouncing Beads", isVisible: true, effectType: "particles",
                        emitter: { rate: 10, width: 5, widthUnit: "PX" },
                        physics: { speedMin: 4, speedMax: 9, angle: 270, spread: 60, gravityY: 0.4, friction: 0.98, orbitalForce: 0 },
                        visual: { shape: "circle", sizeStart: 5, sizeEnd: 2, colors: ["#ffffff", "#60a5fa", "#0284c7"], alphas: [1.0, 1.0], blur: 0, glow: 10, composite: "source-over" },
                        life: { durationMin: 25, durationMax: 60 }
                    }
                ]
            },
            {
                id: "magic-tornade-ribbon", name: "Cyclone Wind Ribbons", tags: "wind, tornado, cyclone, green",
                layers: [
                    {
                        layerName: "Swirling Winds", isVisible: true, effectType: "ribbon",
                        emitter: { rate: 15, width: 45, widthUnit: "PX" },
                        physics: { speedMin: 3, speedMax: 7, angle: 270, spread: 30, gravityY: -0.15, friction: 0.98, orbitalForce: 3.0 },
                        visual: { shape: "spark", sizeStart: 10, sizeEnd: 1, colors: ["#ccfbf1", "#22c55e", "#14532d"], alphas: [0.0, 1.0, 0.0], blur: 0, glow: 20, composite: "lighter" },
                        life: { durationMin: 30, durationMax: 60 }
                    },
                    {
                        layerName: "Debris", isVisible: true, effectType: "particles",
                        emitter: { rate: 5, width: 35, widthUnit: "PX" },
                        physics: { speedMin: 1, speedMax: 3, angle: 270, spread: 45, gravityY: 0.05, friction: 0.98, orbitalForce: 1.5 },
                        visual: { shape: "square", sizeStart: 3, sizeEnd: 0, colors: ["#d1d5db", "#78716c"], alphas: [0.0, 1.0, 0.0], blur: 0, glow: 0, composite: "source-over" },
                        life: { durationMin: 20, durationMax: 50 }
                    }
                ]
            },
            {
                id: "magic-shield-base", name: "Aegis Hexagon Shield", tags: "shield, defense, hexagon, holy",
                layers: [
                    {
                        layerName: "Hex Forcefield", isVisible: true, effectType: "ring",
                        emitter: { rate: 0, width: 1, widthUnit: "PX" },
                        physics: { speedMin: 0.1, speedMax: 0.5, angle: 0, spread: 360, gravityY: 0, friction: 0.9, orbitalForce: 0 },
                        visual: { shape: "hexagon", sizeStart: 40, sizeEnd: 45, colors: ["#ffffff", "#fef08a", "#d97706"], alphas: [0.0, 1.0, 0.0], blur: 0, glow: 30, composite: "screen" },
                        life: { durationMin: 60, durationMax: 100 }
                    },
                    {
                        layerName: "Energy Pulse", isVisible: true, effectType: "ring",
                        emitter: { rate: 0, width: 1, widthUnit: "PX" },
                        physics: { speedMin: 2, speedMax: 4, angle: 0, spread: 360, gravityY: 0, friction: 0.95, orbitalForce: 0 },
                        visual: { shape: "circle", sizeStart: 10, sizeEnd: 35, colors: ["#fde047", "#ca8a04", "#0f0d0e"], alphas: [1.0, 0.0], blur: 0, glow: 15, composite: "lighter" },
                        life: { durationMin: 30, durationMax: 50 }
                    }
                ]
            },
            {
                id: "powerup-aura-burst", name: "Aura Power Burst", tags: "powerup, buff, aura, gold",
                layers: [
                    {
                        layerName: "Ground Power Ring", isVisible: true, effectType: "ring",
                        emitter: { rate: 0, width: 1, widthUnit: "PX" },
                        physics: { speedMin: 8, speedMax: 15, angle: 270, spread: 15, gravityY: 0.1, friction: 0.92, orbitalForce: 0 },
                        visual: { shape: "ring", sizeStart: 5, sizeEnd: 40, colors: ["#ffffff", "#fde047", "#ca8a04"], alphas: [0.0, 1.0, 0.0], blur: 0, glow: 35, composite: "lighter" },
                        life: { durationMin: 20, durationMax: 40 }
                    },
                    {
                        layerName: "Rising Energy", isVisible: true, effectType: "gas",
                        emitter: { rate: 6, width: 20, widthUnit: "PX" },
                        physics: { speedMin: 4, speedMax: 8, angle: 270, spread: 20, gravityY: -0.15, friction: 0.97, orbitalForce: 0 },
                        visual: { shape: "capsule", sizeStart: 8, sizeEnd: 2, colors: ["#fef08a", "#eab308", "#0f0d0e"], alphas: [0.0, 1.0, 0.0], blur: 2, glow: 20, composite: "lighter" },
                        life: { durationMin: 25, durationMax: 50 }
                    }
                ]
            },
            {
                id: "magic-thunder-strike", name: "Divine Judgment Bolt", tags: "lightning, thunder, strike, purple",
                layers: [
                    {
                        layerName: "Heavenly Strike", isVisible: true, effectType: "lightning",
                        emitter: { rate: 8, width: 10, widthUnit: "PX" },
                        physics: { speedMin: 20, speedMax: 35, angle: 90, spread: 2, gravityY: 0, friction: 1.0, orbitalForce: 0 },
                        visual: { shape: "spark", sizeStart: 10, sizeEnd: 2, colors: ["#ffffff", "#d8b4fe", "#9333ea"], alphas: [1.0, 1.0, 0.0], blur: 0, glow: 50, composite: "lighter" },
                        life: { durationMin: 5, durationMax: 15 }
                    },
                    {
                        layerName: "Ground Impact", isVisible: true, effectType: "ring",
                        emitter: { rate: 0, width: 1, widthUnit: "PX" },
                        physics: { speedMin: 10, speedMax: 18, angle: 0, spread: 360, gravityY: 0, friction: 0.9, orbitalForce: 0 },
                        visual: { shape: "ring", sizeStart: 2, sizeEnd: 30, colors: ["#ffffff", "#a855f7", "#0f0d0e"], alphas: [1.0, 0.0], blur: 0, glow: 25, composite: "lighter" },
                        life: { durationMin: 15, durationMax: 30 }
                    }
                ]
            },
            {
                id: "magic-light-1", name: "Heavenly Spear Strike", tags: "light, strike, holy, spear",
                layers: [
                    {
                        layerName: "Falling Spears", isVisible: true, effectType: "projectile",
                        emitter: { rate: 2, width: 80, widthUnit: "%" },
                        physics: { speedMin: 15, speedMax: 25, angle: 90, spread: 0, gravityY: 0.5, friction: 1.0, orbitalForce: 0 },
                        visual: { shape: "spear", sizeStart: 25, sizeEnd: 15, colors: ["#ffffff", "#fbbf24"], alphas: [0.0, 1.0, 0.0], blur: 0, glow: 30, composite: "lighter" },
                        life: { durationMin: 10, durationMax: 20 }
                    },
                    {
                        layerName: "Golden Sparks", isVisible: true, effectType: "particles",
                        emitter: { rate: 6, width: 80, widthUnit: "%" },
                        physics: { speedMin: 2, speedMax: 8, angle: 270, spread: 90, gravityY: 0.3, friction: 0.98, orbitalForce: 0 },
                        visual: { shape: "spark", sizeStart: 6, sizeEnd: 1, colors: ["#fde047", "#d97706"], alphas: [1.0, 1.0], blur: 0, glow: 15, composite: "lighter" },
                        life: { durationMin: 20, durationMax: 40 }
                    }
                ]
            },
            {
                id: "magic-meteo-1", name: "Meteor Shower Lines", tags: "meteor, space, laser, rain",
                layers: [
                    {
                        layerName: "Laser Meteors", isVisible: true, effectType: "projectile",
                        emitter: { rate: 4, width: 100, widthUnit: "%" },
                        physics: { speedMin: 12, speedMax: 18, angle: 105, spread: 5, gravityY: 0.2, friction: 1.0, orbitalForce: 0 },
                        visual: { shape: "capsule", sizeStart: 12, sizeEnd: 2, colors: ["#ffffff", "#f97316", "#ef4444"], alphas: [0.0, 1.0, 0.0], blur: 0, glow: 25, composite: "lighter" },
                        life: { durationMin: 15, durationMax: 30 }
                    },
                    {
                        layerName: "Meteor Trails", isVisible: true, effectType: "gas",
                        emitter: { rate: 10, width: 100, widthUnit: "%" },
                        physics: { speedMin: 0.5, speedMax: 2, angle: 270, spread: 20, gravityY: -0.05, friction: 0.98, orbitalForce: 0 },
                        visual: { shape: "circle", sizeStart: 8, sizeEnd: 20, colors: ["#ef4444", "#7f1d1d", "#0f0d0e"], alphas: [0.0, 0.6, 0.0], blur: 0, glow: 10, composite: "screen" },
                        life: { durationMin: 30, durationMax: 50 }
                    }
                ]
            },
            {
                id: "magic-fire-1", name: "Cursed Pharaoh's Fog", tags: "egyptian, dark, smoke, cursed",
                layers: [
                    {
                        layerName: "Ominous Smoke", isVisible: true, effectType: "gas",
                        emitter: { rate: 8, width: 35, widthUnit: "PX" },
                        physics: { speedMin: 1, speedMax: 3.5, angle: 270, spread: 30, gravityY: -0.08, friction: 0.97, orbitalForce: 0.1 },
                        visual: { shape: "circle", sizeStart: 10, sizeEnd: 30, colors: ["#16a34a", "#dc2626", "#0f0d0e"], alphas: [0.0, 0.6, 0.0], blur: 8, glow: 10, composite: "lighter" },
                        life: { durationMin: 30, durationMax: 70 }
                    },
                    {
                        layerName: "Corrupted Runes", isVisible: true, effectType: "particles",
                        emitter: { rate: 3, width: 30, widthUnit: "PX" },
                        physics: { speedMin: 0.5, speedMax: 2, angle: 270, spread: 10, gravityY: -0.05, friction: 0.99, orbitalForce: 0 },
                        visual: { shape: "diamond", sizeStart: 12, sizeEnd: 4, colors: ["#22c55e", "#ef4444"], alphas: [0.0, 1.0, 0.0], blur: 0, glow: 20, composite: "lighter" },
                        life: { durationMin: 40, durationMax: 80 }
                    }
                ]
            }
        ];
})();
