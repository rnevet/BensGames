window.WG = window.WG || {};
WG.DayNight = {};

WG.DayNight.time = 0.3;   // 0=midnight, 0.25=dawn, 0.5=noon, 0.75=dusk
WG.DayNight.CYCLE = 480;  // seconds per full day

WG.DayNight._label = null;

WG.DayNight._KEYFRAMES = [
    // midnight (t=0 and t=1)
    {
        sky:   [13/255,  13/255,  38/255,  1],
        fog:   [10/255,  10/255,  30/255],
        fogDensity: 0.025,
        sun: 0, hemi: 0.18,
        sunDir: [-0.2, -1, -0.2],
    },
    // dawn (t=0.25)
    {
        sky:   [191/255, 115/255, 64/255,  1],
        fog:   [150/255, 90/255,  50/255],
        fogDensity: 0.014,
        sun: 0.5, hemi: 0.5,
        sunDir: [-1, -0.4, -0.3],
    },
    // noon (t=0.5)
    {
        sky:   [140/255, 179/255, 217/255, 1],
        fog:   [143/255, 158/255, 115/255],
        fogDensity: 0.010,
        sun: 0.85, hemi: 0.75,
        sunDir: [-0.2, -1, -0.2],
    },
    // dusk (t=0.75)
    {
        sky:   [179/255, 89/255,  51/255,  1],
        fog:   [140/255, 70/255,  40/255],
        fogDensity: 0.014,
        sun: 0.4, hemi: 0.45,
        sunDir: [1, -0.4, 0.3],
    },
];

WG.DayNight._lerpNum = function (a, b, t) { return a + (b - a) * t; };

WG.DayNight._lerpKF = function (kfA, kfB, t) {
    const L = WG.DayNight._lerpNum;
    return {
        sky:  kfA.sky.map(function (v, i) { return L(v, kfB.sky[i], t); }),
        fog:  kfA.fog.map(function (v, i) { return L(v, kfB.fog[i], t); }),
        fogDensity: L(kfA.fogDensity, kfB.fogDensity, t),
        sun:  L(kfA.sun,  kfB.sun,  t),
        hemi: L(kfA.hemi, kfB.hemi, t),
        sunDir: kfA.sunDir.map(function (v, i) { return L(v, kfB.sunDir[i], t); }),
    };
};

WG.DayNight._apply = function (scene, sun, hemi) {
    const KF = WG.DayNight._KEYFRAMES;
    const t = WG.DayNight.time;

    // Map t (0..1) to segment index (4 keyframes at 0, 0.25, 0.5, 0.75)
    // Segments: 0->0.25, 0.25->0.5, 0.5->0.75, 0.75->1(==0)
    let seg, local;
    if (t < 0.25) {
        seg = 0; local = t / 0.25;           // midnight -> dawn
        // KF[0] -> KF[1]
        var a = KF[0], b = KF[1];
    } else if (t < 0.5) {
        seg = 1; local = (t - 0.25) / 0.25;  // dawn -> noon
        var a = KF[1], b = KF[2];
    } else if (t < 0.75) {
        seg = 2; local = (t - 0.5) / 0.25;   // noon -> dusk
        var a = KF[2], b = KF[3];
    } else {
        seg = 3; local = (t - 0.75) / 0.25;  // dusk -> midnight
        var a = KF[3], b = KF[0];
    }

    const v = WG.DayNight._lerpKF(a, b, local);

    scene.clearColor = new BABYLON.Color4(v.sky[0], v.sky[1], v.sky[2], v.sky[3]);
    scene.fogColor   = new BABYLON.Color3(v.fog[0], v.fog[1], v.fog[2]);
    scene.fogDensity = v.fogDensity;
    sun.intensity    = v.sun;
    hemi.intensity   = v.hemi;
    sun.direction    = new BABYLON.Vector3(v.sunDir[0], v.sunDir[1], v.sunDir[2]);

    // Update time-of-day label
    if (WG.DayNight._label) {
        var icon;
        if (t < 0.125 || t >= 0.875)       icon = '🌙';
        else if (t < 0.375)                 icon = '🌅';
        else if (t < 0.625)                 icon = '☀';
        else                                icon = '🌇';
        WG.DayNight._label.textContent = icon;
    }

    // Update sky sphere colour
    var sky = { r: v.sky[0], g: v.sky[1], b: v.sky[2] };
    if (WG.Graphics && WG.Graphics.setSkyColor) {
        WG.Graphics.setSkyColor(sky.r, sky.g, sky.b);
    }

    // Fire light — brighter at night (day fraction = v.sun clamped 0..1)
    if (WG.Environment && WG.Environment._fireLight) {
        var dayFrac = WG.Helpers.clamp(v.sun, 0, 1);
        WG.Environment._fireLight.intensity = 1.4 * (1.0 + (1 - dayFrac) * 0.8);
    }
};

WG.DayNight.init = function (scene, sun, hemi) {
    // Create DOM label
    var lbl = document.createElement('div');
    lbl.id = 'tod-label';
    lbl.style.cssText = 'position:fixed;top:16px;left:146px;font-size:22px;z-index:101;pointer-events:none;display:none;';
    document.body.appendChild(lbl);
    WG.DayNight._label = lbl;

    var lastTime = performance.now();

    scene.onBeforeRenderObservable.add(function () {
        if (!WG.gameStarted) return;

        // Show label once game starts
        if (lbl.style.display === 'none') lbl.style.display = 'block';

        var now = performance.now();
        var dt = (now - lastTime) / 1000;
        lastTime = now;

        WG.DayNight.time = (WG.DayNight.time + dt / WG.DayNight.CYCLE) % 1;
        WG.DayNight._apply(scene, sun, hemi);
    });
};
