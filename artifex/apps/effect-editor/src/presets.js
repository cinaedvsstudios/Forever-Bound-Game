/* Artifex Effect Editor preset registries.
 * Extracted from index.html in Phase 7 so presets can be edited without touching the live app shell.
 */
(function () {
    'use strict';

    window.ARTIFEX_FX_PRESETS = {
            particles: [
                {
                    id: "electric-sparks", effectType: "particles", subType: "electric-sparks",
                    name: "Base · Electric Sparks", description: "Fast additive spark particles with downward gravity and warm yellow-to-red glow.", tags: "base, particles, sparks, electric, warm, additive",
                    emitter: { rate: 6, width: 2, widthUnit: "PX" }, physics: { speedMin: 4, speedMax: 10, angle: 270, spread: 55, gravityY: 0.28, friction: 0.98, orbitalForce: 0 }, visual: { shape: "spark", sizeStart: 6, sizeEnd: 1, colors: ["#ffd23f", "#ee4266"], alphas: [1.0, 1.0], blur: 0, glow: 20, composite: "lighter" }, life: { durationMin: 25, durationMax: 50 }
                }
            ],
            ribbon: [
                {
                    id: "sword-slash", effectType: "ribbon", subType: "sword-slash",
                    name: "Base · Ribbon Trail", description: "Short glowing blue-white trail for slash, swipe, or fast motion effects.", tags: "base, ribbon, trail, slash, blue, additive",
                    emitter: { rate: 12, width: 1, widthUnit: "PX" }, physics: { speedMin: 0.1, speedMax: 0.5, angle: 0, spread: 0, gravityY: 0, friction: 1.0, orbitalForce: 0 }, visual: { shape: "spark", sizeStart: 12, sizeEnd: 0.1, colors: ["#00a1d7", "#ffffff"], alphas: [1.0, 1.0], blur: 0, glow: 25, composite: "lighter" }, life: { durationMin: 15, durationMax: 20 }
                }
            ],
            ring: [
                {
                    id: "shockwave", effectType: "ring", subType: "shockwave",
                    name: "Base · Expanding Shockwave", description: "Circular ring burst that expands outward from the emitter.", tags: "base, ring, shockwave, burst, blue, additive",
                    emitter: { rate: 0, width: 1, widthUnit: "PX" }, physics: { speedMin: 5, speedMax: 8, angle: 0, spread: 360, gravityY: 0, friction: 0.95, orbitalForce: 0 }, visual: { shape: "circle", sizeStart: 2, sizeEnd: 25, colors: ["#ffffff", "#00a1d7"], alphas: [1.0, 1.0], blur: 0, glow: 20, composite: "lighter" }, life: { durationMin: 30, durationMax: 50 }
                }
            ],
            lightning: [
                {
                    id: "tesla-bolt", effectType: "lightning", subType: "tesla-bolt",
                    name: "Base · Electric Discharge", description: "Short-lived blue-white spark particles with high glow and chaotic spread.", tags: "base, lightning, electric, blue, additive",
                    emitter: { rate: 5, width: 2, widthUnit: "PX" }, physics: { speedMin: 6, speedMax: 12, angle: 90, spread: 360, gravityY: 0, friction: 0.9, orbitalForce: 0 }, visual: { shape: "spark", sizeStart: 4, sizeEnd: 1, colors: ["#00a1d7", "#ffffff"], alphas: [1.0, 1.0], blur: 0, glow: 35, composite: "lighter" }, life: { durationMin: 10, durationMax: 20 }
                }
            ],
            projectile: [
                {
                    id: "fireball", effectType: "projectile", subType: "fireball",
                    name: "Base · Fireball Core", description: "Warm glowing projectile core travelling horizontally with a small floating lift.", tags: "base, projectile, fire, core, orange, additive",
                    emitter: { rate: 8, width: 1, widthUnit: "PX" }, physics: { speedMin: 4, speedMax: 6, angle: 180, spread: 5, gravityY: -0.05, friction: 0.99, orbitalForce: 0 }, visual: { shape: "circle", sizeStart: 12, sizeEnd: 2, colors: ["#ef4444", "#ffd23f"], alphas: [1.0, 1.0], blur: 0, glow: 30, composite: "lighter" }, life: { durationMin: 20, durationMax: 40 }
                }
            ],
            gas: [
                {
                    id: "generic-fog", effectType: "gas", subType: "generic-fog",
                    name: "Base · Wide Rolling Fog", description: "Large slow white-grey fog puffs spread across the canvas with screen blending.", tags: "base, gas, fog, mist, clouds, weather, screen",
                    emitter: { rate: 3, width: 100, widthUnit: "%" }, physics: { speedMin: 0.1, speedMax: 0.5, angle: 0, spread: 360, gravityY: -0.01, friction: 0.98, orbitalForce: 0 }, visual: { shape: "circle", sizeStart: 40, sizeEnd: 90, colors: ["#f8fafc", "#94a3b8", "#334155"], alphas: [0.0, 0.6, 0.0], blur: 15, glow: 30, composite: "screen" }, life: { durationMin: 100, durationMax: 180 }
                },
                {
                    id: "toxic-bubble-fog", effectType: "gas", subType: "toxic-bubble-fog",
                    name: "Base · Toxic Gas Bubbles", description: "Green rising gas bubbles with slight orbital drift.", tags: "base, gas, toxic, bubbles, green, screen",
                    emitter: { rate: 3, width: 10, widthUnit: "%" }, physics: { speedMin: 0.5, speedMax: 1.8, angle: 270, spread: 20, gravityY: -0.06, friction: 0.99, orbitalForce: 0.05 }, visual: { shape: "circle", sizeStart: 8, sizeEnd: 24, colors: ["#22c55e", "#0f0d0e"], alphas: [1.0, 1.0], blur: 0, glow: 15, composite: "screen" }, life: { durationMin: 50, durationMax: 110 }
                }
            ],
            refraction: [
                {
                    id: "heat-shimmer", effectType: "refraction", subType: "heat-shimmer",
                    name: "Base · Heat Shimmer", description: "Soft rising screen-blended distortion-style particles for heat/refraction previews.", tags: "base, refraction, heat, shimmer, screen",
                    emitter: { rate: 3, width: 15, widthUnit: "%" }, physics: { speedMin: 0.8, speedMax: 2.2, angle: 270, spread: 15, gravityY: -0.04, friction: 0.99, orbitalForce: 0 }, visual: { shape: "circle", sizeStart: 12, sizeEnd: 32, colors: ["#00a1d7", "#ffffff"], alphas: [0.0, 0.8, 0.0], blur: 0, glow: 8, composite: "screen" }, life: { durationMin: 40, durationMax: 85 }
                }
            ],
            lensflare: [
                {
                    id: "anamorphic-streak", effectType: "lensflare", subType: "anamorphic-streak",
                    name: "Base · Anamorphic Lens Flare", description: "Expanding blue-white star glare particles for optical flare effects.", tags: "base, lensflare, flare, optical, blue, additive",
                    emitter: { rate: 2, width: 1, widthUnit: "PX" }, physics: { speedMin: 0.1, speedMax: 0.5, angle: 0, spread: 360, gravityY: 0, friction: 0.95, orbitalForce: 0 }, visual: { shape: "star", sizeStart: 1, sizeEnd: 30, colors: ["#00a1d7", "#ffffff"], alphas: [1.0, 1.0], blur: 0, glow: 40, composite: "lighter" }, life: { durationMin: 20, durationMax: 45 }
                }
            ]
        };

    window.ARTIFEX_FX_COMPOSITES = [
            {
                id: "magic-cold", name: "Ice Magic · Crystal Mist", description: "Cold blue mist with rising star-shaped ice motes.", tags: "ice, cold, magic, crystal, mist, snow",
                layers: [
                    {
                        layerName: "Cold Mist Base", isVisible: true, effectType: "gas",
                        emitter: { rate: 8, width: 40, widthUnit: "%" },
                        physics: { speedMin: 0.5, speedMax: 1.5, angle: 270, spread: 30, gravityY: -0.02, friction: 0.99, orbitalForce: 0.05 },
                        visual: { shape: "circle", sizeStart: 10, sizeEnd: 30, colors: ["#00a1d7", "#ffffff", "#0f0d0e"], alphas: [0.0, 0.7, 0.0], blur: 8, glow: 15, composite: "screen" },
                        life: { durationMin: 50, durationMax: 90 }
                    },
                    {
                        layerName: "Rising Ice Stars", isVisible: true, effectType: "particles",
                        emitter: { rate: 5, width: 30, widthUnit: "%" },
                        physics: { speedMin: 3, speedMax: 7, angle: 270, spread: 45, gravityY: 0.05, friction: 0.98, orbitalForce: 0 },
                        visual: { shape: "star", sizeStart: 6, sizeEnd: 2, colors: ["#ffffff", "#00a1d7"], alphas: [0.0, 1.0, 0.0], blur: 0, glow: 20, composite: "lighter" },
                        life: { durationMin: 30, durationMax: 60 }
                    }
                ]
            },
            {
                id: "magic-dark", name: "Dark Magic · Void Vortex", description: "Dark red-purple void ring with swirling shadow mist.", tags: "dark, magic, void, vortex, shadow",
                layers: [
                    {
                        layerName: "Void Ring Core", isVisible: true, effectType: "ring",
                        emitter: { rate: 0, width: 1, widthUnit: "PX" },
                        physics: { speedMin: 1, speedMax: 2, angle: 0, spread: 360, gravityY: 0, friction: 0.95, orbitalForce: 2.0 },
                        visual: { shape: "circle", sizeStart: 40, sizeEnd: 5, colors: ["#000000", "#ef4444", "#4e1452"], alphas: [0.0, 1.0, 0.0], blur: 0, glow: 20, composite: "source-over" },
                        life: { durationMin: 40, durationMax: 80 }
                    },
                    {
                        layerName: "Shadow Vortex Mist", isVisible: true, effectType: "gas",
                        emitter: { rate: 6, width: 20, "widthUnit": "PX" },
                        physics: { speedMin: 1, speedMax: 3, angle: 0, spread: 360, gravityY: -0.05, "friction": 0.96, "orbitalForce": 1.5 },
                        visual: { shape: "circle", sizeStart: 5, sizeEnd: 25, colors: ["#4e1452", "#171210"], alphas: [0.0, 0.5, 0.0], blur: 10, glow: 5, composite: "screen" },
                        life: { durationMin: 50, durationMax: 90 }
                    }
                ]
            },
            {
                id: "magic-fire-2", name: "Fire Magic · Hellfire Burst", description: "Fire impact burst with shockwave, rolling flame smoke, and burning shards.", tags: "fire, magic, hellfire, explosion, chaos, burst",
                layers: [
                    {
                        layerName: "Impact Shockwave", isVisible: true, effectType: "ring",
                        emitter: { rate: 0, width: 1, widthUnit: "PX" },
                        physics: { speedMin: 8, speedMax: 12, angle: 0, spread: 360, gravityY: 0, friction: 0.92, orbitalForce: 0 },
                        visual: { shape: "circle", sizeStart: 5, sizeEnd: 40, colors: ["#ffffff", "#ef4444", "#171719"], alphas: [1.0, 0.0], blur: 0, glow: 25, composite: "lighter" },
                        life: { durationMin: 15, durationMax: 30 }
                    },
                    {
                        layerName: "Rolling Fire Smoke", isVisible: true, effectType: "gas",
                        emitter: { rate: 8, width: 15, widthUnit: "PX" },
                        physics: { speedMin: 2, speedMax: 5, angle: 270, spread: 40, gravityY: -0.1, friction: 0.95, orbitalForce: 0 },
                        visual: { shape: "circle", sizeStart: 10, sizeEnd: 35, colors: ["#fbbf24", "#ef4444", "#171210"], alphas: [0.0, 1.0, 0.0], blur: 6, glow: 15, composite: "screen" },
                        life: { durationMin: 30, durationMax: 60 }
                    },
                    {
                        layerName: "Burning Shards", isVisible: true, effectType: "particles",
                        emitter: { rate: 10, width: 10, widthUnit: "PX" },
                        physics: { speedMin: 6, speedMax: 15, angle: 270, spread: 360, gravityY: 0.2, friction: 0.97, orbitalForce: 0 },
                        visual: { shape: "shard", sizeStart: 8, sizeEnd: 1, colors: ["#ffffff", "#fbbf24", "#ef4444"], alphas: [1.0, 1.0, 0.0], blur: 0, glow: 20, composite: "lighter" },
                        life: { durationMin: 20, durationMax: 40 }
                    }
                ]
            },
            {
                id: "magic-heal-1", name: "Healing Magic · Green Sparkles", description: "Soft green healing ring with rising cross-star motes.", tags: "heal, healing, magic, sparkle, star, green",
                layers: [
                    {
                        layerName: "Healing Aura Ring", isVisible: true, effectType: "ring",
                        emitter: { rate: 0, width: 1, widthUnit: "PX" },
                        physics: { speedMin: 2, speedMax: 4, angle: 0, spread: 360, gravityY: 0, friction: 0.98, orbitalForce: 0 },
                        visual: { shape: "circle", sizeStart: 2, sizeEnd: 35, colors: ["#ffffff", "#22c55e", "#0f0d0e"], alphas: [0.0, 0.8, 0.0], blur: 0, glow: 20, composite: "screen" },
                        life: { durationMin: 40, durationMax: 70 }
                    },
                    {
                        layerName: "Green Cross-Star Motes", isVisible: true, effectType: "particles",
                        emitter: { rate: 6, width: 30, widthUnit: "%" },
                        physics: { speedMin: 1, speedMax: 3, angle: 270, spread: 25, gravityY: -0.05, friction: 0.99, orbitalForce: 0 },
                        visual: { shape: "cross-star", sizeStart: 6, sizeEnd: 0.5, colors: ["#ffffff", "#86efac", "#22c55e"], alphas: [0.0, 1.0, 0.0], blur: 0, glow: 15, composite: "lighter" },
                        life: { durationMin: 45, durationMax: 80 }
                    }
                ]
            },
            {
                id: "magic-heal-2", name: "Holy Magic · Photon Pillars", description: "Blue-white holy rune glow with rising capsule photon pillars.", tags: "holy, heal, photon, light, aura, blue",
                layers: [
                    {
                        layerName: "Holy Rune Glow", isVisible: true, effectType: "ring",
                        emitter: { rate: 0, width: 1, widthUnit: "PX" },
                        physics: { speedMin: 0.5, speedMax: 1.5, angle: 0, spread: 360, gravityY: 0, friction: 0.95, orbitalForce: 0 },
                        visual: { shape: "circle", sizeStart: 10, sizeEnd: 40, colors: ["#ffffff", "#00a1d7", "#0f0d0e"], alphas: [0.0, 0.9, 0.0], blur: 0, glow: 30, composite: "screen" },
                        life: { durationMin: 50, durationMax: 90 }
                    },
                    {
                        layerName: "Rising Photon Pillars", isVisible: true, effectType: "particles",
                        emitter: { rate: 8, width: 40, widthUnit: "PX" },
                        physics: { speedMin: 4, speedMax: 8, angle: 270, spread: 5, gravityY: -0.1, friction: 0.99, orbitalForce: 0 },
                        visual: { shape: "capsule", sizeStart: 12, sizeEnd: 2, colors: ["#ffffff", "#38bdf8", "#0284c7"], alphas: [0.0, 1.0, 0.0], blur: 0, glow: 25, composite: "lighter" },
                        life: { durationMin: 25, durationMax: 45 }
                    }
                ]
            },
            {
                id: "magic-water-droplets", name: "Water Magic · Aqua Splash", description: "Water ripple ring with bouncing blue droplet beads.", tags: "water, magic, splash, droplet, blue, ripple",
                layers: [
                    {
                        layerName: "Water Ripple Ring", isVisible: true, effectType: "ring",
                        emitter: { rate: 0, width: 1, widthUnit: "PX" },
                        physics: { speedMin: 4, speedMax: 6, angle: 0, spread: 360, gravityY: 0, friction: 0.96, orbitalForce: 0 },
                        visual: { shape: "circle", sizeStart: 2, sizeEnd: 25, colors: ["#ffffff", "#3b82f6", "#0f0d0e"], alphas: [1.0, 0.0], blur: 0, glow: 15, composite: "screen" },
                        life: { durationMin: 20, durationMax: 40 }
                    },
                    {
                        layerName: "Bouncing Water Beads", isVisible: true, effectType: "particles",
                        emitter: { rate: 10, width: 5, widthUnit: "PX" },
                        physics: { speedMin: 4, speedMax: 9, angle: 270, spread: 60, gravityY: 0.4, friction: 0.98, orbitalForce: 0 },
                        visual: { shape: "circle", sizeStart: 5, sizeEnd: 2, colors: ["#ffffff", "#60a5fa", "#0284c7"], alphas: [1.0, 1.0], blur: 0, glow: 10, composite: "source-over" },
                        life: { durationMin: 25, durationMax: 60 }
                    }
                ]
            },
            {
                id: "magic-tornade-ribbon", name: "Wind Magic · Cyclone Ribbons", description: "Green spiral wind ribbons with small swirling debris.", tags: "wind, magic, tornado, cyclone, ribbon, green",
                layers: [
                    {
                        layerName: "Cyclone Ribbon Stream", isVisible: true, effectType: "ribbon",
                        emitter: { rate: 15, width: 45, widthUnit: "PX" },
                        physics: { speedMin: 3, speedMax: 7, angle: 270, spread: 30, gravityY: -0.15, friction: 0.98, orbitalForce: 3.0 },
                        visual: { shape: "spark", sizeStart: 10, sizeEnd: 1, colors: ["#ccfbf1", "#22c55e", "#14532d"], alphas: [0.0, 1.0, 0.0], blur: 0, glow: 20, composite: "lighter" },
                        life: { durationMin: 30, durationMax: 60 }
                    },
                    {
                        layerName: "Swirling Debris", isVisible: true, effectType: "particles",
                        emitter: { rate: 5, width: 35, widthUnit: "PX" },
                        physics: { speedMin: 1, speedMax: 3, angle: 270, spread: 45, gravityY: 0.05, friction: 0.98, orbitalForce: 1.5 },
                        visual: { shape: "square", sizeStart: 3, sizeEnd: 0, colors: ["#d1d5db", "#78716c"], alphas: [0.0, 1.0, 0.0], blur: 0, glow: 0, composite: "source-over" },
                        life: { durationMin: 20, durationMax: 50 }
                    }
                ]
            },
            {
                id: "magic-shield-base", name: "Shield Magic · Hex Aegis", description: "Golden hexagonal forcefield with a secondary energy pulse.", tags: "shield, magic, aegis, hexagon, holy, gold",
                layers: [
                    {
                        layerName: "Hex Shield Field", isVisible: true, effectType: "ring",
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
                id: "powerup-aura-burst", name: "Power-Up · Golden Aura Burst", description: "Golden ground ring with rising energy beams for buffs and power-ups.", tags: "powerup, buff, aura, gold, energy",
                layers: [
                    {
                        layerName: "Ground Power Ring", isVisible: true, effectType: "ring",
                        emitter: { rate: 0, width: 1, widthUnit: "PX" },
                        physics: { speedMin: 8, speedMax: 15, angle: 270, spread: 15, gravityY: 0.1, friction: 0.92, orbitalForce: 0 },
                        visual: { shape: "ring", sizeStart: 5, sizeEnd: 40, colors: ["#ffffff", "#fde047", "#ca8a04"], alphas: [0.0, 1.0, 0.0], blur: 0, glow: 35, composite: "lighter" },
                        life: { durationMin: 20, durationMax: 40 }
                    },
                    {
                        layerName: "Rising Gold Energy", isVisible: true, effectType: "gas",
                        emitter: { rate: 6, width: 20, widthUnit: "PX" },
                        physics: { speedMin: 4, speedMax: 8, angle: 270, spread: 20, gravityY: -0.15, friction: 0.97, orbitalForce: 0 },
                        visual: { shape: "capsule", sizeStart: 8, sizeEnd: 2, colors: ["#fef08a", "#eab308", "#0f0d0e"], alphas: [0.0, 1.0, 0.0], blur: 2, glow: 20, composite: "lighter" },
                        life: { durationMin: 25, durationMax: 50 }
                    }
                ]
            },
            {
                id: "magic-thunder-strike", name: "Lightning Magic · Divine Strike", description: "Fast vertical purple-white lightning strike with ground impact ring.", tags: "lightning, magic, thunder, strike, purple, divine",
                layers: [
                    {
                        layerName: "Vertical Lightning Strike", isVisible: true, effectType: "lightning",
                        emitter: { rate: 8, width: 10, widthUnit: "PX" },
                        physics: { speedMin: 20, speedMax: 35, angle: 90, spread: 2, gravityY: 0, friction: 1.0, orbitalForce: 0 },
                        visual: { shape: "spark", sizeStart: 10, sizeEnd: 2, colors: ["#ffffff", "#d8b4fe", "#9333ea"], alphas: [1.0, 1.0, 0.0], blur: 0, glow: 50, composite: "lighter" },
                        life: { durationMin: 5, durationMax: 15 }
                    },
                    {
                        layerName: "Ground Impact Ring", isVisible: true, effectType: "ring",
                        emitter: { rate: 0, width: 1, widthUnit: "PX" },
                        physics: { speedMin: 10, speedMax: 18, angle: 0, spread: 360, gravityY: 0, friction: 0.9, orbitalForce: 0 },
                        visual: { shape: "ring", sizeStart: 2, sizeEnd: 30, colors: ["#ffffff", "#a855f7", "#0f0d0e"], alphas: [1.0, 0.0], blur: 0, glow: 25, composite: "lighter" },
                        life: { durationMin: 15, durationMax: 30 }
                    }
                ]
            },
            {
                id: "magic-light-1", name: "Light Magic · Falling Spears", description: "Falling golden light spears with impact sparks.", tags: "light, magic, holy, spear, strike, gold",
                layers: [
                    {
                        layerName: "Falling Light Spears", isVisible: true, effectType: "projectile",
                        emitter: { rate: 2, width: 80, widthUnit: "%" },
                        physics: { speedMin: 15, speedMax: 25, angle: 90, spread: 0, gravityY: 0.5, friction: 1.0, orbitalForce: 0 },
                        visual: { shape: "spear", sizeStart: 25, sizeEnd: 15, colors: ["#ffffff", "#fbbf24"], alphas: [0.0, 1.0, 0.0], blur: 0, glow: 30, composite: "lighter" },
                        life: { durationMin: 10, durationMax: 20 }
                    },
                    {
                        layerName: "Golden Impact Sparks", isVisible: true, effectType: "particles",
                        emitter: { rate: 6, width: 80, widthUnit: "%" },
                        physics: { speedMin: 2, speedMax: 8, angle: 270, spread: 90, gravityY: 0.3, friction: 0.98, orbitalForce: 0 },
                        visual: { shape: "spark", sizeStart: 6, sizeEnd: 1, colors: ["#fde047", "#d97706"], alphas: [1.0, 1.0], blur: 0, glow: 15, composite: "lighter" },
                        life: { durationMin: 20, durationMax: 40 }
                    }
                ]
            },
            {
                id: "magic-meteo-1", name: "Meteor Magic · Shower Lines", description: "Diagonal orange-red meteor streaks with smoky trail particles.", tags: "meteor, magic, space, shower, streaks, fire",
                layers: [
                    {
                        layerName: "Falling Meteor Lines", isVisible: true, effectType: "projectile",
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
                id: "magic-fire-1", name: "Cursed Magic · Pharaoh Fog", description: "Green-red cursed smoke with corrupted diamond rune particles.", tags: "cursed, magic, pharaoh, egyptian, smoke, green, red",
                layers: [
                    {
                        layerName: "Cursed Green-Red Smoke", isVisible: true, effectType: "gas",
                        emitter: { rate: 8, width: 35, widthUnit: "PX" },
                        physics: { speedMin: 1, speedMax: 3.5, angle: 270, spread: 30, gravityY: -0.08, friction: 0.97, orbitalForce: 0.1 },
                        visual: { shape: "circle", sizeStart: 10, sizeEnd: 30, colors: ["#16a34a", "#dc2626", "#0f0d0e"], alphas: [0.0, 0.6, 0.0], blur: 8, glow: 10, composite: "lighter" },
                        life: { durationMin: 30, durationMax: 70 }
                    },
                    {
                        layerName: "Corrupted Diamond Runes", isVisible: true, effectType: "particles",
                        emitter: { rate: 3, width: 30, widthUnit: "PX" },
                        physics: { speedMin: 0.5, speedMax: 2, angle: 270, spread: 10, gravityY: -0.05, friction: 0.99, orbitalForce: 0 },
                        visual: { shape: "diamond", sizeStart: 12, sizeEnd: 4, colors: ["#22c55e", "#ef4444"], alphas: [0.0, 1.0, 0.0], blur: 0, glow: 20, composite: "lighter" },
                        life: { durationMin: 40, durationMax: 80 }
                    }
                ]
            }
        ];
})();
