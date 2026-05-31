import { describe, expect, it } from "vitest";
import { CatalogService } from "../src/services/catalog-service.js";
import { InMemoryJobStore } from "../src/storage/memory/job-store.js";
import { asJobId } from "../src/utils/ids.js";

describe("CatalogService", () => {
  it("lists builtin catalog with enterprise pack", () => {
    const svc = new CatalogService(new InMemoryJobStore());
    const list = svc.listBuiltin();
    expect(list.length).toBeGreaterThan(50);
  });

  it("syncs builtin jobs into store", async () => {
    const store = new InMemoryJobStore();
    const svc = new CatalogService(store);
    const n = await svc.syncBuiltin();
    expect(n).toBeGreaterThan(50);
    const stored = await store.list();
    expect(stored.length).toBe(n);
  });

  it("searches by name fragment", () => {
    const svc = new CatalogService(new InMemoryJobStore());
    const hits = svc.search("invoice");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.some((j) => j.name.toLowerCase().includes("invoice") || j.id.includes("invoice"))).toBe(true);
  });

  it("resolves builtin job when not in store", async () => {
    const svc = new CatalogService(new InMemoryJobStore());
    const builtin = svc.listBuiltin()[0];
    const def = await svc.get(builtin.id);
    expect(def.id).toBe(builtin.id);
  });

  it("throws for unknown job id", async () => {
    const svc = new CatalogService(new InMemoryJobStore());
    await expect(svc.get(asJobId("does_not_exist"))).rejects.toThrow();
  });
});
