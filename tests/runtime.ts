import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
export const sqlite = new DatabaseSync(":memory:");
sqlite.exec("PRAGMA foreign_keys=ON");
sqlite.exec(readFileSync("schema.sql", "utf8"));
class Statement {
  constructor(
    public sql: string,
    public values: any[] = [],
  ) {}
  bind(...args: any[]) {
    return new Statement(this.sql, args);
  }
  async all() {
    return { results: sqlite.prepare(this.sql).all(...this.values) };
  }
  async first() {
    return sqlite.prepare(this.sql).get(...this.values) || null;
  }
  async run() {
    const r = sqlite.prepare(this.sql).run(...this.values);
    return { meta: { changes: Number(r.changes) } };
  }
}
const DB = {
  prepare: (sql: string) => new Statement(sql),
  async batch(ss: Statement[]) {
    sqlite.exec("BEGIN");
    try {
      const results = [];
      for (const s of ss) results.push(await s.run());
      sqlite.exec("COMMIT");
      return results;
    } catch (e) {
      sqlite.exec("ROLLBACK");
      throw e;
    }
  },
};
export function runtime() {
  return {
    DB,
    DATABASE_PROVIDER: "d1",
    ADMIN_SETUP_TOKEN: "TEST-ONLY-SETUP-TOKEN-DO-NOT-USE",
    RATE_LIMIT_SALT: "TEST-ONLY-SALT",
    NEXT_PUBLIC_SITE_URL: "https://test.alertard.local",
  };
}
