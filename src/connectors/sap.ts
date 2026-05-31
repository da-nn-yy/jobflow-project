import { BaseConnector, type ConnectorConfig } from "./base-connector.js";
import type { Logger } from "../utils/logger.js";

export interface SapDocument {
  documentNumber: string;
  companyCode: string;
  fiscalYear: number;
  amount: number;
  currency: string;
}

export class SapConnector extends BaseConnector {
  constructor(config: ConnectorConfig, log: Logger) {
    super(config, log.child({ connector: "sap" }));
  }

  async healthCheck(): Promise<boolean> {
    const res = await this.request<{ healthy: boolean }>("GET", "/sap/opu/odata/sap/API_BUSINESS_PARTNER/$metadata");
    return res.ok;
  }

  async fetchAccountingDocuments(companyCode: string, fromDate: string, toDate: string): Promise<SapDocument[]> {
    const filter = `CompanyCode eq '${companyCode}' and PostingDate ge datetime'${fromDate}' and PostingDate le datetime'${toDate}'`;
    const res = await this.request<{ value: SapDocument[] }>(
      "GET",
      `/sap/opu/odata/sap/API_JOURNALENTRY_SRV/A_JournalEntryItem?${encodeURIComponent("$filter")}=${encodeURIComponent(filter)}`,
    );
    return res.data?.value ?? [];
  }

  async postClearing(document: {
    companyCode: string;
    debitAccount: string;
    creditAccount: string;
    amount: number;
    text: string;
  }): Promise<ConnectorPostResult> {
    const res = await this.request<{ DocumentNumber: string }>(
      "POST",
      "/sap/opu/odata/sap/API_JOURNALENTRY_SRV/A_JournalEntry",
      document,
    );
    return { success: res.ok, documentNumber: res.data?.DocumentNumber, error: res.error };
  }
}

export interface ConnectorPostResult {
  success: boolean;
  documentNumber?: string;
  error?: string;
}
