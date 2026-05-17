window.WG = window.WG || {};
WG.Inventory = {};

WG.Inventory.ITEMS = {
    herb:   { name: 'Heilkraut', icon: '🌿', maxStack: 10 },
    feather:{ name: 'Feder',     icon: '🪶', maxStack: 5  },
    stone:  { name: 'Stein',     icon: '🪨', maxStack: 5  },
};

WG.Inventory.add = function (type) {
    const ps = WG.playerStats;
    const def = WG.Inventory.ITEMS[type];
    if (!def) return;
    const existing = ps.inventory.find(i => i.type === type);
    if (existing && existing.count < def.maxStack) {
        existing.count++;
    } else if (!existing) {
        ps.inventory.push({ type, name: def.name, icon: def.icon, count: 1 });
    }
    WG.HUD.showPickup(def.icon + ' ' + def.name + ' eingesammelt');
    WG.InventoryUI.render();
};

WG.Inventory.use = function (type) {
    const ps = WG.playerStats;
    const idx = ps.inventory.findIndex(i => i.type === type);
    if (idx === -1) return false;
    const item = ps.inventory[idx];

    if (type === 'herb') {
        const heal = WG.C.HERB_HEAL_SELF;
        ps.hp = Math.min(ps.maxHp, ps.hp + heal);
        WG.HUD.showPickup('🌿 Kraut benutzt: +' + heal + ' HP');
        WG.Quest.checkObjective('USE_HERB', {});
    }

    item.count--;
    if (item.count <= 0) ps.inventory.splice(idx, 1);
    WG.InventoryUI.render();
    return true;
};

WG.Inventory.count = function (type) {
    const ps = WG.playerStats;
    const item = ps.inventory.find(i => i.type === type);
    return item ? item.count : 0;
};
