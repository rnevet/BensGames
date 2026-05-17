window.WG = window.WG || {};
WG.AI = {};

WG.AI._frameCount = 0;
WG.AI._TICK = 10; // update every 10 frames

WG.AI.init = function (scene) {
    scene.onBeforeRenderObservable.add(function () {
        if (!WG.gameStarted) return;
        WG.AI._frameCount++;
        if (WG.AI._frameCount % WG.AI._TICK !== 0) return;

        const dt = scene.getEngine().getDeltaTime() / 1000 * WG.AI._TICK;
        const playerPos = WG.Camera.cam.position;

        WG.Enemy.list.forEach(e => {
            if (!e.alive) return;
            const near = WG.Helpers.distXZ(e.mesh.position, playerPos) < 80;
            e.label.isVisible = near;
            e.hpBar.isVisible = near;
            if (near) WG.AI._updateEnemy(e, playerPos, dt);
        });
        WG.AI._checkBossTrigger(playerPos);
        WG.AI._updateActiveBoss(playerPos, dt, scene);
        WG.Clanmates.update(dt);
    });
};

WG.AI._updateEnemy = function (e, playerPos, dt) {
    const pos = e.mesh.position;
    const dist = WG.Helpers.distXZ(pos, playerPos);
    const ai = e.ai;

    switch (ai.state) {
        case 'PATROL':
            if (dist < WG.C.DETECT_RADIUS) { ai.state = 'ALERT'; ai.waitTimer = 0.65; break; }
            const wp = ai.waypoints[ai.wpIdx];
            if (WG.Helpers.distXZ(pos, wp) < 1.5) {
                ai.waitTimer -= dt;
                if (ai.waitTimer <= 0) {
                    ai.wpIdx = (ai.wpIdx + 1) % ai.waypoints.length;
                    ai.waitTimer = WG.Helpers.rand(0.8, 2.5);
                }
            } else {
                WG.AI._moveTo(e.mesh, wp, e.stats.speed * 0.5, dt);
            }
            break;
        case 'ALERT':
            ai.waitTimer -= dt;
            e.mesh.rotation.y += dt * 2.5;
            if (ai.waitTimer <= 0) ai.state = 'CHASE';
            break;
        case 'CHASE':
            if (dist > WG.C.CHASE_MAX) { ai.state = 'PATROL'; break; }
            if (dist < WG.C.ATTACK_RADIUS) { ai.state = 'ATTACK'; ai.attackTimer = 0; break; }
            WG.AI._moveTo(e.mesh, playerPos, e.stats.speed, dt);
            break;
        case 'ATTACK':
            if (dist > WG.C.ATTACK_RADIUS * 1.6) { ai.state = 'CHASE'; break; }
            ai.attackTimer -= dt;
            if (ai.attackTimer <= 0) {
                ai.attackTimer = WG.Helpers.rand(1.1, 2.0);
                WG.Combat.enemyHitPlayer(e.stats.atk);
            }
            WG.AI._face(e.mesh, playerPos);
            break;
    }
};

WG.AI._checkBossTrigger = function (playerPos) {
    if (WG.Boss.active) return;
    Object.keys(WG.Boss.all).forEach(clanKey => {
        const boss = WG.Boss.all[clanKey];
        if (!boss || !boss.alive || boss.triggered) return;
        const dist = WG.Helpers.distXZ(boss.mesh.position, playerPos);
        if (dist < 32) WG.Boss.trigger(clanKey);
    });
};

WG.AI._updateActiveBoss = function (playerPos, dt, scene) {
    const boss = WG.Boss.active;
    if (!boss || !boss.alive || !boss.triggered) return;

    const pos = boss.mesh.position;
    const dist = WG.Helpers.distXZ(pos, playerPos);
    const ai = boss.ai;

    ai.attackTimer -= dt;
    ai.specialTimer -= dt;

    if (dist < WG.C.ATTACK_RADIUS * 1.7) {
        if (ai.attackTimer <= 0) {
            ai.attackTimer = WG.Helpers.rand(1.2, 1.8);
            WG.Combat.enemyHitPlayer(boss.stats.atk);
        }
        WG.AI._face(boss.mesh, playerPos);
    } else {
        WG.AI._moveTo(boss.mesh, playerPos, boss.stats.speed, dt);
    }

    if (ai.specialTimer <= 0) {
        ai.specialTimer = WG.Helpers.rand(4, 7);
        if (boss.special === 'dash' && dist < 22) {
            WG.AI._bossDash(boss, playerPos);
        } else if (boss.special === 'summon' && ai.phase >= 2 && ai.sumCount < 4 && scene) {
            ai.sumCount++;
            const ang = Math.random() * Math.PI * 2;
            const ex = pos.x + Math.cos(ang) * 7, ez = pos.z + Math.sin(ang) * 7;
            WG.Enemy.create(scene, boss.clanKey, ex, ez, WG.HUD._ui);
        } else if (boss.special === 'rapid') {
            boss.stats.atk = ai.phase >= 2 ? 8 : 12;
            ai.attackTimer = 0;
        }
    }
};

WG.AI._bossDash = function (boss, playerPos) {
    const dir = playerPos.subtract(boss.mesh.position);
    dir.y = 0;
    if (dir.length() < 0.1) return;
    dir.normalize();
    const target = boss.mesh.position.add(dir.scale(9));
    target.y = WG.Helpers.terrainHeight(target.x, target.z);
    BABYLON.Animation.CreateAndStartAnimation(
        'bossDash_' + boss.clanKey, boss.mesh, 'position', 60, 14,
        boss.mesh.position.clone(), target,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );
};

WG.AI._moveTo = function (mesh, target, speed, dt) {
    const pos = mesh.position;
    const dx = target.x - pos.x, dz = target.z - pos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < 0.3) return;
    pos.x += (dx / dist) * speed * dt;
    pos.z += (dz / dist) * speed * dt;
    pos.y = WG.Helpers.terrainHeight(pos.x, pos.z);
    mesh.rotation.y = Math.atan2(dx, dz);
};

WG.AI._face = function (mesh, target) {
    const dx = target.x - mesh.position.x, dz = target.z - mesh.position.z;
    mesh.rotation.y = Math.atan2(dx, dz);
};
