window.WG = window.WG || {};
WG.Cat = {};

WG.Cat._matsCache = {};

WG.Cat._getMat = function (scene, r, g, b) {
    const key = r.toFixed(2) + '_' + g.toFixed(2) + '_' + b.toFixed(2);
    if (WG.Cat._matsCache[key]) return WG.Cat._matsCache[key];
    const mat = new BABYLON.StandardMaterial('catMat_' + key, scene);
    mat.diffuseColor = new BABYLON.Color3(r, g, b);
    mat.specularColor = new BABYLON.Color3(0.08, 0.08, 0.08);
    WG.Cat._matsCache[key] = mat;
    return mat;
};

WG.Cat.create = function (scene, colorRGB, id) {
    const [r, g, b] = colorRGB;
    const mat = WG.Cat._getMat(scene, r, g, b);
    const darkMat = WG.Cat._getMat(scene, r * 0.6, g * 0.6, b * 0.6);
    const eyeMat = WG.Cat._getMat(scene, 0.9, 0.8, 0.1);

    const root = new BABYLON.TransformNode('cat_' + id, scene);

    // Body
    const body = BABYLON.MeshBuilder.CreateBox('catBody_' + id,
        { width: 0.65, height: 0.42, depth: 0.95 }, scene);
    body.material = mat;
    body.parent = root;
    body.position.y = 0.42;
    body.isPickable = false;

    // Head
    const head = BABYLON.MeshBuilder.CreateSphere('catHead_' + id,
        { diameter: 0.42, segments: 7 }, scene);
    head.material = mat;
    head.parent = root;
    head.position.set(0, 0.80, 0.48);
    head.isPickable = false;

    // Ears
    for (let s = -1; s <= 1; s += 2) {
        const ear = BABYLON.MeshBuilder.CreateBox('catEar_' + id + '_' + s,
            { width: 0.10, height: 0.16, depth: 0.08 }, scene);
        ear.material = mat;
        ear.parent = root;
        ear.position.set(s * 0.14, 1.02, 0.46);
        ear.isPickable = false;
    }

    // Eyes
    for (let s = -1; s <= 1; s += 2) {
        const eye = BABYLON.MeshBuilder.CreateSphere('catEye_' + id + '_' + s,
            { diameter: 0.07, segments: 4 }, scene);
        eye.material = eyeMat;
        eye.parent = root;
        eye.position.set(s * 0.11, 0.82, 0.68);
        eye.isPickable = false;
    }

    // Legs
    const legPositions = [
        [-0.22, 0, 0.28], [0.22, 0, 0.28],
        [-0.22, 0, -0.28], [0.22, 0, -0.28],
    ];
    legPositions.forEach((lp, i) => {
        const leg = BABYLON.MeshBuilder.CreateCylinder('catLeg_' + id + '_' + i,
            { diameter: 0.13, height: 0.40, tessellation: 6 }, scene);
        leg.material = darkMat;
        leg.parent = root;
        leg.position.set(lp[0], 0.20, lp[2]);
        leg.isPickable = false;
    });

    // Tail
    const tail = BABYLON.MeshBuilder.CreateCylinder('catTail_' + id,
        { diameterTop: 0.04, diameterBottom: 0.09, height: 0.68, tessellation: 6 }, scene);
    tail.material = mat;
    tail.parent = root;
    tail.position.set(0, 0.65, -0.50);
    tail.rotation.x = -0.7;
    tail.isPickable = false;

    // Hitbox (invisible, pickable, for raycast)
    const hitbox = BABYLON.MeshBuilder.CreateBox('catHit_' + id,
        { width: 0.8, height: 1.1, depth: 1.1 }, scene);
    const hitMat = new BABYLON.StandardMaterial('hitMat_' + id, scene);
    hitMat.alpha = 0;
    hitbox.material = hitMat;
    hitbox.parent = root;
    hitbox.position.y = 0.55;
    hitbox.isPickable = true;

    return { root, hitbox, body };
};
