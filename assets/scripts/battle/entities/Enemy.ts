import { _decorator, Color, Component, Graphics, Vec2 } from 'cc';
import { GameEvent, GlobalEvents } from '../../core/EventBus';
import { IPoolable } from '../../core/ObjectPool';
import { Faction, IDamageable } from '../../data/BattleTypes';
import { EnemyConfig } from '../../data/EnemyData';
import { AIBase } from '../ai/AIBase';
import { isOutside, PlayfieldBounds } from '../PlayfieldBounds';

const { ccclass } = _decorator;

@ccclass('Enemy')
export class Enemy extends Component implements IDamageable, IPoolable {
  faction = Faction.Enemy;
  alive = true;
  position = new Vec2();
  radius = 20;

  config!: EnemyConfig;
  hp = 1;
  ai!: AIBase;
  fireCooldown = 0;
  bounds!: PlayfieldBounds;

  configure(cfg: EnemyConfig, bounds: PlayfieldBounds, ai: AIBase): void {
    this.config = cfg;
    this.bounds = bounds;
    this.hp = cfg.hp;
    this.radius = cfg.radius;
    this.alive = true;
    this.ai = ai;
    this.fireCooldown = cfg.fireIntervalSec ?? Infinity;
    this.draw();
  }

  setLocalPosition(x: number, y: number): void {
    this.node.setPosition(x, y, 0);
    this.position.set(x, y);
  }

  tick(dt: number, target: Vec2): { fire: boolean } {
    if (!this.alive) return { fire: false };
    this.ai.update(dt, this, target);
    let p = this.node.position;

    // Clamp horizontally so enemies never exit the visible field sideways.
    // (Vertical exit is allowed — they're supposed to fly off the bottom.)
    const minX = this.bounds.left + this.radius + 50; // bounds left already has 50 padding; pull back inside
    const maxX = this.bounds.right - this.radius - 50;
    if (p.x < minX) {
      this.node.setPosition(minX, p.y, p.z);
      p = this.node.position;
    } else if (p.x > maxX) {
      this.node.setPosition(maxX, p.y, p.z);
      p = this.node.position;
    }

    this.position.set(p.x, p.y);
    if (isOutside(p.x, p.y, this.bounds)) {
      this.alive = false;
      return { fire: false };
    }
    if (this.config.fireIntervalSec) {
      this.fireCooldown -= dt;
      if (this.fireCooldown <= 0) {
        this.fireCooldown += this.config.fireIntervalSec;
        return { fire: true };
      }
    }
    return { fire: false };
  }

  takeDamage(amount: number): void {
    if (!this.alive) return;
    this.hp -= amount;
    if (this.hp <= 0) {
      this.alive = false;
      GlobalEvents.emit(GameEvent.EnemyKilled, {
        id: this.config.id,
        score: this.config.scoreReward,
        coin: this.config.coinReward,
        x: this.position.x,
        y: this.position.y,
        isBoss: !!this.config.isBoss,
      });
    }
  }

  onSpawn(): void {
    this.alive = true;
  }

  onRecycle(): void {
    this.alive = false;
  }

  private draw(): void {
    const g = this.node.getComponent(Graphics) ?? this.node.addComponent(Graphics);
    g.clear();
    const c = parseColor(this.config.color);
    g.fillColor = c;
    if (this.config.isBoss) {
      g.rect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
      g.fill();
    } else {
      g.circle(0, 0, this.radius);
      g.fill();
    }
  }
}

function parseColor(s: string): Color {
  if (s.startsWith('#') && s.length === 7) {
    const r = parseInt(s.slice(1, 3), 16);
    const g = parseInt(s.slice(3, 5), 16);
    const b = parseInt(s.slice(5, 7), 16);
    return new Color(r, g, b, 255);
  }
  return new Color(255, 100, 100, 255);
}
