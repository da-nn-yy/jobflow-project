import type { TaskHandlerImplementation } from "./base.js";
import { InvoiceFetchHandler } from "./invoice-fetch.js";
import { InvoiceNormalizeHandler } from "./invoice-normalize.js";
import { InvoicePostGlHandler } from "./invoice-post-gl.js";
import { ReconcileExtractHandler } from "./reconcile-extract.js";
import { ReconcileMatchHandler } from "./reconcile-match.js";
import { OnboardValidateHandler } from "./onboard-validate.js";
import { OnboardProvisionHandler } from "./onboard-provision.js";
import { ReportAggregateHandler } from "./report-aggregate.js";
import { ExternalNotifyHandler } from "./external-notify.js";

const IMPLEMENTATIONS: TaskHandlerImplementation[] = [
  new InvoiceFetchHandler(),
  new InvoiceNormalizeHandler(),
  new InvoicePostGlHandler(),
  new ReconcileExtractHandler(),
  new ReconcileMatchHandler(),
  new OnboardValidateHandler(),
  new OnboardProvisionHandler(),
  new ReportAggregateHandler(),
  new ExternalNotifyHandler(),
];

export class HandlerImplementationRegistry {
  private readonly byName = new Map(IMPLEMENTATIONS.map((h) => [h.name, h]));

  get(name: string): TaskHandlerImplementation | undefined {
    return this.byName.get(name);
  }

  list(): string[] {
    return [...this.byName.keys()];
  }
}
