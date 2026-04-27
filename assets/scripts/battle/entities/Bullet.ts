import { _decorator, Color, Component, Graphics, Vec2 } from 'cc';
import { Faction, IBullet } from '../../data/BattleTypes';
import { IPoolable } from '../../core/ObjectPool';
import { isOutside, PlayfieldBounds } from '../PlayfieldBounds';

const { ccclass } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component implements IBullet, IPoolable {
  faction = Faction.Player;
  ownerFaction = Faction.Player;
  alive = true;
  radius = 5;
  damage = 1;
  pierceLeft = 0;
  position = new Vec2();
  velocity = new Vec2();

  private bounds!: PlayfieldBounds;
  private color = new Color(255, 230, 80, 255);

  configure(opts: {
    bounds: PlayfieldBounds;
    faction: Faction;
    damage: number;
    pierce: number;
    velocity: Vec2;
    radius?: number;
    color?: Color;
  }): void {
    this.bounds = opts.bounds;
    this.faction = opts.faction;
    this.ownerFaction = opts.faction;
    this.damage = opts.damage;
    this.pierceLeft = opts.pierce;
    this.velocity.set(opts.velocity.x, opts.velocity.y);
    this.radius = opts.radius ?? (opts.faction === Faction.Player ? 5 : 6);
    if (opts.color) this.color = opts.color;
    this.alive = true;
    this.draw();
  }

  setLocalPosition(x: number, y: number): void {
    this.node.setPosition(x, y, 0);
    this.position.set(x, y);
  }

  tick(dt: number): boolean {
    if (!this.alive) return false;
    const p = this.node.position;
    const nx = p.x + this.velocity.x * dt;
    const ny = p.y + this.velocity.y * dt;
    this.node.setPosition(nx, ny, 0);
    this.position.set(nx, ny);
    if (isOutside(nx, ny, this.bounds)) {
      this.alive = false;
      return false;
    }
    return true;
  }

  onHit(): void {
    if (this.pierceLeft > 0) this.pierceLeft -= 1;
    else this.alive = false;
  }

  onSpawn(): void {
    this.alive = true;
  }

  onRecycle(): void {
    this.alive = false;
    this.velocity.set(0, 0);
  }

  private draw(): void {
    const g = this.node.getComponent(Graphics) ?? this.node.addComponent(Graphics);
    g.clear();
    g.fillColor = this.color;
    g.circle(0, 0, this.radius);
    g.fill();
  }
}
