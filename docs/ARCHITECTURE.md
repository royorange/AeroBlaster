# 架构说明

## 分层

```
┌──────────────────────────────────────────┐
│  Scenes (Boot / Main / Battle)            │
├──────────────────────────────────────────┤
│  UI Controllers (MainMenuUI, BattleHUD,   │
│  BattleSceneController, PerkSelectUI...)  │
├──────────────────────────────────────────┤
│  Roguelike Core (RunManager, PerkSystem,  │
│  RewardSelector, MetaProgress)            │
├──────────────────────────────────────────┤
│  Battle (BattleManager, entities, AI,     │
│  CollisionSystem, SpawnSystem)            │
├──────────────────────────────────────────┤
│  Services (Ad, Save, Audio, Config,       │
│  Analytics) — Singleton                   │
├──────────────────────────────────────────┤
│  Platform (IPlatform + Wechat/Douyin/     │
│  Browser implementations + Factory)       │
├──────────────────────────────────────────┤
│  Core (EventBus, ObjectPool, Singleton,   │
│  Logger, Random, Timer)                   │
└──────────────────────────────────────────┘
```

**依赖方向自上而下**。下层不依赖上层。Battle 层不知道有 UI，UI 层通过 EventBus 接收战斗事件。

## 关键决策

### 1. 平台层是唯一允许触碰 `wx.*` / `tt.*` 的地方
其他所有代码只通过 `IPlatform` 接口调用。这样新增平台（H5/QQ/快手）只需要写一个新的 implementation。

### 2. 服务全部 Singleton
访问方式：`AdService.getInstance()`，调用前必须 `init()`。GameApp 在 Boot 场景统一 init 一次，之后所有场景都能直接 getInstance 用。

### 3. 战斗与 UI 通过 EventBus 解耦
`GlobalEvents.emit(GameEvent.BattleEnd, payload)` —— UI 监听这个事件来弹结算面板。Battle 完全不知道 UI 存在，方便单测和未来加观战回放。

### 4. 数据驱动
敌人、词条、关卡都在 `assets/resources/configs/*.json`。改数值不动代码，策划友好（虽然现在是你一个人）。

### 5. 跨局状态由 RunManager 持有
RunManager 是 Singleton，跨场景存活。它负责：当前 stats、已选词条、stage 进度、是否已用复活。BattleManager 每次 startRun 时从 RunManager 取 stats。

### 6. ObjectPool 已搭好但 demo 暂未启用
Demo 用 `node.destroy()` 重建以保持代码简单。**正式版必须切换到 PrefabPool**：
- 把 Player/Enemy/Bullet 做成 Prefab 挂在 resources/prefabs 下
- 在 BattleManager.startRun 里通过 `PrefabPoolRegistry.register('bullet', new PrefabPool(...))`
- spawnBullet 改为 `PrefabPoolRegistry.acquire('bullet')`
- cullDead 改为 `PrefabPoolRegistry.release('bullet', node)`

## 可扩展点

| 想做什么 | 改哪里 |
|---------|-------|
| 加新词条 | `assets/resources/configs/perks.json` + 如果是新效果类型则 PerkSystem.applyEffect |
| 加新敌人 | `enemies.json` + 如果是新 AI 则 AIBase.ts 加一个类，BattleManager.makeAI 加 case |
| 加新关卡 | `stages.json` |
| 接新平台 | 新建 `platform/XxxPlatform.ts` 实现 IPlatform，PlatformFactory 加分支 |
| 接后端 | AnalyticsService.flush 里发 HTTP，SaveService 用 cloud storage 替换本地 |
| 加新广告位 | AdService.AdSlot 加类型，DEFAULT_CONFIG 三个平台都加配置 |

## 不要做的事

- 不要在 entity 里直接 `import { ... } from 'cc'` 之外的服务 — entity 只关心自己的状态
- 不要在 UI 里直接读 BattleManager 内部状态 — 用 EventBus 或 RunManager
- 不要让 Service 之间循环依赖 — 必要时用 EventBus 解耦
- 不要把 `wx.*` / `tt.*` 写到平台层之外
- 不要给 demo 加美术和音效 — 等玩法手感锁定再说
