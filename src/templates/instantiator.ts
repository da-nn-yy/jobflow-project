import type { JobDefinition } from "../domain/job-definition.js";
import { ValidationError } from "../domain/errors.js";
import type { Clock } from "../utils/clock.js";
import { getTemplate } from "./catalog.js";

export class TemplateInstantiator {
  constructor(private readonly clock: Clock) {}

  instantiate(templateId: string, params: Record<string, string>): JobDefinition {
    const template = getTemplate(templateId);
    if (!template) {
      throw new ValidationError(`unknown template: ${templateId}`);
    }
    for (const p of template.parameters) {
      if (p.required && !params[p.key]) {
        throw new ValidationError(`missing template parameter: ${p.key}`);
      }
    }
    const now = this.clock.nowIso();
    const built = template.build(params);
    return { ...built, createdAt: now, updatedAt: now };
  }
}
