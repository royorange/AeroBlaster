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

// ---------- 职业系统 ----------

export enum PlayerClass {
  Inferno = 'inferno',
  Tempest = 'tempest',
  Bastion = 'bastion',
}

export interface PlayerClassDef {
  /** 唯一 id，与枚举值一致 */
  readonly id: PlayerClass;
  /** 中文显示名（短）— 用于 UI 卡片标题 */
  readonly name: string;
  /** 英文代号（全大写）— 用于 UI 副标题 / 装饰 */
  readonly codename: string;
  /** 一句话简介 — 选角卡片副文本 */
  readonly tagline: string;
  /**
   * 立绘 sprite 路径，相对 `assets/resources/`，不含扩展名。
   * 例如：`'arts/characters/inferno_base'`。
   */
  readonly spritePath: string;
  /** 主题色，hex 字符串（含或不含 #）。给卡片 / HUD tint 用。 */
  readonly primaryColor: string;
  /**
   * 该职业的基础 stats。V1 各职业暂时复用 DEFAULT_STATS，
   * 后续做职业差异化时只需修改此处，无需改动业务代码。
   */
  readonly baseStats: PlayerStats;
}

/**
 * 职业定义注册表。新增职业只需：
 *   1. 在 PlayerClass 枚举里加一行
 *   2. 在此处加一份 def
 *   3. 提供对应的 sprite 资源
 * 业务代码、选角 UI 会自动识别。
 */
export const CLASS_DEFS: Record<PlayerClass, PlayerClassDef> = {
  [PlayerClass.Inferno]: {
    id: PlayerClass.Inferno,
    name: '烈焰',
    codename: 'INFERNO',
    tagline: '紧凑的火焰炮艇 · 散射压制',
    spritePath: 'arts/characters/inferno_base',
    primaryColor: '#ff6a1a',
    baseStats: cloneStats(DEFAULT_STATS),
  },
  [PlayerClass.Tempest]: {
    id: PlayerClass.Tempest,
    name: '风暴',
    codename: 'TEMPEST',
    tagline: '紫色晶体战机 · 链式雷霆',
    spritePath: 'arts/characters/tempest_base',
    primaryColor: '#a020ff',
    baseStats: cloneStats(DEFAULT_STATS),
  },
  [PlayerClass.Bastion]: {
    id: PlayerClass.Bastion,
    name: '堡垒',
    codename: 'BASTION',
    tagline: '攻城炮舰 · 充能轨道炮',
    spritePath: 'arts/characters/bastion_base',
    primaryColor: '#d4a520',
    baseStats: cloneStats(DEFAULT_STATS),
  },
};

/** 全部职业的展示顺序（决定选角面板从左到右排列）。 */
export const ALL_CLASSES: readonly PlayerClassDef[] = [
  CLASS_DEFS[PlayerClass.Inferno],
  CLASS_DEFS[PlayerClass.Tempest],
  CLASS_DEFS[PlayerClass.Bastion],
];

export const DEFAULT_CLASS: PlayerClass = PlayerClass.Inferno;

export function getClassDef(cls: PlayerClass): PlayerClassDef {
  return CLASS_DEFS[cls];
}
