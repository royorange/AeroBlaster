import { _decorator, Color, Component, Label, Node } from 'cc';
import { GameEvent, GlobalEvents } from '../core/EventBus';
import { makeLabel, setPos } from './UIBuilder';

const { ccclass, property } = _decorator;

@ccclass('BattleHUD')
export class BattleHUD extends Component {
  @property({ type: Node, tooltip: 'Canvas / HUD root' })
  hudRoot: Node | null = null;

  private hpLabel?: Label;
  private scoreLabel?: Label;
  private coinLabel?: Label;

  protected onLoad(): void {
    const root = this.hudRoot ?? this.node;
    const hp = makeLabel('HP 5/5', 28, new Color(255, 90, 90, 255));
    setPos(hp, -260, 580);
    root.addChild(hp);
    this.hpLabel = hp.getComponent(Label) ?? undefined;

    const score = makeLabel('Score 0', 28);
    setPos(score, 0, 580);
    root.addChild(score);
    this.scoreLabel = score.getComponent(Label) ?? undefined;

    const coin = makeLabel('Coin 0', 28, new Color(255, 220, 80, 255));
    setPos(coin, 260, 580);
    root.addChild(coin);
    this.coinLabel = coin.getComponent(Label) ?? undefined;

    GlobalEvents.on(GameEvent.ScoreChanged, this.onScore, this);
  }

  protected onDestroy(): void {
    GlobalEvents.off(GameEvent.ScoreChanged, this.onScore, this);
  }

  setHp(hp: number, max: number): void {
    if (this.hpLabel) this.hpLabel.string = `HP ${hp}/${max}`;
  }

  private onScore(payload: { score: number; coins: number }): void {
    if (this.scoreLabel) this.scoreLabel.string = `Score ${payload.score}`;
    if (this.coinLabel) this.coinLabel.string = `Coin ${payload.coins}`;
  }
}
