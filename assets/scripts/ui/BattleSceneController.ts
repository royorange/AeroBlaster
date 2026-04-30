import { _decorator, Component, director, Node, UITransform } from 'cc';
import { BattleManager } from '../battle/BattleManager';
import { GameEvent, GlobalEvents } from '../core/EventBus';
import { PerkConfig } from '../data/PerkData';
import { RunManager } from '../roguelike/RunManager';
import { AdService } from '../services/AdService';
import { AnalyticsService } from '../services/AnalyticsService';
import { ConfigService } from '../services/ConfigService';
import { BattleHUD } from './BattleHUD';
import { showPerkSelect } from './PerkSelectUI';
import { showResult } from './ResultUI';

const { ccclass, property } = _decorator;

@ccclass('BattleSceneController')
export class BattleSceneController extends Component {
  @property({ type: BattleManager })
  battle: BattleManager | null = null;

  @property({ type: BattleHUD })
  hud: BattleHUD | null = null;

  @property({ type: Node, tooltip: 'Overlay layer for popups' })
  overlayRoot: Node | null = null;

  protected async onLoad(): Promise<void> {
    this.ensureBindings();
    GlobalEvents.on(GameEvent.BattleEnd, this.onBattleEnd, this);
    GlobalEvents.on(GameEvent.PlayerDied, this.onPlayerDied, this);

    await ConfigService.getInstance().whenReady();

    const run = RunManager.getInstance();
    if (run.getPhase() === 'idle' || run.getPhase() === 'finished') run.start();

    const stage = run.getCurrentStage();
    if (!stage) return;
    AnalyticsService.getInstance().track({ name: 'run_start', stageId: stage.id });
    this.battle?.startRun(stage, run.getStats(), run.getPlayerClassDef());
    this.refreshHud();
    this.schedule(this.refreshHud, 0.1);
  }

  protected onDestroy(): void {
    GlobalEvents.off(GameEvent.BattleEnd, this.onBattleEnd, this);
    GlobalEvents.off(GameEvent.PlayerDied, this.onPlayerDied, this);
  }

  private ensureBindings(): void {
    if (!this.battle) this.battle = this.getComponentInChildren(BattleManager);
    if (!this.hud) this.hud = this.getComponentInChildren(BattleHUD);
  }

  private refreshHud = (): void => {
    if (!this.battle || !this.hud) return;
    const p = this.battle.getPlayer?.();
    if (!p) return;
    this.hud.setHp(p.getStats().hp, p.getStats().maxHp);
  };

  private onPlayerDied(): void {
    // BattleEnd will fire shortly; keep handler thin
  }

  private async onBattleEnd(payload: {
    result: 'win' | 'lose';
    score: number;
    coins: number;
    durationSec: number;
    stageId: string;
  }): Promise<void> {
    const run = RunManager.getInstance();
    AnalyticsService.getInstance().track({
      name: 'run_end',
      stageId: payload.stageId,
      result: payload.result,
      durationSec: payload.durationSec,
      score: payload.score,
    });

    if (payload.result === 'lose' && run.canRevive()) {
      this.showRevivePrompt(payload);
      return;
    }

    if (payload.result === 'win') {
      this.offerPerk();
      return;
    }

    this.finishRun(payload);
  }

  private showRevivePrompt(payload: {
    result: 'win' | 'lose';
    score: number;
    coins: number;
    durationSec: number;
    stageId: string;
  }): void {
    const overlay = this.overlayRoot ?? this.node;
    showResult(
      overlay,
      { ...payload, shards: Math.floor(payload.coins / 10) },
      {
        onRevive: async () => {
          const ok = await AdService.getInstance().showReward('revive');
          AnalyticsService.getInstance().track({ name: 'ad_shown', slot: 'revive', success: ok });
          if (ok) {
            RunManager.getInstance().consumeRevive();
            this.battle!.getPlayer().revive(0.5);
            this.battle!.resumeAfterRevive(2);
            AnalyticsService.getInstance().track({
              name: 'revive_used',
              stageId: payload.stageId,
            });
          } else {
            this.finishRun(payload);
          }
        },
        onContinue: () => this.finishRun(payload),
        onBackToMenu: () => {
          this.finishRun(payload);
          director.loadScene('Main');
        },
      },
    );
  }

  private offerPerk(): void {
    const run = RunManager.getInstance();
    const perks = run.rollRewards(3);
    const overlay = this.overlayRoot ?? this.node;
    showPerkSelect(
      overlay,
      perks,
      (p: PerkConfig) => {
        AnalyticsService.getInstance().track({ name: 'perk_picked', perkId: p.id });
        run.pickPerk(p);
        run.advanceStage();
        const stage = run.getCurrentStage();
        this.battle!.startRun(stage, run.getStats(), run.getPlayerClassDef());
      },
      async () => {
        const ok = await AdService.getInstance().showReward('rerollPerk');
        AnalyticsService.getInstance().track({ name: 'ad_shown', slot: 'rerollPerk', success: ok });
        if (ok) this.offerPerk();
      },
    );
  }

  private finishRun(payload: {
    result: 'win' | 'lose';
    score: number;
    coins: number;
    durationSec: number;
    stageId: string;
  }): void {
    const shards = Math.floor(payload.coins / 10);
    RunManager.getInstance().finish({ ...payload, shards });
    const overlay = this.overlayRoot ?? this.node;
    showResult(
      overlay,
      { ...payload, shards },
      {
        onContinue: () => director.loadScene('Battle'),
        onBackToMenu: () => director.loadScene('Main'),
      },
    );
  }
}

