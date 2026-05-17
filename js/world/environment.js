window.WG = window.WG || {};
WG.Environment = {};

WG.Environment.herbs = [];
WG.Environment.herbMeshes = [];

WG.Environment.create = function (scene) {
    WG.Environment._createTrees(scene);
    WG.Environment._createRocks(scene);
    WG.Environment._createCamp(scene);
    WG.Environment._createRiver(scene);
    WG.Environment._createHerbs(scene);
};

WG.Environment._placeAtTerrain = function (mesh, x, z, yOffset) {
    yOffset = yOffset || 0;
    mesh.position.x = x;
    mesh.position.z = z;
    mesh.position.y = WG.Helpers.terrainHeight(x, z) + yOffset;
};

WG.Environment._createTrees = function (scene) {
    const trunkMat = new BABYLON.StandardMaterial('trunkMat', scene);
    trunkMat.diffuseColor = new BABYLON.Color3(0.42, 0.28, 0.14);

    const foliageMat = new BABYLON.StandardMaterial('foliageMat', scene);
    foliageMat.diffuseColor = new BABYLON.Color3(0.15, 0.50, 0.12);

    const trunk = BABYLON.MeshBuilder.CreateCylinder('treeTrunk', { diameter: 0.55, height: 3.5, tessellation: 8 }, scene);
    trunk.material = trunkMat;
    trunk.isPickable = false;

    const top = BABYLON.MeshBuilder.CreateSphere('treeTop', { diameter: 3.8, segments: 4 }, scene);
    top.material = foliageMat;
    top.isPickable = false;
    top.parent = trunk;
    top.position.y = 3.0;

    const H = WG.Helpers;
    const sz = WG.C.WORLD_SIZE * 0.46;

    for (let i = 0; i < 140; i++) {
        const x = H.rand(-sz, sz);
        const z = H.rand(-sz, sz);
        if (Math.abs(x) < 30 && Math.abs(z) < 30) continue; // skip camp area

        const ti = trunk.createInstance('t' + i);
        WG.Environment._placeAtTerrain(ti, x, z, 1.75);
        const scale = H.rand(0.7, 1.4);
        ti.scaling.setAll(scale);
        ti.rotation.y = H.rand(0, Math.PI * 2);
        ti.checkCollisions = false;
    }

    // Collision cylinders for trees near camp that player can bump into
    const colMat = new BABYLON.StandardMaterial('colMat', scene);
    colMat.alpha = 0;
    for (let i = 0; i < 18; i++) {
        const angle = H.rand(0, Math.PI * 2);
        const dist = H.rand(35, 80);
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;
        const col = BABYLON.MeshBuilder.CreateCylinder('treeCol' + i, { diameter: 0.7, height: 8, tessellation: 6 }, scene);
        col.material = colMat;
        col.isPickable = false;
        col.checkCollisions = true;
        WG.Environment._placeAtTerrain(col, x, z, 4);
    }
    trunk.setEnabled(false); // hide originals
    top.setEnabled(false);
};

WG.Environment._createRocks = function (scene) {
    const rockMat = new BABYLON.StandardMaterial('rockMat', scene);
    rockMat.diffuseColor = new BABYLON.Color3(0.45, 0.42, 0.40);

    const H = WG.Helpers;
    const sz = WG.C.WORLD_SIZE * 0.44;
    for (let i = 0; i < 25; i++) {
        const x = H.rand(-sz, sz);
        const z = H.rand(-sz, sz);
        if (Math.sqrt(x * x + z * z) < 35) continue;

        const s = H.rand(0.5, 2.0);
        const rock = BABYLON.MeshBuilder.CreateBox('rock' + i, { width: s * 1.1, height: s * 0.7, depth: s * 0.9 }, scene);
        rock.material = rockMat;
        rock.isPickable = false;
        WG.Environment._placeAtTerrain(rock, x, z, 0.5);
        rock.rotation.set(H.rand(0, 0.5), H.rand(0, Math.PI * 2), H.rand(0, 0.5));
    }
};

