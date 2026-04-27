import { Bullet } from '../entities/Bullet';
import { Enemy } from '../entities/Enemy';
import { Player } from '../entities/Player';
import { Faction } from '../../data/BattleTypes';

export class CollisionSystem {
  resolve(player: Player, enemies: Enemy[], bullets: Bullet[]): void {
    for (const b of bullets) {
      if (!b.alive) continue;
      if (b.ownerFaction === Faction.Player) {
        for (const e of enemies) {
          if (!e.alive) continue;
          if (overlap(b.position.x, b.position.y, b.radius, e.position.x, e.position.y, e.radius)) {
            e.takeDamage(b.damage);
            b.onHit();
            if (!b.alive) break;
          }
        }
      } else if (player.alive) {
        if (overlap(b.position.x, b.position.y, b.radius, player.position.x, player.position.y, player.radius)) {
          player.takeDamage(b.damage);
          b.onHit();
        }
      }
    }

    if (player.alive) {
      for (const e of enemies) {
        if (!e.alive) continue;
        if (overlap(player.position.x, player.position.y, player.radius, e.position.x, e.position.y, e.radius)) {
          player.takeDamage(e.config.damage);
          e.takeDamage(9999);
        }
      }
    }
  }
}

function overlap(ax: number, ay: number, ar: number, bx: number, by: number, br: number): boolean {
  const dx = ax - bx;
  const dy = ay - by;
  const r = ar + br;
  return dx * dx + dy * dy <= r * r;
}
