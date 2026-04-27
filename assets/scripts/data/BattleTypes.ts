import { Vec2 } from 'cc';

export enum Faction {
  Player = 0,
  Enemy = 1,
}

export interface ICollidable {
  faction: Faction;
  position: Vec2;
  radius: number;
  alive: boolean;
}

export interface IDamageable extends ICollidable {
  takeDamage(amount: number): void;
}

export interface IBullet extends ICollidable {
  damage: number;
  pierceLeft: number;
  velocity: Vec2;
  ownerFaction: Faction;
}
