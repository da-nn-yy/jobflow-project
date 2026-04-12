import type { ExprNode } from "./ast.js";
import { BUILTINS } from "./builtins.js";
import { ExpressionParser } from "./parser.js";

export class ExpressionEvaluator {
  private readonly parser = new ExpressionParser();

  evaluate(expression: string, context: Record<string, unknown>): unknown {
    const ast = this.parser.parse(expression);
    return this.evalNode(ast, context);
  }

  evaluateBoolean(expression: string, context: Record<string, unknown>): boolean {
    return Boolean(this.evaluate(expression, context));
  }

  private evalNode(node: ExprNode, ctx: Record<string, unknown>): unknown {
    switch (node.kind) {
      case "literal":
        return node.value;
      case "ident":
        return this.resolveIdent(node.name, ctx);
      case "unary":
        if (node.op === "not") return !this.evalNode(node.arg, ctx);
        if (node.op === "neg") return -(Number(this.evalNode(node.arg, ctx)) || 0);
        return null;
      case "binary":
        return this.evalBinary(node.op, node.left, node.right, ctx);
      case "call": {
        const fn = BUILTINS[node.name];
        if (!fn) throw new Error(`unknown function: ${node.name}`);
        const args = node.args.map((a) => this.evalNode(a, ctx));
        return fn(args, ctx);
      }
      default:
        return null;
    }
  }

  private resolveIdent(name: string, ctx: Record<string, unknown>): unknown {
    const parts = name.split(".");
    let cur: unknown = ctx;
    for (const p of parts) {
      if (cur === null || cur === undefined || typeof cur !== "object") return undefined;
      cur = (cur as Record<string, unknown>)[p];
    }
    return cur;
  }

  private evalBinary(op: string, left: ExprNode, right: ExprNode, ctx: Record<string, unknown>): unknown {
    const l = this.evalNode(left, ctx);
    const r = this.evalNode(right, ctx);
    switch (op) {
      case "==":
        return l == r;
      case "!=":
        return l != r;
      case "<":
        return Number(l) < Number(r);
      case "<=":
        return Number(l) <= Number(r);
      case ">":
        return Number(l) > Number(r);
      case ">=":
        return Number(l) >= Number(r);
      case "&&":
        return Boolean(l) && Boolean(r);
      case "||":
        return Boolean(l) || Boolean(r);
      case "+":
        return Number(l) + Number(r);
      case "-":
        return Number(l) - Number(r);
      case "*":
        return Number(l) * Number(r);
      case "/":
        return Number(l) / Number(r);
      default:
        throw new Error(`unknown operator ${op}`);
    }
  }
}
