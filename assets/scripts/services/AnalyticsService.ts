import { Logger } from '../core/Logger';
import { Singleton } from '../core/Singleton';

const TAG = 'Analytics';

export type AnalyticsEvent =
  | { name: 'app_start' }
  | { name: 'run_start'; stageId: string }
  | { name: 'run_end'; stageId: string; result: 'win' | 'lose'; durationSec: number; score: number }
  | { name: 'perk_offered'; perks: string[] }
  | { name: 'perk_picked'; perkId: string }
  | { name: 'ad_shown'; slot: string; success: boolean }
  | { name: 'revive_used'; stageId: string };

export class AnalyticsService extends Singleton<AnalyticsService> {
  private buffer: AnalyticsEvent[] = [];

  track(ev: AnalyticsEvent): void {
    this.buffer.push(ev);
    Logger.debug(TAG, ev);
    if (this.buffer.length >= 50) this.flush();
  }

  flush(): void {
    if (this.buffer.length === 0) return;
    Logger.info(TAG, `flush ${this.buffer.length} events (no backend wired)`);
    this.buffer.length = 0;
  }
}