WG.Environment._createCamp = function (scene) {
    // Rock ring around camp
    const wallMat = new BABYLON.StandardMaterial('wallMat', scene);
    wallMat.diffuseColor = new BABYLON.Color3(0.50, 0.46, 0.42);
    const count = 24;
    const radius = 28;
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const stone = BABYLON.MeshBuilder.CreateBox('campWall' + i, {
            width: WG.Helpers.rand(2.5, 4), height: WG.Helpers.rand(2.5, 4.5), depth: WG.Helpers.rand(2, 3.5)
        }, scene);
        stone.material = wallMat;
        stone.checkCollisions = true;
        WG.Environment._placeAtTerrain(stone, x, z, 1.5);
        stone.rotation.y = angle;
        stone.isPickable = false;
    }

    // Highledge (leader's rock)
    const ledge1 = BABYLON.MeshBuilder.CreateCylinder('ledge1', { diameter: 5, height: 3, tessellation: 8 }, scene);
    ledge1.material = wallMat;
    ledge1.position.set(-18, WG.Helpers.terrainHeight(-18, -15) + 1.5, -15);
    ledge1.checkCollisions = true;
    ledge1.isPickable = false;

    const ledge2 = BABYLON.MeshBuilder.CreateCylinder('ledge2', { diameter: 3.5, height: 2, tessellation: 8 }, scene);
    ledge2.material = wallMat;
    ledge2.position.set(-18, WG.Helpers.terrainHeight(-18, -15) + 3.5, -15);
    ledge2.isPickable = false;

    // Camp ground (darker soil)
    const campGround = BABYLON.MeshBuilder.CreateGround('campGround', { width: 54, height: 54 }, scene);
    const cgMat = new BABYLON.StandardMaterial('cgMat', scene);
    cgMat.diffuseColor = new BABYLON.Color3(0.38, 0.30, 0.18);
    campGround.material = cgMat;
    campGround.position.y = 0.05;
    campGround.isPickable = false;
};

WG.Environment._createRiver = function (scene) {
    const riverMat = new BABYLON.StandardMaterial('riverMat', scene);
    riverMat.diffuseColor = new BABYLON.Color3(0.20, 0.45, 0.75);
    riverMat.alpha = 0.82;
    riverMat.specularColor = new BABYLON.Color3(0.8, 0.9, 1.0);

    const river = BABYLON.MeshBuilder.CreateGround('river', { width: 22, height: 220, subdivisions: 4 }, scene);
    river.material = riverMat;
    river.rotation.y = 0.35;
    river.position.set(-130, WG.Helpers.terrainHeight(-130, 110) + 0.15, 110);
    river.isPickable = false;
};

WG.Environment._createHerbs = function (scene) {
    const herbMat = new BABYLON.StandardMaterial('herbMat', scene);
    herbMat.diffuseColor = new BABYLON.Color3(0.2, 0.9, 0.3);
    herbMat.emissiveColor = new BABYLON.Color3(0.0, 0.4, 0.1);

    const H = WG.Helpers;
    const sz = WG.C.WORLD_SIZE * 0.40;
    const positions = [
        [25, 18], [-35, 22], [18, -30], [45, 10], [-20, 40],
        [60, -20], [-55, 15], [30, 55], [-10, 60], [50, -50]
    ];

    for (let i = 0; i < positions.length; i++) {
        const [x, z] = positions[i];
        const herb = BABYLON.MeshBuilder.CreateSphere('herb' + i, { diameter: 0.9, segments: 5 }, scene);
        herb.material = herbMat;
        WG.Environment._placeAtTerrain(herb, x, z, 0.45);
        herb.isPickable = true;
        herb.metadata = { type: 'herb', id: i };
        WG.Environment.herbMeshes.push(herb);
        WG.Environment.herbs.push({ mesh: herb, active: true, id: i });
    }
};

WG.Environment.collectHerb = function (herbObj) {
    if (!herbObj.active) return false;
    herbObj.active = false;
    herbObj.mesh.setEnabled(false);
    return true;
};
