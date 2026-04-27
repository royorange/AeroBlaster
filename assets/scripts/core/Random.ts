export class Random {
  private state: number;

  constructor(seed?: number) {
    this.state = (seed ?? Date.now()) >>> 0 || 1;
  }

  next(): number {
    let x = this.state | 0;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.state = x >>> 0;
    return (this.state & 0xffffffff) / 0x100000000;
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  intRange(min: number, max: number): number {
    return Math.floor(this.range(min, max));
  }

  pick<T>(arr: readonly T[]): T {
    return arr[this.intRange(0, arr.length)];
  }

  pickWeighted<T>(items: readonly T[], weights: readonly number[]): T {
    const total = weights.reduce((a, b) => a + b, 0);
    let r = this.next() * total;
    for (let i = 0; i < items.length; i++) {
      r -= weights[i];
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  }

  shuffle<T>(arr: T[]): T[] {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = this.intRange(0, i + 1);
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  pickN<T>(arr: readonly T[], n: number): T[] {
    return this.shuffle(arr.slice()).slice(0, n);
  }
}
