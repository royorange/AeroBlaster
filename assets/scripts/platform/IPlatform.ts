export enum PlatformType {
  Browser = 'browser',
  Wechat = 'wechat',
  Douyin = 'douyin',
}

export interface AdResult {
  success: boolean;
  errMsg?: string;
}

export interface ShareOptions {
  title: string;
  imageUrl: string;
  query?: string;
}

export interface UserInfo {
  nickname: string;
  avatar: string;
}

export interface SystemInfo {
  platform: string;
  pixelRatio: number;
  screenWidth: number;
  screenHeight: number;
  safeArea: { top: number; bottom: number; left: number; right: number };
}

export interface IPlatform {
  readonly type: PlatformType;

  init(): Promise<void>;

  showRewardVideo(adId: string): Promise<AdResult>;
  showBanner(adId: string): void;
  hideBanner(): void;
  showInterstitial(adId: string): Promise<AdResult>;

  login(): Promise<{ code: string }>;
  getUserInfo(): Promise<UserInfo | null>;

  share(opts: ShareOptions): Promise<AdResult>;
  onShareMenu(opts: ShareOptions): void;

  vibrate(type: 'short' | 'long'): void;

  getStorageSync<T>(key: string): T | null;
  setStorageSync<T>(key: string, value: T): void;
  removeStorageSync(key: string): void;

  getSystemInfo(): SystemInfo;
}
