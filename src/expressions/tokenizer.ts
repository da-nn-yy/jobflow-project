export type TokenType =
  | "ident"
  | "number"
  | "string"
  | "op"
  | "lparen"
  | "rparen"
  | "comma"
  | "eof";

export interface Token {
  type: TokenType;
  value: string;
  pos: number;
}

export class Tokenizer {
  private pos = 0;

  constructor(private readonly input: string) {}

  tokenize(): Token[] {
    const tokens: Token[] = [];
    while (this.pos < this.input.length) {
      this.skipSpace();
      if (this.pos >= this.input.length) break;
      const ch = this.input[this.pos];
      if (ch === "(") {
        tokens.push({ type: "lparen", value: "(", pos: this.pos++ });
        continue;
      }
      if (ch === ")") {
        tokens.push({ type: "rparen", value: ")", pos: this.pos++ });
        continue;
      }
      if (ch === ",") {
        tokens.push({ type: "comma", value: ",", pos: this.pos++ });
        continue;
      }
      if ("+-*/<>=!&|".includes(ch)) {
        tokens.push({ type: "op", value: this.readOp(), pos: this.pos });
        continue;
      }
      if (ch === '"' || ch === "'") {
        tokens.push({ type: "string", value: this.readString(), pos: this.pos });
        continue;
      }
      if (/[0-9]/.test(ch)) {
        tokens.push({ type: "number", value: this.readNumber(), pos: this.pos });
        continue;
      }
      if (/[a-zA-Z_]/.test(ch)) {
        tokens.push({ type: "ident", value: this.readIdent(), pos: this.pos });
        continue;
      }
      throw new Error(`unexpected character at ${this.pos}: ${ch}`);
    }
    tokens.push({ type: "eof", value: "", pos: this.pos });
    return tokens;
  }

  private skipSpace(): void {
    while (this.pos < this.input.length && /\s/.test(this.input[this.pos])) this.pos++;
  }

  private readOp(): string {
    const two = this.input.slice(this.pos, this.pos + 2);
    if (["==", "!=", "<=", ">=", "&&", "||"].includes(two)) {
      this.pos += 2;
      return two;
    }
    return this.input[this.pos++];
  }

  private readString(): string {
    const quote = this.input[this.pos++];
    let out = "";
    while (this.pos < this.input.length && this.input[this.pos] !== quote) {
      out += this.input[this.pos++];
    }
    this.pos++;
    return out;
  }

  private readNumber(): string {
    const start = this.pos;
    while (this.pos < this.input.length && /[0-9.]/.test(this.input[this.pos])) this.pos++;
    return this.input.slice(start, this.pos);
  }

  private readIdent(): string {
    const start = this.pos;
    while (this.pos < this.input.length && /[a-zA-Z0-9_.]/.test(this.input[this.pos])) this.pos++;
    return this.input.slice(start, this.pos);
  }
}
