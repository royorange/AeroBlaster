import { Vec2 } from 'cc';
import { Enemy } from '../entities/Enemy';

export abstract class AIBase {
  protected age = 0;
  abstract update(dt: number, enemy: Enemy, target: Vec2): void;
}

export class StraightAI extends AIBase {
  update(dt: number, enemy: Enemy): void {
    const p = enemy.node.position;
    enemy.node.setPosition(p.x, p.y - enemy.config.speed * dt, 0);
  }
}

export class SineAI extends AIBase {
  private amplitude: number;
  private frequency: number;
  private baseX = 0;
  private initialized = false;

  constructor(amplitude = 120, frequencyHz = 1) {
    super();
    this.amplitude = amplitude;
    this.frequency = frequencyHz;
  }

  update(dt: number, enemy: Enemy): void {
    if (!this.initialized) {
      // Pull baseX away from edges so the full sine arc stays inside the field.
      const halfField = enemy.bounds.right - 50; // bounds.right has 50 padding outside the visible area
      const safeMax = Math.max(0, halfField - enemy.radius - this.amplitude);
      this.baseX = clamp(enemy.node.position.x, -safeMax, safeMax);
      this.initialized = true;
    }
    this.age += dt;
    const offset = Math.sin(this.age * Math.PI * 2 * this.frequency) * this.amplitude;
    const p = enemy.node.position;
    enemy.node.setPosition(this.baseX + offset, p.y - enemy.config.speed * dt, 0);
  }
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export class TrackerAI extends AIBase {
  update(dt: number, enemy: Enemy, target: Vec2): void {
    this.age += dt;
    const p = enemy.node.position;
    const dx = target.x - p.x;
    const dy = target.y - p.y;
    const len = Math.hypot(dx, dy) || 1;
    const speed = enemy.config.speed;
    enemy.node.setPosition(p.x + (dx / len) * speed * dt, p.y + (dy / len) * speed * dt, 0);
  }
}

export class BossAI extends AIBase {
  private dir = 1;
  private settled = false;
  private targetY: number;

  constructor(targetY: number) {
    super();
    this.targetY = targetY;
  }

  update(dt: number, enemy: Enemy): void {
    this.age += dt;
    const p = enemy.node.position;
    if (!this.settled) {
      const ny = p.y - enemy.config.speed * dt;
      if (ny <= this.targetY) {
        this.settled = true;
        enemy.node.setPosition(p.x, this.targetY, 0);
      } else {
        enemy.node.setPosition(p.x, ny, 0);
      }
      return;
    }
    const speed = enemy.config.speed * 0.6;
    const limit = enemy.bounds.right - 50 - enemy.radius - 20;
    let nx = p.x + this.dir * speed * dt;
    if (nx > limit) {
      nx = limit;
      this.dir = -1;
    } else if (nx < -limit) {
      nx = -limit;
      this.dir = 1;
    }
    enemy.node.setPosition(nx, this.targetY, 0);
  }
}
