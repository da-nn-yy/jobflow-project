export type BuiltinFn = (args: unknown[], ctx: Record<string, unknown>) => unknown;

export const BUILTINS: Record<string, BuiltinFn> = {
  isempty: (args) => {
    const v = args[0];
    return v === null || v === undefined || v === "";
  },
  length: (args) => {
    const v = args[0];
    if (typeof v === "string") return v.length;
    if (Array.isArray(v)) return v.length;
    return 0;
  },
  contains: (args) => {
    const hay = String(args[0] ?? "");
    const needle = String(args[1] ?? "");
    return hay.includes(needle);
  },
  coalesce: (args) => {
    for (const a of args) {
      if (a !== null && a !== undefined && a !== "") return a;
    }
    return null;
  },
};
