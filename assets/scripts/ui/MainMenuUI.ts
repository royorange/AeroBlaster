import { _decorator, Color, Component, director, Node, UITransform } from 'cc';
import { Logger } from '../core/Logger';
import { SaveService } from '../services/SaveService';
import { makeButton, makeLabel, setPos } from './UIBuilder';

const { ccclass, property } = _decorator;
const TAG = 'MainMenuUI';
const UI_NODE_NAME = '__MainMenuUI_Root';

@ccclass('MainMenuUI')
export class MainMenuUI extends Component {
  @property({ type: Node, tooltip: 'Optional: parent for UI; defaults to this node' })
  canvasRoot: Node | null = null;

  protected onLoad(): void {
    Logger.info(TAG, 'onLoad');
    const parent = this.canvasRoot ?? this.node;

    // Build UI in a dedicated child node so we never touch siblings (e.g. Camera)
    const old = parent.getChildByName(UI_NODE_NAME);
    if (old) old.destroy();

    const root = new Node(UI_NODE_NAME);
    root.addComponent(UITransform).setContentSize(720, 1280);
    parent.addChild(root);

    const title = makeLabel('AeroBlaster', 64, new Color(255, 230, 80, 255));
    setPos(title, 0, 200);
    root.addChild(title);

    const save = SaveService.getInstance().data;
    const subtitle = makeLabel(`最高分 ${save.highScore} · 总局数 ${save.totalRuns}`, 22);
    setPos(subtitle, 0, 140);
    root.addChild(subtitle);

    const playBtn = makeButton('开 始 战 斗', {
      width: 320,
      height: 84,
      bgColor: new Color(220, 60, 60, 240),
      fontSize: 32,
      onClick: () => {
        Logger.info(TAG, 'play tapped -> Battle');
        director.loadScene('Battle');
      },
    });
    setPos(playBtn, 0, 0);
    root.addChild(playBtn);

    const tip = makeLabel('触摸/拖动屏幕控制飞机移动 · 自动开火', 20, new Color(220, 220, 220, 255));
    setPos(tip, 0, -120);
    root.addChild(tip);
  }
}
