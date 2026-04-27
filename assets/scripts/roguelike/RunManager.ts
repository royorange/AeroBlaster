import { GameEvent, GlobalEvents } from '../core/EventBus';
import { Random } from '../core/Random';
import { Singleton } from '../core/Singleton';
import { PerkConfig } from '../data/PerkData';
import { cloneStats, DEFAULT_STATS, PlayerStats } from '../data/PlayerData';
import { ConfigService, StageConfig } from '../services/ConfigService';
import { SaveService } from '../services/SaveService';
import { MetaProgress } from './MetaProgress';
import { PerkSystem } from './PerkSystem';
import { RewardSelector } from './RewardSelector';

export type RunPhase = 'idle' | 'battle' | 'rewardSelect' | 'finished';

export interface RunResult {
  result: 'win' | 'lose';
  score: number;
  coins: number;
  shards: number;
  durationSec: number;
  stageId: string;
}

export class RunManager extends Singleton<RunManager> {
  private rng = new Random();
  private perks = new PerkSystem();
  private meta = new MetaProgress();
  private currentStats: PlayerStats = cloneStats(DEFAULT_STATS);
  private acquiredPerks: PerkConfig[] = [];
  private stageIndex = 0;
  private phase: RunPhase = 'idle';
  private lastResult: RunResult | null = null;
  private revivedThisRun = false;

  start(seed?: number): void {
    this.rng = new Random(seed);
    this.perks.reset();
    this.acquiredPerks = [];
    this.stageIndex = 0;
    this.revivedThisRun = false;
    this.currentStats = cloneStats(DEFAULT_STATS);
    this.meta.applyAll(this.currentStats);
    this.phase = 'battle';
    SaveService.getInstance().update({ totalRuns: SaveService.getInstance().data.totalRuns + 1 });
  }

  getStats(): Readonly<PlayerStats> {
    return this.currentStats;
  }

  getCurrentStage(): StageConfig {
    const stages = ConfigService.getInstance().get().stages;
    return stages[this.stageIndex % stages.length];
  }

  hasNextStage(): boolean {
    return this.stageIndex + 1 < ConfigService.getInstance().get().stages.length;
  }

  getPhase(): RunPhase {
    return this.phase;
  }

  canRevive(): boolean {
    return !this.revivedThisRun;
  }

  consumeRevive(): void {
    this.revivedThisRun = true;
  }

  rollRewards(n: number): PerkConfig[] {
    const all = ConfigService.getInstance().get().perks;
    const sel = new RewardSelector(this.rng);
    const rewards = sel.pickN(all, this.perks, n);
    GlobalEvents.emit(GameEvent.PerkOffered, rewards);
    return rewards;
  }

  pickPerk(perk: PerkConfig): void {
    this.perks.pick(perk);
    this.acquiredPerks.push(perk);
    this.currentStats = this.perks.apply(
      this.recomputeBase(),
      Array.from(new Set(this.acquiredPerks)),
    );
    GlobalEvents.emit(GameEvent.PerkSelected, perk);
  }

  advanceStage(): void {
    this.stageIndex += 1;
    this.phase = 'battle';
  }

  enterRewardSelect(): void {
    this.phase = 'rewardSelect';
    GlobalEvents.emit(GameEvent.PlayerLevelUp);
  }

  finish(result: RunResult): void {
    this.phase = 'finished';
    this.lastResult = result;
    const save = SaveService.getInstance();
    const newCoins = save.data.totalCoins + result.coins;
    const newShards = save.data.shards + result.shards;
    const newHigh = Math.max(save.data.highScore, result.score);
    save.update({ totalCoins: newCoins, shards: newShards, highScore: newHigh });
  }

  getLastResult(): RunResult | null {
    return this.lastResult;
  }

  private recomputeBase(): PlayerStats {
    const base = cloneStats(DEFAULT_STATS);
    this.meta.applyAll(base);
    return base;
  }
}
