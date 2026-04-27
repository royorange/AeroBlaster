export interface PlayerStats {
  maxHp: number;
  hp: number;
  damage: number;
  fireRateHz: number;
  bulletCount: number;
  bulletSpeed: number;
  pierce: number;
  spreadDeg: number;
  moveSpeed: number;
  critChance: number;
  critMul: number;
  coinGainMul: number;
}

export const DEFAULT_STATS: PlayerStats = {
  maxHp: 5,
  hp: 5,
  damage: 1,
  fireRateHz: 4,
  bulletCount: 1,
  bulletSpeed: 800,
  pierce: 0,
  spreadDeg: 0,
  moveSpeed: 480,
  critChance: 0,
  critMul: 2,
  coinGainMul: 1,
};

export function cloneStats(s: PlayerStats): PlayerStats {
  return { ...s };
}
