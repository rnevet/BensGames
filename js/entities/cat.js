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

    // Eye material — emissive amber glow
    const eyeMat = new BABYLON.StandardMaterial('eyeMat_' + id, scene);
    eyeMat.diffuseColor = new BABYLON.Color3(0.9, 0.8, 0.1);
    eyeMat.emissiveColor = new BABYLON.Color3(0.95, 0.85, 0.1);

    // Nose material
    const noseMat = new BABYLON.StandardMaterial('noseMat_' + id, scene);
    noseMat.diffuseColor = new BABYLON.Color3(0.15, 0.10, 0.08);

    const root = new BABYLON.TransformNode('cat_' + id, scene);

    // Body — slightly larger
    const body = BABYLON.MeshBuilder.CreateBox('catBody_' + id,
        { width: 0.65, height: 0.45, depth: 1.0 }, scene);
    body.material = mat;
    body.parent = root;
    body.position.y = 0.42;
    body.isPickable = false;

    // Head — larger, moved forward
    const head = BABYLON.MeshBuilder.CreateSphere('catHead_' + id,
        { diameter: 0.48, segments: 7 }, scene);
    head.material = mat;
    head.parent = root;
    head.position.set(0, 0.80, 0.50);
    head.isPickable = false;

    // Ears — taller, raised higher
    for (let s = -1; s <= 1; s += 2) {
        const ear = BABYLON.MeshBuilder.CreateBox('catEar_' + id + '_' + s,
            { width: 0.10, height: 0.19, depth: 0.08 }, scene);
        ear.material = mat;
        ear.parent = root;
        ear.position.set(s * 0.14, 1.06, 0.46);
        ear.isPickable = false;
    }

    // Eyes — larger, emissive
    for (let s = -1; s <= 1; s += 2) {
        const eye = BABYLON.MeshBuilder.CreateSphere('catEye_' + id + '_' + s,
            { diameter: 0.09, segments: 4 }, scene);
        eye.material = eyeMat;
        eye.parent = root;
        eye.position.set(s * 0.11, 0.82, 0.68);
        eye.isPickable = false;
    }

    // Nose — small dark box
    const nose = BABYLON.MeshBuilder.CreateBox('catNose_' + id,
        { width: 0.07, height: 0.05, depth: 0.06 }, scene);
    nose.material = noseMat;
    nose.parent = root;
    nose.position.set(0, 0.75, 0.69);
    nose.isPickable = false;

    // Whiskers — 4 thin cylinders (2 per side), ~15° from horizontal
    const whiskerAngle = 15 * Math.PI / 180;
    const whiskerConfigs = [
        // left side: two whiskers pointing left-forward
        { x: -0.14, rotY: -0.4,  rotZ:  whiskerAngle },
        { x: -0.14, rotY: -0.4,  rotZ: -whiskerAngle },
        // right side: two whiskers pointing right-forward
        { x:  0.14, rotY:  0.4,  rotZ:  whiskerAngle },
        { x:  0.14, rotY:  0.4,  rotZ: -whiskerAngle },
    ];
    whiskerConfigs.forEach(function (cfg, wi) {
        const whisker = BABYLON.MeshBuilder.CreateCylinder('catWhisker_' + id + '_' + wi,
            { diameter: 0.018, height: 0.35, tessellation: 4 }, scene);
        whisker.material = darkMat;
        whisker.parent = root;
        whisker.position.set(cfg.x, 0.75, 0.66);
        whisker.rotation.set(0, cfg.rotY, cfg.rotZ);
        whisker.isPickable = false;
    });

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

    // Tail — with animated wag
    const tail = BABYLON.MeshBuilder.CreateCylinder('catTail_' + id,
        { diameterTop: 0.04, diameterBottom: 0.09, height: 0.68, tessellation: 6 }, scene);
    tail.material = mat;
    tail.parent = root;
    tail.position.set(0, 0.65, -0.50);
    tail.rotation.x = -0.7;
    tail.isPickable = false;

    // Tail wag animation
    const tailAnim = new BABYLON.Animation(
        'tailWag_' + id,
        'rotation.z',
        30,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
    );
    tailAnim.setKeys([
        { frame: 0,  value: -0.4 },
        { frame: 45, value:  0.4 },
        { frame: 90, value: -0.4 },
    ]);
    tail.animations = [tailAnim];
    scene.beginAnimation(tail, 0, 90, true);

    // Hitbox (invisible, pickable, for raycast)
    const hitbox = BABYLON.MeshBuilder.CreateBox('catHit_' + id,
        { width: 0.8, height: 1.1, depth: 1.1 }, scene);
    const hitMat = new BABYLON.StandardMaterial('hitMat_' + id, scene);
    hitMat.alpha = 0;
    hitbox.material = hitMat;
    hitbox.parent = root;
    hitbox.position.y = 0.55;
    hitbox.isPickable = true;

    // Shadow casting (if shadow generator available)
    if (WG.Graphics && WG.Graphics._shadowGenerator) {
        [body, head].forEach(m => WG.Graphics.addShadowCaster(m));
    }

    return { root, hitbox, body };
};
