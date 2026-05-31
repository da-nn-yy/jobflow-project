import type { ConstraintDslNode, TaskDslNode, WorkflowDslNode } from "./ast.js";
import type { DslToken } from "./lexer.js";
import { WorkflowDslLexer } from "./lexer.js";

export class WorkflowDslParser {
  private tokens: DslToken[] = [];
  private i = 0;

  parse(source: string): WorkflowDslNode {
    this.tokens = new WorkflowDslLexer(source).tokenize();
    this.i = 0;
    this.expectKeyword("workflow");
    const name = this.expectIdent();
    this.expect("colon");
    this.expect("lbrace");
    this.expectKeyword("version");
    this.expect("colon");
    const version = Number(this.expect("number").value);
    const tasks: TaskDslNode[] = [];
    const constraints: ConstraintDslNode[] = [];
    while (this.peek().type !== "rbrace") {
      if (this.peekKeyword("task")) {
        tasks.push(this.parseTask());
      } else if (this.peekKeyword("constraint")) {
        constraints.push(this.parseConstraint());
      } else {
        throw new Error(`unexpected token in workflow body: ${this.peek().value}`);
      }
    }
    this.expect("rbrace");
    return { kind: "workflow", name, version, tasks, constraints };
  }

  private parseTask(): TaskDslNode {
    this.expectKeyword("task");
    const id = this.expectIdent();
    this.expect("colon");
    this.expect("lbrace");
    let handler = "";
    let timeoutMs = 30_000;
    const dependsOn: string[] = [];
    let optional = false;
    while (this.peek().type !== "rbrace") {
      if (this.peekKeyword("handler")) {
        this.expectKeyword("handler");
        this.expect("colon");
        handler = this.expect("string").value;
      } else if (this.peekKeyword("timeout")) {
        this.expectKeyword("timeout");
        this.expect("colon");
        timeoutMs = Number(this.expect("number").value);
      } else if (this.peekKeyword("depends")) {
        this.expectKeyword("depends");
        this.expect("colon");
        this.expect("lbracket");
        while (this.peek().type !== "rbracket") {
          dependsOn.push(this.expectIdentOrString());
          if (this.peek().type === "comma") this.expect("comma");
        }
        this.expect("rbracket");
      } else if (this.peekKeyword("optional")) {
        this.expectKeyword("optional");
        optional = true;
      } else {
        throw new Error(`unknown task field near ${this.peek().value}`);
      }
    }
    this.expect("rbrace");
    if (!handler) throw new Error(`task ${id} missing handler`);
    return { kind: "task", id, handler, timeoutMs, dependsOn, optional };
  }

  private parseConstraint(): ConstraintDslNode {
    this.expectKeyword("constraint");
    const id = this.expectIdent();
    this.expect("colon");
    this.expect("lbrace");
    let expr = "";
    let severity: "warn" | "block" = "block";
    while (this.peek().type !== "rbrace") {
      if (this.peekKeyword("expr")) {
        this.expectKeyword("expr");
        this.expect("colon");
        expr = this.expect("string").value;
      } else if (this.peekKeyword("warn")) {
        this.expectKeyword("warn");
        severity = "warn";
      } else if (this.peekKeyword("block")) {
        this.expectKeyword("block");
        severity = "block";
      }
    }
    this.expect("rbrace");
    return { kind: "constraint", id, expr, severity };
  }

  private peek(): DslToken {
    return this.tokens[this.i];
  }

  private peekKeyword(kw: string): boolean {
    return this.peek().type === "keyword" && this.peek().value === kw;
  }

  private expectKeyword(kw: string): void {
    const t = this.expect("keyword");
    if (t.value !== kw) throw new Error(`expected keyword ${kw}`);
  }

  private expectIdent(): string {
    return this.expect("ident").value;
  }

  private expectIdentOrString(): string {
    const t = this.peek();
    if (t.type === "ident" || t.type === "string") {
      this.i += 1;
      return t.value;
    }
    throw new Error(`expected ident or string, got ${t.type}`);
  }

  private expect(type: DslToken["type"]): DslToken {
    const t = this.peek();
    if (t.type !== type) throw new Error(`expected ${type}, got ${t.type} (${t.value})`);
    this.i += 1;
    return t;
  }
}
