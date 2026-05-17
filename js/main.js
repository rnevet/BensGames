window.WG = window.WG || {};
WG.gameStarted = false;

(function () {
    const canvas = document.getElementById('renderCanvas');
    const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true });

    const scene = new BABYLON.Scene(engine);
    scene.gravity = new BABYLON.Vector3(0, -18, 0);
    scene.collisionsEnabled = true;
    scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
    scene.fogDensity = 0.012;
    scene.fogColor = new BABYLON.Color3(0.56, 0.62, 0.45);

    // Lighting
    const hemi = new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0, 1, 0), scene);
    hemi.intensity = 0.75;
    hemi.groundColor = new BABYLON.Color3(0.3, 0.28, 0.20);

    const sun = new BABYLON.DirectionalLight('sun', new BABYLON.Vector3(-0.5, -1, -0.5), scene);
    sun.intensity = 0.7;
    sun.diffuse = new BABYLON.Color3(1.0, 0.95, 0.80);

    // Sky color
    scene.clearColor = new BABYLON.Color4(0.55, 0.70, 0.85, 1.0);

    // Build world
    WG.Terrain.create(scene);
    WG.Environment.create(scene);
    WG.Territories; // ensure loaded

    // Player
    const camera = WG.Camera.create(scene, canvas);
    WG.Controller.init(scene, canvas);

    // HUD (must be before entities that reference WG.HUD._ui)
    WG.HUD.create(scene);

    // Entities
    WG.NPC.create(scene, WG.HUD._ui);
    WG.Clanmates.create(scene, WG.HUD._ui);
    WG.Spawner.init(scene, WG.HUD._ui);

    // Systems
    WG.AI.init(scene);
    WG.Combat.init(scene, canvas);
    WG.Progression.init();
    WG.Touch.init(camera);

    // Touch joystick applied each frame
    scene.onBeforeRenderObservable.add(function () {
        if (WG.gameStarted && WG.Helpers.isMobile()) {
            WG.Touch.applyJoystick();
        }
    });

    // Game loop
    engine.runRenderLoop(function () {
        scene.render();
    });

    window.addEventListener('resize', function () {
        engine.resize();
    });

    // Show title screen last
    WG.Screens.showTitle();
})();
