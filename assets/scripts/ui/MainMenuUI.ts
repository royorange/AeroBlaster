import { _decorator, Color, Component, director, Node, UITransform } from 'cc';
import { Logger } from '../core/Logger';
import { ALL_CLASSES, DEFAULT_CLASS, PlayerClass, PlayerClassDef } from '../data/PlayerData';
import { RunManager } from '../roguelike/RunManager';
import { SaveService } from '../services/SaveService';
import { CharacterCardHandle, makeCharacterCard } from './CharacterCard';
import { makeButton, makeLabel, setPos } from './UIBuilder';

const { ccclass, property } = _decorator;
const TAG = 'MainMenuUI';
const UI_NODE_NAME = '__MainMenuUI_Root';

type Panel = 'main' | 'characterSelect';

/**
 * 主菜单 UI。包含两个面板：
 *  - 'main'             ：标题 + "开始战斗"按钮
 *  - 'characterSelect'  ：3 张职业卡片 + "出击"按钮
 *
 * 不开新场景，避免维护 .scene 文件 + 转场动画。
 * 通过 panel 切换控制可见性。
 */
@ccclass('MainMenuUI')
export class MainMenuUI extends Component {
  @property({ type: Node, tooltip: 'Optional: parent for UI; defaults to this node' })
  canvasRoot: Node | null = null;

  private root!: Node;
  private mainPanel!: Node;
  private selectPanel!: Node;
  private cards: CharacterCardHandle[] = [];
  private selectedClass: PlayerClass = DEFAULT_CLASS;

  protected onLoad(): void {
    Logger.info(TAG, 'onLoad');
    const parent = this.canvasRoot ?? this.node;

    // 重建：避免热重载残留
    const old = parent.getChildByName(UI_NODE_NAME);
    if (old) old.destroy();

    this.root = new Node(UI_NODE_NAME);
    this.root.addComponent(UITransform).setContentSize(720, 1280);
    parent.addChild(this.root);

    this.mainPanel = this.buildMainPanel();
    this.selectPanel = this.buildCharacterSelectPanel();
    this.root.addChild(this.mainPanel);
    this.root.addChild(this.selectPanel);

    this.showPanel('main');
  }

  // ---------- 面板切换 ----------

  private showPanel(p: Panel): void {
    this.mainPanel.active = p === 'main';
    this.selectPanel.active = p === 'characterSelect';
  }

  // ---------- 主面板 ----------

  private buildMainPanel(): Node {
    const panel = new Node('MainPanel');
    panel.addComponent(UITransform).setContentSize(720, 1280);

    const title = makeLabel('AeroBlaster', 64, new Color(255, 230, 80, 255));
    setPos(title, 0, 200);
    panel.addChild(title);

    const save = SaveService.getInstance().data;
    const subtitle = makeLabel(`最高分 ${save.highScore} · 总局数 ${save.totalRuns}`, 22);
    setPos(subtitle, 0, 140);
    panel.addChild(subtitle);

    const playBtn = makeButton('开 始 战 斗', {
      width: 320,
      height: 84,
      bgColor: new Color(220, 60, 60, 240),
      fontSize: 32,
      onClick: () => {
        Logger.info(TAG, 'play tapped -> character select');
        this.showPanel('characterSelect');
      },
    });
    setPos(playBtn, 0, 0);
    panel.addChild(playBtn);

    const tip = makeLabel('触摸/拖动屏幕控制飞机移动 · 自动开火', 20, new Color(220, 220, 220, 255));
    setPos(tip, 0, -120);
    panel.addChild(tip);

    return panel;
  }

  // ---------- 选角面板 ----------

  private buildCharacterSelectPanel(): Node {
    const panel = new Node('CharacterSelectPanel');
    panel.addComponent(UITransform).setContentSize(720, 1280);

    const title = makeLabel('选 择 战 机', 48, new Color(255, 230, 80, 255));
    setPos(title, 0, 480);
    panel.addChild(title);

    const subtitle = makeLabel('点击卡片预览 · 出击锁定', 20, new Color(200, 200, 200, 255));
    setPos(subtitle, 0, 420);
    panel.addChild(subtitle);

    // 3 张卡片横排
    this.cards = [];
    const cardW = 200;
    const cardH = 320;
    const gap = 14;
    const totalW = ALL_CLASSES.length * cardW + (ALL_CLASSES.length - 1) * gap;
    const startX = -totalW / 2 + cardW / 2;
    ALL_CLASSES.forEach((def, i) => {
      const handle = makeCharacterCard({
        classDef: def,
        width: cardW,
        height: cardH,
        onTap: (d) => this.onCardTap(d),
      });
      setPos(handle.node, startX + i * (cardW + gap), 100);
      panel.addChild(handle.node);
      this.cards.push(handle);
    });
    this.applySelection(this.selectedClass);

    // 出击按钮
    const launchBtn = makeButton('出 击', {
      width: 320,
      height: 84,
      bgColor: new Color(220, 60, 60, 240),
      fontSize: 32,
      onClick: () => this.onLaunch(),
    });
    setPos(launchBtn, 0, -200);
    panel.addChild(launchBtn);

    // 返回按钮
    const backBtn = makeButton('返回', {
      width: 160,
      height: 56,
      bgColor: new Color(60, 60, 80, 220),
      fontSize: 22,
      onClick: () => this.showPanel('main'),
    });
    setPos(backBtn, 0, -310);
    panel.addChild(backBtn);

    return panel;
  }

  private onCardTap(def: PlayerClassDef): void {
    this.selectedClass = def.id;
    this.applySelection(def.id);
    Logger.info(TAG, `class selected: ${def.id}`);
  }

  private applySelection(cls: PlayerClass): void {
    for (const card of this.cards) card.setSelected(card.classDef.id === cls);
  }

  private onLaunch(): void {
    Logger.info(TAG, `launch with class=${this.selectedClass}`);
    RunManager.getInstance().start(this.selectedClass);
    director.loadScene('Battle');
  }
}
