import { describe, expect, it } from "vitest";
import { HandlerRegistry } from "../src/handlers/registry.js";

describe("HandlerRegistry", () => {
  it("lists builtin handlers", () => {
    const reg = new HandlerRegistry();
    expect(reg.list().length).toBeGreaterThan(5);
    expect(reg.get("invoice.fetch")).toBeDefined();
  });

  it("rejects unknown handler on assert", () => {
    const reg = new HandlerRegistry();
    expect(() => reg.assertKnown("not.real")).toThrow();
  });
});
