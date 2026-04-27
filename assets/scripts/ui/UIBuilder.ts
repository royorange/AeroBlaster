import { Color, Graphics, Label, Node, UIOpacity, UITransform, Vec3 } from 'cc';

export function makeLabel(text: string, fontSize = 28, color = Color.WHITE): Node {
  const node = new Node('Label');
  node.addComponent(UITransform);
  const label = node.addComponent(Label);
  label.string = text;
  label.fontSize = fontSize;
  label.color = color;
  label.horizontalAlign = Label.HorizontalAlign.CENTER;
  label.verticalAlign = Label.VerticalAlign.CENTER;
  label.cacheMode = Label.CacheMode.BITMAP;
  label.enableOutline = true;
  label.outlineColor = new Color(0, 0, 0, 200);
  label.outlineWidth = 2;
  return node;
}

export interface ButtonOptions {
  width: number;
  height: number;
  bgColor?: Color;
  fontSize?: number;
  onClick: () => void;
}

export function makeButton(text: string, opts: ButtonOptions): Node {
  const root = new Node('Button');
  const ut = root.addComponent(UITransform);
  ut.setContentSize(opts.width, opts.height);
  const bg = opts.bgColor ?? new Color(40, 80, 160, 230);

  const g = root.addComponent(Graphics);
  drawRect(g, opts.width, opts.height, bg);

  const label = makeLabel(text, opts.fontSize ?? 28);
  root.addChild(label);

  root.on(Node.EventType.TOUCH_START, () => drawRect(g, opts.width, opts.height, darken(bg, 0.7)));
  root.on(Node.EventType.TOUCH_CANCEL, () => drawRect(g, opts.width, opts.height, bg));
  root.on(Node.EventType.TOUCH_END, () => {
    drawRect(g, opts.width, opts.height, bg);
    opts.onClick();
  });
  return root;
}

export function makePanel(width: number, height: number, color = new Color(0, 0, 0, 200)): Node {
  const node = new Node('Panel');
  const ut = node.addComponent(UITransform);
  ut.setContentSize(width, height);
  const g = node.addComponent(Graphics);
  drawRect(g, width, height, color);
  node.addComponent(UIOpacity);
  return node;
}

export function setPos(node: Node, x: number, y: number): Node {
  node.setPosition(new Vec3(x, y, 0));
  return node;
}

function drawRect(g: Graphics, w: number, h: number, color: Color): void {
  g.clear();
  g.fillColor = color;
  g.rect(-w / 2, -h / 2, w, h);
  g.fill();
}

function darken(c: Color, factor: number): Color {
  return new Color(c.r * factor, c.g * factor, c.b * factor, c.a);
}
