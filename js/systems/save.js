window.WG = window.WG || {};
WG.Save = {};

WG.Save.KEY = 'wg_v1_save';

WG.Save.hasSave = function () {
    return !!localStorage.getItem(WG.Save.KEY);
};

WG.Save.clear = function () {
    localStorage.removeItem(WG.Save.KEY);
};

WG.Save.save = function () {
    try {
        const ps = WG.playerStats;
        const questProgress = {};
        ps.activeQuests.forEach(function (id) {
            const q = WG.Quest._DB[id];
            if (q && q._progress) questProgress[id] = q._progress.map(function (o) { return Object.assign({}, o); });
        });
        const data = {
            name:             ps.name,
            hp:               ps.hp,
            maxHp:            ps.maxHp,
            xp:               ps.xp,
            rank:             ps.rank,
            rankIndex:        ps.rankIndex,
            path:             ps.path,
            mentor:           ps.mentor,
            attackPower:      ps.attackPower,
            lives:            ps.lives,
            activeQuests:     ps.activeQuests.slice(),
            completedQuests:  ps.completedQuests.slice(),
            inventory:        ps.inventory.map(function (i) { return Object.assign({}, i); }),
            defeatedBosses:   ps.defeatedBosses.slice(),
            questProgress:    questProgress,
        };
        localStorage.setItem(WG.Save.KEY, JSON.stringify(data));
    } catch (e) { /* silent */ }
};

WG.Save.load = function () {
    try {
        const raw = localStorage.getItem(WG.Save.KEY);
        if (!raw) return false;
        const data = JSON.parse(raw);
        const ps = WG.playerStats;
        ps.name           = data.name           || '';
        ps.hp             = data.hp             != null ? data.hp : ps.maxHp;
        ps.maxHp          = data.maxHp          != null ? data.maxHp : ps.maxHp;
        ps.xp             = data.xp             || 0;
        ps.rank           = data.rank           || ps.rank;
        ps.rankIndex      = data.rankIndex      || 0;
        ps.path           = data.path           || null;
        ps.mentor         = data.mentor         || null;
        ps.attackPower    = data.attackPower    != null ? data.attackPower : ps.attackPower;
        ps.lives          = data.lives          != null ? data.lives : ps.lives;
        ps.activeQuests   = data.activeQuests   || [];
        ps.completedQuests= data.completedQuests|| [];
        ps.inventory      = data.inventory      || [];
        ps.defeatedBosses = data.defeatedBosses || [];

        // Restore quest _progress
        if (data.questProgress) {
            Object.keys(data.questProgress).forEach(function (id) {
                const q = WG.Quest._DB[id];
                if (q) q._progress = data.questProgress[id];
            });
        }

        // Sync WG.Boss.defeated
        if (WG.Boss) {
            WG.Boss.defeated = ps.defeatedBosses.slice();
        }

        return true;
    } catch (e) {
        return false;
    }
};

WG.Save.applyToWorld = function () {
    const ps = WG.playerStats;
    ps.defeatedBosses.forEach(function (clanKey) {
        const boss = WG.Boss && WG.Boss.all && WG.Boss.all[clanKey];
        if (!boss) return;
        boss.alive = false;
        boss.mesh.setEnabled(false);
        boss.label.isVisible = false;
        boss.hitbox.isPickable = false;
    });
};
