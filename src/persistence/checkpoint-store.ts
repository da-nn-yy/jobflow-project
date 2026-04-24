import type { RunSnapshot } from "./run-snapshot.js";
import type { RunId } from "../domain/types.js";

export class CheckpointStore {
  private readonly snapshots = new Map<string, RunSnapshot[]>();

  save(snapshot: RunSnapshot): void {
    const key = snapshot.runId;
    const list = this.snapshots.get(key) ?? [];
    list.push(snapshot);
    this.snapshots.set(key, list);
  }

  latest(runId: RunId): RunSnapshot | undefined {
    const list = this.snapshots.get(runId);
    return list?.[list.length - 1];
  }

  list(runId: RunId): RunSnapshot[] {
    return [...(this.snapshots.get(runId) ?? [])];
  }
}
