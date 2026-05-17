# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the Game

There is no build step. Open `index.html` directly in a browser, or serve it with any static file server:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

The game loads Babylon.js 7 and its GUI library from CDN — an internet connection is required.

## Architecture

### Global Namespace & Script Load Order

All modules attach to `window.WG`. There is no bundler; scripts must be included in `index.html` in dependency order. `js/main.js` is always last. The load order is:

```
constants.js → helpers.js → world/* → player/* → entities/* → systems/* → ui/* → main.js
```

`WG.C` (constants) and `WG.Helpers` are available to every subsequent module. `WG.playerStats` (from `player/stats.js`) is the single source of truth for all player state. `WG.gameStarted` (boolean) gates all per-frame logic.

### Initialization Flow (`js/main.js`)

The IIFE in `main.js` constructs everything in a strict order:
1. Babylon engine + scene (gravity, fog, lights)
2. `WG.Terrain.create` → `WG.Environment.create`
3. `WG.Camera.create` → `WG.Controller.init`
4. **`WG.HUD.create`** — must run before any entity creation because `WG.HUD._ui` (the Babylon GUI `AdvancedDynamicTexture`) is passed as `ui` to every entity factory
5. `WG.NPC.create` / `WG.Clanmates.create` / `WG.Spawner.init`
6. `WG.AI.init` / `WG.Combat.init` / `WG.Progression.init` / `WG.Touch.init`
7. `WG.Screens.showTitle()` — blocks gameplay until name is entered

### Terrain & Height

`WG.Helpers.terrainHeight(x, z)` is the canonical height function — it uses the same seeded Perlin noise as the GPU mesh, so any JS code can query world-space Y at any (x, z). The camp area (radius ~90 units from origin) is flattened via a blend formula. **All entity placement must call this function** to sit on the ground correctly.

### Entity Model

Every cat entity (enemy, NPC, clanmate, boss) is built by `WG.Cat.create(scene, colorRGB, id)` which returns `{ root (TransformNode), hitbox (invisible pickable Box), body }`. The `hitbox.metadata` object drives the combat raycast:
- `{ type: 'enemy', id }` — looked up in `WG.Enemy.list`
- `{ type: 'boss', clanKey }` — resolved via `WG.Boss.active`
- `{ type: 'npc', id }` — resolved via `WG.NPC.list`

### Combat Loop

`WG.Combat.playerAttack()` fires a center-screen raycast (`scene.pick`) and resolves the hit via `hitbox.metadata`. Damage numbers are spawned as Babylon GUI `TextBlock` elements linked to short-lived ghost meshes. No blood is ever rendered; hit feedback is a yellow flash mesh + floating number only.

### AI (`js/systems/ai.js`)

Enemy AI runs every **6 frames** (not every frame) to save CPU. The state machine is `PATROL → ALERT → CHASE → ATTACK`. Boss trigger check (`WG.AI._checkBossTrigger`) scans `WG.Boss.all` each tick; only one boss can be active at a time (`WG.Boss.active`). Bosses are dormant (`hitbox.isPickable = false`) until triggered within 32 units of the player.

### Quest System (`js/systems/quest.js`)

Quests live in `WG.Quest._DB` as static objects. Active progress is stored on `q._progress` (a deep copy of `q.objectives` made at `start()` time). Events fire via `WG.Quest.checkObjective(type, data)` called from combat/world code. Quest chains are wired with `setTimeout` inside `_checkComplete`. To add a new quest: add an entry to `_DB`, hook `checkObjective` calls at the right trigger sites, and optionally chain it from an existing quest's `_checkComplete`.

### Progression & Rank Paths

`WG.playerStats.path` is `'warrior'` or `'healer'` (set null until mentor is chosen at rank index 1). `WG.Progression.getRankList()` returns the correct rank ladder based on `path`. Rank bonuses (attack power, max HP, lives) are applied inside `WG.Progression.onRankUp(idx)`.

### UI Layers

Two separate UI systems coexist:
- **Babylon GUI** (`WG.HUD._ui`): in-world labels, HP bars, damage numbers, crosshair, HUD bars, boss bar — linked to 3D meshes
- **HTML overlays** (`overlay-panel` CSS class in `index.html`): map, dialog, quest log, inventory — toggled by adding/removing `.active`

The map (`js/ui/map.js`) draws onto a plain `<canvas>` with 2D context; it does not use Babylon's render-target system.

### Mobile vs PC

`WG.Helpers.isMobile()` detects touch devices. On mobile: pointer lock is skipped, `WG.Touch.init` creates the virtual joystick and touch buttons, and `WG.Touch.applyJoystick()` is called each frame to translate joystick delta into camera movement. On PC: `camera.attachControl(canvas)` handles mouse look + WASD natively via Babylon's `UniversalCamera`.

### Adding Content

| Task | Where |
|---|---|
| Tune combat/speed values | `WG.C` in `js/utils/constants.js` |
| Add a new clan | `WG.C.CLANS` + `WG.Enemy.CLAN_STATS` + `WG.C.BOSS_CONFIGS` |
| Add a new boss | `WG.C.BOSS_CONFIGS`, then `WG.Spawner.init` calls `WG.Boss.create` |
| Add a new quest | `WG.Quest._DB`, wire `checkObjective` calls, chain in `_checkComplete` |
| Add a new NPC | `WG.NPC._CONFIGS` array in `js/entities/npc.js` with a dialog tree |
| Add terrain objects | `WG.Environment.create` in `js/world/environment.js` |
