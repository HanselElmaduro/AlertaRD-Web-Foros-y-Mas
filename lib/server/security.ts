import { z } from "zod";
import { config, database, one, run, uid, type Row } from "./database";
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export const textField = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min, "El texto es demasiado corto.")
    .max(max, "El texto supera el límite permitido.")
    .refine(
      (s) => !/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(s),
      "El texto contiene caracteres no válidos.",
    );
export async function sha(value: string) {
  return Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
    ),
  )
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}
const random = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
export async function passwordHash(password: string, salt: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: new TextEncoder().encode(salt),
      iterations: 100000,
    },
    key,
    256,
  );
  return Array.from(new Uint8Array(bits))
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}
export function equal(a: string, b: string) {
  let d = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++)
    d |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return d === 0;
}
export interface Context {
  profile: Row;
  cookie?: string;
  tokenHash: string;
  request: Request;
}
export async function session(
  request: Request,
  create = true,
): Promise<Context> {
  const token = request.headers
    .get("cookie")
    ?.split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith("ard_session="))
    ?.slice(12);
  const tokenHash = token ? await sha(token) : "";
  const profile = tokenHash
    ? await one(
        "SELECT p.* FROM profiles p JOIN sessions s ON s.profile_id = p.id WHERE s.token_hash = ? AND s.expires_at > ?",
        tokenHash,
        Date.now(),
      )
    : null;
  if (profile) return { profile, tokenHash, request };
  if (!create) throw new ApiError(401, "Inicia sesión para continuar.");
  const id = uid();
  const secret = random();
  const hash = await sha(secret);
  const db = database();
  await db.batch([
    db
      .prepare("INSERT INTO profiles (id,alias,role) VALUES (?,?,?)")
      .bind(id, "Participante", "guest"),
    db
      .prepare(
        "INSERT INTO sessions (token_hash,profile_id,expires_at) VALUES (?,?,?)",
      )
      .bind(hash, id, Date.now() + 30 * 86400000),
  ]);
  return {
    profile: { id, alias: "Participante", role: "guest", province: null },
    tokenHash: hash,
    request,
    cookie: cookie(secret, request),
  };
}
export function cookie(token: string, request: Request, maxAge = 2592000) {
  return `ard_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${new URL(request.url).protocol === "https:" ? "; Secure" : ""}`;
}
export async function rotate(ctx: Context, id: string) {
  const token = random();
  await database().batch([
    database()
      .prepare("DELETE FROM sessions WHERE token_hash = ?")
      .bind(ctx.tokenHash),
    database()
      .prepare(
        "INSERT INTO sessions (token_hash,profile_id,expires_at) VALUES (?,?,?)",
      )
      .bind(await sha(token), id, Date.now() + 2592000000),
  ]);
  ctx.cookie = cookie(token, ctx.request);
}
export function requireRole(ctx: Context, adminOnly = false) {
  if (
    !(adminOnly ? ["admin"] : ["admin", "moderator"]).includes(ctx.profile.role)
  )
    throw new ApiError(403, "Esta sección requiere una cuenta autorizada.");
}
export async function participate(ctx: Context) {
  await run(
    "INSERT INTO participation_data (profile_id) VALUES (?) ON CONFLICT(profile_id) DO NOTHING",
    ctx.profile.id,
  );
}
export function checkOrigin(req: Request) {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) return;
  const origin = req.headers.get("origin");
  const host = new URL(req.url).origin;
  const trusted = config("NEXT_PUBLIC_SITE_URL");
  if (!origin || (origin !== host && origin !== trusted))
    throw new ApiError(403, "La solicitud debe enviarse desde este sitio.");
  if (!req.headers.get("content-type")?.includes("application/json"))
    throw new ApiError(415, "Se requiere contenido JSON.");
}
export async function throttle(
  req: Request,
  bucket: string,
  limit = 25,
  seconds = 60,
) {
  const ip = req.headers.get("cf-connecting-ip") || "local";
  const key = await sha(
    (config("RATE_LIMIT_SALT") || "alerta-rd") +
      ip +
      bucket +
      Math.floor(Date.now() / (seconds * 1000)),
  );
  const expiry = Date.now() + seconds * 1000;
  const row = await one(
    "INSERT INTO rate_limits (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=rate_limits.count+1 RETURNING count",
    key,
    expiry,
  );
  if ((row?.count || 0) > limit)
    throw new ApiError(
      429,
      "Has realizado varias acciones seguidas. Espera un momento e inténtalo de nuevo.",
    );
  await run(
    "DELETE FROM rate_limits WHERE expires_at < ?",
    Date.now() - 86400000,
  );
}
export async function body(req: Request) {
  const raw = await req.text();
  if (raw.length > 30000)
    throw new ApiError(413, "El contenido es demasiado largo.");
  try {
    return JSON.parse(raw);
  } catch {
    throw new ApiError(400, "La solicitud no es válida.");
  }
}
export function publicProfile(p: Row) {
  return { id: p.id, alias: p.alias, province: p.province, role: p.role };
}
export function response(data: unknown, ctx?: Context, status = 200) {
  const h = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  if (ctx?.cookie) h.set("Set-Cookie", ctx.cookie);
  return new Response(JSON.stringify(data), { status, headers: h });
}
export function fail(err: unknown, ctx?: Context) {
  if (err instanceof ApiError)
    return response({ error: err.message }, ctx, err.status);
  if (err instanceof z.ZodError)
    return response(
      { error: err.issues[0]?.message || "Revisa los campos." },
      ctx,
      400,
    );
  console.error(
    "Alerta RD request failed",
    err instanceof Error ? err.message : "unknown",
  );
  return response(
    {
      error:
        "No pudimos completar la solicitud. Tus cambios no se han confirmado; inténtalo de nuevo.",
    },
    ctx,
    503,
  );
}
export const newSalt = random;
