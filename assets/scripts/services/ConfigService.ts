import { JsonAsset, resources } from 'cc';
import { Logger } from '../core/Logger';
import { Singleton } from '../core/Singleton';
import { EnemyConfig } from '../data/EnemyData';
import { PerkConfig } from '../data/PerkData';

const TAG = 'ConfigService';

export interface StageConfig {
  id: string;
  name: string;
  durationSec: number;
  spawnIntervalSec: [number, number];
  enemyPool: string[];
  bossId?: string;
}

export interface AllConfigs {
  enemies: EnemyConfig[];
  perks: PerkConfig[];
  stages: StageConfig[];
}

export class ConfigService extends Singleton<ConfigService> {
  private configs?: AllConfigs;

  async loadAll(): Promise<AllConfigs> {
    const [enemies, perks, stages] = await Promise.all([
      this.loadJson<EnemyConfig[]>('configs/enemies'),
      this.loadJson<PerkConfig[]>('configs/perks'),
      this.loadJson<StageConfig[]>('configs/stages'),
    ]);
    this.configs = { enemies, perks, stages };
    Logger.info(TAG, `loaded enemies=${enemies.length} perks=${perks.length} stages=${stages.length}`);
    return this.configs;
  }

  get(): AllConfigs {
    if (!this.configs) throw new Error('ConfigService.loadAll() not called');
    return this.configs;
  }

  enemy(id: string): EnemyConfig | undefined {
    return this.get().enemies.find((e) => e.id === id);
  }

  perk(id: string): PerkConfig | undefined {
    return this.get().perks.find((p) => p.id === id);
  }

  stage(id: string): StageConfig | undefined {
    return this.get().stages.find((s) => s.id === id);
  }

  private loadJson<T>(path: string): Promise<T> {
    return new Promise((resolve, reject) => {
      resources.load(path, JsonAsset, (err, asset) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(asset.json as T);
      });
    });
  }
}
