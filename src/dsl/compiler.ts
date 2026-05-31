import type { JobDefinition } from "../domain/job-definition.js";
import { DEFAULT_RETRY_POLICY } from "../domain/retry-policy.js";
import { asJobId } from "../utils/ids.js";
import type { WorkflowDslNode } from "./ast.js";
import { WorkflowDslParser } from "./parser.js";
import { WorkflowDslOptimizer } from "./optimizer.js";

export class WorkflowDslCompiler {
  private readonly parser = new WorkflowDslParser();
  private readonly optimizer = new WorkflowDslOptimizer();

  compile(source: string, jobId?: string): JobDefinition {
    const ast = this.parser.parse(source);
    const optimized = this.optimizer.optimize(ast);
    return this.toJobDefinition(optimized, jobId);
  }

  compileFile(content: string, meta: { id: string; createdAt: string }): JobDefinition {
    const def = this.compile(content, meta.id);
    return { ...def, id: asJobId(meta.id), createdAt: meta.createdAt, updatedAt: meta.createdAt };
  }

  private toJobDefinition(ast: WorkflowDslNode, jobId?: string): JobDefinition {
    const now = new Date().toISOString();
    const id = asJobId(jobId ?? ast.name.replace(/\s+/g, "_").toLowerCase());
    return {
      id,
      name: ast.name,
      version: ast.version,
      tasks: ast.tasks.map((t) => ({
        id: t.id,
        name: t.id,
        handler: t.handler,
        timeoutMs: t.timeoutMs,
        optional: t.optional,
        dependsOn: t.dependsOn.length ? t.dependsOn : undefined,
      })),
      constraints: ast.constraints.map((c) => ({
        id: c.id,
        expression: c.expr,
        severity: c.severity,
      })),
      retryPolicy: DEFAULT_RETRY_POLICY,
      allowedTransitions: [],
      metadata: { compiledFrom: "dsl" },
      createdAt: now,
      updatedAt: now,
    };
  }
}
