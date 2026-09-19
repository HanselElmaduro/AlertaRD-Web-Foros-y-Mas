let initialized = false;
let bootstrap: Promise<any> | undefined;
async function request(path: string, data?: unknown) {
  const response = await fetch("/api/" + path, {
    method: data === undefined ? "GET" : "POST",
    credentials: "same-origin",
    signal: AbortSignal.timeout(15000),
    headers: data === undefined ? {} : { "Content-Type": "application/json" },
    body: data === undefined ? undefined : JSON.stringify(data),
  });
  const result = (await response.json()) as Record<string, any>;
  if (!response.ok)
    throw new Error(result.error || "No pudimos completar esta acción.");
  return result;
}
async function initialize() {
  if (initialized) return;
  bootstrap ??= request("state")
    .then((v) => {
      initialized = true;
      return v;
    })
    .catch((e) => {
      bootstrap = undefined;
      throw e;
    });
  return bootstrap;
}
export async function api<T = any>(path: string, data?: unknown): Promise<T> {
  if (!initialized) {
    const first = await initialize();
    if (path === "state" && data === undefined) return first;
  }
  return (await request(path, data)) as T;
}
export function dateLabel(value: string) {
  return new Date(
    value.endsWith("Z") ? value : value.replace(" ", "T") + "Z",
  ).toLocaleDateString("es-DO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
