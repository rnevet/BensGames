window.WG = window.WG || {};
WG.NPC = {};
WG.NPC.list = [];

WG.NPC._CONFIGS = [
    {
        id: 'leader',
        cfg: WG.C ? WG.C.NPC_LEADER : null,
        pos: [-14, -16],
        dialogs: {
            root: {
                text: 'Willkommen, {name}! Der DonnerClan braucht tapfere Krieger. Was führt dich zu mir?',
                options: [
                    { label: 'Ich bin bereit für meine erste Aufgabe.', next: 'quest1' },
                    { label: 'Wie geht es dem Clan?', next: 'status' },
                    { label: 'Auf Wiedersehen.', next: null },
                ]
            },
            quest1: {
                text: 'Gut. Erkunde die Territorien der anderen Clans und lerne das Land kennen. Kehre zurück, sobald du SchatteClan-Gebiet betreten hast.',
                options: [
                    { label: 'Ich werde es tun.', next: null, action: 'START_QUEST_patrol' },
                ]
            },
            status: {
                text: 'Der Clan ist stark, aber die Grenzen werden von SchatteClan bedroht. Wir brauchen jeden Krieger.',
                options: [
                    { label: 'Ich werde den Clan schützen.', next: null },
                ]
            }
        }
    },
    {
        id: 'mentor_warrior',
        cfg: WG.C ? WG.C.NPC_MENTOR_WARRIOR : null,
        pos: [10, -10],
        dialogs: {
            root: {
                text: 'Ich bin {mentorName}, dein Krieger-Mentor. Ich bringe dir bei, wie du für den Clan kämpfst.',
                options: [
                    { label: 'Zeig mir die Kampfkunst.', next: 'teach' },
                    { label: 'Ich möchte lieber Heiler werden.', next: null, action: 'SWITCH_MENTOR_healer' },
                    { label: 'Auf Wiedersehen.', next: null },
                ]
            },
            teach: {
                text: 'Klick [Linksklick / ⚔] zum Angreifen. Drücke [Leertaste / 💨] zum Ausweichen. Halte Distanz und greife aus dem richtigen Moment an!',
                options: [
                    { label: 'Verstanden!', next: null, action: 'START_QUEST_shadows' },
                ]
            }
        }
    },
    {
        id: 'mentor_healer',
        cfg: WG.C ? WG.C.NPC_MENTOR_HEALER : null,
        pos: [5, 14],
        dialogs: {
            root: {
                text: 'Ich bin {mentorName}, die Medizinkatze. Als Heiler sammelst du Kräuter und pflegst deine Clanmates.',
                options: [
                    { label: 'Zeig mir, wie man Kräuter sammelt.', next: 'teach' },
                    { label: 'Ich möchte doch lieber kämpfen.', next: null, action: 'SWITCH_MENTOR_warrior' },
                    { label: 'Auf Wiedersehen.', next: null },
                ]
            },
            teach: {
                text: 'Leuchtendes Grün in der Welt sind Heilkräuter. Geh nah heran und drücke [E / 💬]. Mit [I] öffnest du deine Vorräte.',
                options: [
                    { label: 'Ich werde Kräuter sammeln.', next: null, action: 'START_QUEST_herbs' },
                ]
            }
        }
    },
    {
        id: 'healer_npc',
        cfg: WG.C ? WG.C.NPC_HEALER : null,
        pos: [16, 8],
        dialogs: {
            root: {
                text: 'Grüße, {name}. Brauchst du Hilfe? Sammle Kräuter im Wald – sie heilen Wunden und stärken den Geist.',
                options: [
                    { label: 'Welche Kräuter soll ich suchen?', next: 'info' },
                    { label: 'Danke, alles gut.', next: null },
                ]
            },
            info: {
                text: 'Suche nach leuchtend grünen Kugeln zwischen den Bäumen. Bringe mir 3 Kräuter und ich lohne deine Mühe.',
                options: [
                    { label: 'Ich mache mich auf den Weg.', next: null, action: 'START_QUEST_herbs' },
                ]
            }
        }
    },
];

WG.NPC.create = function (scene, ui) {
    // Defer cfg loading until CLANS are ready
    WG.NPC._CONFIGS.forEach(cfg => {
        if (!cfg.cfg) {
            if (cfg.id === 'leader')         cfg.cfg = WG.C.NPC_LEADER;
            if (cfg.id === 'mentor_warrior') cfg.cfg = WG.C.NPC_MENTOR_WARRIOR;
            if (cfg.id === 'mentor_healer')  cfg.cfg = WG.C.NPC_MENTOR_HEALER;
            if (cfg.id === 'healer_npc')     cfg.cfg = WG.C.NPC_HEALER;
        }
    });

    WG.NPC._CONFIGS.forEach((conf, idx) => {
        const catObj = WG.Cat.create(scene, conf.cfg.color, 'npc_' + conf.id);
        const [x, z] = conf.pos;
        const y = WG.Helpers.terrainHeight(x, z);
        catObj.root.position.set(x, y, z);

        // Name label
        const advTex = ui;
        const label = new BABYLON.GUI.TextBlock('npcLabel_' + conf.id, conf.cfg.name);
        label.color = '#FFD700';
        label.fontSize = 13;
        label.outlineWidth = 3;
        label.outlineColor = '#000';
        advTex.addControl(label);
        label.linkWithMesh(catObj.root);
        label.linkOffsetY = -70;

        catObj.hitbox.metadata = { type: 'npc', id: conf.id };

        const npc = {
            id: conf.id,
            name: conf.cfg.name,
            mesh: catObj.root,
            hitbox: catObj.hitbox,
            dialogs: conf.dialogs,
        };
        WG.NPC.list.push(npc);
    });
};
