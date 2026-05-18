window.WG = window.WG || {};
WG.Terrain = {};

WG.Terrain.create = function (scene) {
    const sz = WG.C.WORLD_SIZE;
    const subs = WG.C.TERRAIN_SUBS;
    const ground = BABYLON.MeshBuilder.CreateGround('ground', {
        width: sz, height: sz,
        subdivisions: subs,
        updatable: true
    }, scene);

    // Apply noise to vertices
    const pos = ground.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    for (let i = 0; i < pos.length; i += 3) {
        pos[i + 1] = WG.Helpers.terrainHeight(pos[i], pos[i + 2]);
    }
    ground.updateVerticesData(BABYLON.VertexBuffer.PositionKind, pos);
    const norms = new Float32Array(pos.length);
    BABYLON.VertexData.ComputeNormals(pos, ground.getIndices(), norms);
    ground.updateVerticesData(BABYLON.VertexBuffer.NormalKind, norms);

    // Vertex colors — height-based terrain tinting
    const clamp = WG.Helpers.clamp;
    const numVerts = pos.length / 3;
    const colorData = new Float32Array(numVerts * 4);
    for (let i = 0; i < numVerts; i++) {
        const y = pos[i * 3 + 1];
        let cr, cg, cb;
        if (y < -3) {
            // Very low — dark brownish-green
            cr = 0.22; cg = 0.38; cb = 0.12;
        } else if (y < 0) {
            // Low — blend toward medium green
            const t = clamp((y - (-3)) / 3, 0, 1);
            cr = 0.22 + (0.26 - 0.22) * t;
            cg = 0.38 + (0.48 - 0.38) * t;
            cb = 0.12 + (0.16 - 0.12) * t;
        } else if (y < 4) {
            // Mid — blend from medium green to standard green
            const t = clamp(y / 4, 0, 1);
            cr = 0.26 + (0.30 - 0.26) * t;
            cg = 0.48 + (0.54 - 0.48) * t;
            cb = 0.16 + (0.18 - 0.16) * t;
        } else if (y < 8) {
            // High — blend from standard to lighter dry green
            const t = clamp((y - 4) / 4, 0, 1);
            cr = 0.30 + (0.38 - 0.30) * t;
            cg = 0.54 + (0.58 - 0.54) * t;
            cb = 0.18 + (0.22 - 0.18) * t;
        } else {
            // Very high — rocky grey-green
            cr = 0.42; cg = 0.50; cb = 0.28;
        }
        colorData[i * 4 + 0] = cr;
        colorData[i * 4 + 1] = cg;
        colorData[i * 4 + 2] = cb;
        colorData[i * 4 + 3] = 1.0;
    }
    ground.setVerticesData(BABYLON.VertexBuffer.ColorKind, colorData);

    // Material: white so vertex colors show through
    const mat = new BABYLON.StandardMaterial('groundMat', scene);
    mat.diffuseColor = new BABYLON.Color3(1, 1, 1);
    mat.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);
    ground.material = mat;
    ground.checkCollisions = true;
    ground.receiveShadows = true;

    WG.Terrain._ground = ground;

    return ground;
};
