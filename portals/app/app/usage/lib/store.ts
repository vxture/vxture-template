// Local usage buffer port (local_usage.raw). Only COUNTER metrics are buffered
// here; gauge is a no-buffer direct PUT and caps are counted locally. Batch 2d
// ships the in-memory store; the Prisma-backed store over local_usage lands in 2e.

export interface UsageRow {
  workspaceId: string;
  metric: string; // must hit a platform metric registry key
  amount: number;
  idempotencyKey: string; // forced; replay = no-op
  flushed: boolean;
}

export interface UsageStore {
  record(row: Omit<UsageRow, "flushed">): Promise<void>;
  unflushed(limit: number): Promise<UsageRow[]>;
  markFlushed(idempotencyKeys: string[]): Promise<void>;
}

export class InMemoryUsageStore implements UsageStore {
  private rows = new Map<string, UsageRow>();

  async record(row: Omit<UsageRow, "flushed">): Promise<void> {
    // Upsert by idempotency key: a replay must not double-count.
    if (!this.rows.has(row.idempotencyKey)) {
      this.rows.set(row.idempotencyKey, { ...row, flushed: false });
    }
  }
  async unflushed(limit: number): Promise<UsageRow[]> {
    const out: UsageRow[] = [];
    for (const r of this.rows.values()) {
      if (!r.flushed) out.push(r);
      if (out.length >= limit) break;
    }
    return out;
  }
  async markFlushed(keys: string[]): Promise<void> {
    for (const k of keys) {
      const r = this.rows.get(k);
      if (r) r.flushed = true;
    }
  }
}

let store: UsageStore = new InMemoryUsageStore();
export function getUsageStore(): UsageStore {
  return store;
}
export function setUsageStore(next: UsageStore): void {
  store = next;
}
