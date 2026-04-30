import { _decorator, Component, director, game } from 'cc';
import { Logger, LogLevel } from './core/Logger';
import { ALL_CLASSES } from './data/PlayerData';
import { getPlatform } from './platform/PlatformFactory';
import { AdService } from './services/AdService';
import { AnalyticsService } from './services/AnalyticsService';
import { ConfigService } from './services/ConfigService';
import { ResourceService } from './services/ResourceService';
import { SaveService } from './services/SaveService';

const { ccclass, property } = _decorator;
const TAG = 'GameApp';

@ccclass('GameApp')
export class GameApp extends Component {
  @property({ tooltip: 'Scene to load after init' })
  nextScene = 'Main';

  protected async onLoad(): Promise<void> {
    Logger.setLevel(LogLevel.Debug);
    Logger.info(TAG, 'onLoad start, nextScene=', this.nextScene);
    game.addPersistRootNode(this.node);

    const platform = getPlatform();
    await platform.init();
    Logger.info(TAG, 'platform inited');
    SaveService.getInstance().init(platform);
    AdService.getInstance().init(platform);
    AnalyticsService.getInstance().track({ name: 'app_start' });

    try {
      await ConfigService.getInstance().loadAll();
      Logger.info(TAG, 'configs loaded');
    } catch (e) {
      Logger.error(TAG, 'config load failed', e);
    }

    // 预加载所有职业立绘，避免选角 / 战斗首次渲染卡顿
    try {
      const paths = ALL_CLASSES.map((c) => c.spritePath);
      await ResourceService.getInstance().preload(paths);
      Logger.info(TAG, `preloaded ${paths.length} class sprites`);
    } catch (e) {
      Logger.error(TAG, 'sprite preload failed', e);
    }

    Logger.info(TAG, 'loading scene:', this.nextScene);
    director.loadScene(this.nextScene, (err) => {
      if (err) Logger.error(TAG, 'loadScene failed', err);
      else Logger.info(TAG, 'scene loaded');
    });
  }
}
