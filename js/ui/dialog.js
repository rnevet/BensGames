window.WG = window.WG || {};
WG.Dialog = {};

WG.Dialog._open = false;
WG.Dialog._currentNPC = null;

WG.Dialog.isOpen = function () { return WG.Dialog._open; };

WG.Dialog.show = function (npc) {
    WG.Dialog._currentNPC = npc;
    WG.Dialog._open = true;
    const panel = document.getElementById('dialogPanel');
    panel.classList.add('active');

    // unlock pointer
    if (document.exitPointerLock) document.exitPointerLock();
    WG.Dialog._showNode('root');
};

WG.Dialog._showNode = function (nodeId) {
    const npc = WG.Dialog._currentNPC;
    if (!npc) return;
    const node = npc.dialogs[nodeId];
    if (!node) { WG.Dialog.close(); return; }

    const ps = WG.playerStats;
    let text = node.text
        .replace('{name}', ps.name || 'Jüngling')
        .replace('{mentorName}', npc.name);

    document.getElementById('dialogNpcName').textContent = npc.name;
    document.getElementById('dialogText').textContent = text;

    const optContainer = document.getElementById('dialogOptions');
    optContainer.innerHTML = '';
    node.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'dialog-option';
        btn.textContent = opt.label;
        btn.addEventListener('click', () => WG.Dialog._chooseOption(opt));
        optContainer.appendChild(btn);
    });
};

WG.Dialog._chooseOption = function (opt) {
    if (opt.action) WG.Dialog._runAction(opt.action);
    if (opt.next) {
        WG.Dialog._showNode(opt.next);
    } else {
        WG.Dialog.close();
    }
};

WG.Dialog._runAction = function (action) {
    if (action.startsWith('START_QUEST_')) {
        const questId = action.replace('START_QUEST_', '');
        WG.Quest.start(questId);
    } else if (action.startsWith('SWITCH_MENTOR_')) {
        const mentor = action.replace('SWITCH_MENTOR_', '');
        WG.playerStats.mentor = mentor;
        WG.playerStats.path = mentor;
        WG.HUD.showPickup('Mentor gewechselt zu: ' + (mentor === 'warrior' ? 'Krieger' : 'Heiler'));
    }
};

WG.Dialog.close = function () {
    WG.Dialog._open = false;
    WG.Dialog._currentNPC = null;
    document.getElementById('dialogPanel').classList.remove('active');
};
