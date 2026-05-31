import type { FailureReason } from "./types.js";

export class JobflowError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "JobflowError";
    this.code = code;
  }
}

export class ValidationError extends JobflowError {
  readonly details: string[];

  constructor(message: string, details: string[] = []) {
    super("VALIDATION_ERROR", message);
    this.name = "ValidationError";
    this.details = details;
  }
}

export class TransitionError extends JobflowError {
  constructor(message: string) {
    super("TRANSITION_DENIED", message);
    this.name = "TransitionError";
  }
}

export class NotFoundError extends JobflowError {
  constructor(entity: string, id: string) {
    super("NOT_FOUND", `${entity} not found: ${id}`);
    this.name = "NotFoundError";
  }
}

export class ExecutionError extends JobflowError {
  readonly reason: FailureReason;

  constructor(reason: FailureReason, message: string) {
    super("EXECUTION_ERROR", message);
    this.name = "ExecutionError";
    this.reason = reason;
  }
}

export class ConcurrencyError extends JobflowError {
  constructor(message: string) {
    super("CONCURRENCY_CONFLICT", message);
    this.name = "ConcurrencyError";
  }
}
