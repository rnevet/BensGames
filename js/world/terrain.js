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

    // Material: green grass
    const mat = new BABYLON.StandardMaterial('groundMat', scene);
    mat.diffuseColor = new BABYLON.Color3(0.28, 0.52, 0.18);
    mat.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);
    ground.material = mat;
    ground.checkCollisions = true;
    ground.receiveShadows = true;

    return ground;
};
