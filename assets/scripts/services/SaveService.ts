import { Logger } from '../core/Logger';
import { Singleton } from '../core/Singleton';
import { IPlatform } from '../platform/IPlatform';
import { getPlatform } from '../platform/PlatformFactory';

const TAG = 'SaveService';
const SAVE_KEY = 'ab_save_v1';

export interface SaveBlob {
  version: number;
  totalCoins: number;
  shards: number;
  highScore: number;
  unlockedShips: string[];
  metaPerks: Record<string, number>;
  totalRuns: number;
  lastPlayedAt: number;
}

const DEFAULT_SAVE: SaveBlob = {
  version: 1,
  totalCoins: 0,
  shards: 0,
  highScore: 0,
  unlockedShips: ['default'],
  metaPerks: {},
  totalRuns: 0,
  lastPlayedAt: 0,
};

export class SaveService extends Singleton<SaveService> {
  private platform!: IPlatform;
  private cache: SaveBlob = { ...DEFAULT_SAVE };

  init(platform: IPlatform = getPlatform()): void {
    this.platform = platform;
    this.load();
  }

  get data(): Readonly<SaveBlob> {
    return this.cache;
  }

  update(patch: Partial<SaveBlob>): void {
    this.cache = { ...this.cache, ...patch, lastPlayedAt: Date.now() };
    this.flush();
  }

  reset(): void {
    this.cache = { ...DEFAULT_SAVE };
    this.flush();
  }

  private load(): void {
    const raw = this.platform.getStorageSync<SaveBlob>(SAVE_KEY);
    if (raw && typeof raw === 'object' && 'version' in raw) {
      this.cache = { ...DEFAULT_SAVE, ...raw };
    } else {
      this.cache = { ...DEFAULT_SAVE };
    }
  }

  private flush(): void {
    try {
      this.platform.setStorageSync(SAVE_KEY, this.cache);
    } catch (e) {
      Logger.error(TAG, 'flush failed', e);
    }
  }
}
