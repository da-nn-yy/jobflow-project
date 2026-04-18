import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { z } from "zod";
import type { BatchManifest } from "./manifest.js";
import { asJobId } from "../utils/ids.js";

const itemSchema = z.object({
  jobId: z.string(),
  label: z.string(),
  input: z.record(z.unknown()).default({}),
  priority: z.number().optional(),
  continueOnError: z.boolean().optional(),
});

const manifestSchema = z.object({
  id: z.string(),
  name: z.string(),
  tenantId: z.string(),
  maxParallel: z.number().int().positive().optional(),
  items: z.array(itemSchema).min(1),
});

export async function loadBatchManifest(path: string): Promise<BatchManifest> {
  const raw = JSON.parse(await readFile(resolve(path), "utf8")) as unknown;
  const parsed = manifestSchema.parse(raw);
  return {
    ...parsed,
    createdAt: new Date().toISOString(),
    items: parsed.items.map((i) => ({
      ...i,
      jobId: asJobId(i.jobId),
    })),
  };
}
