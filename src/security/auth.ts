import type { TenantId } from "../domain/tenant.js";
import { JobflowError } from "../domain/errors.js";
import type { ApiKeyRecord } from "./api-key.js";
import { hashKey } from "./api-key.js";

export class ApiKeyStore {
  private readonly keys: ApiKeyRecord[] = [];

  async insert(record: ApiKeyRecord): Promise<void> {
    this.keys.push(record);
  }

  async findByPrefix(prefix: string): Promise<ApiKeyRecord | undefined> {
    return this.keys.find((k) => k.prefix === prefix && !k.revokedAt);
  }
}

export class ApiKeyAuthenticator {
  constructor(private readonly store: ApiKeyStore) {}

  async authenticate(header: string | undefined): Promise<{ tenantId: TenantId; scopes: string[] }> {
    if (!header?.startsWith("Bearer ")) {
      throw new JobflowError("UNAUTHORIZED", "missing bearer token");
    }
    const raw = header.slice(7).trim();
    const prefix = raw.slice(0, 8);
    const record = await this.store.findByPrefix(prefix);
    if (!record || record.hash !== hashKey(raw)) {
      throw new JobflowError("UNAUTHORIZED", "invalid api key");
    }
    return { tenantId: record.tenantId, scopes: record.scopes };
  }
}
