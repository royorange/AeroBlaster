import { PlayerStats } from '../data/PlayerData';
import { SaveService } from '../services/SaveService';

export interface MetaPerkDef {
  id: string;
  name: string;
  desc: string;
  costPerLevel: (level: number) => number;
  maxLevel: number;
  apply: (stats: PlayerStats, level: number) => void;
}

const META_PERKS: MetaPerkDef[] = [
  {
    id: 'meta_hp',
    name: '强化机身',
    desc: '+1 最大生命值 / 级',
    costPerLevel: (lv) => 50 + lv * 30,
    maxLevel: 10,
    apply: (s, lv) => {
      s.maxHp += lv;
      s.hp += lv;
    },
  },
  {
    id: 'meta_dmg',
    name: '强化主炮',
    desc: '+10% 基础伤害 / 级',
    costPerLevel: (lv) => 60 + lv * 40,
    maxLevel: 10,
    apply: (s, lv) => {
      s.damage *= 1 + 0.1 * lv;
    },
  },
  {
    id: 'meta_speed',
    name: '强化引擎',
    desc: '+30 移动速度 / 级',
    costPerLevel: (lv) => 40 + lv * 25,
    maxLevel: 5,
    apply: (s, lv) => {
      s.moveSpeed += 30 * lv;
    },
  },
  {
    id: 'meta_coin',
    name: '财富磁铁',
    desc: '+10% 金币收益 / 级',
    costPerLevel: (lv) => 80 + lv * 60,
    maxLevel: 5,
    apply: (s, lv) => {
      s.coinGainMul += 0.1 * lv;
    },
  },
];

export class MetaProgress {
  list(): readonly MetaPerkDef[] {
    return META_PERKS;
  }

  getLevel(id: string): number {
    return SaveService.getInstance().data.metaPerks[id] ?? 0;
  }

  upgradeCost(def: MetaPerkDef): number {
    return def.costPerLevel(this.getLevel(def.id));
  }

  canUpgrade(def: MetaPerkDef): boolean {
    return this.getLevel(def.id) < def.maxLevel && SaveService.getInstance().data.shards >= this.upgradeCost(def);
  }

  upgrade(def: MetaPerkDef): boolean {
    if (!this.canUpgrade(def)) return false;
    const save = SaveService.getInstance();
    const cost = this.upgradeCost(def);
    const lv = this.getLevel(def.id);
    save.update({
      shards: save.data.shards - cost,
      metaPerks: { ...save.data.metaPerks, [def.id]: lv + 1 },
    });
    return true;
  }

  applyAll(stats: PlayerStats): void {
    for (const def of META_PERKS) {
      const lv = this.getLevel(def.id);
      if (lv > 0) def.apply(stats, lv);
    }
  }
}
