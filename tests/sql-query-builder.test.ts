import { describe, expect, it } from "vitest";
import { SqlQueryBuilder } from "../src/storage/sql/query-builder.js";

describe("SqlQueryBuilder", () => {
  it("builds simple equality query", () => {
    const { sql, params } = new SqlQueryBuilder("jobs").where("id", "=", "j1").build();
    expect(sql).toContain("FROM jobs");
    expect(sql).toContain("id = $1");
    expect(params).toEqual(["j1"]);
  });

  it("builds IN clause with multiple params", () => {
    const { sql, params } = new SqlQueryBuilder("runs")
      .where("status", "in", ["pending", "running"])
      .build();
    expect(sql).toContain("IN ($1, $2)");
    expect(params).toEqual(["pending", "running"]);
  });

  it("adds order, limit, and offset", () => {
    const { sql, params } = new SqlQueryBuilder("runs")
      .select("id", "status")
      .orderBy("started_at", true)
      .limit(10)
      .offset(20)
      .build();
    expect(sql).toContain("SELECT id, status");
    expect(sql).toContain("ORDER BY started_at DESC");
    expect(sql).toContain("LIMIT");
    expect(sql).toContain("OFFSET");
    expect(params).toEqual([10, 20]);
  });
});
