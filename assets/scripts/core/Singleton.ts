export class Singleton<T> {
  private static _instances = new Map<Function, unknown>();

  static getInstance<U>(this: new () => U): U {
    const map = Singleton._instances;
    if (!map.has(this)) {
      map.set(this, new this());
    }
    return map.get(this) as U;
  }

  static reset(): void {
    Singleton._instances.clear();
  }
}
