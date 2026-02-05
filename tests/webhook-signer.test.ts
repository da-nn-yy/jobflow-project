import { describe, expect, it } from "vitest";
import { signPayload, verifySignature } from "../src/webhooks/signer.js";

describe("webhook signer", () => {
  it("verifies valid signature", () => {
    const body = JSON.stringify({ ok: true });
    const ts = "1700000000";
    const sig = signPayload("secret", body, ts);
    expect(verifySignature("secret", body, ts, sig)).toBe(true);
  });
});
