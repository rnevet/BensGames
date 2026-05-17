window.WG = window.WG || {};
WG.Stats = {};

WG.Stats.create = function () {
    return {
        name: '',
        hp: 100, maxHp: 100,
        xp: 0, rank: 'Jüngling', rankIndex: 0,
        path: null,         // 'warrior' | 'healer'
        mentor: null,       // 'warrior' | 'healer'
        attackPower: WG.C.ATTACK_POWER_BASE,
        speed: WG.C.PLAYER_SPEED,
        lives: 1,
        isInvincible: false,
        isDodging: false,
        isMoving: false,
        activeQuests: [],
        completedQuests: [],
        inventory: [],      // [{type, name, icon, count}]
        defeatedBosses: [],
        lastAttackTime: 0,
        lastDodgeTime: 0,
        nearNPC: null,
        nearHerb: null,
    };
};

WG.playerStats = WG.Stats.create();
