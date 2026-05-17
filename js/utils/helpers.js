window.WG = window.WG || {};
WG.Helpers = {};

// --- Perlin Noise ---
(function () {
    const p = new Array(256).fill(0).map((_, i) => i);
    for (let i = 255; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [p[i], p[j]] = [p[j], p[i]];
    }
    const perm = [...p, ...p];
    function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    function lerp(a, b, t) { return a + t * (b - a); }
    function grad(h, x, y) {
        h &= 3;
        const u = h < 2 ? x : y, v = h < 2 ? y : x;
        return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
    }
    WG.Helpers.perlin = function (x, y) {
        const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
        x -= Math.floor(x); y -= Math.floor(y);
        const u = fade(x), v = fade(y);
        const a = perm[X] + Y, b = perm[X + 1] + Y;
        return lerp(
            lerp(grad(perm[a],     x,     y), grad(perm[b],     x - 1, y),     u),
            lerp(grad(perm[a + 1], x,     y - 1), grad(perm[b + 1], x - 1, y - 1), u),
            v
        );
    };
})();

WG.Helpers.terrainHeight = function (x, z) {
    const flatBlend = Math.max(0, 1 - Math.sqrt(x * x + z * z) / 90);
    const h = WG.Helpers.perlin(x * 0.018, z * 0.018) * 14
            + WG.Helpers.perlin(x * 0.005, z * 0.005) * 22;
    return h * (1 - flatBlend * flatBlend);
};

WG.Helpers.rand = function (min, max) { return min + Math.random() * (max - min); };
WG.Helpers.randInt = function (min, max) { return Math.floor(WG.Helpers.rand(min, max + 1)); };
WG.Helpers.choice = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };

WG.Helpers.distXZ = function (a, b) {
    const dx = a.x - b.x, dz = a.z - b.z;
    return Math.sqrt(dx * dx + dz * dz);
};

WG.Helpers.isMobile = function () {
    return ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
};

WG.Helpers.clamp = function (v, lo, hi) { return Math.max(lo, Math.min(hi, v)); };

WG.Helpers.lerp = function (a, b, t) { return a + (b - a) * t; };
