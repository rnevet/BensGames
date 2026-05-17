window.WG = window.WG || {};
WG.Combat = {};

WG.Combat._scene = null;
WG.Combat._hitFlashMesh = null;

WG.Combat.init = function (scene, canvas) {
    WG.Combat._scene = scene;
    WG.Combat._createHitFlash(scene);

    // PC: left click to attack
    canvas.addEventListener('mousedown', function (e) {
        if (e.button !== 0) return;
        if (!WG.gameStarted || WG.Dialog.isOpen()) return;
        WG.Combat.playerAttack();
    });

    // PC: spacebar to dodge
    document.addEventListener('keydown', function (e) {
        if (e.code === 'Space' && WG.gameStarted && !WG.Dialog.isOpen()) {
            e.preventDefault();
            WG.Controller.dodge();
        }
    });
};

WG.Combat._createHitFlash = function (scene) {
    const flash = BABYLON.MeshBuilder.CreatePlane('hitFlash', { size: 0.8 }, scene);
    const mat = new BABYLON.StandardMaterial('hitFlashMat', scene);
    mat.diffuseColor = new BABYLON.Color3(1, 0.9, 0.3);
    mat.emissiveColor = new BABYLON.Color3(1, 0.8, 0.2);
    mat.backFaceCulling = false;
    flash.material = mat;
    flash.setEnabled(false);
    flash.isPickable = false;
    flash.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    WG.Combat._hitFlashMesh = flash;
};

WG.Combat.playerAttack = function () {
    const ps = WG.playerStats;
    const now = performance.now();
    if (now - ps.lastAttackTime < WG.C.ATTACK_COOLDOWN) return;
    ps.lastAttackTime = now;

    const scene = WG.Combat._scene;
    const engine = scene.getEngine();
    const pick = scene.pick(engine.getRenderWidth() / 2, engine.getRenderHeight() / 2,
        mesh => mesh.isPickable && mesh.isEnabled());

    if (!pick.hit) return;
    const meta = pick.pickedMesh ? pick.pickedMesh.metadata : null;
    if (!meta) return;

    const dist = pick.distance;
    if (dist > WG.C.ATTACK_RANGE) return;

    if (meta.type === 'enemy') {
        const enemy = WG.Enemy.list.find(e => e.id === meta.id);
        if (enemy && enemy.alive) {
            const dmg = ps.attackPower + WG.Helpers.randInt(0, 3);
            WG.Combat._showHitFlash(pick.pickedPoint);
            WG.Combat._showDamageNumber(scene, pick.pickedPoint, dmg, '#FFE050');
            WG.Enemy.damage(enemy, dmg);
        }
    } else if (meta.type === 'boss') {
        if (WG.Boss.active && WG.Boss.active.alive && WG.Boss.active.clanKey === meta.clanKey) {
            const dmg = ps.attackPower + WG.Helpers.randInt(0, 3);
            WG.Combat._showHitFlash(pick.pickedPoint);
            WG.Combat._showDamageNumber(scene, pick.pickedPoint, dmg, '#FFE050');
            WG.Boss.damage(dmg);
        }
    }
};

WG.Combat.collectHerb = function (herbObj) {
    if (WG.Environment.collectHerb(herbObj)) {
        WG.Inventory.add('herb');
        WG.Quest.checkObjective('COLLECT_HERB', {});
    }
};

WG.Combat.enemyHitPlayer = function (amount) {
    const ps = WG.playerStats;
    if (ps.isInvincible) return;
    ps.hp = Math.max(0, ps.hp - amount);
    WG.HUD.showVignette();
    WG.HUD.updateHealth();
    if (ps.hp <= 0) WG.Combat.playerDie();
};

WG.Combat.playerDie = function () {
    const ps = WG.playerStats;
    ps.lives--;
    ps.hp = ps.maxHp;
    WG.HUD.updateHealth();
    if (ps.lives <= 0) {
        WG.Screens.showGameOver();
    } else {
        WG.Screens.showDeathScreen(ps.lives);
        WG.Camera.cam.position.set(0, WG.C.PLAYER_HEIGHT + 2, 0);
    }
};

WG.Combat._showHitFlash = function (pos) {
    if (!pos) return;
    const flash = WG.Combat._hitFlashMesh;
    flash.position.copyFrom(pos);
    flash.setEnabled(true);
    setTimeout(() => flash.setEnabled(false), 110);
};

WG.Combat._showDamageNumber = function (scene, pos, value, color) {
    if (!pos) return;
    const advTex = WG.HUD._ui;
    const txt = new BABYLON.GUI.TextBlock('dmg_' + Date.now(), '-' + value);
    txt.color = color || '#FFE050';
    txt.fontSize = 22;
    txt.fontWeight = 'bold';
    txt.outlineWidth = 3;
    txt.outlineColor = '#000';
    advTex.addControl(txt);

    const ghost = BABYLON.MeshBuilder.CreateBox('dmgAnchor_' + Date.now(), { size: 0.01 }, scene);
    ghost.position.copyFrom(pos);
    ghost.position.y += 0.5;
    ghost.isPickable = false;
    txt.linkWithMesh(ghost);
    txt.linkOffsetY = 0;

    let elapsed = 0;
    const obs = scene.onBeforeRenderObservable.add(function () {
        elapsed += scene.getEngine().getDeltaTime();
        ghost.position.y += 0.03;
        txt.alpha = Math.max(0, 1 - elapsed / 900);
        if (elapsed > 900) {
            advTex.removeControl(txt);
            ghost.dispose();
            scene.onBeforeRenderObservable.remove(obs);
        }
    });
};
