window.WG = window.WG || {};
WG.Territories = {};

WG.Territories._explored = new Set();

WG.Territories.getClanAt = function (x, z) {
    let nearest = null, nearestDist = Infinity;
    for (const [key, cl] of Object.entries(WG.C.CLANS)) {
        const dx = x - cl.cx, dz = z - cl.cz;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < cl.cr && dist < nearestDist) {
            nearest = key;
            nearestDist = dist;
        }
    }
    return nearest; // null = neutral
};

WG.Territories.checkExploration = function (x, z, playerStats) {
    const clan = WG.Territories.getClanAt(x, z);
    if (clan && !WG.Territories._explored.has(clan)) {
        WG.Territories._explored.add(clan);
        WG.Progression.awardXP(WG.C.XP_ZONE);
        WG.Quest.checkObjective('EXPLORE_ZONE', { clan });
        const clanName = WG.C.CLANS[clan].name;
        WG.HUD.showZoneLabel(clan === 'THUNDER' ? 'DonnerClan-Territorium' : clanName + '-Territorium');
    }
};

WG.Territories.getBossClan = function (x, z) {
    for (const [key, cl] of Object.entries(WG.C.CLANS)) {
        if (key === 'THUNDER') continue;
        const dx = x - cl.cx, dz = z - cl.cz;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 30) return key; // near clan center = boss zone
    }
    return null;
};
