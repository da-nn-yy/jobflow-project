export type DslTokenType =
  | "keyword"
  | "ident"
  | "number"
  | "string"
  | "lbrace"
  | "rbrace"
  | "lbracket"
  | "rbracket"
  | "colon"
  | "comma"
  | "arrow"
  | "eof";

export interface DslToken {
  type: DslTokenType;
  value: string;
  line: number;
  column: number;
}

const KEYWORDS = new Set([
  "workflow",
  "task",
  "constraint",
  "depends",
  "optional",
  "warn",
  "block",
  "timeout",
  "version",
  "handler",
  "expr",
]);

export class WorkflowDslLexer {
  private pos = 0;
  private line = 1;
  private column = 1;

  constructor(private readonly source: string) {}

  tokenize(): DslToken[] {
    const tokens: DslToken[] = [];
    while (this.pos < this.source.length) {
      this.skipWhitespaceAndComments();
      if (this.pos >= this.source.length) break;
      const startLine = this.line;
      const startCol = this.column;
      const ch = this.peek();
      if (ch === "{") {
        tokens.push(this.single("lbrace", "{", startLine, startCol));
        continue;
      }
      if (ch === "}") {
        tokens.push(this.single("rbrace", "}", startLine, startCol));
        continue;
      }
      if (ch === "[") {
        tokens.push(this.single("lbracket", "[", startLine, startCol));
        continue;
      }
      if (ch === "]") {
        tokens.push(this.single("rbracket", "]", startLine, startCol));
        continue;
      }
      if (ch === ":") {
        tokens.push(this.single("colon", ":", startLine, startCol));
        continue;
      }
      if (ch === ",") {
        tokens.push(this.single("comma", ",", startLine, startCol));
        continue;
      }
      if (ch === "-" && this.peek(1) === ">") {
        this.advance();
        this.advance();
        tokens.push({ type: "arrow", value: "->", line: startLine, column: startCol });
        continue;
      }
      if (ch === '"' || ch === "'") {
        tokens.push({ type: "string", value: this.readString(), line: startLine, column: startCol });
        continue;
      }
      if (/[0-9]/.test(ch)) {
        tokens.push({ type: "number", value: this.readNumber(), line: startLine, column: startCol });
        continue;
      }
      if (/[a-zA-Z_]/.test(ch)) {
        const word = this.readIdent();
        const type: DslTokenType = KEYWORDS.has(word) ? "keyword" : "ident";
        tokens.push({ type, value: word, line: startLine, column: startCol });
        continue;
      }
      throw new Error(`unexpected character '${ch}' at ${startLine}:${startCol}`);
    }
    tokens.push({ type: "eof", value: "", line: this.line, column: this.column });
    return tokens;
  }

  private single(type: DslTokenType, value: string, line: number, column: number): DslToken {
    this.advance();
    return { type, value, line, column };
  }

  private peek(offset = 0): string {
    return this.source[this.pos + offset] ?? "";
  }

  private advance(): void {
    if (this.source[this.pos] === "\n") {
      this.line += 1;
      this.column = 1;
    } else {
      this.column += 1;
    }
    this.pos += 1;
  }

  private skipWhitespaceAndComments(): void {
    while (this.pos < this.source.length) {
      if (/\s/.test(this.peek())) {
        this.advance();
        continue;
      }
      if (this.peek() === "#") {
        while (this.pos < this.source.length && this.peek() !== "\n") this.advance();
        continue;
      }
      break;
    }
  }

  private readString(): string {
    const q = this.peek();
    this.advance();
    let out = "";
    while (this.pos < this.source.length && this.peek() !== q) {
      if (this.peek() === "\\") {
        this.advance();
        out += this.peek();
        this.advance();
        continue;
      }
      out += this.peek();
      this.advance();
    }
    this.advance();
    return out;
  }

  private readNumber(): string {
    const start = this.pos;
    while (this.pos < this.source.length && /[0-9]/.test(this.peek())) this.advance();
    return this.source.slice(start, this.pos);
  }

  private readIdent(): string {
    const start = this.pos;
    while (this.pos < this.source.length && /[a-zA-Z0-9_.-]/.test(this.peek())) this.advance();
    return this.source.slice(start, this.pos);
  }
}
