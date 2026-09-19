import { runtime } from "./runtime-cloudflare";
export type Row = Record<string, any>;
export interface Statement {
  sql: string;
  params: unknown[];
  bind(...values: unknown[]): Statement;
  all<T = Row>(): Promise<{ results: T[] }>;
  first<T = Row>(): Promise<T | null>;
  run(): Promise<{ meta: { changes: number } }>;
}
interface Database {
  prepare(sql: string): Statement;
  batch(statements: Statement[]): Promise<unknown[]>;
}
export function config(name: string): string {
  return String(runtime()[name] || process.env[name] || "");
}
class RemoteStatement implements Statement {
  constructor(
    public sql: string,
    public params: unknown[] = [],
  ) {}
  bind(...values: unknown[]) {
    return new RemoteStatement(this.sql, values);
  }
  async all<T = Row>() {
    const result = await remote([{ sql: this.sql, params: this.params }]);
    return { results: result[0].rows as T[] };
  }
  async first<T = Row>() {
    return (await this.all<T>()).results[0] || null;
  }
  async run() {
    const result = await remote([{ sql: this.sql, params: this.params }]);
    return { meta: { changes: result[0].changes } };
  }
}
async function remote(statements: { sql: string; params: unknown[] }[]) {
  const url = config("NEXT_PUBLIC_SUPABASE_URL");
  const key = config("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Supabase configuration unavailable");
  const res = await fetch(
    url.replace(/\/$/, "") + "/rest/v1/rpc/alerta_batch",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: "Bearer " + key,
      },
      body: JSON.stringify({ statements }),
      signal: AbortSignal.timeout(12000),
    },
  );
  if (!res.ok) throw new Error("Database request failed: " + res.status);
  return (await res.json()) as { rows: Row[]; changes: number }[];
}
export function database(): Database {
  if (config("DATABASE_PROVIDER") === "supabase")
    return {
      prepare: (sql) => new RemoteStatement(sql),
      batch: (ss) => remote(ss.map((s) => ({ sql: s.sql, params: s.params }))),
    };
  const db = runtime().DB as D1Database | undefined;
  if (!db) throw new Error("Persistent database unavailable");
  return db as unknown as Database;
}
export async function rows<T = Row>(
  sql: string,
  ...args: unknown[]
): Promise<T[]> {
  return (
    await database()
      .prepare(sql)
      .bind(...args)
      .all<T>()
  ).results;
}
export async function one<T = Row>(
  sql: string,
  ...args: unknown[]
): Promise<T | null> {
  return database()
    .prepare(sql)
    .bind(...args)
    .first<T>();
}
export async function run(sql: string, ...args: unknown[]) {
  return database()
    .prepare(sql)
    .bind(...args)
    .run();
}
export const uid = () => crypto.randomUUID();
