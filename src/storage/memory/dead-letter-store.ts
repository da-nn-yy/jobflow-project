import type { RunId } from "../../domain/types.js";
import type { DeadLetterStore } from "../interfaces.js";

interface DeadLetterEntry {
  runId: RunId;
  payload: Record<string, unknown>;
  at: string;
}

export class InMemoryDeadLetterStore implements DeadLetterStore {
  private readonly entries: DeadLetterEntry[] = [];

  async push(runId: RunId, payload: Record<string, unknown>): Promise<void> {
    this.entries.push({ runId, payload, at: new Date().toISOString() });
  }

  async list(limit = 100): Promise<DeadLetterEntry[]> {
    return this.entries.slice(-limit);
  }
}
