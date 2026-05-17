window.WG = window.WG || {};
WG.HUD = {};

WG.HUD._ui = null;
WG.HUD._healthBar = null;
WG.HUD._xpBar = null;
WG.HUD._rankText = null;
WG.HUD._bossBar = null;
WG.HUD._bossName = null;
WG.HUD._zoneLabel = null;
WG.HUD._pickupText = null;
WG.HUD._splashText = null;
WG.HUD._vignetteRect = null;
WG.HUD._pickupTimeout = null;
WG.HUD._splashTimeout = null;

WG.HUD.create = function (scene) {
    const ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('HUD', true, scene);
    WG.HUD._ui = ui;

    // Crosshair
    const ch = new BABYLON.GUI.Ellipse('crosshair');
    ch.width = '8px'; ch.height = '8px';
    ch.color = 'rgba(255,255,255,0.8)'; ch.thickness = 2;
    ch.background = 'transparent';
    ui.addControl(ch);

    // Bottom left panel background
    const hudBg = new BABYLON.GUI.Rectangle('hudBg');
    hudBg.width = '220px'; hudBg.height = '80px';
    hudBg.cornerRadius = 8;
    hudBg.background = 'rgba(10,6,2,0.65)';
    hudBg.color = '#8B6914'; hudBg.thickness = 1;
    hudBg.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    hudBg.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    hudBg.left = '12px'; hudBg.top = '-12px';
    ui.addControl(hudBg);

    // Rank label
    const rankLabel = new BABYLON.GUI.TextBlock('rankLabel', '');
    rankLabel.color = '#FFD700'; rankLabel.fontSize = 12;
    rankLabel.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    rankLabel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    rankLabel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    rankLabel.left = '22px'; rankLabel.top = '-58px';
    ui.addControl(rankLabel);
    WG.HUD._rankText = rankLabel;

    // HP label
    const hpLabel = new BABYLON.GUI.TextBlock('hpLabel', 'HP');
    hpLabel.color = '#F5DEB3'; hpLabel.fontSize = 11;
    hpLabel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    hpLabel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    hpLabel.left = '22px'; hpLabel.top = '-40px';
    ui.addControl(hpLabel);

    // HP bar bg
    const hpBg = new BABYLON.GUI.Rectangle('hpBg');
    hpBg.width = '160px'; hpBg.height = '12px';
    hpBg.cornerRadius = 4; hpBg.background = '#330000'; hpBg.color = '#550000'; hpBg.thickness = 1;
    hpBg.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    hpBg.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    hpBg.left = '42px'; hpBg.top = '-40px';
    ui.addControl(hpBg);

    const hpBar = new BABYLON.GUI.Rectangle('hpBar');
    hpBar.width = '160px'; hpBar.height = '12px';
    hpBar.cornerRadius = 4; hpBar.background = '#CC2222'; hpBar.color = 'transparent'; hpBar.thickness = 0;
    hpBar.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    hpBar.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    hpBar.left = '42px'; hpBar.top = '-40px';
    ui.addControl(hpBar);
    WG.HUD._healthBar = hpBar;

    // XP bar
    const xpLabel = new BABYLON.GUI.TextBlock('xpLabel', 'XP');
    xpLabel.color = '#C8A96E'; xpLabel.fontSize = 11;
    xpLabel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    xpLabel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    xpLabel.left = '22px'; xpLabel.top = '-22px';
    ui.addControl(xpLabel);

    const xpBg = new BABYLON.GUI.Rectangle('xpBg');
    xpBg.width = '160px'; xpBg.height = '8px';
    xpBg.cornerRadius = 3; xpBg.background = '#1a1200'; xpBg.color = '#3a2800'; xpBg.thickness = 1;
    xpBg.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    xpBg.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    xpBg.left = '42px'; xpBg.top = '-22px';
    ui.addControl(xpBg);

    const xpBar = new BABYLON.GUI.Rectangle('xpBar');
    xpBar.width = '0px'; xpBar.height = '8px';
    xpBar.cornerRadius = 3; xpBar.background = '#CC8800'; xpBar.color = 'transparent'; xpBar.thickness = 0;
    xpBar.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    xpBar.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    xpBar.left = '42px'; xpBar.top = '-22px';
    ui.addControl(xpBar);
    WG.HUD._xpBar = xpBar;

    // Boss bar (top center, hidden)
    const bossCont = new BABYLON.GUI.Rectangle('bossCont');
    bossCont.width = '360px'; bossCont.height = '44px';
    bossCont.cornerRadius = 6; bossCont.background = 'rgba(10,4,2,0.8)';
    bossCont.color = '#8B0000'; bossCont.thickness = 2;
    bossCont.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    bossCont.top = '16px';
    bossCont.isVisible = false;
    ui.addControl(bossCont);
    WG.HUD._bossCont = bossCont;

    const bossNameTxt = new BABYLON.GUI.TextBlock('bossName', '');
    bossNameTxt.color = '#FF6666'; bossNameTxt.fontSize = 13; bossNameTxt.fontWeight = 'bold';
    bossNameTxt.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    bossNameTxt.top = '20px';
    bossNameTxt.isVisible = false;
    ui.addControl(bossNameTxt);
    WG.HUD._bossName = bossNameTxt;

    const bossBg = new BABYLON.GUI.Rectangle('bossBg');
    bossBg.width = '340px'; bossBg.height = '10px';
    bossBg.cornerRadius = 4; bossBg.background = '#2a0000'; bossBg.color = '#550000'; bossBg.thickness = 1;
    bossBg.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    bossBg.top = '38px'; bossBg.isVisible = false;
    ui.addControl(bossBg);
    WG.HUD._bossBg = bossBg;

    const bossBar = new BABYLON.GUI.Rectangle('bossBar');
    bossBar.width = '340px'; bossBar.height = '10px';
    bossBar.cornerRadius = 4; bossBar.background = '#CC0000'; bossBar.color = 'transparent'; bossBar.thickness = 0;
    bossBar.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    bossBar.top = '38px'; bossBar.isVisible = false;
    ui.addControl(bossBar);
    WG.HUD._bossBar = bossBar;

    // Zone label (top center, fades)
    const zoneTxt = new BABYLON.GUI.TextBlock('zoneLabel', '');
    zoneTxt.color = '#FFFFFF'; zoneTxt.fontSize = 18; zoneTxt.fontWeight = 'bold';
    zoneTxt.outlineWidth = 3; zoneTxt.outlineColor = '#000';
    zoneTxt.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    zoneTxt.top = '72px'; zoneTxt.alpha = 0;
    ui.addControl(zoneTxt);
    WG.HUD._zoneLabel = zoneTxt;

    // Pickup / notification text (upper right-ish)
    const pickupTxt = new BABYLON.GUI.TextBlock('pickupTxt', '');
    pickupTxt.color = '#90EE90'; pickupTxt.fontSize = 14;
    pickupTxt.outlineWidth = 2; pickupTxt.outlineColor = '#000';
    pickupTxt.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    pickupTxt.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    pickupTxt.right = '16px'; pickupTxt.top = '110px';
    pickupTxt.alpha = 0;
    ui.addControl(pickupTxt);
    WG.HUD._pickupText = pickupTxt;

    // Rank-up / boss splash
    const splashTxt = new BABYLON.GUI.TextBlock('splashTxt', '');
    splashTxt.color = '#FFD700'; splashTxt.fontSize = 24; splashTxt.fontWeight = 'bold';
    splashTxt.outlineWidth = 4; splashTxt.outlineColor = '#000';
    splashTxt.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    splashTxt.top = '120px'; splashTxt.alpha = 0;
    splashTxt.textWrapping = true;
    ui.addControl(splashTxt);
    WG.HUD._splashText = splashTxt;

    // Vignette (red hit effect)
    const vignette = new BABYLON.GUI.Rectangle('vignette');
    vignette.width = '100%'; vignette.height = '100%';
    vignette.background = 'rgba(180,0,0,0.28)'; vignette.color = 'transparent'; vignette.thickness = 0;
    vignette.alpha = 0; vignette.isPointerBlocker = false;
    ui.addControl(vignette);
    WG.HUD._vignetteRect = vignette;

    WG.HUD.updateHealth();
    WG.HUD.updateXP();
    WG.HUD.updateRank();
    return ui;
};

