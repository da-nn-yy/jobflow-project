import type { JobId, RetryPolicy } from "./types.js";

export interface TaskDefinition {
  id: string;
  name: string;
  handler: string;
  timeoutMs: number;
  optional?: boolean;
  dependsOn?: string[];
}

export interface JobConstraint {
  id: string;
  expression: string;
  severity: "warn" | "block";
}

export interface JobDefinition {
  id: JobId;
  name: string;
  version: number;
  description?: string;
  tasks: TaskDefinition[];
  constraints: JobConstraint[];
  retryPolicy: RetryPolicy;
  allowedTransitions: string[];
  metadata: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export function cloneJobDefinition(def: JobDefinition): JobDefinition {
  return {
    ...def,
    tasks: def.tasks.map((t) => ({ ...t, dependsOn: t.dependsOn ? [...t.dependsOn] : undefined })),
    constraints: def.constraints.map((c) => ({ ...c })),
    metadata: { ...def.metadata },
  };
}
