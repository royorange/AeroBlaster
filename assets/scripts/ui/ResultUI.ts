import { Color, Node } from 'cc';
import { RunResult } from '../roguelike/RunManager';
import { makeButton, makeLabel, makePanel, setPos } from './UIBuilder';

export interface ResultActions {
  onRevive?: () => void;
  onContinue: () => void;
  onBackToMenu: () => void;
}

export function showResult(parent: Node, result: RunResult, actions: ResultActions): Node {
  const overlay = makePanel(800, 1400, new Color(0, 0, 0, 220));
  parent.addChild(overlay);

  const titleColor = result.result === 'win' ? new Color(120, 220, 120, 255) : new Color(220, 80, 80, 255);
  const title = makeLabel(result.result === 'win' ? '通过！' : '阵亡', 64, titleColor);
  setPos(title, 0, 380);
  overlay.addChild(title);

  setPos(addLine(overlay, `得分  ${result.score}`), 0, 240);
  setPos(addLine(overlay, `金币  ${result.coins}`), 0, 180);
  setPos(addLine(overlay, `碎片  ${result.shards}`), 0, 120);
  setPos(addLine(overlay, `用时  ${result.durationSec.toFixed(1)} 秒`), 0, 60);

  let y = -40;
  if (result.result === 'lose' && actions.onRevive) {
    const revive = makeButton('看广告复活', {
      width: 320,
      height: 70,
      bgColor: new Color(220, 60, 60, 240),
      onClick: () => {
        overlay.removeFromParent();
        overlay.destroy();
        actions.onRevive!();
      },
    });
    setPos(revive, 0, y);
    overlay.addChild(revive);
    y -= 90;
  }

  const cont = makeButton(result.result === 'win' ? '继续下一关' : '再战一局', {
    width: 320,
    height: 70,
    bgColor: new Color(40, 100, 180, 240),
    onClick: () => {
      overlay.removeFromParent();
      overlay.destroy();
      actions.onContinue();
    },
  });
  setPos(cont, 0, y);
  overlay.addChild(cont);
  y -= 90;

  const back = makeButton('回主菜单', {
    width: 320,
    height: 70,
    bgColor: new Color(80, 80, 80, 240),
    onClick: () => {
      overlay.removeFromParent();
      overlay.destroy();
      actions.onBackToMenu();
    },
  });
  setPos(back, 0, y);
  overlay.addChild(back);

  return overlay;
}

function addLine(parent: Node, text: string): Node {
  const n = makeLabel(text, 28);
  parent.addChild(n);
  return n;
}
