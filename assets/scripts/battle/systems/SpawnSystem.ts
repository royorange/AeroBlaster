import { Random } from '../../core/Random';
import { EnemyConfig } from '../../data/EnemyData';
import { ConfigService, StageConfig } from '../../services/ConfigService';

export interface SpawnRequest {
  cfg: EnemyConfig;
  x: number;
  topY: number;
}

export class SpawnSystem {
  private elapsed = 0;
  private nextSpawnAt = 0;
  private bossSpawned = false;

  constructor(
    private stage: StageConfig,
    private rng: Random,
    private playfieldHalfWidth: number,
    private playfieldTop: number,
  ) {
    this.scheduleNext();
  }

  get stageElapsed(): number {
    return this.elapsed;
  }

  get isBossPhase(): boolean {
    return this.elapsed >= this.stage.durationSec;
  }

  tick(dt: number): SpawnRequest | null {
    this.elapsed += dt;

    if (this.isBossPhase) {
      if (!this.bossSpawned && this.stage.bossId) {
        this.bossSpawned = true;
        const cfg = ConfigService.getInstance().enemy(this.stage.bossId);
        if (cfg) return { cfg, x: 0, topY: this.playfieldTop };
      }
      return null;
    }

    if (this.elapsed < this.nextSpawnAt) return null;
    this.scheduleNext();

    const enemyId = this.rng.pick(this.stage.enemyPool);
    const cfg = ConfigService.getInstance().enemy(enemyId);
    if (!cfg) return null;

    const x = this.rng.range(-this.playfieldHalfWidth + cfg.radius, this.playfieldHalfWidth - cfg.radius);
    return { cfg, x, topY: this.playfieldTop };
  }

  private scheduleNext(): void {
    const [a, b] = this.stage.spawnIntervalSec;
    this.nextSpawnAt = this.elapsed + this.rng.range(a, b);
  }
}
