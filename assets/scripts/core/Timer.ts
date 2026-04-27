type TickFn = (dt: number) => void;

interface Task {
  id: number;
  delay: number;
  remain: number;
  repeat: boolean;
  fn: () => void;
  alive: boolean;
}

export class Timer {
  private static seq = 0;
  private tickFns: TickFn[] = [];
  private tasks: Task[] = [];
  private paused = false;

  setPaused(p: boolean): void {
    this.paused = p;
  }

  onTick(fn: TickFn): void {
    this.tickFns.push(fn);
  }

  offTick(fn: TickFn): void {
    this.tickFns = this.tickFns.filter((f) => f !== fn);
  }

  schedule(fn: () => void, delay: number, repeat = false): number {
    const id = ++Timer.seq;
    this.tasks.push({ id, delay, remain: delay, repeat, fn, alive: true });
    return id;
  }

  cancel(id: number): void {
    const t = this.tasks.find((t) => t.id === id);
    if (t) t.alive = false;
  }

  update(dt: number): void {
    if (this.paused) return;
    for (const fn of this.tickFns) fn(dt);
    for (const t of this.tasks) {
      if (!t.alive) continue;
      t.remain -= dt;
      if (t.remain <= 0) {
        try {
          t.fn();
        } catch (e) {
          console.error('[Timer] task error', e);
        }
        if (t.repeat) t.remain += t.delay;
        else t.alive = false;
      }
    }
    if (this.tasks.length > 64) this.tasks = this.tasks.filter((t) => t.alive);
  }

  clear(): void {
    this.tickFns.length = 0;
    this.tasks.length = 0;
  }
}
