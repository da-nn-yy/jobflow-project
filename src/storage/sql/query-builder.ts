export type SqlOp = "=" | "!=" | ">" | "<" | ">=" | "<=" | "in" | "like";

export interface SqlCondition {
  column: string;
  op: SqlOp;
  value: unknown;
}

export interface SqlQuery {
  table: string;
  columns: string[];
  conditions: SqlCondition[];
  orderBy?: { column: string; desc: boolean };
  limit?: number;
  offset?: number;
}

export class SqlQueryBuilder {
  private query: SqlQuery;

  constructor(table: string) {
    this.query = { table, columns: ["*"], conditions: [] };
  }

  select(...columns: string[]): this {
    this.query.columns = columns.length ? columns : ["*"];
    return this;
  }

  where(column: string, op: SqlOp, value: unknown): this {
    this.query.conditions.push({ column, op, value });
    return this;
  }

  orderBy(column: string, desc = false): this {
    this.query.orderBy = { column, desc };
    return this;
  }

  limit(n: number): this {
    this.query.limit = n;
    return this;
  }

  offset(n: number): this {
    this.query.offset = n;
    return this;
  }

  build(): { sql: string; params: unknown[] } {
    const params: unknown[] = [];
    const cols = this.query.columns.join(", ");
    let sql = `SELECT ${cols} FROM ${this.query.table}`;
    if (this.query.conditions.length) {
      const parts = this.query.conditions.map((c) => {
        if (c.op === "in") {
          const arr = c.value as unknown[];
          const placeholders = arr.map((v) => {
            params.push(v);
            return `$${params.length}`;
          });
          return `${c.column} IN (${placeholders.join(", ")})`;
        }
        params.push(c.value);
        const op = c.op === "like" ? "LIKE" : c.op;
        return `${c.column} ${op} $${params.length}`;
      });
      sql += ` WHERE ${parts.join(" AND ")}`;
    }
    if (this.query.orderBy) {
      sql += ` ORDER BY ${this.query.orderBy.column} ${this.query.orderBy.desc ? "DESC" : "ASC"}`;
    }
    if (this.query.limit !== undefined) {
      params.push(this.query.limit);
      sql += ` LIMIT $${params.length}`;
    }
    if (this.query.offset !== undefined) {
      params.push(this.query.offset);
      sql += ` OFFSET $${params.length}`;
    }
    return { sql, params };
  }
}
