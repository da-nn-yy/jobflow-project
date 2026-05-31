export type JobId = string & { readonly __brand: "JobId" };
export type WorkflowId = string & { readonly __brand: "WorkflowId" };
export type RunId = string & { readonly __brand: "RunId" };
export type TaskId = string & { readonly __brand: "TaskId" };

export type ISODateString = string;

export enum WorkflowState {
  Draft = "draft",
  Pending = "pending",
  Running = "running",
  Waiting = "waiting",
  Completed = "completed",
  Failed = "failed",
  Cancelled = "cancelled",
  DeadLettered = "dead_lettered",
}

export enum TaskStatus {
  Queued = "queued",
  Running = "running",
  Succeeded = "succeeded",
  Failed = "failed",
  Skipped = "skipped",
  Retrying = "retrying",
}

export enum FailureReason {
  Validation = "validation",
  Timeout = "timeout",
  HandlerError = "handler_error",
  TransitionDenied = "transition_denied",
  ConstraintViolation = "constraint_violation",
  MaxRetriesExceeded = "max_retries_exceeded",
}

export interface RetryPolicy {
  maxAttempts: number;
  initialDelayMs: number;
  backoffMultiplier: number;
  maxDelayMs: number;
}

export interface TransitionRule {
  from: WorkflowState;
  to: WorkflowState;
  event: string;
  guard?: string;
}
