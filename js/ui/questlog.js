window.WG = window.WG || {};
WG.QuestLog = {};

WG.QuestLog.toggle = function () {
    const panel = document.getElementById('questPanel');
    if (panel.classList.contains('active')) WG.QuestLog.close();
    else WG.QuestLog.open();
};
WG.QuestLog.open = function () {
    WG.QuestLog.render();
    document.getElementById('questPanel').classList.add('active');
};
WG.QuestLog.close = function () {
    document.getElementById('questPanel').classList.remove('active');
};

WG.QuestLog.render = function () {
    const ps = WG.playerStats;
    const container = document.getElementById('questList');
    if (!container) return;
    container.innerHTML = '';

    const allQ = WG.Quest.getAll();

    if (ps.activeQuests.length === 0 && ps.completedQuests.length === 0) {
        container.innerHTML = '<div style="color:#888;font-size:13px;text-align:center;padding:12px;">Noch keine Quests angenommen.</div>';
        return;
    }

    // Active
    ps.activeQuests.forEach(id => {
        const q = allQ[id];
        if (!q) return;
        const div = document.createElement('div');
        div.className = 'quest-item';
        const progress = q._progress || q.objectives;
        const objHtml = progress.map(o =>
            `<div class="quest-obj">▷ ${o.label}</div>`
        ).join('');
        div.innerHTML = `<div class="quest-title">📜 ${q.title}</div>
                         <div class="quest-desc">${q.desc}</div>
                         ${objHtml}
                         <div class="quest-obj" style="color:#FFD700">Belohnung: +${q.reward.xp} XP</div>`;
        container.appendChild(div);
    });

    // Completed
    ps.completedQuests.forEach(id => {
        const q = allQ[id];
        if (!q) return;
        const div = document.createElement('div');
        div.className = 'quest-item quest-done';
        div.innerHTML = `<div class="quest-title">✓ ${q.title}</div>`;
        container.appendChild(div);
    });
};
