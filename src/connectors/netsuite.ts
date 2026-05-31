import { BaseConnector, type ConnectorConfig } from "./base-connector.js";
import type { Logger } from "../utils/logger.js";

export interface NetSuiteInvoice {
  id: string;
  tranId: string;
  amount: number;
  currency: string;
  status: string;
}

export class NetSuiteConnector extends BaseConnector {
  constructor(config: ConnectorConfig, log: Logger) {
    super(config, log.child({ connector: "netsuite" }));
  }

  async healthCheck(): Promise<boolean> {
    const res = await this.request<{ status: string }>("GET", "/services/rest/record/v1/metadata-catalog");
    return res.ok;
  }

  async listOpenInvoices(subsidiaryId: string, since?: string): Promise<NetSuiteInvoice[]> {
    const q = since ? `?q=lastModifiedDate ON OR AFTER "${since}"` : "";
    const res = await this.request<{ items: NetSuiteInvoice[] }>(
      "GET",
      `/services/rest/record/v1/invoice${q}&subsidiary=${subsidiaryId}`,
    );
    if (!res.ok || !res.data) return [];
    return res.data.items ?? [];
  }

  async postJournalEntry(entry: {
    subsidiaryId: string;
    lines: Array<{ account: string; debit: number; credit: number; memo: string }>;
  }): Promise<{ id: string } | undefined> {
    const res = await this.request<{ id: string }>("POST", "/services/rest/record/v1/journalEntry", entry);
    return res.data;
  }

  async getVendor(vendorId: string) {
    return this.request<Record<string, unknown>>("GET", `/services/rest/record/v1/vendor/${vendorId}`);
  }
}
