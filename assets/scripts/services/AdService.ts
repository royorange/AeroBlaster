import { Logger } from '../core/Logger';
import { Singleton } from '../core/Singleton';
import { IPlatform, PlatformType } from '../platform/IPlatform';
import { getPlatform } from '../platform/PlatformFactory';

const TAG = 'AdService';

export type AdSlot = 'revive' | 'doubleReward' | 'freeChest' | 'rerollPerk' | 'banner' | 'interstitial';

interface AdSlotConfig {
  adId: string;
  cooldownMs: number;
}

interface PlatformAdConfig {
  slots: Record<AdSlot, AdSlotConfig>;
  maxRewardPerSession: number;
}

const DEFAULT_CONFIG: Record<PlatformType, PlatformAdConfig> = {
  [PlatformType.Browser]: {
    slots: {
      revive: { adId: 'mock-revive', cooldownMs: 0 },
      doubleReward: { adId: 'mock-double', cooldownMs: 0 },
      freeChest: { adId: 'mock-chest', cooldownMs: 0 },
      rerollPerk: { adId: 'mock-reroll', cooldownMs: 0 },
      banner: { adId: 'mock-banner', cooldownMs: 0 },
      interstitial: { adId: 'mock-interstitial', cooldownMs: 0 },
    },
    maxRewardPerSession: 999,
  },
  [PlatformType.Wechat]: {
    slots: {
      revive: { adId: 'adunit-REPLACE-revive', cooldownMs: 0 },
      doubleReward: { adId: 'adunit-REPLACE-double', cooldownMs: 0 },
      freeChest: { adId: 'adunit-REPLACE-chest', cooldownMs: 0 },
      rerollPerk: { adId: 'adunit-REPLACE-reroll', cooldownMs: 0 },
      banner: { adId: 'adunit-REPLACE-banner', cooldownMs: 0 },
      interstitial: { adId: 'adunit-REPLACE-inter', cooldownMs: 0 },
    },
    maxRewardPerSession: 10,
  },
  [PlatformType.Douyin]: {
    slots: {
      revive: { adId: 'REPLACE-revive', cooldownMs: 30000 },
      doubleReward: { adId: 'REPLACE-double', cooldownMs: 60000 },
      freeChest: { adId: 'REPLACE-chest', cooldownMs: 60000 },
      rerollPerk: { adId: 'REPLACE-reroll', cooldownMs: 30000 },
      banner: { adId: 'REPLACE-banner', cooldownMs: 0 },
      interstitial: { adId: 'REPLACE-inter', cooldownMs: 180000 },
    },
    maxRewardPerSession: 8,
  },
};

export class AdService extends Singleton<AdService> {
  private platform!: IPlatform;
  private config!: PlatformAdConfig;
  private lastShownAt = new Map<AdSlot, number>();
  private rewardCount = 0;

  init(platform: IPlatform = getPlatform(), override?: Partial<PlatformAdConfig>): void {
    this.platform = platform;
    this.config = { ...DEFAULT_CONFIG[platform.type], ...(override ?? {}) };
  }

  canShow(slot: AdSlot): boolean {
    const cd = this.config.slots[slot].cooldownMs;
    const last = this.lastShownAt.get(slot) ?? 0;
    if (cd > 0 && Date.now() - last < cd) return false;
    if (this.isRewardSlot(slot) && this.rewardCount >= this.config.maxRewardPerSession) return false;
    return true;
  }

  async showReward(slot: AdSlot): Promise<boolean> {
    if (!this.canShow(slot)) {
      Logger.warn(TAG, `slot ${slot} on cooldown or capped`);
      return false;
    }
    const adId = this.config.slots[slot].adId;
    const res = await this.platform.showRewardVideo(adId);
    if (res.success) {
      this.lastShownAt.set(slot, Date.now());
      this.rewardCount += 1;
    }
    return res.success;
  }

  showBanner(): void {
    this.platform.showBanner(this.config.slots.banner.adId);
  }

  hideBanner(): void {
    this.platform.hideBanner();
  }

  async showInterstitial(): Promise<boolean> {
    if (!this.canShow('interstitial')) return false;
    const res = await this.platform.showInterstitial(this.config.slots.interstitial.adId);
    if (res.success) this.lastShownAt.set('interstitial', Date.now());
    return res.success;
  }

  private isRewardSlot(slot: AdSlot): boolean {
    return slot !== 'banner' && slot !== 'interstitial';
  }
}
