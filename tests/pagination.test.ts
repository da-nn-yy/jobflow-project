import { describe, expect, it } from "vitest";
import { paginate } from "../src/utils/pagination.js";

describe("paginate", () => {
  const items = Array.from({ length: 25 }, (_, i) => `item-${i}`);

  it("returns first page with default sizing", () => {
    const page = paginate(items, { page: 1, pageSize: 10 });
    expect(page.items).toHaveLength(10);
    expect(page.items[0]).toBe("item-0");
    expect(page.total).toBe(25);
    expect(page.totalPages).toBe(3);
  });

  it("returns last partial page", () => {
    const page = paginate(items, { page: 3, pageSize: 10 });
    expect(page.items).toHaveLength(5);
    expect(page.items[0]).toBe("item-20");
  });

  it("clamps invalid page and pageSize", () => {
    const page = paginate(items, { page: 0, pageSize: 500 });
    expect(page.page).toBe(1);
    expect(page.pageSize).toBe(100);
    expect(page.items).toHaveLength(25);
  });

  it("handles empty list", () => {
    const page = paginate([], { page: 1, pageSize: 10 });
    expect(page.items).toEqual([]);
    expect(page.totalPages).toBe(1);
  });
});
