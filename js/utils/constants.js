window.WG = window.WG || {};

WG.C = {
    WORLD_SIZE: 500,
    TERRAIN_SUBS: 80,

    PLAYER_HEIGHT: 1.2,
    PLAYER_SPEED: 14,
    PLAYER_SPRINT: 22,
    PLAYER_ANGULAR: 650,

    ATTACK_RANGE: 4.5,
    ATTACK_COOLDOWN: 600,
    ATTACK_POWER_BASE: 5,
    DODGE_DIST: 5,
    DODGE_MS: 220,
    INVINCIBLE_MS: 350,

    DETECT_RADIUS: 18,
    CHASE_MAX: 50,
    ATTACK_RADIUS: 2.8,

    XP_KILL: 15,
    XP_BOSS: 500,
    XP_ZONE: 25,
    XP_QUEST_BASE: 30,

    HERB_HEAL_SELF: 25,
    HERB_HEAL_MATE: 60,
    INTERACT_RADIUS: 4,
    HERB_RADIUS: 3,

    RANKS_WARRIOR: [
        { name: 'Jüngling',        xp: 0    },
        { name: 'Lehrling',         xp: 100  },
        { name: 'Krieger',          xp: 400  },
        { name: 'Stellvertreter',   xp: 1000 },
        { name: 'Anführer',         xp: 2500 },
    ],
    RANKS_HEALER: [
        { name: 'Jüngling',                 xp: 0    },
        { name: 'Heiler-Lehrling',           xp: 100  },
        { name: 'Medizinkatze',             xp: 400  },
        { name: 'Erfahrene Medizinkatze',   xp: 1000 },
    ],

    CLANS: {
        THUNDER: { name: 'DonnerClan',  color: [0.85, 0.55, 0.15], cx: 0,    cz: 0,    cr: 110 },
        SHADOW:  { name: 'SchatteClan', color: [0.22, 0.18, 0.30], cx: 160,  cz: 120,  cr: 100 },
        RIVER:   { name: 'FlussClan',   color: [0.25, 0.50, 0.85], cx: -160, cz: 120,  cr: 100 },
        WIND:    { name: 'WindClan',    color: [0.80, 0.70, 0.38], cx: 0,    cz: 200,  cr: 100 },
        CLOUD:   { name: 'WolkenClan',  color: [0.88, 0.88, 0.95], cx: 160,  cz: -160, cr: 100 },
    },

    BOSS_CONFIGS: {
        SHADOW: { name: 'Tigerstern', hp: 200, speed: 8,  attackPower: 18, color: [0.45, 0.28, 0.05], special: 'dash'   },
        RIVER:  { name: 'Leopardstern', hp: 180, speed: 9,  attackPower: 15, color: [0.55, 0.45, 0.20], special: 'summon' },
        WIND:   { name: 'Tallstern',  hp: 160, speed: 12, attackPower: 12, color: [0.70, 0.60, 0.30], special: 'rapid'  },
        CLOUD:  { name: 'Weißsturm', hp: 170, speed: 10, attackPower: 14, color: [0.90, 0.90, 0.95], special: 'dash'   },
    },

    CLANMATE_NAMES: ['Graustreifen','Rabenpfote','Feuersturm','Sandwind','Silberbach',
                     'Herzflamme','Mondblatt','Tauwind','Eichenherz','Blitzpfote'],
    NPC_MENTOR_WARRIOR: { name: 'Feuerstern', desc: 'Kampferfahrener Krieger', color: [0.9, 0.4, 0.1] },
    NPC_MENTOR_HEALER:  { name: 'Blattschatten', desc: 'Weise Medizinkatze',   color: [0.3, 0.7, 0.3] },
    NPC_LEADER:         { name: 'Donnerherz', desc: 'Anführer des DonnerClans', color: [0.8, 0.6, 0.2] },
    NPC_HEALER:         { name: 'Mondblüte', desc: 'Medizinkatze des Clans',   color: [0.5, 0.8, 0.5] },
};
