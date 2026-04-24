import type { WorkflowInstance } from "../domain/workflow-instance.js";
import type { RunId } from "../domain/types.js";

export interface RunSnapshot {
  runId: RunId;
  version: number;
  workflow: WorkflowInstance;
  capturedAt: string;
  label?: string;
}