WG.HUD.updateHealth = function () {
    const ps = WG.playerStats;
    const ratio = Math.max(0, ps.hp / ps.maxHp);
    if (WG.HUD._healthBar) WG.HUD._healthBar.scaleX = ratio;
};

WG.HUD.updateXP = function () {
    const ps = WG.playerStats;
    const ranks = WG.Progression.getRankList();
    const cur = ranks[ps.rankIndex];
    const next = ranks[ps.rankIndex + 1];
    if (!next) { if (WG.HUD._xpBar) WG.HUD._xpBar.width = '160px'; return; }
    const ratio = (ps.xp - cur.xp) / (next.xp - cur.xp);
    if (WG.HUD._xpBar) WG.HUD._xpBar.width = Math.floor(WG.Helpers.clamp(ratio, 0, 1) * 160) + 'px';
};

WG.HUD.updateRank = function () {
    if (WG.HUD._rankText) {
        const ps = WG.playerStats;
        WG.HUD._rankText.text = (ps.name || 'Katze') + ' · ' + ps.rank;
    }
};

WG.HUD.setBossBar = function (name, ratio) {
    const visible = !!name;
    [WG.HUD._bossCont, WG.HUD._bossName, WG.HUD._bossBg, WG.HUD._bossBar].forEach(el => {
        if (el) el.isVisible = visible;
    });
    if (visible && WG.HUD._bossName) WG.HUD._bossName.text = '☠ ' + name;
    if (WG.HUD._bossBar) WG.HUD._bossBar.scaleX = Math.max(0, ratio);
};

