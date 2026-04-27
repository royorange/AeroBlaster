export type AIKind = 'straight' | 'sine' | 'tracker' | 'shooter' | 'boss';

export interface EnemyConfig {
  id: string;
  name: string;
  hp: number;
  speed: number;
  damage: number;
  scoreReward: number;
  coinReward: number;
  ai: AIKind;
  fireIntervalSec?: number;
  bulletSpeed?: number;
  color: string;
  radius: number;
  isBoss?: boolean;
}
