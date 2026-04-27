import { _decorator, Color, Component, EventTouch, Graphics, Node, UITransform, Vec2, Vec3 } from 'cc';
import { GameEvent, GlobalEvents } from '../core/EventBus';
import { Logger } from '../core/Logger';
import { Random } from '../core/Random';
import { Faction } from '../data/BattleTypes';
import { cloneStats, DEFAULT_STATS, PlayerStats } from '../data/PlayerData';
import { ConfigService, StageConfig } from '../services/ConfigService';
import { AIBase, BossAI, SineAI, StraightAI, TrackerAI } from './ai/AIBase';
import { Bullet } from './entities/Bullet';
import { Enemy } from './entities/Enemy';
import { Player } from './entities/Player';
import { makeBounds, PlayfieldBounds } from './PlayfieldBounds';
import { CollisionSystem } from './systems/CollisionSystem';
import { SpawnSystem } from './systems/SpawnSystem';

const { ccclass, property } = _decorator;

@ccclass('BattleManager')
export class BattleManager extends Component {
  @property({ type: Node, tooltip: 'Container for entities; size defines the playfield' })
  playfield: Node | null = null;

  private player!: Player;
  private enemies: Enemy[] = [];
  private bullets: Bullet[] = [];
  private collision = new CollisionSystem();
  private spawn!: SpawnSystem;
  private bounds!: PlayfieldBounds;
  private rng = new Random();
  private playerStats: PlayerStats = cloneStats(DEFAULT_STATS);
  private stage!: StageConfig;
  private running = false;
  private result: 'win' | 'lose' | null = null;
  private startedAt = 0;
  private score = 0;
  private coins = 0;

  startRun(stage: StageConfig, stats: PlayerStats, seed?: number): void {
    if (!this.playfield) {
      Logger.error('BattleManager', 'playfield node not assigned in scene');
      return;
    }
    const ut = this.playfield.getComponent(UITransform)!;
    this.bounds = makeBounds(ut.contentSize.width, ut.contentSize.height, 50);
    this.rng = new Random(seed);
    this.playerStats = cloneStats(stats);
    this.stage = stage;
    this.score = 0;
    this.coins = 0;
    this.result = null;
    this.startedAt = Date.now();

    this.cleanup();
    this.spawnPlayer();
    this.spawn = new SpawnSystem(
      stage,
      this.rng,
      ut.contentSize.width / 2,
      ut.contentSize.height / 2,
    );
    this.bindInput();
    this.running = true;
    GlobalEvents.emit(GameEvent.BattleStart, { stageId: stage.id });
  }

  stopRun(): void {
    this.running = false;
    this.unbindInput();
  }

  protected update(dt: number): void {
    if (!this.running) return;
    this.tickPlayer(dt);
    this.tickEnemies(dt);
    this.tickBullets(dt);
    this.tickSpawn(dt);
    this.collision.resolve(this.player, this.enemies, this.bullets);
    this.cullDead();
    this.checkEnd();
  }

  private spawnPlayer(): void {
    const node = new Node('Player');
    this.playfield!.addChild(node);
    node.addComponent(UITransform);
    node.setPosition(0, this.bounds.bottom + 120, 0);
    this.player = node.addComponent(Player);
    this.player.init(this.bounds, this.playerStats);
  }

  private bindInput(): void {
    this.playfield!.on(Node.EventType.TOUCH_START, this.onTouch, this);
    this.playfield!.on(Node.EventType.TOUCH_MOVE, this.onTouch, this);
    this.playfield!.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.playfield!.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }

  private unbindInput(): void {
    this.playfield!.off(Node.EventType.TOUCH_START, this.onTouch, this);
    this.playfield!.off(Node.EventType.TOUCH_MOVE, this.onTouch, this);
    this.playfield!.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.playfield!.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }

  private onTouch(e: EventTouch): void {
    const ut = this.playfield!.getComponent(UITransform)!;
    const ui = e.getUILocation();
    const local = ut.convertToNodeSpaceAR(new Vec3(ui.x, ui.y, 0));
    this.player.setMoveTargetLocal(local.x, local.y);
  }

  private onTouchEnd(): void {
    this.player.clearMoveTarget();
  }

  private tickPlayer(dt: number): void {
    this.player.tick(dt, (origin) => this.firePlayerVolley(origin));
  }

