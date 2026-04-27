import { PerkConfig, PerkEffect } from '../data/PerkData';
import { cloneStats, PlayerStats } from '../data/PlayerData';

export class PerkSystem {
  private acquired = new Map<string, number>();

  reset(): void {
    this.acquired.clear();
  }

  getStackCount(perkId: string): number {
    return this.acquired.get(perkId) ?? 0;
  }

  canPick(perk: PerkConfig): boolean {
    return this.getStackCount(perk.id) < perk.maxStack;
  }

  apply(baseStats: PlayerStats, perks: readonly PerkConfig[]): PlayerStats {
    const out = cloneStats(baseStats);
    for (const perk of perks) {
      const stack = this.getStackCount(perk.id);
      for (let i = 0; i < stack; i++) {
        for (const eff of perk.effects) this.applyEffect(out, eff);
      }
    }
    out.hp = Math.min(out.hp, out.maxHp);
    return out;
  }

  pick(perk: PerkConfig): void {
    this.acquired.set(perk.id, this.getStackCount(perk.id) + 1);
  }

  snapshot(): Record<string, number> {
    return Object.fromEntries(this.acquired);
  }

  private applyEffect(s: PlayerStats, e: PerkEffect): void {
    switch (e.kind) {
      case 'addDamage':
        s.damage += e.value;
        break;
      case 'mulDamage':
        s.damage *= 1 + e.value;
        break;
      case 'addFireRate':
        s.fireRateHz += e.value;
        break;
      case 'mulFireRate':
        s.fireRateHz *= 1 + e.value;
        break;
      case 'addBulletCount':
        s.bulletCount += e.value;
        break;
      case 'addPierce':
        s.pierce += e.value;
        break;
      case 'addSpread':
        s.spreadDeg += e.value;
        break;
      case 'addMaxHp': {
        const delta = e.value;
        s.maxHp += delta;
        s.hp += delta;
        break;
      }
      case 'addMoveSpeed':
        s.moveSpeed += e.value;
        break;
      case 'addCoinGain':
        s.coinGainMul += e.value;
        break;
      case 'addCritChance':
        s.critChance = Math.min(1, s.critChance + e.value);
        break;
      case 'addCritMul':
        s.critMul += e.value;
        break;
    }
  }
}
