import { Color, Node } from 'cc';
import { PerkConfig } from '../data/PerkData';
import { makeButton, makeLabel, makePanel, setPos } from './UIBuilder';

const RARITY_COLOR: Record<string, Color> = {
  common: new Color(180, 180, 180, 255),
  rare: new Color(80, 160, 255, 255),
  epic: new Color(190, 100, 255, 255),
  legendary: new Color(255, 180, 60, 255),
};

export function showPerkSelect(
  parent: Node,
  perks: PerkConfig[],
  onPick: (p: PerkConfig) => void,
  onReroll?: () => void,
): Node {
  const overlay = makePanel(800, 1400, new Color(0, 0, 0, 220));
  parent.addChild(overlay);

  const title = makeLabel('选择一个强化', 40, new Color(255, 230, 80, 255));
  setPos(title, 0, 360);
  overlay.addChild(title);

  const cardW = 220;
  const cardH = 320;
  const gap = 20;
  const total = perks.length;
  const startX = -((cardW + gap) * (total - 1)) / 2;

  perks.forEach((perk, i) => {
    const card = makePanel(cardW, cardH, new Color(30, 30, 50, 240));
    setPos(card, startX + i * (cardW + gap), 0);
    overlay.addChild(card);

    const rarity = makeLabel(perk.rarity.toUpperCase(), 18, RARITY_COLOR[perk.rarity] ?? Color.WHITE);
    setPos(rarity, 0, 130);
    card.addChild(rarity);

    const name = makeLabel(perk.name, 26);
    setPos(name, 0, 80);
    card.addChild(name);

    const desc = makeLabel(perk.desc, 18);
    setPos(desc, 0, 0);
    card.addChild(desc);

    const pick = makeButton('选择', {
      width: 160,
      height: 56,
      bgColor: new Color(60, 140, 80, 240),
      onClick: () => {
        overlay.removeFromParent();
        overlay.destroy();
        onPick(perk);
      },
    });
    setPos(pick, 0, -110);
    card.addChild(pick);
  });

  if (onReroll) {
    const reroll = makeButton('看广告刷新', {
      width: 280,
      height: 60,
      bgColor: new Color(120, 60, 60, 240),
      fontSize: 22,
      onClick: () => {
        overlay.removeFromParent();
        overlay.destroy();
        onReroll();
      },
    });
    setPos(reroll, 0, -300);
    overlay.addChild(reroll);
  }

  return overlay;
}
