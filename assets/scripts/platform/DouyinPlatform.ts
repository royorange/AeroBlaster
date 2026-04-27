import { PlatformType } from './IPlatform';
import { getTt, MiniGameAPI } from './MiniGameGlobals';
import { MiniGamePlatformBase } from './MiniGamePlatformBase';

export class DouyinPlatform extends MiniGamePlatformBase {
  readonly type = PlatformType.Douyin;

  protected api(): MiniGameAPI {
    const sdk = getTt();
    if (!sdk) throw new Error('tt is not available');
    return sdk;
  }
}
