import { Color, Graphics, Node, UIOpacity, UITransform } from 'cc';
import { PlayerClassDef } from '../data/PlayerData';
import { colorFromHex, makeImage, makeLabel, setPos } from './UIBuilder';

/**
 * 选角卡片组件（炉石风格）。
 *
 * 设计要点：
 *  - 不依赖具体职业，接受任意 PlayerClassDef，便于未来增减职业
 *  - 维持 selected/unselected 两态，由父级（CharacterSelectPanel）统一切换
 *  - 暴露 onTap 回调，业务逻辑下沉到调用方
 *
 * 视觉：
 *  - 卡片框：深底 + 主题色描边（用 classDef.primaryColor）
 *  - 立绘：职业 sprite，居中
 *  - 文本：codename（英文小标题）+ name（中文大标题）+ tagline（简介）
 *  - 选中态：放大 1.08 倍 + 描边亮度提升 + UI 不透明度 100%
 *  - 未选中态：暗淡（UIOpacity = 140）
 */

export interface CharacterCardOptions {
  classDef: PlayerClassDef;
  width: number;
  height: number;
  onTap: (classDef: PlayerClassDef) => void;
}

const SELECTED_OPACITY = 255;
const UNSELECTED_OPACITY = 140;
const SELECTED_SCALE = 1.08;

export function makeCharacterCard(opts: CharacterCardOptions): CharacterCardHandle {
  const root = new Node(`Card_${opts.classDef.id}`);
  const ut = root.addComponent(UITransform);
  ut.setContentSize(opts.width, opts.height);
  const opacity = root.addComponent(UIOpacity);
  opacity.opacity = UNSELECTED_OPACITY;

  const themeColor = colorFromHex(opts.classDef.primaryColor);
  const dimColor = darken(themeColor, 0.35);

  // 卡片背景框
  const bg = root.addComponent(Graphics);
  drawCardFrame(bg, opts.width, opts.height, themeColor, dimColor, false);

  // 立绘
  const portraitSize = Math.min(opts.width - 40, opts.height * 0.5);
  const portrait = makeImage({
    width: portraitSize,
    height: portraitSize,
    resourcePath: opts.classDef.spritePath,
  });
  setPos(portrait, 0, opts.height * 0.12);
  root.addChild(portrait);

  // 英文 codename（小副标题，主题色）
  const codename = makeLabel(opts.classDef.codename, 22, themeColor);
  setPos(codename, 0, -opts.height * 0.18);
  root.addChild(codename);

  // 中文名（大标题，白色）
  const name = makeLabel(opts.classDef.name, 44, new Color(255, 255, 255, 255));
  setPos(name, 0, -opts.height * 0.28);
  root.addChild(name);

  // 一句话 tagline
  const tagline = makeLabel(opts.classDef.tagline, 18, new Color(220, 220, 220, 255));
  setPos(tagline, 0, -opts.height * 0.4);
  root.addChild(tagline);

  // 触摸交互
  root.on(Node.EventType.TOUCH_END, () => opts.onTap(opts.classDef));

  let selected = false;
  const setSelected = (sel: boolean): void => {
    if (selected === sel) return;
    selected = sel;
    opacity.opacity = sel ? SELECTED_OPACITY : UNSELECTED_OPACITY;
    root.setScale(sel ? SELECTED_SCALE : 1, sel ? SELECTED_SCALE : 1, 1);
    drawCardFrame(bg, opts.width, opts.height, themeColor, dimColor, sel);
  };

  return { node: root, setSelected, classDef: opts.classDef };
}

export interface CharacterCardHandle {
  node: Node;
  classDef: PlayerClassDef;
  setSelected: (selected: boolean) => void;
}

function drawCardFrame(
  g: Graphics,
  w: number,
  h: number,
  themeColor: Color,
  dimColor: Color,
  selected: boolean,
): void {
  g.clear();
  // 卡片底色：深黑半透明
  g.fillColor = new Color(15, 15, 25, 235);
  g.rect(-w / 2, -h / 2, w, h);
  g.fill();

  // 顶部主题色色带（炉石风格的"职业横条"）
  g.fillColor = selected ? themeColor : dimColor;
  const bandH = h * 0.08;
  g.rect(-w / 2, h / 2 - bandH, w, bandH);
  g.fill();

  // 描边
  g.lineWidth = selected ? 4 : 2;
  g.strokeColor = selected ? themeColor : dimColor;
  g.rect(-w / 2, -h / 2, w, h);
  g.stroke();
}

function darken(c: Color, factor: number): Color {
  return new Color(
    Math.floor(c.r * factor),
    Math.floor(c.g * factor),
    Math.floor(c.b * factor),
    c.a,
  );
}
