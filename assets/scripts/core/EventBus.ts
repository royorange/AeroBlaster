type Handler<T = unknown> = (payload: T) => void;

interface Subscription {
  handler: Handler;
  context?: unknown;
  once: boolean;
}

export class EventBus {
  private handlers = new Map<string, Subscription[]>();

  on<T = unknown>(event: string, handler: Handler<T>, context?: unknown): void {
    this.add(event, handler as Handler, context, false);
  }

  once<T = unknown>(event: string, handler: Handler<T>, context?: unknown): void {
    this.add(event, handler as Handler, context, true);
  }

  off(event: string, handler?: Handler, context?: unknown): void {
    const list = this.handlers.get(event);
    if (!list) return;
    if (!handler) {
      this.handlers.delete(event);
      return;
    }
    const filtered = list.filter((s) => s.handler !== handler || (context && s.context !== context));
    if (filtered.length === 0) this.handlers.delete(event);
    else this.handlers.set(event, filtered);
  }

  emit<T = unknown>(event: string, payload?: T): void {
    const list = this.handlers.get(event);
    if (!list) return;
    const snapshot = list.slice();
    for (const sub of snapshot) {
      try {
        sub.handler.call(sub.context, payload);
      } catch (e) {
        console.error(`[EventBus] handler error for "${event}":`, e);
      }
      if (sub.once) this.off(event, sub.handler, sub.context);
    }
  }

  clear(): void {
    this.handlers.clear();
  }

  private add(event: string, handler: Handler, context: unknown, once: boolean): void {
    const list = this.handlers.get(event) ?? [];
    list.push({ handler, context, once });
    this.handlers.set(event, list);
  }
}

export const GlobalEvents = new EventBus();

export const GameEvent = {
  BattleStart: 'battle:start',
  BattleEnd: 'battle:end',
  PlayerDied: 'player:died',
  PlayerLevelUp: 'player:levelup',
  EnemyKilled: 'enemy:killed',
  BossKilled: 'boss:killed',
  PerkSelected: 'perk:selected',
  PerkOffered: 'perk:offered',
  ScoreChanged: 'score:changed',
  CoinChanged: 'coin:changed',
} as const;
