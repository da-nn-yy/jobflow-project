export type ExprNode =
  | { kind: "literal"; value: string | number | boolean | null }
  | { kind: "ident"; name: string }
  | { kind: "unary"; op: "not" | "neg"; arg: ExprNode }
  | { kind: "binary"; op: string; left: ExprNode; right: ExprNode }
  | { kind: "call"; name: string; args: ExprNode[] };

export function literal(value: string | number | boolean | null): ExprNode {
  return { kind: "literal", value };
}

export function ident(name: string): ExprNode {
  return { kind: "ident", name };
}
