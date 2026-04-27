export type PerkRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type PerkEffectKind =
  | 'addDamage'
  | 'mulDamage'
  | 'addFireRate'
  | 'mulFireRate'
  | 'addBulletCount'
  | 'addPierce'
  | 'addSpread'
  | 'addMaxHp'
  | 'addMoveSpeed'
  | 'addCoinGain'
  | 'addCritChance'
  | 'addCritMul';

export interface PerkEffect {
  kind: PerkEffectKind;
  value: number;
}

export interface PerkConfig {
  id: string;
  name: string;
  desc: string;
  rarity: PerkRarity;
  weight: number;
  maxStack: number;
  effects: PerkEffect[];
}

export const RARITY_WEIGHTS: Record<PerkRarity, number> = {
  common: 100,
  rare: 35,
  epic: 10,
  legendary: 2,
};
