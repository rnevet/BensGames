window.WG = window.WG || {};
WG.Progression = {};

WG.Progression.init = function () {};

WG.Progression.getRankList = function () {
    const ps = WG.playerStats;
    return ps.path === 'healer' ? WG.C.RANKS_HEALER : WG.C.RANKS_WARRIOR;
};

WG.Progression.awardXP = function (amount) {
    const ps = WG.playerStats;
    ps.xp += amount;
    WG.HUD.updateXP();

    const ranks = WG.Progression.getRankList();
    let newIdx = 0;
    for (let i = ranks.length - 1; i >= 0; i--) {
        if (ps.xp >= ranks[i].xp) { newIdx = i; break; }
    }
    if (newIdx > ps.rankIndex) {
        ps.rankIndex = newIdx;
        ps.rank = ranks[newIdx].name;
        WG.Progression.onRankUp(newIdx);
    }
};

WG.Progression.onRankUp = function (idx) {
    const ps = WG.playerStats;
    const ranks = WG.Progression.getRankList();
    const rankName = ranks[idx].name;

    // Apply bonuses
    if (idx === 1) { // Lehrling / Heiler-Lehrling
        WG.Screens.showMentorChoice();
    }
    if (idx === 2) { // Krieger / Medizinkatze
        if (ps.path === 'warrior') {
            ps.attackPower += 3;
            WG.HUD.showRankSplash('Du bist jetzt ein ' + rankName + '!\n+3 Angriffskraft');
        } else {
            WG.C.HERB_HEAL_SELF = 35;
            WG.Screens.showHealerFinalChoice();
        }
    }
    if (idx === 3) { // Stellvertreter / Erfahrene Medizinkatze
        ps.maxHp += 30;
        ps.hp = Math.min(ps.hp + 30, ps.maxHp);
        WG.HUD.showRankSplash('Du bist jetzt ' + rankName + '!\n+30 max HP');
    }
    if (idx === 4 && ps.path === 'warrior') { // Anführer
        ps.lives = 9;
        WG.HUD.showRankSplash('Du bist jetzt ' + rankName + '!\n9 Leben. Der DonnerClan ist unter deiner Führung!');
        WG.Screens.showWinScreen();
    }

    if (idx !== 1) {
        WG.HUD.showRankSplash('Rang aufgestiegen: ' + rankName + '!');
    }
    WG.HUD.updateRank();
};
