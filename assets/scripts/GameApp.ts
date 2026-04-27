import { _decorator, Component, director, game } from 'cc';
import { Logger, LogLevel } from './core/Logger';
import { getPlatform } from './platform/PlatformFactory';
import { AdService } from './services/AdService';
import { AnalyticsService } from './services/AnalyticsService';
import { ConfigService } from './services/ConfigService';
import { SaveService } from './services/SaveService';

const { ccclass, property } = _decorator;
const TAG = 'GameApp';

@ccclass('GameApp')
export class GameApp extends Component {
  @property({ tooltip: 'Scene to load after init' })
  nextScene = 'Main';

  protected async onLoad(): Promise<void> {
    game.addPersistRootNode(this.node);
    Logger.setLevel(LogLevel.Debug);

    const platform = getPlatform();
    await platform.init();
    SaveService.getInstance().init(platform);
    AdService.getInstance().init(platform);
    AnalyticsService.getInstance().track({ name: 'app_start' });

    try {
      await ConfigService.getInstance().loadAll();
    } catch (e) {
      Logger.error(TAG, 'config load failed', e);
    }

    director.loadScene(this.nextScene);
  }
}
