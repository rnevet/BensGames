window.WG = window.WG || {};
WG.Clanmates = {};
WG.Clanmates.list = [];

WG.Clanmates.create = function (scene, ui) {
    const positions = [
        [8, 12], [-12, 8], [15, -5], [-8, -14], [18, 3]
    ];
    const colors = [
        [0.75, 0.45, 0.15], [0.55, 0.55, 0.60], [0.90, 0.75, 0.35],
        [0.30, 0.25, 0.22], [0.80, 0.60, 0.50]
    ];
    const names = WG.C.CLANMATE_NAMES;

    positions.forEach(([x, z], i) => {
        const name = names[i % names.length];
        const catObj = WG.Cat.create(scene, colors[i], 'mate_' + i);
        const y = WG.Helpers.terrainHeight(x, z);
        catObj.root.position.set(x, y, z);
        catObj.hitbox.isPickable = false;

        const label = new BABYLON.GUI.TextBlock('mateLabel_' + i, name);
        label.color = '#90EE90';
        label.fontSize = 11;
        label.outlineWidth = 2;
        label.outlineColor = '#000';
        ui.addControl(label);
        label.linkWithMesh(catObj.root);
        label.linkOffsetY = -65;

        const mate = {
            name, mesh: catObj.root,
            wanderTarget: catObj.root.position.clone(),
            wanderTimer: WG.Helpers.rand(1, 4),
            basePos: new BABYLON.Vector3(x, y, z),
        };
        WG.Clanmates.list.push(mate);
    });
};

WG.Clanmates.update = function (deltaTime) {
    const wanderRadius = 12;
    WG.Clanmates.list.forEach(mate => {
        mate.wanderTimer -= deltaTime;
        if (mate.wanderTimer <= 0) {
            const angle = WG.Helpers.rand(0, Math.PI * 2);
            const dist = WG.Helpers.rand(3, wanderRadius);
            const nx = mate.basePos.x + Math.cos(angle) * dist;
            const nz = mate.basePos.z + Math.sin(angle) * dist;
            mate.wanderTarget.set(nx, WG.Helpers.terrainHeight(nx, nz), nz);
            mate.wanderTimer = WG.Helpers.rand(3, 7);
        }
        const pos = mate.mesh.position;
        const dx = mate.wanderTarget.x - pos.x;
        const dz = mate.wanderTarget.z - pos.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > 0.5) {
            const speed = 2.5;
            pos.x += (dx / dist) * speed * deltaTime;
            pos.z += (dz / dist) * speed * deltaTime;
            pos.y = WG.Helpers.terrainHeight(pos.x, pos.z);
            mate.mesh.rotation.y = Math.atan2(dx, dz);
        }
    });
};
