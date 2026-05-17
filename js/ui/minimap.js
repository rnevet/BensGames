window.WG = window.WG || {};
WG.Minimap = {};

WG.Minimap._frame = 0;
WG.Minimap._canvas = null;
WG.Minimap._ctx = null;
WG.Minimap._SIZE = 120;

WG.Minimap.init = function (scene) {
    WG.Minimap._canvas = document.getElementById('minimapCanvas');
    if (!WG.Minimap._canvas) return;
    WG.Minimap._ctx = WG.Minimap._canvas.getContext('2d');

    scene.onBeforeRenderObservable.add(function () {
        if (!WG.gameStarted) return;
        WG.Minimap._frame++;
        if (WG.Minimap._frame % 6 !== 0) return;
        WG.Minimap.draw();
    });
};

WG.Minimap.draw = function () {
    const canvas = WG.Minimap._canvas;
    const ctx = WG.Minimap._ctx;
    if (!canvas || !ctx) return;

    const SIZE = WG.Minimap._SIZE;
    const worldSize = WG.C.WORLD_SIZE;
    const scale = SIZE / worldSize;

    const toMM = function (wx, wz) {
        return {
            x: SIZE / 2 + wx * scale,
            y: SIZE / 2 + wz * scale,
        };
    };

    // Background
    ctx.fillStyle = 'rgba(8, 6, 3, 0.9)';
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Clan territory circles (faint)
    const clanColors = {
        THUNDER: 'rgba(200,130,40,0.25)',
        SHADOW:  'rgba(60,40,90,0.30)',
        RIVER:   'rgba(40,90,180,0.30)',
        WIND:    'rgba(180,160,80,0.25)',
        CLOUD:   'rgba(180,180,210,0.30)',
    };
    Object.entries(WG.C.CLANS).forEach(function (entry) {
        const key = entry[0], cl = entry[1];
        const c = toMM(cl.cx, cl.cz);
        const r = cl.cr * scale;
        ctx.beginPath();
        ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
        ctx.fillStyle = clanColors[key] || 'rgba(100,100,100,0.2)';
        ctx.fill();
    });

    // Camp (gold dot at 0,0)
    const camp = toMM(0, 0);
    ctx.beginPath();
    ctx.arc(camp.x, camp.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD700';
    ctx.fill();

    // Red dots for alive enemies
    if (WG.Enemy && WG.Enemy.list) {
        WG.Enemy.list.forEach(function (e) {
            if (!e.alive) return;
            const sc = toMM(e.mesh.position.x, e.mesh.position.z);
            ctx.beginPath();
            ctx.arc(sc.x, sc.y, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = '#FF4444';
            ctx.fill();
        });
    }

    // Active boss skull
    const boss = WG.Boss && WG.Boss.active;
    if (boss && boss.alive) {
        const sc = toMM(boss.mesh.position.x, boss.mesh.position.z);
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('☠', sc.x, sc.y);
    }

    // Player: green dot + direction line
    if (WG.Camera && WG.Camera.cam) {
        const cam = WG.Camera.cam;
        const ps = toMM(cam.position.x, cam.position.z);

        // Direction line
        const fwd = cam.getForwardRay(1).direction;
        ctx.beginPath();
        ctx.moveTo(ps.x, ps.y);
        ctx.lineTo(ps.x + fwd.x * 8, ps.y + fwd.z * 8);
        ctx.strokeStyle = '#00FF66';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Dot
        ctx.beginPath();
        ctx.arc(ps.x, ps.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#00FF66';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Gold border
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0.75, 0.75, SIZE - 1.5, SIZE - 1.5);
};
