window.WG = window.WG || {};
WG.Spawner = {};

WG.Spawner.init = function (scene, ui) {
    const clans = ['SHADOW', 'RIVER', 'WIND', 'CLOUD'];
    clans.forEach(clanKey => {
        const cl = WG.C.CLANS[clanKey];
        const count = 6;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + WG.Helpers.rand(0, 0.5);
            const r = WG.Helpers.rand(35, cl.cr - 10);
            const x = cl.cx + Math.cos(angle) * r;
            const z = cl.cz + Math.sin(angle) * r;
            WG.Enemy.create(scene, clanKey, x, z, ui);
        }
        // Create boss for each enemy clan
        WG.Boss.create(scene, clanKey, ui);
    });
};
