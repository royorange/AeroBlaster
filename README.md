# AeroBlaster

A roguelike shoot'em up for WeChat & Douyin mini-games.

## Tech Stack

- **Engine**: Cocos Creator 3.8.x LTS
- **Language**: TypeScript
- **Targets**: WeChat Mini Game, Douyin Mini Game, Browser (debug)

## Quick Start

### Prerequisites

1. Install [Cocos Dashboard](https://www.cocos.com/creator/download)
2. Install **Cocos Creator 3.8.x LTS** via Dashboard
3. Install [VSCode](https://code.visualstudio.com/) + extensions:
   - Cocos Effect
   - ESLint
   - Prettier
4. Install [WeChat DevTools](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) (for WeChat publishing)
5. Install [Douyin DevTools](https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/developer-instrument/developer-instrument-update-and-download) (for Douyin publishing)

### Open Project

1. Launch Cocos Dashboard
2. Click `Add` and select this project root
3. Click the project to open in Cocos Creator
4. First open will take a few minutes (engine compiling assets)

### Run in Browser

In Cocos Creator: click the play button (top toolbar) > `Browser`.

### Build for WeChat

In Cocos Creator: `Project > Build` > select `WeChat Mini Game` > Build.
Then open the output folder in WeChat DevTools.

### Build for Douyin

In Cocos Creator: `Project > Build` > select `Bytedance Mini Game` > Build.
Then open the output folder in Douyin DevTools.

## Project Layout

```
assets/
  resources/        Dynamically loaded assets (configs, prefabs, audio)
  scenes/           Scene files (Boot, Main, Battle, Result)
  scripts/
    core/           Engine-agnostic framework (EventBus, ObjectPool, ...)
    platform/       Platform adapter layer (WeChat/Douyin/Browser)
    services/       Global services (Ad, Save, Audio, Config, Analytics)
    battle/         Battle logic (entities, systems, AI)
    roguelike/      Roguelike core (RunManager, PerkPool, MetaProgress)
    ui/             UI controllers
    data/           Pure data models
    GameApp.ts      Global entry point (mounted on Boot scene)
  arts/             Art assets (placeholder shapes for now)
  audio/            BGM and SFX
build-templates/    Per-platform build overrides (game.js, project.config.json)
```

## Architecture Principles

- **Layered**: `Platform Adapter` isolates WeChat/Douyin API differences. The rest of the code never touches `wx.*` or `tt.*` directly.
- **Service-oriented**: Global services (Ad, Save, Audio) are singletons accessed through interfaces, easy to mock in tests.
- **Data-driven**: Enemies, weapons, perks defined in JSON configs, not hardcoded.
- **Pool-everything**: Bullets, enemies, effects all go through `ObjectPool`. No `new` in hot paths.
- **Event-bus decoupling**: Battle, UI, and services communicate through `EventBus`, not direct references.

## Demo Scope (current)

This is a playable scaffold using colored shapes (no art assets yet). It demonstrates:
- Player movement & auto-fire
- Enemy spawning, collision, death
- Roguelike perk selection (3-choose-1)
- Ad service interface (mock implementation in browser)
- Cross-platform save/load
- Run loop: Battle -> Death/Clear -> Perk -> Continue

Art style and visual polish come **after** gameplay feel is locked in.

## Roadmap

- [ ] Phase 1 (current): Playable scaffold with placeholder shapes
- [ ] Phase 2: Real perks (30+), enemies (10+), one boss
- [ ] Phase 3: Meta progression, shop, multiple aircraft
- [ ] Phase 4: Art pass + audio pass
- [ ] Phase 5: Platform integration test, soft launch
