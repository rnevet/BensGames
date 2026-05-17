window.WG = window.WG || {};
WG.Camera = {};

WG.Camera.cam = null;
WG.Camera._bobTime = 0;
WG.Camera._bobBaseY = WG.C ? WG.C.PLAYER_HEIGHT : 1.2;

WG.Camera.create = function (scene, canvas) {
    const cam = new BABYLON.UniversalCamera('fpCam',
        new BABYLON.Vector3(0, WG.C.PLAYER_HEIGHT + 2, 0), scene);
    cam.setTarget(new BABYLON.Vector3(1, WG.C.PLAYER_HEIGHT + 2, 0));
    cam.minZ = 0.1;
    cam.fov = 1.15;
    cam.checkCollisions = true;
    cam.applyGravity = true;
    cam.ellipsoid = new BABYLON.Vector3(0.55, WG.C.PLAYER_HEIGHT, 0.55);
    cam.ellipsoidOffset = new BABYLON.Vector3(0, WG.C.PLAYER_HEIGHT, 0);
    cam.speed = WG.C.PLAYER_SPEED * 0.1;
    cam.angularSensibility = WG.C.PLAYER_ANGULAR;
    cam.keysUp    = [87, 38]; // W / Up
    cam.keysDown  = [83, 40]; // S / Down
    cam.keysLeft  = [65, 37]; // A / Left
    cam.keysRight = [68, 39]; // D / Right

    if (!WG.Helpers.isMobile()) {
        cam.attachControl(canvas, true);
    }

    WG.Camera.cam = cam;
    WG.Camera._bobBaseY = WG.C.PLAYER_HEIGHT;

    // Head bobbing + terrain following
    scene.onBeforeRenderObservable.add(function () {
        if (!WG.gameStarted) return;
        const ps = WG.playerStats;
        const dt = scene.getEngine().getDeltaTime() / 1000;

        if (ps.isMoving && !ps.isDodging) {
            WG.Camera._bobTime += dt * 7;
            const bob = Math.sin(WG.Camera._bobTime) * 0.055;
            cam.position.y += bob * dt * 3;
        }

        // Clamp camera to terrain
        const th = WG.Helpers.terrainHeight(cam.position.x, cam.position.z);
        const minY = th + WG.C.PLAYER_HEIGHT;
        if (cam.position.y < minY) cam.position.y = minY;

        // World boundary
        const half = WG.C.WORLD_SIZE * 0.48;
        cam.position.x = WG.Helpers.clamp(cam.position.x, -half, half);
        cam.position.z = WG.Helpers.clamp(cam.position.z, -half, half);
    });

    // Pointer lock on click (PC)
    canvas.addEventListener('click', function () {
        if (WG.gameStarted && !WG.Helpers.isMobile() && !WG.Dialog.isOpen()) {
            canvas.requestPointerLock();
        }
    });

    return cam;
};
