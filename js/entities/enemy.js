window.WG = window.WG || {};
WG.Enemy = {};
WG.Enemy.list = [];
WG.Enemy._idCounter = 0;

WG.Enemy.CLAN_STATS = {
    SHADOW: { hp: 45, speed: 6.5, atk: 10, color: [0.22, 0.18, 0.30] },
    RIVER:  { hp: 55, speed: 6.0, atk: 12, color: [0.25, 0.50, 0.85] },
    WIND:   { hp: 35, speed: 9.0, atk: 8,  color: [0.80, 0.70, 0.38] },
    CLOUD:  { hp: 40, speed: 7.5, atk: 9,  color: [0.88, 0.88, 0.95] },
};

WG.Enemy.create = function (scene, clanKey, x, z, ui) {
    const id = WG.Enemy._idCounter++;
    const stat = WG.Enemy.CLAN_STATS[clanKey] || WG.Enemy.CLAN_STATS.SHADOW;
    const catObj = WG.Cat.create(scene, stat.color, 'enemy_' + id);
    const y = WG.Helpers.terrainHeight(x, z);
    catObj.root.position.set(x, y, z);

    const clanName = WG.C.CLANS[clanKey] ? WG.C.CLANS[clanKey].name : clanKey;
    const label = new BABYLON.GUI.TextBlock('enemyLabel_' + id, clanName);
    label.color = '#FF6666';
    label.fontSize = 11;
    label.outlineWidth = 2;
    label.outlineColor = '#000';
    ui.addControl(label);
    label.linkWithMesh(catObj.root);
    label.linkOffsetY = -65;

    // HP bar
    const hpBar = new BABYLON.GUI.Rectangle('enemyHp_' + id);
    hpBar.width = '60px'; hpBar.height = '6px';
    hpBar.cornerRadius = 2;
    hpBar.background = '#CC2222'; hpBar.color = '#000';
    hpBar.thickness = 1;
    ui.addControl(hpBar);
    hpBar.linkWithMesh(catObj.root);
    hpBar.linkOffsetY = -55;

    catObj.hitbox.metadata = { type: 'enemy', id };

    const enemy = {
        id, clanKey,
        mesh: catObj.root, hitbox: catObj.hitbox, hpBar,
        stats: { hp: stat.hp, maxHp: stat.hp, speed: stat.speed, atk: stat.atk },
        ai: { state: 'PATROL', waypoints: [], wpIdx: 0, waitTimer: 0, attackTimer: 0 },
        patrol: { base: new BABYLON.Vector3(x, y, z) },
        alive: true,
        label,
    };

    WG.Enemy._generateWaypoints(enemy);
    WG.Enemy.list.push(enemy);
    return enemy;
};

WG.Enemy._generateWaypoints = function (enemy) {
    const n = 4;
    const base = enemy.patrol.base;
    for (let i = 0; i < n; i++) {
        const angle = (i / n) * Math.PI * 2;
        const r = WG.Helpers.rand(10, 20);
        const wx = base.x + Math.cos(angle) * r;
        const wz = base.z + Math.sin(angle) * r;
        enemy.ai.waypoints.push(new BABYLON.Vector3(wx, WG.Helpers.terrainHeight(wx, wz), wz));
    }
};

WG.Enemy.damage = function (enemy, amount) {
    if (!enemy.alive) return;
    enemy.stats.hp -= amount;
    const ratio = Math.max(0, enemy.stats.hp / enemy.stats.maxHp);
    enemy.hpBar.scaleX = ratio;
    if (enemy.stats.hp <= 0) WG.Enemy.kill(enemy);
};

WG.Enemy.kill = function (enemy) {
    if (!enemy.alive) return;
    enemy.alive = false;
    enemy.mesh.setEnabled(false);
    enemy.hpBar.isVisible = false;
    enemy.label.isVisible = false;
    WG.Enemy.list = WG.Enemy.list.filter(e => e.id !== enemy.id);
    WG.Progression.awardXP(WG.C.XP_KILL);
    WG.Quest.checkObjective('KILL_ENEMY', { clan: enemy.clanKey });
    WG.HUD.showPickup('+' + WG.C.XP_KILL + ' XP');
};