WG.HUD.showZoneLabel = function (text) {
    const lbl = WG.HUD._zoneLabel;
    if (!lbl) return;
    lbl.text = text;
    lbl.alpha = 1;
    clearTimeout(WG.HUD._zoneFade);
    WG.HUD._zoneFade = setTimeout(() => {
        let a = 1;
        const fade = setInterval(() => {
            a -= 0.04;
            lbl.alpha = Math.max(0, a);
            if (a <= 0) clearInterval(fade);
        }, 60);
    }, 2000);
};

WG.HUD.showPickup = function (text) {
    const t = WG.HUD._pickupText;
    if (!t) return;
    t.text = text;
    t.alpha = 1;
    clearTimeout(WG.HUD._pickupTimeout);
    WG.HUD._pickupTimeout = setTimeout(() => {
        let a = 1;
        const fade = setInterval(() => {
            a -= 0.06;
            t.alpha = Math.max(0, a);
            if (a <= 0) clearInterval(fade);
        }, 80);
    }, 2000);
};

WG.HUD.showRankSplash = function (text) {
    const t = WG.HUD._splashText;
    if (!t) return;
    t.text = text;
    t.alpha = 1;
    t.scaleX = 0.8; t.scaleY = 0.8;
    clearTimeout(WG.HUD._splashTimeout);
    let frame = 0;
    const anim = setInterval(() => {
        frame++;
        const s = WG.Helpers.lerp(0.8, 1.0, Math.min(frame / 8, 1));
        t.scaleX = s; t.scaleY = s;
        if (frame >= 8) clearInterval(anim);
    }, 30);
    WG.HUD._splashTimeout = setTimeout(() => {
        let a = 1;
        const fade = setInterval(() => {
            a -= 0.04;
            t.alpha = Math.max(0, a);
            if (a <= 0) clearInterval(fade);
        }, 80);
    }, 2800);
};

WG.HUD.showVignette = function () {
    const v = WG.HUD._vignetteRect;
    if (!v) return;
    v.alpha = 0.6;
    let a = 0.6;
    const fade = setInterval(() => {
        a -= 0.06;
        v.alpha = Math.max(0, a);
        if (a <= 0) clearInterval(fade);
    }, 50);
};
