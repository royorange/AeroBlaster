import { _decorator, Component, Sprite, SpriteFrame, UITransform, Vec2, Vec3 } from 'cc';
import { Logger } from '../../core/Logger';
import { GameEvent, GlobalEvents } from '../../core/EventBus';
import {
  cloneStats,
  DEFAULT_CLASS,
  DEFAULT_STATS,
  getClassDef,
  PlayerClass,
  PlayerClassDef,
  PlayerStats,
} from '../../data/PlayerData';
import { Faction, IDamageable } from '../../data/BattleTypes';
import { ResourceService } from '../../services/ResourceService';
import { PlayfieldBounds } from '../PlayfieldBounds';

const { ccclass } = _decorator;
const TAG = 'Player';

/** sprite 渲染尺寸（视觉宽高，逻辑碰撞用 radius 控制）。 */
const SPRITE_SIZE = 100;
/**
 * 碰撞半径，刻意小于 SPRITE_SIZE/2，给玩家略宽容的判定（hitbox < hurtbox）。
 * 这是射击游戏的常见设计，提升手感。
 */
const COLLISION_RADIUS = 38;

@ccclass('Player')
export class Player extends Component implements IDamageable {
  faction = Faction.Player;
  alive = true;
  radius = COLLISION_RADIUS;
  position = new Vec2();

  private classDef: PlayerClassDef = getClassDef(DEFAULT_CLASS);
  private stats: PlayerStats = cloneStats(DEFAULT_STATS);
  private fireCooldown = 0;
  private bounds!: PlayfieldBounds;

  // Bind-mode input: when finger/mouse down, lock the offset between cursor and player,
  // then on every move event set player = cursor + offset (1:1, no chase).
  private dragOffset = new Vec3();
  private dragging = false;

  private invulnRemain = 0;
  private blinkAccum = 0;

  private sprite?: Sprite;

  /**
   * 初始化玩家。
   * @param classDef 职业定义；若不传则使用默认职业（开发期容错）。
   *   生产路径应总是显式传入，由 RunManager 负责选择。
   */
  init(bounds: PlayfieldBounds, stats: PlayerStats, classDef?: PlayerClassDef): void {
    this.bounds = bounds;
    this.stats = cloneStats(stats);
    this.classDef = classDef ?? getClassDef(DEFAULT_CLASS);
    this.alive = true;
    this.fireCooldown = 0;
    this.dragging = false;
    this.setupVisual();
    this.syncPosition();
  }

  getStats(): Readonly<PlayerStats> {
    return this.stats;
  }

  getClassDef(): Readonly<PlayerClassDef> {
    return this.classDef;
  }

  setStats(s: PlayerStats): void {
    this.stats = cloneStats(s);
  }

  beginDrag(localX: number, localY: number): void {
    const cur = this.node.position;
    this.dragOffset.set(cur.x - localX, cur.y - localY, 0);
    this.dragging = true;
  }

  dragTo(localX: number, localY: number): void {
    if (!this.dragging || !this.alive) return;
    this.node.setPosition(localX + this.dragOffset.x, localY + this.dragOffset.y, 0);
    this.clampToBounds();
    this.syncPosition();
  }

  endDrag(): void {
    this.dragging = false;
  }

  takeDamage(amount: number): void {
    if (!this.alive || this.invulnRemain > 0) return;
    this.stats.hp = Math.max(0, this.stats.hp - amount);
    if (this.stats.hp <= 0) {
      this.alive = false;
      this.node.active = false;
      GlobalEvents.emit(GameEvent.PlayerDied);
    }
  }

  revive(hpFraction = 1): void {
    this.stats.hp = Math.max(1, Math.floor(this.stats.maxHp * hpFraction));
    this.alive = true;
    this.node.active = true;
  }

  setInvulnerable(seconds: number): void {
    this.invulnRemain = Math.max(this.invulnRemain, seconds);
  }

  isInvulnerable(): boolean {
    return this.invulnRemain > 0;
  }

  tick(dt: number, fireCb: (origin: Vec2) => void): void {
    if (!this.alive) return;

    // Position is updated synchronously by dragTo; tick only handles firing & sync.
    this.clampToBounds();
    this.syncPosition();

    if (this.invulnRemain > 0) {
      this.invulnRemain -= dt;
      this.blinkAccum += dt;
      if (this.blinkAccum >= 0.1) {
        this.blinkAccum = 0;
        this.node.active = !this.node.active;
      }
      if (this.invulnRemain <= 0) {
        this.invulnRemain = 0;
        this.blinkAccum = 0;
        this.node.active = true;
      }
    }

    this.fireCooldown -= dt;
    if (this.fireCooldown <= 0) {
      this.fireCooldown += 1 / Math.max(0.1, this.stats.fireRateHz);
      fireCb(this.position);
    }
  }

  private clampToBounds(): void {
    const p = this.node.position;
    const x = Math.min(this.bounds.right - this.radius, Math.max(this.bounds.left + this.radius, p.x));
    const y = Math.min(this.bounds.top - this.radius, Math.max(this.bounds.bottom + this.radius, p.y));
    if (x !== p.x || y !== p.y) this.node.setPosition(x, y, p.z);
  }

  private syncPosition(): void {
    const p = this.node.position;
    this.position.set(p.x, p.y);
  }

  /**
   * 配置节点尺寸 + Sprite 组件，并异步加载职业立绘。
   * 加载失败不阻塞游戏：玩家会以"无贴图"状态继续可玩，便于诊断。
   */
  private setupVisual(): void {
    const ut = this.node.getComponent(UITransform) ?? this.node.addComponent(UITransform);
    ut.setContentSize(SPRITE_SIZE, SPRITE_SIZE);

    const sprite = this.node.getComponent(Sprite) ?? this.node.addComponent(Sprite);
    sprite.sizeMode = Sprite.SizeMode.CUSTOM;
    this.sprite = sprite;

    const path = this.classDef.spritePath;
    ResourceService.getInstance()
      .applyToSprite(sprite, path)
      .catch((err) => {
        Logger.error(TAG, `failed to load sprite: ${path}`, err);
      });
  }

  /** 测试 / 编辑器中暂未用到的 setter，保留扩展点（如热切换皮肤）。 */
  setSpriteFrame(frame: SpriteFrame): void {
    if (this.sprite) this.sprite.spriteFrame = frame;
  }
}
