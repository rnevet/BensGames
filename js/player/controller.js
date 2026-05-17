window.WG = window.WG || {};
WG.Controller = {};

WG.Controller._keys = {};
WG.Controller._sprinting = false;

WG.Controller.init = function (scene, canvas) {
    const onKey = function (e, down) {
        WG.Controller._keys[e.code] = down;
        if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && !WG.Helpers.isMobile()) {
            WG.Controller._sprinting = down;
            WG.Camera.cam.speed = down
                ? WG.C.PLAYER_SPRINT * 0.01
                : WG.C.PLAYER_SPEED * 0.01;
        }
        // Interact (E)
        if (down && e.code === 'KeyE') WG.Controller._tryInteract();
        // Toggle panels
        if (down && e.code === 'KeyM') WG.Map.toggle();
        if (down && e.code === 'KeyJ') WG.QuestLog.toggle();
        if (down && e.code === 'KeyI') WG.InventoryUI.toggle();
        if (down && e.code === 'Escape') {
            WG.Map.close();
            WG.QuestLog.close();
            WG.InventoryUI.close();
            WG.Dialog.close();
        }
    };
    document.addEventListener('keydown', e => { if (WG.gameStarted) onKey(e, true); });
    document.addEventListener('keyup',   e => onKey(e, false));

    // Track movement state
    scene.onBeforeRenderObservable.add(function () {
        if (!WG.gameStarted) return;
        const ks = WG.Controller._keys;
        WG.playerStats.isMoving = !!(ks['KeyW'] || ks['KeyS'] || ks['KeyA'] || ks['KeyD'] ||
            ks['ArrowUp'] || ks['ArrowDown'] || ks['ArrowLeft'] || ks['ArrowRight']);
        WG.Controller._checkNearby();
        WG.Territories.checkExploration(
            WG.Camera.cam.position.x, WG.Camera.cam.position.z, WG.playerStats);
    });
};

WG.Controller._tryInteract = function () {
    if (!WG.gameStarted) return;
    const ps = WG.playerStats;
    if (ps.nearNPC) {
        WG.Dialog.show(ps.nearNPC);
    } else if (ps.nearClanmate && ps.path === 'healer' && WG.Inventory.count('herb') > 0) {
        WG.Inventory.use('herb');
        const mate = ps.nearClanmate;
        WG.HUD.showPickup('🌿 ' + mate.name + ' geheilt!');
    } else if (ps.nearHerb) {
        WG.Combat.collectHerb(ps.nearHerb);
    }
};

WG.Controller._checkNearby = function () {
    const ps = WG.playerStats;
    const pos = WG.Camera.cam.position;
    const ir = WG.C.INTERACT_RADIUS;
    const hr = WG.C.HERB_RADIUS;

    ps.nearNPC = null;
    for (const npc of WG.NPC.list) {
        if (WG.Helpers.distXZ(pos, npc.mesh.position) < ir) {
            ps.nearNPC = npc;
            break;
        }
    }

    ps.nearHerb = null;
    for (const h of WG.Environment.herbs) {
        if (h.active && WG.Helpers.distXZ(pos, h.mesh.position) < hr) {
            ps.nearHerb = h;
            break;
        }
    }

    ps.nearClanmate = null;
    if (ps.path === 'healer') {
        for (const mate of WG.Clanmates.list) {
            if (WG.Helpers.distXZ(pos, mate.mesh.position) < ir) {
                ps.nearClanmate = mate;
                break;
            }
        }
    }

    // Show/hide interact button on mobile
    const canHealMate = ps.nearClanmate && ps.path === 'healer' && WG.Inventory.count('herb') > 0;
    const btn = document.getElementById('touchInteractBtn');
    if (btn) btn.style.display = (ps.nearNPC || ps.nearHerb || canHealMate) ? 'flex' : 'none';
};

WG.Controller.dodge = function () {
    const ps = WG.playerStats;
    const now = performance.now();
    if (ps.isDodging || now - ps.lastDodgeTime < 1200) return;
    if (ps.rankIndex < 1) return; // must be at least Lehrling

    ps.isDodging = true;
    ps.isInvincible = true;
    ps.lastDodgeTime = now;

    const cam = WG.Camera.cam;
    const fwd = cam.getForwardRay(1).direction;
    const dir = new BABYLON.Vector3(fwd.x, 0, fwd.z).normalize();
    const target = cam.position.add(dir.scale(WG.C.DODGE_DIST));
    target.y = WG.Helpers.terrainHeight(target.x, target.z) + WG.C.PLAYER_HEIGHT;

    BABYLON.Animation.CreateAndStartAnimation(
        'dodge', cam, 'position', 60, WG.C.DODGE_MS / 1000 * 60,
        cam.position.clone(), target,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    setTimeout(() => { ps.isDodging = false; }, WG.C.DODGE_MS);
    setTimeout(() => { ps.isInvincible = false; }, WG.C.INVINCIBLE_MS);
};
