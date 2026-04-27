import { Logger } from '../core/Logger';
import { AdResult, IPlatform, PlatformType, ShareOptions, SystemInfo, UserInfo } from './IPlatform';

const TAG = 'BrowserPlatform';

export class BrowserPlatform implements IPlatform {
  readonly type = PlatformType.Browser;

  async init(): Promise<void> {
    Logger.info(TAG, 'init (no-op)');
  }

  async showRewardVideo(adId: string): Promise<AdResult> {
    Logger.info(TAG, `[mock] reward video ${adId} -> auto success in 1s`);
    await new Promise((r) => setTimeout(r, 1000));
    return { success: true };
  }

  showBanner(adId: string): void {
    Logger.info(TAG, `[mock] banner ${adId}`);
  }

  hideBanner(): void {
    Logger.info(TAG, '[mock] hideBanner');
  }

  async showInterstitial(adId: string): Promise<AdResult> {
    Logger.info(TAG, `[mock] interstitial ${adId}`);
    return { success: true };
  }

  async login(): Promise<{ code: string }> {
    return { code: 'mock-browser-code' };
  }

  async getUserInfo(): Promise<UserInfo | null> {
    return { nickname: 'Tester', avatar: '' };
  }

  async share(opts: ShareOptions): Promise<AdResult> {
    Logger.info(TAG, '[mock] share', opts);
    return { success: true };
  }

  onShareMenu(opts: ShareOptions): void {
    Logger.info(TAG, '[mock] onShareMenu', opts);
  }

  vibrate(_type: 'short' | 'long'): void {
    if (navigator.vibrate) navigator.vibrate(_type === 'short' ? 15 : 60);
  }

  getStorageSync<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  setStorageSync<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      Logger.warn(TAG, 'setStorageSync failed', e);
    }
  }

  removeStorageSync(key: string): void {
    localStorage.removeItem(key);
  }

  getSystemInfo(): SystemInfo {
    return {
      platform: 'browser',
      pixelRatio: window.devicePixelRatio || 1,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      safeArea: { top: 0, bottom: 0, left: 0, right: 0 },
    };
  }
}
