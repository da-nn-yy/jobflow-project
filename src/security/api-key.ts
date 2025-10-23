import { createHash, randomBytes } from "node:crypto";
import type { TenantId } from "../domain/tenant.js";

export interface ApiKeyRecord {
  id: string;
  tenantId: TenantId;
  prefix: string;
  hash: string;
  scopes: string[];
  createdAt: string;
  revokedAt?: string;
}

export function generateApiKey(): { raw: string; prefix: string; hash: string } {
  const raw = randomBytes(24).toString("base64url");
  const prefix = raw.slice(0, 8);
  const hash = hashKey(raw);
  return { raw, prefix, hash };
}

export function hashKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}
