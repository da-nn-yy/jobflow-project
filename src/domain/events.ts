import type { FailureReason, RunId, WorkflowState } from "./types.js";

export type DomainEvent =
  | { type: "job.registered"; jobId: string; at: string }
  | { type: "run.started"; runId: RunId; jobId: string; at: string }
  | { type: "run.completed"; runId: RunId; at: string }
  | { type: "workflow.transitioned"; runId: RunId; from: WorkflowState; to: WorkflowState; event: string; at: string }
  | { type: "task.started"; runId: RunId; taskId: string; attempt: number; at: string }
  | { type: "task.finished"; runId: RunId; taskId: string; success: boolean; at: string }
  | { type: "task.retry_scheduled"; runId: RunId; taskId: string; attempt: number; delayMs: number; at: string }
  | { type: "run.failed"; runId: RunId; reason: FailureReason; at: string }
  | { type: "run.dead_lettered"; runId: RunId; at: string };

export type DomainEventListener = (event: DomainEvent) => void;
