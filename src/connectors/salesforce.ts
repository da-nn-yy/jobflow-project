import { BaseConnector, type ConnectorConfig } from "./base-connector.js";
import type { Logger } from "../utils/logger.js";

export interface SalesforceAccount {
  Id: string;
  Name: string;
  Industry?: string;
  AnnualRevenue?: number;
}

export class SalesforceConnector extends BaseConnector {
  constructor(config: ConnectorConfig, log: Logger) {
    super(config, log.child({ connector: "salesforce" }));
  }

  async healthCheck(): Promise<boolean> {
    const res = await this.request<{ totalSize: number }>("GET", "/services/data/v58.0/limits");
    return res.ok;
  }

  async queryAccounts(industry?: string): Promise<SalesforceAccount[]> {
    const soql = industry
      ? `SELECT Id,Name,Industry,AnnualRevenue FROM Account WHERE Industry='${industry}' LIMIT 200`
      : "SELECT Id,Name,Industry,AnnualRevenue FROM Account LIMIT 200";
    const res = await this.request<{ records: SalesforceAccount[] }>(
      "GET",
      `/services/data/v58.0/query?q=${encodeURIComponent(soql)}`,
    );
    return res.data?.records ?? [];
  }

  async upsertOpportunity(payload: {
    Name: string;
    StageName: string;
    CloseDate: string;
    Amount: number;
  }) {
    return this.request<{ id: string }>("POST", "/services/data/v58.0/sobjects/Opportunity", payload);
  }
}
