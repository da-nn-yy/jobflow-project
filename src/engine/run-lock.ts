import type { RunId } from "../domain/types.js";
import { ConcurrencyError } from "../domain/errors.js";

export class RunLockRegistry {
  private readonly locks = new Map<RunId, string>();

  acquire(runId: RunId, owner: string): void {
    const current = this.locks.get(runId);
    if (current && current !== owner) {
      throw new ConcurrencyError(`run ${runId} locked by ${current}`);
    }
    this.locks.set(runId, owner);
  }

  release(runId: RunId, owner: string): void {
    if (this.locks.get(runId) === owner) {
      this.locks.delete(runId);
    }
  }

  isLocked(runId: RunId): boolean {
    return this.locks.has(runId);
  }
}
