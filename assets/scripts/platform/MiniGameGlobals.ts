interface MiniGameRewardAd {
  load(): Promise<void>;
  show(): Promise<void>;
  onClose(cb: (res: { isEnded: boolean }) => void): void;
  offClose(cb: (res: { isEnded: boolean }) => void): void;
  onError(cb: (err: { errMsg: string; errCode?: number }) => void): void;
  offError(cb: (err: { errMsg: string; errCode?: number }) => void): void;
  destroy?(): void;
}

interface MiniGameBannerAd {
  show(): Promise<void>;
  hide(): void;
  destroy(): void;
  onError(cb: (err: { errMsg: string }) => void): void;
}

interface MiniGameInterstitialAd {
  load(): Promise<void>;
  show(): Promise<void>;
  onClose(cb: () => void): void;
  onError(cb: (err: { errMsg: string }) => void): void;
}

export interface MiniGameAPI {
  createRewardedVideoAd(opts: { adUnitId: string }): MiniGameRewardAd;
  createBannerAd(opts: {
    adUnitId: string;
    style: { left: number; top: number; width: number };
  }): MiniGameBannerAd;
  createInterstitialAd(opts: { adUnitId: string }): MiniGameInterstitialAd;

  login(opts: { success: (res: { code: string }) => void; fail: (err: unknown) => void }): void;
  getUserInfo?(opts: {
    success: (res: { userInfo: { nickName: string; avatarUrl: string } }) => void;
    fail: (err: unknown) => void;
  }): void;

  shareAppMessage(opts: { title: string; imageUrl: string; query?: string }): void;
  showShareMenu?(opts: unknown): void;
  onShareAppMessage?(cb: () => { title: string; imageUrl: string; query?: string }): void;

  vibrateShort?(opts?: { type?: 'heavy' | 'medium' | 'light' }): void;
  vibrateLong?(): void;

  getStorageSync(key: string): unknown;
  setStorageSync(key: string, value: unknown): void;
  removeStorageSync(key: string): void;

  getSystemInfoSync(): {
    platform: string;
    pixelRatio: number;
    screenWidth: number;
    screenHeight: number;
    safeArea?: { top: number; bottom: number; left: number; right: number };
  };
}

declare const wx: MiniGameAPI | undefined;
declare const tt: MiniGameAPI | undefined;

export function getWx(): MiniGameAPI | null {
  return typeof wx !== 'undefined' ? wx : null;
}

export function getTt(): MiniGameAPI | null {
  return typeof tt !== 'undefined' ? tt : null;
}
