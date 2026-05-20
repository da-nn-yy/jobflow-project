import { describe, expect, it } from "vitest";
import { TemplateInstantiator } from "../src/templates/instantiator.js";
import { FakeClock } from "../src/utils/clock.js";

describe("TemplateInstantiator", () => {
  const inst = new TemplateInstantiator(new FakeClock());

  it("builds erp invoice sync from template", () => {
    const def = inst.instantiate("erp_invoice_sync", { tenantId: "acme", glAccount: "4000" });
    expect(def.tasks).toHaveLength(3);
    expect(def.id).toContain("acme");
  });

  it("requires parameters", () => {
    expect(() => inst.instantiate("customer_onboarding", {})).toThrow();
  });
});
