import { z } from "zod";
import { config, database, one, rows, run, uid } from "./database";
import {
  ApiError,
  type Context,
  textField,
  newSalt,
  passwordHash,
  equal,
  rotate,
  throttle,
  publicProfile,
} from "./security";
import { PROVINCES } from "../content";
export async function authAction(action: string, input: any, ctx: Context) {
  if (action === "register") {
    await throttle(ctx.request, "register", 8, 3600);
    if (ctx.profile.role !== "guest")
      throw new ApiError(409, "Ya tienes una cuenta abierta.");
    const v = z
      .object({
        alias: textField(2, 40),
        email: z.string().email().max(200),
        password: z
          .string()
          .min(12, "Usa una contraseña de al menos 12 caracteres.")
          .max(128),
      })
      .parse(input);
    const email = v.email.toLowerCase().trim();
    if (await one("SELECT id FROM users WHERE email = ?", email))
      throw new ApiError(
        409,
        "No se pudo registrar ese correo. Si ya tienes cuenta, inicia sesión.",
      );
    const salt = newSalt();
    const hash = await passwordHash(v.password, salt);
    const db = database();
    await db.batch([
      db
        .prepare(
          "INSERT INTO users (id,email,password_hash,salt) VALUES (?,?,?,?)",
        )
        .bind(ctx.profile.id, email, hash, salt),
      db
        .prepare("UPDATE profiles SET alias = ?, role = ? WHERE id = ?")
        .bind(v.alias, "user", ctx.profile.id),
    ]);
    await rotate(ctx, ctx.profile.id);
    return {
      message: "Tu cuenta está lista.",
      profile: { ...publicProfile(ctx.profile), alias: v.alias, role: "user" },
    };
  }
  if (action === "login") {
    await throttle(ctx.request, "login", 12, 900);
    const v = z
      .object({
        email: z.string().email().max(200),
        password: z.string().max(128),
      })
      .parse(input);
    const user = await one(
      "SELECT u.*,p.alias,p.role,p.province FROM users u JOIN profiles p ON p.id=u.id WHERE u.email = ?",
      v.email.trim().toLowerCase(),
    );
    const hash = await passwordHash(
      v.password,
      user?.salt || "constant-time-unavailable-user-salt",
    );
    if (!user || !equal(user.password_hash, hash))
      throw new ApiError(401, "Correo o contraseña incorrectos.");
    await rotate(ctx, user.id);
    return { message: "Sesión iniciada.", profile: publicProfile(user) };
  }
  if (action === "logout") {
    await run("DELETE FROM sessions WHERE token_hash = ?", ctx.tokenHash);
    ctx.cookie = "ard_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0";
    return { message: "Sesión cerrada." };
  }
  if (action === "setup") {
    if (ctx.profile.role === "guest")
      throw new ApiError(401, "Crea una cuenta e inicia sesión primero.");
    await throttle(ctx.request, "setup", 5, 3600);
    const token = config("ADMIN_SETUP_TOKEN");
    if (!token || !equal(String(input.token || ""), token))
      throw new ApiError(403, "La clave de configuración no es válida.");
    const db = database();
    // Atomic singleton claim prevents races and forbids a public first-user promotion.
    const claim = await db
      .prepare(
        "INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO NOTHING",
      )
      .bind("admin-owner", ctx.profile.id)
      .run();
    const owner = await one(
      "SELECT value FROM settings WHERE key = ?",
      "admin-owner",
    );
    if (owner?.value !== ctx.profile.id)
      throw new ApiError(409, "El administrador inicial ya fue configurado.");
    await run(
      "UPDATE profiles SET role = ? WHERE id = ?",
      "admin",
      ctx.profile.id,
    );
    return { message: "Administrador configurado." };
  }
  throw new ApiError(404, "Acción desconocida.");
}
export async function profileAction(input: any, ctx: Context) {
  const v = z
    .object({
      alias: textField(2, 40),
      province: z.string().nullable().optional(),
    })
    .parse(input);
  if (v.province && !PROVINCES.includes(v.province))
    throw new ApiError(400, "Selecciona una provincia válida.");
  await run(
    "UPDATE profiles SET alias = ?,province = ? WHERE id = ?",
    v.alias,
    v.province || null,
    ctx.profile.id,
  );
  return { message: "Perfil actualizado." };
}
export async function profileData(ctx: Context) {
  const id = ctx.profile.id;
  const [threads, comments, suggestions, surveys, bookmarks] =
    await Promise.all([
      rows(
        "SELECT id,title,body,status,created_at FROM forum_threads WHERE profile_id = ? ORDER BY created_at DESC",
        id,
      ),
      rows(
        "SELECT id,thread_id,body,status,created_at FROM forum_comments WHERE profile_id = ? ORDER BY created_at DESC",
        id,
      ),
      rows(
        "SELECT id,title,description,problem,solution,category,status,created_at FROM suggestions WHERE profile_id = ? ORDER BY created_at DESC",
        id,
      ),
      rows(
        "SELECT r.id,p.title,r.created_at FROM poll_responses r JOIN polls p ON p.id=r.poll_id WHERE r.profile_id = ?",
        id,
      ),
      rows(
        "SELECT t.id,t.title FROM bookmarks b JOIN forum_threads t ON t.id=b.thread_id WHERE b.profile_id = ? AND t.status = ?",
        id,
        "approved",
      ),
    ]);
  return {
    profile: publicProfile(ctx.profile),
    threads,
    comments,
    suggestions,
    surveys,
    bookmarks,
  };
}
export async function deleteOwn(input: any, ctx: Context) {
  const v = z
    .object({
      type: z.enum(["thread", "comment", "suggestion", "account"]),
      id: z.string().optional(),
    })
    .parse(input);
  if (v.type === "account") {
    if (ctx.profile.role === "admin")
      throw new ApiError(
        409,
        "Transfiere la administración antes de eliminar esta cuenta.",
      );
    const db = database();
    await db.batch([
      db
        .prepare("DELETE FROM forum_threads WHERE profile_id = ?")
        .bind(ctx.profile.id),
      db
        .prepare("DELETE FROM forum_comments WHERE profile_id = ?")
        .bind(ctx.profile.id),
      db
        .prepare("DELETE FROM suggestions WHERE profile_id = ?")
        .bind(ctx.profile.id),
      db.prepare("DELETE FROM profiles WHERE id = ?").bind(ctx.profile.id),
    ]);
    ctx.cookie = "ard_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0";
    return { message: "Tu cuenta y tu participación han sido eliminadas." };
  }
  const table = {
    thread: "forum_threads",
    comment: "forum_comments",
    suggestion: "suggestions",
  }[v.type];
  await run(
    `DELETE FROM ${table} WHERE id = ? AND profile_id = ?`,
    v.id || "",
    ctx.profile.id,
  );
  return { message: "Contenido eliminado." };
}
