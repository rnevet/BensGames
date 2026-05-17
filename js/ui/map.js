window.WG = window.WG || {};
WG.Map = {};

WG.Map._open = false;

WG.Map.toggle = function () { WG.Map._open ? WG.Map.close() : WG.Map.open(); };

WG.Map.open = function () {
    WG.Map._open = true;
    const panel = document.getElementById('mapPanel');
    panel.classList.add('active');
    WG.Map.draw();
};

WG.Map.close = function () {
    WG.Map._open = false;
    document.getElementById('mapPanel').classList.remove('active');
};

WG.Map.draw = function () {
    const canvas = document.getElementById('mapCanvas');
    if (!canvas) return;
    const panel = document.getElementById('mapPanel');
    canvas.width = panel.offsetWidth - 34;
    canvas.height = panel.offsetHeight - 66;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const worldSize = WG.C.WORLD_SIZE;
    const scale = Math.min(W, H) / worldSize;

    const toScreen = (wx, wz) => ({
        x: W / 2 + wx * scale,
        y: H / 2 + wz * scale,
    });

    // Background
    ctx.fillStyle = '#0d0a06';
    ctx.fillRect(0, 0, W, H);

    // Clan territories
    const clanColors = {
        THUNDER: 'rgba(200,130,40,0.3)',
        SHADOW:  'rgba(60,40,90,0.35)',
        RIVER:   'rgba(40,90,180,0.35)',
        WIND:    'rgba(180,160,80,0.3)',
        CLOUD:   'rgba(180,180,210,0.35)',
    };
    Object.entries(WG.C.CLANS).forEach(([key, cl]) => {
        const center = toScreen(cl.cx, cl.cz);
        const r = cl.cr * scale;
        ctx.beginPath();
        ctx.arc(center.x, center.y, r, 0, Math.PI * 2);
        ctx.fillStyle = clanColors[key] || 'rgba(100,100,100,0.2)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,215,0,0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,215,0,0.7)';
        ctx.font = '10px Georgia';
        ctx.textAlign = 'center';
        ctx.fillText(cl.name, center.x, center.y - cl.cr * scale + 14);
    });

    // Clan camp (player camp)
    const camp = toScreen(0, 0);
    ctx.beginPath();
    ctx.arc(camp.x, camp.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD700';
    ctx.fill();
    ctx.fillStyle = '#FFD700';
    ctx.font = '9px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('Lager', camp.x, camp.y + 14);

    // Active quest markers
    WG.playerStats.activeQuests.forEach(id => {
        const q = WG.Quest._DB[id];
        if (!q) return;
        const giver = WG.NPC.list.find(n => n.id === q.giver);
        if (!giver) return;
        const mp = giver.mesh.position;
        const sc = toScreen(mp.x, mp.z);
        ctx.font = '14px Georgia';
        ctx.textAlign = 'center';
        ctx.fillText('❗', sc.x, sc.y + 5);
    });

    // Bosses
    WG.Boss.defeated; // just ref to avoid lint
    Object.entries(WG.C.CLANS).forEach(([key, cl]) => {
        if (key === 'THUNDER') return;
        if (WG.Boss.defeated.includes(key)) return;
        const sc = toScreen(cl.cx, cl.cz);
        ctx.font = '14px Georgia';
        ctx.textAlign = 'center';
        ctx.fillText('☠', sc.x, sc.y + 5);
    });

    // Enemies
    WG.Enemy.list.forEach(e => {
        if (!e.alive) return;
        const sc = toScreen(e.mesh.position.x, e.mesh.position.z);
        ctx.beginPath();
        ctx.arc(sc.x, sc.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FF4444';
        ctx.fill();
    });

    // Player
    const cam = WG.Camera.cam;
    const ps = toScreen(cam.position.x, cam.position.z);
    ctx.beginPath();
    ctx.arc(ps.x, ps.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#00FF66';
    ctx.fill();
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Direction arrow
    const fwd = cam.getForwardRay(1).direction;
    ctx.beginPath();
    ctx.moveTo(ps.x, ps.y);
    ctx.lineTo(ps.x + fwd.x * 10, ps.y + fwd.z * 10);
    ctx.strokeStyle = '#00FF66';
    ctx.lineWidth = 2;
    ctx.stroke();
};
