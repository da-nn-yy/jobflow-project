import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { z } from "zod";
import type { PluginManifest } from "./manifest.js";
import { ValidationError } from "../domain/errors.js";

const schema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  entry: z.string(),
  hooks: z.array(z.enum(["before_run", "after_task", "on_failure"])),
});

export class PluginLoader {
  private readonly loaded = new Map<string, PluginManifest>();

  async loadFromFile(path: string): Promise<PluginManifest> {
    const raw = JSON.parse(await readFile(resolve(path), "utf8")) as unknown;
    const parsed = schema.parse(raw);
    if (this.loaded.has(parsed.id)) {
      throw new ValidationError(`plugin already loaded: ${parsed.id}`);
    }
    this.loaded.set(parsed.id, parsed);
    return parsed;
  }

  list(): PluginManifest[] {
    return [...this.loaded.values()];
  }
}
