export interface TaskDslNode {
  kind: "task";
  id: string;
  handler: string;
  timeoutMs: number;
  dependsOn: string[];
  optional: boolean;
}

export interface ConstraintDslNode {
  kind: "constraint";
  id: string;
  expr: string;
  severity: "warn" | "block";
}

export interface WorkflowDslNode {
  kind: "workflow";
  name: string;
  version: number;
  tasks: TaskDslNode[];
  constraints: ConstraintDslNode[];
}
