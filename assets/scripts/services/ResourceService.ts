import { ImageAsset, resources, Sprite, SpriteFrame, Texture2D } from 'cc';
import { Logger } from '../core/Logger';
import { Singleton } from '../core/Singleton';

const TAG = 'ResourceService';

/**
 * 资源加载隔离层。
 *
 * 设计意图：
 *  - 业务代码（Player、UI 卡片等）只调用此服务，不直接依赖 `cc.resources` API
 *  - 后续若要替换为微信/抖音小程序的远程加载、或加上 LRU 缓存策略，
 *    只需修改此文件，业务零改动
 *  - 提供 SpriteFrame 缓存，避免同一张图被重复构造
 *
 * 路径约定：
 *  - 所有路径相对 `assets/resources/`，不含扩展名
 *  - 例：`'arts/characters/inferno_base'` 对应
 *    `assets/resources/arts/characters/inferno_base.png`
 */
export class ResourceService extends Singleton<ResourceService> {
  private spriteFrameCache = new Map<string, SpriteFrame>();

  /**
   * 异步加载一个 SpriteFrame。
   * 命中缓存直接返回；未命中才走 resources.load。
   */
  async loadSpriteFrame(path: string): Promise<SpriteFrame> {
    const cached = this.spriteFrameCache.get(path);
    if (cached && cached.isValid) return cached;

    return new Promise((resolve, reject) => {
      // Cocos Creator 3.x: PNG 资源加载有两种约定路径：
      //   - `${path}/spriteFrame` 直接给 SpriteFrame（推荐）
      //   - `${path}` 给 ImageAsset，需手动构造
      // 我们优先用前者，失败时降级
      resources.load(`${path}/spriteFrame`, SpriteFrame, (err, frame) => {
        if (!err && frame) {
          this.spriteFrameCache.set(path, frame);
          resolve(frame);
          return;
        }
        // 降级：用 ImageAsset 构造
        resources.load(path, ImageAsset, (err2, image) => {
          if (err2 || !image) {
            Logger.error(TAG, `loadSpriteFrame failed: ${path}`, err2 ?? err);
            reject(err2 ?? err);
            return;
          }
          const tex = new Texture2D();
          tex.image = image;
          const sf = new SpriteFrame();
          sf.texture = tex;
          this.spriteFrameCache.set(path, sf);
          resolve(sf);
        });
      });
    });
  }

  /**
   * 批量预加载，常用于场景启动前一次性把所需 sprite 全部备好，
   * 避免运行时首次显示卡顿。
   */
  async preload(paths: readonly string[]): Promise<void> {
    await Promise.all(paths.map((p) => this.loadSpriteFrame(p)));
  }

  /**
   * 便捷方法：把 SpriteFrame 应用到一个 Sprite 组件上。
   * 把"加载 + 设置"封到一个调用里，调用方代码更短。
   */
  async applyToSprite(sprite: Sprite, path: string): Promise<void> {
    const frame = await this.loadSpriteFrame(path);
    if (sprite.isValid) sprite.spriteFrame = frame;
  }

  /** 测试 / 热重载场景使用 */
  clearCache(): void {
    this.spriteFrameCache.clear();
  }
}
