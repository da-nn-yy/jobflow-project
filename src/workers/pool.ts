import type { RunId } from "../domain/types.js";
import { RunPriority, comparePriority } from "../domain/priority.js";

export interface QueuedRun {
  runId: RunId;
  priority: RunPriority;
  enqueuedAt: string;
}

export class WorkerPool {
  private readonly queue: QueuedRun[] = [];
  private running = 0;

  constructor(private readonly concurrency: number) {}

  enqueue(item: QueuedRun): void {
    this.queue.push(item);
    this.queue.sort((a, b) => comparePriority(a.priority, b.priority));
  }

  canAccept(): boolean {
    return this.running < this.concurrency;
  }

  start(): QueuedRun | undefined {
    if (!this.canAccept() || !this.queue.length) return undefined;
    this.running += 1;
    return this.queue.shift();
  }

  complete(): void {
    this.running = Math.max(0, this.running - 1);
  }

  depth(): number {
    return this.queue.length;
  }
}
