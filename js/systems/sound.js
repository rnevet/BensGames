window.WG = window.WG || {};
WG.Sound = {};

WG.Sound._ctx = null;

WG.Sound._getCtx = function () {
    if (WG.Sound._ctx) return WG.Sound._ctx;
    try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) WG.Sound._ctx = new AC();
    } catch (e) { /* silent */ }
    return WG.Sound._ctx;
};

WG.Sound._tone = function (freq, type, duration, vol, freqEnd) {
    const ctx = WG.Sound._getCtx();
    if (!ctx) return;
    try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        if (freqEnd !== undefined) {
            osc.frequency.linearRampToValueAtTime(freqEnd, ctx.currentTime + duration);
        }
        gain.gain.setValueAtTime(vol || 0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration + 0.01);
    } catch (e) { /* silent */ }
};

WG.Sound.attack = function () {
    WG.Sound._tone(220, 'sawtooth', 0.08, 0.25, 110);
};

WG.Sound.hit = function () {
    WG.Sound._tone(80, 'sine', 0.12, 0.35, 40);
};

WG.Sound.pickup = function () {
    WG.Sound._tone(660, 'sine', 0.15, 0.2);
    setTimeout(function () { WG.Sound._tone(880, 'sine', 0.15, 0.2); }, 80);
};

WG.Sound.rankUp = function () {
    const notes = [440, 550, 660, 880];
    notes.forEach(function (freq, i) {
        setTimeout(function () { WG.Sound._tone(freq, 'sine', 0.3, 0.22); }, i * 100);
    });
};

WG.Sound.bossTrigger = function () {
    WG.Sound._tone(110, 'sawtooth', 0.6, 0.4, 55);
};
