import { BUILTIN_HANDLERS, type HandlerManifestEntry } from "../domain/handler-manifest.js";
import { ValidationError } from "../domain/errors.js";

export class HandlerRegistry {
  private readonly handlers = new Map<string, HandlerManifestEntry>();

  constructor() {
    for (const h of BUILTIN_HANDLERS) {
      this.handlers.set(h.name, h);
    }
  }

  register(entry: HandlerManifestEntry): void {
    if (this.handlers.has(entry.name)) {
      throw new ValidationError(`handler already registered: ${entry.name}`);
    }
    this.handlers.set(entry.name, entry);
  }

  get(name: string): HandlerManifestEntry | undefined {
    return this.handlers.get(name);
  }

  list(tag?: string): HandlerManifestEntry[] {
    const all = [...this.handlers.values()];
    if (!tag) return all;
    return all.filter((h) => h.tags.includes(tag));
  }

  assertKnown(handler: string): void {
    if (!this.handlers.has(handler)) {
      throw new ValidationError(`unknown handler: ${handler}`, [handler]);
    }
  }
}
