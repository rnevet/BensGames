window.WG = window.WG || {};
WG.Boss = {};
WG.Boss.all = {};      // map clanKey -> boss entity
WG.Boss.active = null; // currently fighting boss (only one at a time)
WG.Boss.defeated = [];

WG.Boss.create = function (scene, clanKey, ui) {
    if (WG.Boss.defeated.includes(clanKey)) return null;
    const cfg = WG.C.BOSS_CONFIGS[clanKey];
    if (!cfg) return null;

    const cl = WG.C.CLANS[clanKey];
    const x = cl.cx, z = cl.cz;
    const id = 'boss_' + clanKey;

    const catObj = WG.Cat.create(scene, cfg.color, id);
    catObj.root.scaling.setAll(1.55);
    const y = WG.Helpers.terrainHeight(x, z);
    catObj.root.position.set(x, y, z);

    const label = new BABYLON.GUI.TextBlock('bossLabel_' + clanKey, '☠ ' + cfg.name);
    label.color = '#FF4444';
    label.fontSize = 16;
    label.fontWeight = 'bold';
    label.outlineWidth = 3;
    label.outlineColor = '#000';
    label.isVisible = false;
    ui.addControl(label);
    label.linkWithMesh(catObj.root);
    label.linkOffsetY = -95;

    catObj.hitbox.metadata = { type: 'boss', clanKey };
    catObj.hitbox.isPickable = false; // not pickable until triggered

    const boss = {
        clanKey, name: cfg.name,
        mesh: catObj.root, hitbox: catObj.hitbox, label,
        stats: { hp: cfg.hp, maxHp: cfg.hp, speed: cfg.speed, atk: cfg.attackPower },
        ai: { state: 'IDLE', phase: 1, attackTimer: 0, specialTimer: 0, sumCount: 0 },
        special: cfg.special,
        alive: true,
        triggered: false,
    };
    WG.Boss.all[clanKey] = boss;
    return boss;
};

WG.Boss.trigger = function (clanKey) {
    if (WG.Boss.active) return; // only one boss at a time
    const boss = WG.Boss.all[clanKey];
    if (!boss || !boss.alive || boss.triggered) return;
    boss.triggered = true;
    WG.Boss.active = boss;
    boss.label.isVisible = true;
    boss.hitbox.isPickable = true;
    WG.HUD.setBossBar(boss.name, 1.0);
    WG.HUD.showRankSplash('⚔ ' + boss.name + ' greift an!');
};

WG.Boss.damage = function (amount) {
    const boss = WG.Boss.active;
    if (!boss || !boss.alive) return;
    boss.stats.hp -= amount;
    const ratio = Math.max(0, boss.stats.hp / boss.stats.maxHp);
    WG.HUD.setBossBar(boss.name, ratio);

    if (ratio <= 0.5 && boss.ai.phase === 1) {
        boss.ai.phase = 2;
        boss.stats.speed *= 1.35;
        WG.HUD.showPickup('⚠ ' + boss.name + ' wird wütend!');
    }
    if (boss.stats.hp <= 0) WG.Boss.kill();
};

WG.Boss.kill = function () {
    const boss = WG.Boss.active;
    if (!boss || !boss.alive) return;
    boss.alive = false;
    boss.mesh.setEnabled(false);
    boss.label.isVisible = false;
    boss.hitbox.isPickable = false;
    WG.Boss.defeated.push(boss.clanKey);
    WG.Boss.active = null;
    WG.HUD.setBossBar(null, 0);
    WG.Progression.awardXP(WG.C.XP_BOSS);
    WG.Quest.checkObjective('DEFEAT_BOSS', { clan: boss.clanKey });
    WG.HUD.showRankSplash('☠ ' + boss.name + ' besiegt!\n+' + WG.C.XP_BOSS + ' XP');
    WG.playerStats.defeatedBosses.push(boss.clanKey);
};
