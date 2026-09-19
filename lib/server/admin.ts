import { z } from "zod";
import { database, rows, one, run, uid } from "./database";
import { ApiError, type Context, requireRole, textField } from "./security";
import { results } from "./results";
import { CATEGORIES } from "../content";
const question = z
  .object({
    id: z.string().regex(/^[a-zA-Z0-9_-]{1,60}$/),
    title: textField(4, 300),
    type: z.enum(["text", "choice"]).optional(),
    required: z.boolean(),
    options: z.array(textField(1, 200)).min(2).max(40).optional(),
  })
  .refine(
    (q) => q.type === "text" || !!q.options,
    "Las preguntas de selección necesitan opciones.",
  );
export async function adminData(ctx: Context) {
  requireRole(ctx);
  const [
    stats,
    comments,
    threads,
    suggestions,
    reports,
    polls,
    changes,
    settings,
  ] = await Promise.all([
    results(),
    rows(
      "SELECT c.*,p.alias FROM forum_comments c LEFT JOIN profiles p ON p.id=c.profile_id ORDER BY c.created_at DESC LIMIT 200",
    ),
    rows(
      "SELECT t.*,p.alias FROM forum_threads t LEFT JOIN profiles p ON p.id=t.profile_id ORDER BY t.created_at DESC LIMIT 200",
    ),
    rows("SELECT * FROM suggestions ORDER BY created_at DESC LIMIT 200"),
    rows(
      "SELECT r.*,CASE WHEN r.target_type='comment' THEN (SELECT body FROM forum_comments WHERE id=r.target_id) ELSE (SELECT title FROM forum_threads WHERE id=r.target_id) END as content FROM reports r ORDER BY r.created_at DESC LIMIT 200",
    ),
    rows(
      "SELECT p.*,(SELECT COUNT(*) FROM poll_responses r WHERE r.poll_id=p.id) as responses FROM polls p ORDER BY p.created_at DESC",
    ),
    rows("SELECT * FROM project_changes ORDER BY created_at DESC"),
    rows("SELECT key,value FROM settings WHERE key IN ('creator','contact')"),
  ]);
  return {
    stats,
    comments,
    threads,
    suggestions,
    reports,
    polls: polls.map((p) => ({ ...p, questions: JSON.parse(p.questions) })),
    changes,
    settings,
    role: ctx.profile.role,
  };
}
async function log(ctx: Context, id: string, action: string) {
  await run(
    "INSERT INTO moderation_logs (id,actor_id,target_id,action) VALUES (?,?,?,?)",
    uid(),
    ctx.profile.id,
    id,
    action,
  );
}
export async function adminAction(action: string, input: any, ctx: Context) {
  requireRole(ctx);
  if (action === "moderate") {
    const v = z
      .object({
        type: z.enum(["thread", "comment"]),
        id: z.string(),
        status: z.enum(["pending", "approved", "rejected", "reported"]),
      })
      .parse(input);
    const table = v.type === "thread" ? "forum_threads" : "forum_comments";
    await run(`UPDATE ${table} SET status=? WHERE id=?`, v.status, v.id);
    await log(ctx, v.id, v.type + ":" + v.status);
    return { message: "Moderación actualizada." };
  }
  if (action === "thread") {
    const v = z
      .object({
        id: z.string(),
        closed: z.boolean().optional(),
        featured: z.boolean().optional(),
      })
      .parse(input);
    if (v.closed !== undefined)
      await run(
        "UPDATE forum_threads SET closed=? WHERE id=?",
        v.closed ? 1 : 0,
        v.id,
      );
    if (v.featured !== undefined)
      await run(
        "UPDATE forum_threads SET featured=? WHERE id=?",
        v.featured ? 1 : 0,
        v.id,
      );
    await log(ctx, v.id, "thread settings");
    return { message: "Conversación actualizada." };
  }
  if (action === "feature-comment") {
    const v = z.object({ id: z.string(), featured: z.boolean() }).parse(input);
    await run(
      "UPDATE forum_comments SET featured=? WHERE id=? AND status='approved'",
      v.featured ? 1 : 0,
      v.id,
    );
    await log(ctx, v.id, "featured opinion");
    return { message: "Opinión destacada actualizada." };
  }
  if (action === "resolve-report") {
    const v = z.object({ id: z.string() }).parse(input);
    await run("UPDATE reports SET status=? WHERE id=?", "resolved", v.id);
    await log(ctx, v.id, "report resolved");
    return { message: "Reporte resuelto." };
  }
  if (action === "suggestion") {
    const v = z
      .object({
        id: z.string(),
        status: z.enum([
          "nueva",
          "revisando",
          "interesante",
          "implementable",
          "archivada",
        ]),
      })
      .parse(input);
    await run("UPDATE suggestions SET status=? WHERE id=?", v.status, v.id);
    await log(ctx, v.id, v.status);
    return { message: "Propuesta actualizada." };
  }
  requireRole(ctx, true);
  if (action === "official-thread") {
    const v = z
      .object({
        title: textField(8, 160),
        body: textField(20, 5000),
        category: z.enum(CATEGORIES as [string, ...string[]]),
      })
      .parse(input);
    const id = uid();
    await run(
      "INSERT INTO forum_threads (id,profile_id,title,body,category,status,official,featured) VALUES (?,?,?,?,?,?,1,1)",
      id,
      ctx.profile.id,
      v.title,
      v.body,
      v.category,
      "approved",
    );
    await log(ctx, id, "official thread");
    return { message: "Debate oficial publicado." };
  }
  if (action === "poll") {
    const v = z
      .object({
        id: z.string().optional(),
        title: textField(8, 150),
        description: textField(10, 600),
        questions: z.array(question).min(1).max(25),
        active: z.boolean(),
      })
      .parse(input);
    if (new Set(v.questions.map((q) => q.id)).size !== v.questions.length)
      throw new ApiError(400, "Cada pregunta debe ser única.");
    const old = v.id ? await one("SELECT * FROM polls WHERE id=?", v.id) : null;
    if (old) {
      const count = await one(
        "SELECT COUNT(*) as n FROM poll_responses WHERE poll_id=?",
        v.id,
      );
      if (count?.n && old.questions !== JSON.stringify(v.questions))
        throw new ApiError(
          409,
          "Esta encuesta ya tiene respuestas. Crea otra para cambiar las preguntas y conservar la validez de los resultados.",
        );
      await run(
        "UPDATE polls SET title=?,description=?,questions=?,active=?,version=version+1 WHERE id=?",
        v.title,
        v.description,
        JSON.stringify(v.questions),
        v.active ? 1 : 0,
        v.id,
      );
    } else
      await run(
        "INSERT INTO polls (id,title,description,questions,active) VALUES (?,?,?,?,?)",
        uid(),
        v.title,
        v.description,
        JSON.stringify(v.questions),
        v.active ? 1 : 0,
      );
    await log(ctx, v.id || "new poll", "poll edited");
    return { message: "Encuesta guardada." };
  }
  if (action === "poll-toggle") {
    const v = z.object({ id: z.string(), active: z.boolean() }).parse(input);
    await run("UPDATE polls SET active=? WHERE id=?", v.active ? 1 : 0, v.id);
    return { message: v.active ? "Encuesta abierta." : "Encuesta cerrada." };
  }
  if (action === "change") {
    const v = z
      .object({
        id: z.string().optional(),
        concern: textField(5, 1200),
        suggestion: textField(5, 1200),
        decision: textField(5, 1500),
        changeMade: z.string().max(1500),
        status: z.enum([
          "En evaluación",
          "En diseño",
          "Implementado",
          "No viable actualmente",
        ]),
      })
      .parse(input);
    const id = v.id || uid();
    await run(
      "INSERT INTO project_changes (id,concern,suggestion,decision,change_made,status) VALUES (?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET concern=excluded.concern,suggestion=excluded.suggestion,decision=excluded.decision,change_made=excluded.change_made,status=excluded.status",
      id,
      v.concern,
      v.suggestion,
      v.decision,
      v.changeMade,
      v.status,
    );
    await log(ctx, id, "project change");
    return { message: "Decisión publicada." };
  }
  if (action === "creator") {
    const v = z
      .object({
        name: textField(2, 80),
        role: textField(3, 120),
        bio: textField(10, 2000),
        github: z.string().url().or(z.literal("")),
        linkedin: z.string().url().or(z.literal("")),
        email: z.string().email().or(z.literal("")),
      })
      .parse(input);
    if ([v.github, v.linkedin].some((s) => s && !s.startsWith("https://")))
      throw new ApiError(400, "Usa enlaces HTTPS.");
    await run(
      "INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
      "creator",
      JSON.stringify(v),
    );
    return { message: "Información del proyecto actualizada." };
  }
  if (action === "role") {
    const v = z
      .object({
        email: z.string().email(),
        role: z.enum(["user", "moderator", "admin"]),
      })
      .parse(input);
    const user = await one(
      "SELECT id FROM users WHERE email=?",
      v.email.toLowerCase().trim(),
    );
    if (!user)
      throw new ApiError(404, "Esa persona aún no ha creado una cuenta.");
    if (user.id === ctx.profile.id)
      throw new ApiError(400, "No puedes cambiar tu propio rol.");
    await run("UPDATE profiles SET role=? WHERE id=?", v.role, user.id);
    await log(ctx, user.id, "role " + v.role);
    return { message: "Permisos actualizados." };
  }
  throw new ApiError(404, "Acción desconocida.");
}
export async function exportCSV(ctx: Context) {
  requireRole(ctx);
  const data = await results();
  const cells: unknown[][] = [
    ["Indicador", "Opción", "Cantidad", "Base"],
    ["Participación", "Participantes", data.participants, ""],
    ["Encuestas", "Respuestas", data.surveys, ""],
    ["Comentarios", "Aprobados", data.comments, ""],
    ...data.provinces.map((p) => [
      "Provincia",
      p.name,
      p.count,
      data.participants,
    ]),
    ...data.features.flatMap((f) => [
      ["Función: " + f.title, "Importante", f.yes, f.yes + f.no + f.unsure],
      ["Función: " + f.title, "No necesaria", f.no, f.yes + f.no + f.unsure],
      ["Función: " + f.title, "Tengo dudas", f.unsure, f.yes + f.no + f.unsure],
      ["Configuración ideal", f.title, f.selected, data.configurationCount],
    ]),
    ...data.concerns.map((c) => [
      "Preocupación",
      c.name,
      c.count,
      data.surveyBase,
    ]),
    ...data.intent.map((c) => ["Intención", c.name, c.count, data.surveyBase]),
  ];
  const pollRows = await rows(
    "SELECT r.poll_id,p.title,r.answers FROM poll_responses r JOIN polls p ON p.id=r.poll_id",
  );
  const aggregate: Record<string, number> = {};
  for (const r of pollRows) {
    const a = JSON.parse(r.answers);
    for (const [question, answer] of Object.entries(a)) {
      if (["idea"].includes(question)) continue;
      const key = JSON.stringify([r.title, question, answer]);
      aggregate[key] = (aggregate[key] || 0) + 1;
    }
  }
  for (const [key, count] of Object.entries(aggregate)) {
    const [poll, q, a] = JSON.parse(key);
    cells.push([poll + " / " + q, a, count, ""]);
  }
  const cell = (x: unknown) => {
    let s = String(x ?? "");
    if (/^[=+@\-\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
  };
  return new Response(
    "\ufeff" + cells.map((r) => r.map(cell).join(",")).join("\r\n"),
    {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="Alerta-RD-resultados.csv"',
        "Cache-Control": "no-store",
      },
    },
  );
}
