import type { ExprNode } from "./ast.js";
import { ident, literal } from "./ast.js";
import { Tokenizer, type Token } from "./tokenizer.js";

export class ExpressionParser {
  private tokens: Token[] = [];
  private i = 0;

  parse(input: string): ExprNode {
    this.tokens = new Tokenizer(input).tokenize();
    this.i = 0;
    const node = this.parseOr();
    if (this.peek().type !== "eof") {
      throw new Error(`unexpected token ${this.peek().value}`);
    }
    return node;
  }

  private parseOr(): ExprNode {
    let left = this.parseAnd();
    while (this.peek().value === "||") {
      this.consume("op");
      left = { kind: "binary", op: "||", left, right: this.parseAnd() };
    }
    return left;
  }

  private parseAnd(): ExprNode {
    let left = this.parseComparison();
    while (this.peek().value === "&&") {
      this.consume("op");
      left = { kind: "binary", op: "&&", left, right: this.parseComparison() };
    }
    return left;
  }

  private parseComparison(): ExprNode {
    let left = this.parseAdd();
    const ops = ["==", "!=", "<", "<=", ">", ">="];
    if (ops.includes(this.peek().value)) {
      const op = this.consume("op").value;
      return { kind: "binary", op, left, right: this.parseAdd() };
    }
    return left;
  }

  private parseAdd(): ExprNode {
    let left = this.parseMul();
    while (["+", "-"].includes(this.peek().value)) {
      const op = this.consume("op").value;
      left = { kind: "binary", op, left, right: this.parseMul() };
    }
    return left;
  }

  private parseMul(): ExprNode {
    let left = this.parseUnary();
    while (["*", "/"].includes(this.peek().value)) {
      const op = this.consume("op").value;
      left = { kind: "binary", op, left, right: this.parseUnary() };
    }
    return left;
  }

  private parseUnary(): ExprNode {
    if (this.peek().value === "!") {
      this.consume("op");
      return { kind: "unary", op: "not", arg: this.parseUnary() };
    }
    if (this.peek().value === "-") {
      this.consume("op");
      return { kind: "unary", op: "neg", arg: this.parseUnary() };
    }
    return this.parsePrimary();
  }

  private parsePrimary(): ExprNode {
    const t = this.peek();
    if (t.type === "number") {
      this.i++;
      return literal(Number(t.value));
    }
    if (t.type === "string") {
      this.i++;
      return literal(t.value);
    }
    if (t.type === "ident") {
      const name = this.consume("ident").value;
      if (name === "true") return literal(true);
      if (name === "false") return literal(false);
      if (name === "null") return literal(null);
      if (this.peek().type === "lparen") {
        this.consume("lparen");
        const args: ExprNode[] = [];
        if (this.peek().type !== "rparen") {
          args.push(this.parseOr());
          while (this.peek().type === "comma") {
            this.consume("comma");
            args.push(this.parseOr());
          }
        }
        this.consume("rparen");
        return { kind: "call", name, args };
      }
      return ident(name);
    }
    if (t.type === "lparen") {
      this.consume("lparen");
      const inner = this.parseOr();
      this.consume("rparen");
      return inner;
    }
    throw new Error(`unexpected token ${t.type}`);
  }

  private peek(): Token {
    return this.tokens[this.i];
  }

  private consume(type: Token["type"]): Token {
    const t = this.peek();
    if (t.type !== type) throw new Error(`expected ${type}, got ${t.type}`);
    this.i++;
    return t;
  }
}
