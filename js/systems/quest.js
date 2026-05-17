window.WG = window.WG || {};
WG.Quest = {};

WG.Quest._DB = {
    patrol: {
        id: 'patrol', title: 'Die erste Patrouille',
        desc: 'Erkunde das Territorium des SchatteClan.',
        objectives: [{ type: 'EXPLORE_ZONE', target: 'SHADOW', count: 1, current: 0, label: 'SchatteClan-Territorium betreten (0/1)' }],
        reward: { xp: 25 }, giver: 'leader',
    },
    shadows: {
        id: 'shadows', title: 'Schatten im Wald',
        desc: 'Besiege 5 SchatteClan-Katzen, um das Clan-Territorium zu sichern.',
        objectives: [{ type: 'KILL_ENEMY', target: 'SHADOW', count: 5, current: 0, label: 'SchatteClan-Katzen besiegt (0/5)' }],
        reward: { xp: 75 }, giver: 'mentor_warrior',
    },
    herbs: {
        id: 'herbs', title: 'Kräuter für den Heiler',
        desc: 'Sammle 3 Heilkräuter im Wald.',
        objectives: [{ type: 'COLLECT_HERB', target: null, count: 3, current: 0, label: 'Kräuter gesammelt (0/3)' }],
        reward: { xp: 30 }, giver: 'healer_npc',
    },
    tigerstern: {
        id: 'tigerstern', title: 'Tigersterns Rückkehr',
        desc: 'Betritt das Zentrum des SchatteClan-Territoriums und besiege Tigerstern.',
        objectives: [{ type: 'DEFEAT_BOSS', target: 'SHADOW', count: 1, current: 0, label: 'Tigerstern besiegt (0/1)' }],
        reward: { xp: 500 }, giver: 'leader',
    },
};

WG.Quest.getAll = function () { return WG.Quest._DB; };

WG.Quest.start = function (id) {
    const ps = WG.playerStats;
    if (ps.activeQuests.includes(id) || ps.completedQuests.includes(id)) return;
    const q = WG.Quest._DB[id];
    if (!q) return;
    // Deep copy objectives
    q._progress = q.objectives.map(o => ({ ...o }));
    ps.activeQuests.push(id);
    WG.HUD.showPickup('📜 Neue Quest: ' + q.title);
    WG.QuestLog.render();
};

WG.Quest.checkObjective = function (type, data) {
    const ps = WG.playerStats;
    ps.activeQuests.forEach(id => {
        const q = WG.Quest._DB[id];
        if (!q || !q._progress) return;
        q._progress.forEach(obj => {
            if (obj.current >= obj.count) return;
            if (obj.type !== type) return;
            if (obj.target && obj.target !== data.clan && obj.target !== data.key) return;
            obj.current++;
            obj.label = obj.label.replace(/\d+\//, obj.current + '/');
            WG.QuestLog.render();
            if (obj.current >= obj.count) WG.Quest._checkComplete(id);
        });
    });
};

WG.Quest._checkComplete = function (id) {
    const q = WG.Quest._DB[id];
    if (!q || !q._progress) return;
    const done = q._progress.every(o => o.current >= o.count);
    if (!done) return;
    const ps = WG.playerStats;
    ps.activeQuests = ps.activeQuests.filter(qid => qid !== id);
    ps.completedQuests.push(id);
    WG.Progression.awardXP(q.reward.xp);
    WG.HUD.showRankSplash('✓ Quest erfüllt: ' + q.title + '\n+' + q.reward.xp + ' XP');
    WG.QuestLog.render();

    // Chain quests
    if (id === 'patrol') setTimeout(() => WG.Quest.start('shadows'), 2000);
    if (id === 'shadows') setTimeout(() => WG.Quest.start('tigerstern'), 2000);

    WG.Sound.pickup();
    WG.Save.save();
};
