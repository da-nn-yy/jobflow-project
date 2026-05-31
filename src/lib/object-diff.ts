export type DiffOp = "add" | "remove" | "change";

export interface DiffEntry {
  path: string;
  op: DiffOp;
  before?: unknown;
  after?: unknown;
}

export function diffObjects(before: Record<string, unknown>, after: Record<string, unknown>, prefix = ""): DiffEntry[] {
  const out: DiffEntry[] = [];
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    const path = prefix ? `${prefix}.${key}` : key;
    const a = before[key];
    const b = after[key];
    if (!(key in before)) {
      out.push({ path, op: "add", after: b });
      continue;
    }
    if (!(key in after)) {
      out.push({ path, op: "remove", before: a });
      continue;
    }
    if (isPlainObject(a) && isPlainObject(b)) {
      out.push(...diffObjects(a, b, path));
      continue;
    }
    if (!deepEqual(a, b)) {
      out.push({ path, op: "change", before: a, after: b });
    }
  }
  return out;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
