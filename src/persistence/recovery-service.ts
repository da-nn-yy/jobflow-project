import type { RunId } from "../domain/types.js";
import type { WorkflowStore } from "../storage/interfaces.js";
import { CheckpointStore } from "./checkpoint-store.js";
import type { Clock } from "../utils/clock.js";
import type { Logger } from "../utils/logger.js";

export class RecoveryService {
  constructor(
    private readonly checkpoints: CheckpointStore,
    private readonly workflows: WorkflowStore,
    private readonly clock: Clock,
    private readonly log: Logger,
  ) {}

  async restoreToCheckpoint(runId: RunId, version?: number): Promise<boolean> {
    const snaps = this.checkpoints.list(runId);
    if (!snaps.length) return false;
    const target = version !== undefined ? snaps.find((s) => s.version === version) : snaps[snaps.length - 1];
    if (!target) return false;
    const restored = {
      ...target.workflow,
      updatedAt: this.clock.nowIso(),
    };
    await this.workflows.save(restored);
    this.log.info("workflow restored from checkpoint", { runId, version: target.version });
    return true;
  }

  captureCheckpoint(runId: RunId, workflow: import("../domain/workflow-instance.js").WorkflowInstance, label?: string): void {
    const snaps = this.checkpoints.list(runId);
    this.checkpoints.save({
      runId,
      version: snaps.length + 1,
      workflow: structuredClone(workflow),
      capturedAt: this.clock.nowIso(),
      label,
    });
  }
}
