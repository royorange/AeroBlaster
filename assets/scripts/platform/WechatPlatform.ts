import { PlatformType } from './IPlatform';
import { getWx, MiniGameAPI } from './MiniGameGlobals';
import { MiniGamePlatformBase } from './MiniGamePlatformBase';

export class WechatPlatform extends MiniGamePlatformBase {
  readonly type = PlatformType.Wechat;

  protected api(): MiniGameAPI {
    const sdk = getWx();
    if (!sdk) throw new Error('wx is not available');
    return sdk;
  }
}