  private firePlayerVolley(origin: Vec2): void {
    const stats = this.player.getStats();
    const count = Math.max(1, Math.floor(stats.bulletCount));
    const spreadDeg = stats.spreadDeg + (count - 1) * 8;
    const startDeg = -spreadDeg / 2;
    const stepDeg = count > 1 ? spreadDeg / (count - 1) : 0;
    const speed = stats.bulletSpeed;
    for (let i = 0; i < count; i++) {
      const deg = startDeg + i * stepDeg;
      const rad = (deg * Math.PI) / 180;
      const vx = Math.sin(rad) * speed;
      const vy = Math.cos(rad) * speed;
      const isCrit = this.rng.next() < stats.critChance;
      const dmg = stats.damage * (isCrit ? stats.critMul : 1);
      this.spawnBullet(origin.x, origin.y + this.player.radius, vx, vy, dmg, stats.pierce, Faction.Player);
    }
  }

  private spawnBullet(
    x: number,
    y: number,
    vx: number,
    vy: number,
    damage: number,
    pierce: number,
    faction: Faction,
  ): void {
    const node = new Node('Bullet');
    this.playfield!.addChild(node);
    node.addComponent(UITransform);
    const b = node.addComponent(Bullet);
    b.configure({
      bounds: this.bounds,
      faction,
      damage,
      pierce,
      velocity: new Vec2(vx, vy),
      color: faction === Faction.Player ? new Color(255, 230, 80, 255) : new Color(255, 80, 80, 255),
    });
    b.setLocalPosition(x, y);
    this.bullets.push(b);
  }

  private tickEnemies(dt: number): void {
    const targetPos = new Vec2(this.player.position.x, this.player.position.y);
    for (const e of this.enemies) {
      const r = e.tick(dt, targetPos);
      if (r.fire && e.alive && e.config.bulletSpeed) {
        const dx = targetPos.x - e.position.x;
        const dy = targetPos.y - e.position.y;
        const len = Math.hypot(dx, dy) || 1;
        const speed = e.config.bulletSpeed;
        this.spawnBullet(e.position.x, e.position.y - e.radius, (dx / len) * speed, (dy / len) * speed, e.config.damage, 0, Faction.Enemy);
      }
    }
  }

  private tickBullets(dt: number): void {
    for (const b of this.bullets) b.tick(dt);
  }

  private tickSpawn(dt: number): void {
    const req = this.spawn.tick(dt);
    if (!req) return;
    const node = new Node(`Enemy_${req.cfg.id}`);
    this.playfield!.addChild(node);
    node.addComponent(UITransform);
    const e = node.addComponent(Enemy);
    const ai = this.makeAI(req.cfg.ai);
    e.configure(req.cfg, this.bounds, ai);
    e.setLocalPosition(req.x, req.topY + req.cfg.radius);
    this.enemies.push(e);
  }

  private makeAI(kind: string): AIBase {
    switch (kind) {
      case 'sine':
        return new SineAI();
      case 'tracker':
        return new TrackerAI();
      case 'boss':
        return new BossAI(this.bounds.top - 120);
      case 'straight':
      case 'shooter':
      default:
        return new StraightAI();
    }
  }

  private cullDead(): void {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      if (!b.alive) {
        b.node.destroy();
        this.bullets.splice(i, 1);
      }
    }
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (!e.alive) {
        if (!e.config.isBoss && e.hp <= 0) {
          this.score += e.config.scoreReward;
          this.coins += Math.round(e.config.coinReward * this.player.getStats().coinGainMul);
          GlobalEvents.emit(GameEvent.ScoreChanged, { score: this.score, coins: this.coins });
        }
        e.node.destroy();
        this.enemies.splice(i, 1);
      }
    }
  }

  private checkEnd(): void {
    if (this.result) return;
    if (!this.player.alive) {
      this.result = 'lose';
      this.endRun();
      return;
    }
    if (this.spawn.isBossPhase && this.enemies.every((e) => !e.alive || !e.config.isBoss)) {
      const allBossesDead = this.enemies.filter((e) => e.config.isBoss).every((e) => !e.alive);
      const hadBoss = this.spawn.isBossPhase && this.stage.bossId;
      if (hadBoss && allBossesDead && this.spawn.stageElapsed > this.stage.durationSec + 0.5) {
        this.result = 'win';
        this.endRun();
      } else if (!hadBoss && this.spawn.stageElapsed > this.stage.durationSec + 0.5) {
        this.result = 'win';
        this.endRun();
      }
    }
  }

  private endRun(): void {
    this.running = false;
    this.unbindInput();
    GlobalEvents.emit(GameEvent.BattleEnd, {
      result: this.result,
      score: this.score,
      coins: this.coins,
      durationSec: (Date.now() - this.startedAt) / 1000,
      stageId: this.stage.id,
    });
  }

  private cleanup(): void {
    this.playfield!.removeAllChildren();
    this.enemies.length = 0;
    this.bullets.length = 0;
  }

  getPlayer(): Player {
    return this.player;
  }
}
