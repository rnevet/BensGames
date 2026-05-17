window.WG = window.WG || {};
WG.Touch = {};

WG.Touch.init = function (camera) {
    if (!WG.Helpers.isMobile()) return;

    document.getElementById('touchControls').style.display = 'block';

    // Joystick
    const joystickZone = document.getElementById('joystickZone');
    const thumb = document.getElementById('joystickThumb');
    let joystickActive = false;
    let joystickOrigin = { x: 0, y: 0 };
    let joystickDelta = { x: 0, y: 0 };

    joystickZone.addEventListener('touchstart', e => {
        e.preventDefault();
        joystickActive = true;
        const t = e.touches[0];
        const r = joystickZone.getBoundingClientRect();
        joystickOrigin = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }, { passive: false });

    joystickZone.addEventListener('touchmove', e => {
        e.preventDefault();
        if (!joystickActive) return;
        const t = e.touches[0];
        const dx = t.clientX - joystickOrigin.x;
        const dy = t.clientY - joystickOrigin.y;
        const max = 40;
        const mag = Math.sqrt(dx * dx + dy * dy);
        const cx = mag > max ? dx / mag * max : dx;
        const cy = mag > max ? dy / mag * max : dy;
        joystickDelta.x = cx / max;
        joystickDelta.y = cy / max;
        thumb.style.transform = `translate(calc(-50% + ${cx}px), calc(-50% + ${cy}px))`;
    }, { passive: false });

    const resetJoy = () => {
        joystickActive = false;
        joystickDelta.x = 0;
        joystickDelta.y = 0;
        thumb.style.transform = 'translate(-50%,-50%)';
    };
    joystickZone.addEventListener('touchend', resetJoy);
    joystickZone.addEventListener('touchcancel', resetJoy);

    // Right-side camera look
    const camZone = document.getElementById('touchCamZone');
    let lastCamTouch = null;
    camZone.addEventListener('touchstart', e => {
        e.preventDefault();
        lastCamTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: false });
    camZone.addEventListener('touchmove', e => {
        e.preventDefault();
        if (!lastCamTouch) return;
        const t = e.touches[0];
        const dx = t.clientX - lastCamTouch.x;
        const dy = t.clientY - lastCamTouch.y;
        camera.rotation.y += dx * 0.004;
        camera.rotation.x = WG.Helpers.clamp(camera.rotation.x + dy * 0.003, -0.9, 0.9);
        lastCamTouch = { x: t.clientX, y: t.clientY };
    }, { passive: false });
    camZone.addEventListener('touchend', () => { lastCamTouch = null; });

    // Attack button
    document.getElementById('touchAttackBtn').addEventListener('touchstart', e => {
        e.preventDefault();
        if (WG.gameStarted) WG.Combat.playerAttack();
    }, { passive: false });

    // Dodge button
    document.getElementById('touchDodgeBtn').addEventListener('touchstart', e => {
        e.preventDefault();
        if (WG.gameStarted) WG.Controller.dodge();
    }, { passive: false });

    // Interact button
    document.getElementById('touchInteractBtn').addEventListener('touchstart', e => {
        e.preventDefault();
        if (WG.gameStarted) WG.Controller._tryInteract();
    }, { passive: false });

    // Icon buttons
    document.getElementById('touchMapBtn').addEventListener('touchstart', e => { e.preventDefault(); WG.Map.toggle(); }, { passive: false });
    document.getElementById('touchQuestBtn').addEventListener('touchstart', e => { e.preventDefault(); WG.QuestLog.toggle(); }, { passive: false });
    document.getElementById('touchInvBtn').addEventListener('touchstart', e => { e.preventDefault(); WG.InventoryUI.toggle(); }, { passive: false });

    // Apply joystick to camera movement each frame
    WG.Touch._joystickDelta = joystickDelta;
    WG.Touch._joyActive = () => joystickActive;
    WG.Touch._camera = camera;
};

WG.Touch.applyJoystick = function () {
    if (!WG.Touch._joystickDelta || !WG.Touch._joyActive()) return;
    const cam = WG.Touch._camera;
    if (!cam) return;
    const d = WG.Touch._joystickDelta;
    if (Math.abs(d.x) < 0.05 && Math.abs(d.y) < 0.05) return;

    const speed = WG.C.PLAYER_SPEED * 0.016;
    const fwd = cam.getForwardRay(1).direction;
    const right = BABYLON.Vector3.Cross(BABYLON.Vector3.Up(), fwd).normalize();
    fwd.y = 0; fwd.normalize();
    right.y = 0; right.normalize();

    cam.position.addInPlace(fwd.scale(-d.y * speed));
    cam.position.addInPlace(right.scale(d.x * speed));

    WG.playerStats.isMoving = true;
};
