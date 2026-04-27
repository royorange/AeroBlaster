import { Random } from '../core/Random';
import { PerkConfig, RARITY_WEIGHTS } from '../data/PerkData';
import { PerkSystem } from './PerkSystem';

export class RewardSelector {
  constructor(private rng: Random) {}

  pickN(all: readonly PerkConfig[], system: PerkSystem, n: number): PerkConfig[] {
    const candidates = all.filter((p) => system.canPick(p));
    if (candidates.length <= n) return candidates.slice();
    const weights = candidates.map((p) => p.weight * RARITY_WEIGHTS[p.rarity]);
    const out: PerkConfig[] = [];
    const pool = candidates.slice();
    const w = weights.slice();
    for (let i = 0; i < n && pool.length > 0; i++) {
      const idx = this.weightedIndex(w);
      out.push(pool[idx]);
      pool.splice(idx, 1);
      w.splice(idx, 1);
    }
    return out;
  }

  private weightedIndex(weights: number[]): number {
    const total = weights.reduce((a, b) => a + b, 0);
    let r = this.rng.next() * total;
    for (let i = 0; i < weights.length; i++) {
      r -= weights[i];
      if (r <= 0) return i;
    }
    return weights.length - 1;
  }
}
