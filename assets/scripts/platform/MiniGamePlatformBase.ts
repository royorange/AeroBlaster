import { Logger } from '../core/Logger';
import { AdResult, IPlatform, PlatformType, ShareOptions, SystemInfo, UserInfo } from './IPlatform';
import { MiniGameAPI } from './MiniGameGlobals';

const TAG = 'MiniGame';

export abstract class MiniGamePlatformBase implements IPlatform {
  abstract readonly type: PlatformType;
  protected abstract api(): MiniGameAPI;

  private bannerCache?: ReturnType<MiniGameAPI['createBannerAd']>;
  private rewardCache = new Map<string, ReturnType<MiniGameAPI['createRewardedVideoAd']>>();

  async init(): Promise<void> {
    Logger.info(TAG, `${this.type} init`);
  }

  async showRewardVideo(adId: string): Promise<AdResult> {
    const sdk = this.api();
    let ad = this.rewardCache.get(adId);
    if (!ad) {
      ad = sdk.createRewardedVideoAd({ adUnitId: adId });
      this.rewardCache.set(adId, ad);
    }

    return new Promise<AdResult>((resolve) => {
      const onClose = (res: { isEnded: boolean }) => {
        cleanup();
        resolve({ success: !!res?.isEnded });
      };
      const onError = (err: { errMsg: string }) => {
        cleanup();
        resolve({ success: false, errMsg: err?.errMsg });
      };
      const cleanup = () => {
        ad?.offClose(onClose);
        ad?.offError(onError);
      };

      ad!.onClose(onClose);
      ad!.onError(onError);

      ad!.load()
        .then(() => ad!.show())
        .catch((err) => {
          cleanup();
          resolve({ success: false, errMsg: String(err) });
        });
    });
  }

  showBanner(adId: string): void {
    if (this.bannerCache) {
      this.bannerCache.show().catch(() => undefined);
      return;
    }
    const sdk = this.api();
    const sys = sdk.getSystemInfoSync();
    this.bannerCache = sdk.createBannerAd({
      adUnitId: adId,
      style: { left: 0, top: sys.screenHeight - 100, width: sys.screenWidth },
    });
    this.bannerCache.onError((e) => Logger.warn(TAG, 'banner error', e));
    this.bannerCache.show().catch(() => undefined);
  }

  hideBanner(): void {
    this.bannerCache?.hide();
  }

  async showInterstitial(adId: string): Promise<AdResult> {
    try {
      const ad = this.api().createInterstitialAd({ adUnitId: adId });
      await ad.load();
      await ad.show();
      return { success: true };
    } catch (e) {
      return { success: false, errMsg: String(e) };
    }
  }

  login(): Promise<{ code: string }> {
    return new Promise((resolve, reject) => {
      this.api().login({
        success: (res) => resolve(res),
        fail: (err) => reject(err),
      });
    });
  }

  async getUserInfo(): Promise<UserInfo | null> {
    const sdk = this.api();
    if (!sdk.getUserInfo) return null;
    return new Promise((resolve) => {
      sdk.getUserInfo!({
        success: (res) => resolve({ nickname: res.userInfo.nickName, avatar: res.userInfo.avatarUrl }),
        fail: () => resolve(null),
      });
    });
  }

  async share(opts: ShareOptions): Promise<AdResult> {
    try {
      this.api().shareAppMessage(opts);
      return { success: true };
    } catch (e) {
      return { success: false, errMsg: String(e) };
    }
  }

  onShareMenu(opts: ShareOptions): void {
    const sdk = this.api();
    sdk.showShareMenu?.({ withShareTicket: true });
    sdk.onShareAppMessage?.(() => opts);
  }

  vibrate(type: 'short' | 'long'): void {
    const sdk = this.api();
    if (type === 'short') sdk.vibrateShort?.();
    else sdk.vibrateLong?.();
  }

  getStorageSync<T>(key: string): T | null {
    const v = this.api().getStorageSync(key);
    return (v as T) ?? null;
  }

  setStorageSync<T>(key: string, value: T): void {
    this.api().setStorageSync(key, value as unknown);
  }

  removeStorageSync(key: string): void {
    this.api().removeStorageSync(key);
  }

  getSystemInfo(): SystemInfo {
    const s = this.api().getSystemInfoSync();
    return {
      platform: s.platform,
      pixelRatio: s.pixelRatio,
      screenWidth: s.screenWidth,
      screenHeight: s.screenHeight,
      safeArea: s.safeArea ?? { top: 0, bottom: 0, left: 0, right: 0 },
    };
  }
}
