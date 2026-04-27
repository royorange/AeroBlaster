import { _decorator, Color, Component, Graphics, Node, Vec2, Vec3 } from 'cc';
import { GameEvent, GlobalEvents } from '../../core/EventBus';
import { cloneStats, DEFAULT_STATS, PlayerStats } from '../../data/PlayerData';
import { Faction, IDamageable } from '../../data/BattleTypes';
import { PlayfieldBounds } from '../PlayfieldBounds';

const { ccclass } = _decorator;

@ccclass('Player')
export class Player extends Component implements IDamageable {
  faction = Faction.Player;
  alive = true;
  radius = 18;
  position = new Vec2();

  private stats: PlayerStats = cloneStats(DEFAULT_STATS);
  private fireCooldown = 0;
  private bounds!: PlayfieldBounds;
  private moveTarget = new Vec3();
  private hasMoveTarget = false;

  init(bounds: PlayfieldBounds, stats: PlayerStats): void {
    this.bounds = bounds;
    this.stats = cloneStats(stats);
    this.alive = true;
    this.fireCooldown = 0;
    this.draw();
    this.syncPosition();
  }

  getStats(): Readonly<PlayerStats> {
    return this.stats;
  }

  setStats(s: PlayerStats): void {
    this.stats = cloneStats(s);
  }

  setMoveTargetLocal(localX: number, localY: number): void {
    this.moveTarget.set(localX, localY, 0);
    this.hasMoveTarget = true;
  }

  clearMoveTarget(): void {
    this.hasMoveTarget = false;
  }

  takeDamage(amount: number): void {
    if (!this.alive) return;
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

  tick(dt: number, fireCb: (origin: Vec2) => void): void {
    if (!this.alive) return;

    if (this.hasMoveTarget) {
      const cur = this.node.position;
      const dx = this.moveTarget.x - cur.x;
      const dy = this.moveTarget.y - cur.y;
      const dist = Math.hypot(dx, dy);
      const step = this.stats.moveSpeed * dt;
      if (dist <= step) this.node.setPosition(this.moveTarget);
      else this.node.setPosition(cur.x + (dx / dist) * step, cur.y + (dy / dist) * step, 0);
    }

    this.clampToBounds();
    this.syncPosition();

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

  private draw(): void {
    const g = this.node.getComponent(Graphics) ?? this.node.addComponent(Graphics);
    g.clear();
    g.fillColor = new Color(80, 200, 255, 255);
    g.circle(0, 0, this.radius);
    g.fill();
    g.fillColor = new Color(255, 255, 255, 255);
    g.circle(0, this.radius * 0.4, this.radius * 0.3);
    g.fill();
  }
}

