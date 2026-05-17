window.WG = window.WG || {};
WG.Screens = {};

WG.Screens._overlay = null;

WG.Screens._makeOverlay = function (html) {
    let el = document.getElementById('screenOverlay');
    if (!el) {
        el = document.createElement('div');
        el.id = 'screenOverlay';
        el.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;z-index:1000;
            display:flex;align-items:center;justify-content:center;
            background:rgba(0,0,0,0.88);font-family:Georgia,serif;color:#F5DEB3;`;
        document.body.appendChild(el);
    }
    el.innerHTML = html;
    el.style.display = 'flex';
    WG.Screens._overlay = el;
    return el;
};

WG.Screens._hideOverlay = function () {
    if (WG.Screens._overlay) WG.Screens._overlay.style.display = 'none';
};

WG.Screens.showTitle = function (onStart) {
    const el = WG.Screens._makeOverlay(`
        <div style="text-align:center;max-width:480px;padding:24px;">
            <div style="font-size:12px;letter-spacing:4px;color:#8B6914;margin-bottom:8px;">EIN BROWSERSPIEL</div>
            <h1 style="font-size:36px;color:#FFD700;text-shadow:0 0 20px #CC8800;margin-bottom:6px;">WARRIORS</h1>
            <h2 style="font-size:20px;color:#F5DEB3;font-weight:normal;margin-bottom:30px;">Aufstieg des DonnerClans</h2>
            <p style="font-size:13px;color:#C8A96E;margin-bottom:28px;line-height:1.7;">
                Du bist eine Katze im DonnerClan.<br>
                Kämpfe für deinen Clan, werde ausgebildet und steige<br>
                bis zum Anführer auf.
            </p>
            <button id="startBtn" style="background:#5a3e0a;border:2px solid #8B6914;color:#FFD700;
                font-family:Georgia,serif;font-size:18px;padding:14px 40px;cursor:pointer;border-radius:6px;
                letter-spacing:1px;">SPIELEN</button>
            <div style="margin-top:20px;font-size:11px;color:#666;">
                PC: WASD bewegen · Maus umschauen · Linksklick angreifen · Leertaste ausweichen<br>
                E interagieren · M Karte · J Quests · I Vorräte
            </div>
        </div>
    `);
    document.getElementById('startBtn').addEventListener('click', () => {
        WG.Screens.showNameEntry(onStart);
    });
};

WG.Screens.showNameEntry = function (onStart) {
    const el = WG.Screens._makeOverlay(`
        <div style="text-align:center;max-width:400px;padding:24px;">
            <h2 style="color:#FFD700;margin-bottom:8px;">Wer bist du?</h2>
            <p style="color:#C8A96E;font-size:13px;margin-bottom:20px;">Gib den Namen deiner Katze ein.<br>Du bist noch ein Jüngling des DonnerClans.</p>
            <input id="catNameInput" type="text" maxlength="20" placeholder="z.B. Blaustern, Feuerpfote..."
                style="width:80%;padding:10px 14px;font-family:Georgia,serif;font-size:16px;
                background:#1a0f03;border:2px solid #8B6914;color:#F5DEB3;border-radius:4px;
                outline:none;margin-bottom:18px;display:block;margin:0 auto 18px;">
            <button id="nameBtn" style="background:#5a3e0a;border:2px solid #8B6914;color:#FFD700;
                font-family:Georgia,serif;font-size:16px;padding:12px 36px;cursor:pointer;border-radius:6px;">
                Ins Lager eintreten
            </button>
        </div>
    `);
    document.getElementById('catNameInput').focus();
    const proceed = () => {
        const val = document.getElementById('catNameInput').value.trim();
        WG.playerStats.name = val || 'Jüngling';
        WG.HUD.updateRank();
        WG.Screens._hideOverlay();
        WG.gameStarted = true;
        if (!WG.Helpers.isMobile()) {
            document.getElementById('renderCanvas').requestPointerLock();
        }
        WG.Quest.start('patrol');
        onStart && onStart();
    };
    document.getElementById('nameBtn').addEventListener('click', proceed);
    document.getElementById('catNameInput').addEventListener('keydown', e => {
        if (e.key === 'Enter') proceed();
    });
};

