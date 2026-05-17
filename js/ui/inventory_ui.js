window.WG = window.WG || {};
WG.InventoryUI = {};

WG.InventoryUI.toggle = function () {
    const panel = document.getElementById('inventoryPanel');
    if (panel.classList.contains('active')) WG.InventoryUI.close();
    else WG.InventoryUI.open();
};
WG.InventoryUI.open = function () {
    WG.InventoryUI.render();
    document.getElementById('inventoryPanel').classList.add('active');
};
WG.InventoryUI.close = function () {
    document.getElementById('inventoryPanel').classList.remove('active');
};

WG.InventoryUI.render = function () {
    const ps = WG.playerStats;
    const container = document.getElementById('inventoryList');
    if (!container) return;
    container.innerHTML = '';

    if (ps.inventory.length === 0) {
        container.innerHTML = '<div class="inv-empty">Vorräte leer.</div>';
        return;
    }
    ps.inventory.forEach(item => {
        const div = document.createElement('div');
        div.className = 'inv-item';
        div.innerHTML = `<span class="inv-icon">${item.icon}</span>
                         <span class="inv-name">${item.name}</span>
                         <span class="inv-count">×${item.count}</span>
                         <button class="use-btn" onclick="WG.Inventory.use('${item.type}');WG.InventoryUI.render()">Benutzen</button>`;
        container.appendChild(div);
    });
};
