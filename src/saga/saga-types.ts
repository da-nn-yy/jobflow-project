import type { RunId } from "../domain/types.js";

export type SagaStepStatus = "pending" | "running" | "completed" | "failed" | "compensating" | "compensated";

export interface SagaStepDefinition {
  id: string;
  name: string;
  forward: string;
  compensate?: string;
  timeoutMs: number;
}

export interface SagaStepState {
  stepId: string;
  status: SagaStepStatus;
  attempt: number;
  output?: Record<string, unknown>;
  error?: string;
  startedAt?: string;
  finishedAt?: string;
}

export interface SagaInstance {
  id: string;
  runId: RunId;
  definitionId: string;
  steps: SagaStepState[];
  status: "active" | "completed" | "failed" | "compensated";
  createdAt: string;
  updatedAt: string;
}

export interface SagaDefinition {
  id: string;
  name: string;
  steps: SagaStepDefinition[];
}
