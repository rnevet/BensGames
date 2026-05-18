window.WG = window.WG || {};
WG.Graphics = {};
WG.Graphics._shadowGenerator = null;
WG.Graphics._glowLayer = null;
WG.Graphics._skySphere = null;
WG.Graphics._skyMat = null;

WG.Graphics.init = function (scene, sun) {
    // Glow layer — subtle glow on emissive surfaces (eyes, fire, herbs)
    WG.Graphics._glowLayer = new BABYLON.GlowLayer('glow', scene);
    WG.Graphics._glowLayer.intensity = 0.45;

    // Sky sphere — large back-face-rendered sphere with emissive sky colour
    WG.Graphics._skySphere = BABYLON.MeshBuilder.CreateSphere('skySphere',
        { diameter: 950, segments: 8, sideOrientation: BABYLON.Mesh.BACKSIDE }, scene);
    const skyMat = new BABYLON.StandardMaterial('skyMat', scene);
    skyMat.disableLighting = true;
    skyMat.backFaceCulling = false;
    skyMat.emissiveColor = new BABYLON.Color3(0.55, 0.70, 0.85);
    WG.Graphics._skySphere.material = skyMat;
    WG.Graphics._skySphere.isPickable = false;
    WG.Graphics._skyMat = skyMat;

    // Shadow generator — desktop only (skip on mobile for performance)
    if (!WG.Helpers.isMobile()) {
        const shadowGen = new BABYLON.ShadowGenerator(512, sun);
        shadowGen.useBlurExponentialShadowMap = true;
        WG.Graphics._shadowGenerator = shadowGen;
    }
};

WG.Graphics.addShadowCaster = function (mesh) {
    if (WG.Graphics._shadowGenerator) {
        WG.Graphics._shadowGenerator.addShadowCaster(mesh, true);
    }
};

WG.Graphics.setSkyColor = function (r, g, b) {
    if (WG.Graphics._skyMat) {
        WG.Graphics._skyMat.emissiveColor = new BABYLON.Color3(r, g, b);
    }
};
