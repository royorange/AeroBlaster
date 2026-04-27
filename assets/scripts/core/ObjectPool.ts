import { instantiate, Node, NodePool, Prefab } from 'cc';

export interface IPoolable {
  onSpawn?(): void;
  onRecycle?(): void;
}

export class PrefabPool {
  private pool: NodePool;
  private prefab: Prefab;
  private parent: Node | null;

  constructor(prefab: Prefab, parent: Node | null = null, preload = 0) {
    this.prefab = prefab;
    this.parent = parent;
    this.pool = new NodePool();
    for (let i = 0; i < preload; i++) {
      this.pool.put(instantiate(prefab));
    }
  }

  acquire(): Node {
    const node = this.pool.size() > 0 ? this.pool.get()! : instantiate(this.prefab);
    if (this.parent && node.parent !== this.parent) {
      this.parent.addChild(node);
    }
    node.active = true;
    this.invokeLifecycle(node, 'onSpawn');
    return node;
  }

  release(node: Node): void {
    if (!node) return;
    this.invokeLifecycle(node, 'onRecycle');
    node.active = false;
    this.pool.put(node);
  }

  size(): number {
    return this.pool.size();
  }

  clear(): void {
    this.pool.clear();
  }

  private invokeLifecycle(node: Node, method: keyof IPoolable): void {
    const comps = node.components;
    for (const c of comps) {
      const fn = (c as unknown as IPoolable)[method];
      if (typeof fn === 'function') fn.call(c);
    }
  }
}

export class PrefabPoolRegistry {
  private static pools = new Map<string, PrefabPool>();

  static register(key: string, pool: PrefabPool): void {
    this.pools.set(key, pool);
  }

  static get(key: string): PrefabPool | undefined {
    return this.pools.get(key);
  }

  static acquire(key: string): Node | null {
    return this.pools.get(key)?.acquire() ?? null;
  }

  static release(key: string, node: Node): void {
    this.pools.get(key)?.release(node);
  }

  static clearAll(): void {
    this.pools.forEach((p) => p.clear());
    this.pools.clear();
  }
}