WG.Screens.showMentorChoice = function () {
    WG.gameStarted = false;
    if (document.exitPointerLock) document.exitPointerLock();

    const el = WG.Screens._makeOverlay(`
        <div style="text-align:center;max-width:500px;padding:28px;">
            <h2 style="color:#FFD700;margin-bottom:10px;">Du bist nun ein Lehrling!</h2>
            <p style="color:#C8A96E;font-size:14px;margin-bottom:24px;line-height:1.7;">
                Es ist Zeit, einen Mentor zu wählen.<br>
                Dein Mentor bestimmt, welchen Weg du gehst.
            </p>
            <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
                <div class="mentor-card" id="pickWarrior" style="cursor:pointer;background:rgba(90,40,10,0.5);border:2px solid #8B6914;
                    border-radius:8px;padding:18px 24px;flex:1;min-width:180px;transition:background 0.2s;">
                    <div style="font-size:28px;margin-bottom:8px;">⚔</div>
                    <div style="color:#FFD700;font-size:16px;font-weight:bold;margin-bottom:6px;">Feuerstern</div>
                    <div style="font-size:13px;color:#C8A96E;">Krieger-Mentor<br>Kampfkünste & Stärke</div>
                </div>
                <div class="mentor-card" id="pickHealer" style="cursor:pointer;background:rgba(10,60,20,0.5);border:2px solid #2a8a4a;
                    border-radius:8px;padding:18px 24px;flex:1;min-width:180px;transition:background 0.2s;">
                    <div style="font-size:28px;margin-bottom:8px;">🌿</div>
                    <div style="color:#90EE90;font-size:16px;font-weight:bold;margin-bottom:6px;">Blattschatten</div>
                    <div style="font-size:13px;color:#C8A96E;">Heiler-Mentor<br>Kräuter & Heilung</div>
                </div>
            </div>
            <p style="color:#666;font-size:11px;margin-top:16px;">Du kannst deinen Mentor jederzeit im Lager wechseln.</p>
        </div>
    `);

    const choose = (path) => {
        WG.playerStats.mentor = path;
        WG.playerStats.path = path;
        const rankList = WG.Progression.getRankList();
        WG.playerStats.rank = rankList[1].name;
        WG.HUD.updateRank();
        WG.Screens._hideOverlay();
        WG.gameStarted = true;
        const mentorName = path === 'warrior' ? WG.C.NPC_MENTOR_WARRIOR.name : WG.C.NPC_MENTOR_HEALER.name;
        WG.HUD.showRankSplash('Dein Mentor ist ' + mentorName + '!');
        if (!WG.Helpers.isMobile()) {
            document.getElementById('renderCanvas').requestPointerLock();
        }
        if (path === 'warrior') WG.Quest.start('shadows');
        else WG.Quest.start('herbs');
    };

    document.getElementById('pickWarrior').addEventListener('click', () => choose('warrior'));
    document.getElementById('pickHealer').addEventListener('click', () => choose('healer'));
};

WG.Screens.showDeathScreen = function (livesLeft) {
    WG.gameStarted = false;
    if (document.exitPointerLock) document.exitPointerLock();
    const el = WG.Screens._makeOverlay(`
        <div style="text-align:center;max-width:380px;padding:28px;">
            <h2 style="color:#FF4444;margin-bottom:10px;">Du wurdest besiegt!</h2>
            <p style="color:#C8A96E;font-size:14px;margin-bottom:16px;">
                Du kehrst ins Lager zurück...<br>
                <span style="color:#FFD700">Verbleibende Leben: ${livesLeft}</span>
            </p>
            <button id="respawnBtn" style="background:#5a3e0a;border:2px solid #8B6914;color:#FFD700;
                font-family:Georgia,serif;font-size:16px;padding:12px 36px;cursor:pointer;border-radius:6px;">
                Weiterkämpfen
            </button>
        </div>
    `);
    document.getElementById('respawnBtn').addEventListener('click', () => {
        WG.Screens._hideOverlay();
        WG.gameStarted = true;
        if (!WG.Helpers.isMobile()) {
            document.getElementById('renderCanvas').requestPointerLock();
        }
    });
};

WG.Screens.showGameOver = function () {
    WG.gameStarted = false;
    if (document.exitPointerLock) document.exitPointerLock();
    WG.Screens._makeOverlay(`
        <div style="text-align:center;max-width:380px;padding:28px;">
            <h2 style="color:#FF2222;font-size:32px;margin-bottom:10px;">☠ Game Over</h2>
            <p style="color:#C8A96E;font-size:14px;margin-bottom:20px;">
                Der DonnerClan trauert um dich.<br>Du hast alle Leben verloren.
            </p>
            <button onclick="location.reload()" style="background:#5a3e0a;border:2px solid #8B6914;color:#FFD700;
                font-family:Georgia,serif;font-size:16px;padding:12px 36px;cursor:pointer;border-radius:6px;">
                Von vorn beginnen
            </button>
        </div>
    `);
};

WG.Screens.showWinScreen = function () {
    WG.gameStarted = false;
    if (document.exitPointerLock) document.exitPointerLock();
    WG.Screens._makeOverlay(`
        <div style="text-align:center;max-width:460px;padding:32px;">
            <div style="font-size:48px;margin-bottom:12px;">🏆</div>
            <h1 style="color:#FFD700;font-size:30px;text-shadow:0 0 20px #CC8800;margin-bottom:10px;">
                Anführer des DonnerClans!
            </h1>
            <p style="color:#C8A96E;font-size:15px;margin-bottom:10px;line-height:1.7;">
                ${WG.playerStats.name} hat sich durch Mut und Stärke<br>
                zur Anführerin / zum Anführer des DonnerClans hochgekämpft.<br>
                Der Wald gehört dem DonnerClan!
            </p>
            <p style="color:#FFD700;font-size:13px;margin-bottom:22px;">✧ Sternenclan ehrt dich ✧</p>
            <button onclick="location.reload()" style="background:#5a3e0a;border:2px solid #8B6914;color:#FFD700;
                font-family:Georgia,serif;font-size:16px;padding:12px 36px;cursor:pointer;border-radius:6px;">
                Neues Spiel
            </button>
        </div>
    `);
};
