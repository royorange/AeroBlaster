import { Logger } from '../core/Logger';
import { BrowserPlatform } from './BrowserPlatform';
import { DouyinPlatform } from './DouyinPlatform';
import { IPlatform, PlatformType } from './IPlatform';
import { getTt, getWx } from './MiniGameGlobals';
import { WechatPlatform } from './WechatPlatform';

const TAG = 'PlatformFactory';

let cached: IPlatform | null = null;

export function getPlatform(): IPlatform {
  if (cached) return cached;
  if (getWx()) cached = new WechatPlatform();
  else if (getTt()) cached = new DouyinPlatform();
  else cached = new BrowserPlatform();
  Logger.info(TAG, `selected ${cached.type}`);
  return cached;
}

export function getPlatformType(): PlatformType {
  return getPlatform().type;
}
