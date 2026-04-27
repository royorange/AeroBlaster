# 场景搭建指南 (3 个场景)

> Cocos 的 `.scene` 文件是引擎管理的 JSON，UUID 由编辑器生成，因此**不要手写 .scene 文件**。
> 按下面的步骤在编辑器里搭，每个场景 5 分钟搞定。

## 准备：项目设置

1. 打开 Cocos Creator，加载本项目
2. 菜单 `Project > Project Settings`：
   - **Project Data > Design Resolution**：宽 720, 高 1280, Fit Height
   - **Layer / Sorting**：保持默认即可
3. 让编辑器先把脚本编译完一遍（右下角无 spinner 即可）

---

## 场景 1: Boot.scene （启动场景，必须最先创建）

**作用**：初始化全局服务，加载配置，跳转到 Main。

1. `Hierarchy` 面板右键 → `Create > Scene` → 命名 **Boot**
2. 双击打开 Boot 场景
3. 场景里默认会有一个 `Canvas` 节点 — **不需要 Canvas**，删掉它
4. `Hierarchy` 右键场景 → `Create Empty Node` → 命名 **GameApp**
5. 选中 GameApp，`Inspector` 右下 `Add Component` → 搜 **GameApp** → 添加
6. `nextScene` 字段填 `Main`
7. `Ctrl/Cmd + S` 保存
8. 菜单 `Project > Project Settings > Project Data` → **Initial Scene** 选 `Boot`

---

## 场景 2: Main.scene （主菜单）

1. 新建场景，命名 **Main**
2. 保留默认 Canvas
3. 选中 Canvas 节点，`Add Component` → 搜 **MainMenuUI** → 添加
4. 把 Canvas 节点拖到 MainMenuUI 的 `canvasRoot` 字段（或直接挂在 Canvas 上即可，脚本会用 self）
5. 保存

---

## 场景 3: Battle.scene （战斗场景）

这是最重要的场景。结构如下：

```
Canvas
├── Playfield        (Node, UITransform 720x1280)
├── HUD              (Node, UITransform 720x1280)
├── Overlay          (Node, UITransform 720x1280)
└── BattleSceneController (空节点 + 脚本)
```

### 步骤

1. 新建场景，命名 **Battle**，保留 Canvas
2. **创建 Playfield 节点**：
   - 在 Canvas 下创建空节点，命名 **Playfield**
   - Inspector 中把 `UITransform` 的 `Content Size` 设为 720 x 1280
   - 添加 `Widget` 组件（可选）：上下左右都对齐到 0，让它跟随屏幕
3. **创建 HUD 节点**：
   - 在 Canvas 下创建空节点，命名 **HUD**
   - 添加 `UITransform`，Size 720 x 1280
4. **创建 Overlay 节点**：
   - 在 Canvas 下创建空节点，命名 **Overlay**
   - 添加 `UITransform`，Size 720 x 1280
   - **拖到节点列表最下方**（最后渲染，盖在最上层）
5. **创建控制器节点**：
   - 在 Canvas 下创建空节点，命名 **BattleRoot**
   - Add Component → 搜 **BattleManager**，添加
     - 把 Hierarchy 的 `Playfield` 拖到 `playfield` 字段
   - Add Component → 搜 **BattleHUD**，添加
     - 把 `HUD` 拖到 `hudRoot` 字段
   - Add Component → 搜 **BattleSceneController**，添加
     - 把 BattleRoot 自身拖到 `battle` 字段（或留空让脚本自动找）
     - 把 BattleRoot 自身拖到 `hud` 字段
     - 把 `Overlay` 拖到 `overlayRoot` 字段
6. 保存

---

## 验证

1. 编辑器顶部点 `Play` 旁的下拉，选 `Browser`
2. 浏览器自动打开
3. 应该看到：Boot 闪过 → Main 出现 "AeroBlaster" 标题 → 点 "开始战斗" → Battle 中蓝色圆形是玩家，自动开火，红色圆形是敌人
4. 触摸/拖拽屏幕控制玩家移动

---

## 常见问题

- **打不开场景 / 报 missing script**：编辑器右下角 spinner 消失再打开
- **Canvas 不显示**：检查 Camera 节点是否被误删
- **脚本字段拖拽失败**：检查脚本里 `@property` 装饰器、字段类型是否匹配
- **触摸无反应**：Playfield 的 UITransform 必须有正常 size，否则收不到事件
