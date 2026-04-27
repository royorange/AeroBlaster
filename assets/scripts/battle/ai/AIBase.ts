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
  private baseX: number;

  constructor(amplitude = 120, frequencyHz = 1) {
    super();
    this.amplitude = amplitude;
    this.frequency = frequencyHz;
    this.baseX = 0;
  }

  update(dt: number, enemy: Enemy): void {
    if (this.age === 0) this.baseX = enemy.node.position.x;
    this.age += dt;
    const offset = Math.sin(this.age * Math.PI * 2 * this.frequency) * this.amplitude;
    const p = enemy.node.position;
    enemy.node.setPosition(this.baseX + offset, p.y - enemy.config.speed * dt, 0);
  }
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
    let nx = p.x + this.dir * speed * dt;
    if (nx > 220) {
      nx = 220;
      this.dir = -1;
    } else if (nx < -220) {
      nx = -220;
      this.dir = 1;
    }
    enemy.node.setPosition(nx, this.targetY, 0);
  }
}
