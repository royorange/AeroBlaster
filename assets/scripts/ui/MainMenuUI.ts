import { _decorator, Color, Component, director, Node, UITransform } from 'cc';
import { SaveService } from '../services/SaveService';
import { makeButton, makeLabel, setPos } from './UIBuilder';

const { ccclass, property } = _decorator;

@ccclass('MainMenuUI')
export class MainMenuUI extends Component {
  @property({ type: Node, tooltip: 'Canvas root for buttons' })
  canvasRoot: Node | null = null;

  protected onLoad(): void {
    const root = this.canvasRoot ?? this.node;
    root.removeAllChildren();

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
      onClick: () => director.loadScene('Battle'),
    });
    setPos(playBtn, 0, 0);
    root.addChild(playBtn);

    const tip = makeLabel('触摸/拖动屏幕控制飞机移动 · 自动开火', 20, new Color(220, 220, 220, 255));
    setPos(tip, 0, -120);
    root.addChild(tip);

    const ut = root.getComponent(UITransform);
    if (ut && ut.contentSize.width === 0) ut.setContentSize(720, 1280);
  }
}
