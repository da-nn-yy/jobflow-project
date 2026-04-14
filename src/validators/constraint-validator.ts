import type { JobConstraint } from "../domain/job-definition.js";
import { ExecutionError } from "../domain/errors.js";
import { FailureReason } from "../domain/types.js";
import { ExpressionEvaluator } from "../expressions/evaluator.js";

export interface ConstraintContext {
  context: Record<string, unknown>;
  taskOutputs: Record<string, Record<string, unknown>>;
}

export class ConstraintValidator {
  private readonly expressions = new ExpressionEvaluator();

  evaluate(constraints: JobConstraint[], ctx: ConstraintContext): { warnings: string[]; blocks: string[] } {
    const warnings: string[] = [];
    const blocks: string[] = [];

    for (const c of constraints) {
      const violated = this.evaluateExpression(c.expression, ctx);
      if (!violated) continue;
      if (c.severity === "warn") {
        warnings.push(c.id);
      } else {
        blocks.push(c.id);
      }
    }

    return { warnings, blocks };
  }

  assertPassing(constraints: JobConstraint[], ctx: ConstraintContext): void {
    const { blocks } = this.evaluate(constraints, ctx);
    if (blocks.length) {
      throw new ExecutionError(
        FailureReason.ConstraintViolation,
        `constraints blocked: ${blocks.join(", ")}`,
      );
    }
  }

  private evaluateExpression(expr: string, ctx: ConstraintContext): boolean {
    if (expr === "always") return true;
    const evalCtx: Record<string, unknown> = {
      ctx: ctx.context,
      output: ctx.taskOutputs,
    };
    try {
      return this.expressions.evaluateBoolean(expr, evalCtx);
    } catch {
      if (expr.startsWith("ctx.")) {
        const key = expr.slice(4);
        const val = ctx.context[key];
        return val === undefined || val === null || val === "";
      }
      return false;
    }
  }
}
