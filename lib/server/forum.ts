import { z } from "zod";
import { database, one, rows, run, uid } from "./database";
import { ApiError, type Context, textField, participate } from "./security";
import { CATEGORIES } from "../content";
export async function listThreads(params: URLSearchParams, ctx: Context) {
  const query = (params.get("q") || "").slice(0, 100),
    cat = params.get("category") || "";
  const sort =
    params.get("sort") === "popular"
      ? "likes DESC, t.created_at DESC"
      : "t.featured DESC, t.created_at DESC";
  const data = await rows(
    `SELECT t.*, COALESCE(p.alias,'Participante') as alias, p.province, (SELECT COUNT(*) FROM forum_comments c WHERE c.thread_id=t.id AND c.status='approved') as comments, (SELECT COUNT(*) FROM comment_likes l WHERE l.target_type='thread' AND l.target_id=t.id) as likes FROM forum_threads t LEFT JOIN profiles p ON p.id=t.profile_id WHERE t.status='approved' AND (?='' OR t.category=?) AND (?='' OR t.title LIKE ? OR t.body LIKE ?) ORDER BY ${sort} LIMIT 100`,
    cat,
    cat,
    query,
    "%" + query + "%",
    "%" + query + "%",
  );
  return data.map((t) => ({
    ...t,
    profile_id: undefined,
    own: t.profile_id === ctx.profile.id,
  }));
}
export async function getThread(id: string, ctx: Context) {
  const t = await one(
    "SELECT t.*,COALESCE(p.alias,'Participante') as alias,p.province FROM forum_threads t LEFT JOIN profiles p ON p.id=t.profile_id WHERE t.id=? AND (t.status='approved' OR t.profile_id=?)",
    id,
    ctx.profile.id,
  );
  if (!t) throw new ApiError(404, "No encontramos esta conversación.");
  const comments = await rows(
    "SELECT c.*,COALESCE(p.alias,'Participante') as alias,p.province,(SELECT COUNT(*) FROM comment_likes l WHERE l.target_type='comment' AND l.target_id=c.id) as likes,(SELECT COUNT(*) FROM comment_likes l WHERE l.target_type='comment' AND l.target_id=c.id AND l.profile_id=?) as liked FROM forum_comments c LEFT JOIN profiles p ON p.id=c.profile_id WHERE c.thread_id=? AND (c.status='approved' OR c.profile_id=?) ORDER BY c.created_at ASC LIMIT 500",
    ctx.profile.id,
    id,
    ctx.profile.id,
  );
  const votes = await rows(
    "SELECT vote,COUNT(*) as count FROM debate_votes WHERE thread_id=? GROUP BY vote",
    id,
  );
  const mine = await one(
    "SELECT vote FROM debate_votes WHERE thread_id=? AND profile_id=?",
    id,
    ctx.profile.id,
  );
  const saved = !!(await one(
    "SELECT id FROM bookmarks WHERE thread_id=? AND profile_id=?",
    id,
    ctx.profile.id,
  ));
  const likes = await one(
    "SELECT COUNT(*) as count FROM comment_likes WHERE target_type='thread' AND target_id=?",
    id,
  );
  const liked = !!(await one(
    "SELECT id FROM comment_likes WHERE target_type='thread' AND target_id=? AND profile_id=?",
    id,
    ctx.profile.id,
  ));
  return {
    thread: {
      ...t,
      profile_id: undefined,
      own: t.profile_id === ctx.profile.id,
      likes: likes?.count || 0,
      liked,
      saved,
    },
    comments: comments.map((c) => ({
      ...c,
      profile_id: undefined,
      own: c.profile_id === ctx.profile.id,
    })),
    votes,
    myVote: mine?.vote,
  };
}
export async function forumAction(action: string, input: any, ctx: Context) {
  const id = ctx.profile.id;
  if (action === "thread") {
    const v = z
      .object({
        title: textField(8, 160),
        body: textField(20, 5000),
        category: z.enum(CATEGORIES as [string, ...string[]]),
        website: z.string().max(0).optional(),
      })
      .parse(input);
    const tid = uid();
    await run(
      "INSERT INTO forum_threads (id,profile_id,title,body,category,status) VALUES (?,?,?,?,?,?)",
      tid,
      id,
      v.title,
      v.body,
      v.category,
      "pending",
    );
    await participate(ctx);
    return {
      message: "Tu conversación está pendiente de moderación.",
      id: tid,
    };
  }
  if (action === "comment") {
    const v = z
      .object({
        threadId: z.string(),
        parentId: z.string().nullable().optional(),
        body: textField(3, 3000),
        website: z.string().max(0).optional(),
      })
      .parse(input);
    const t = await one(
      "SELECT id,closed FROM forum_threads WHERE id=? AND status='approved'",
      v.threadId,
    );
    if (!t || t.closed)
      throw new ApiError(409, "Esta conversación no admite nuevas respuestas.");
    if (
      v.parentId &&
      !(await one(
        "SELECT id FROM forum_comments WHERE id=? AND thread_id=? AND status='approved'",
        v.parentId,
        v.threadId,
      ))
    )
      throw new ApiError(400, "La respuesta original no está disponible.");
    const official = ["admin", "moderator"].includes(ctx.profile.role) ? 1 : 0;
    await run(
      "INSERT INTO forum_comments (id,thread_id,profile_id,parent_id,body,status,official) VALUES (?,?,?,?,?,?,?)",
      uid(),
      v.threadId,
      id,
      v.parentId || null,
      v.body,
      official ? "approved" : "pending",
      official,
    );
    await participate(ctx);
    return {
      message: official
        ? "Respuesta oficial publicada."
        : "Tu comentario fue recibido y está pendiente de moderación.",
    };
  }
  if (action === "debate-vote") {
    const v = z
      .object({ threadId: z.string(), vote: z.enum(["yes", "no", "unsure"]) })
      .parse(input);
    const t = await one(
      "SELECT id,closed FROM forum_threads WHERE id=? AND official=1 AND status='approved'",
      v.threadId,
    );
    if (!t || t.closed) throw new ApiError(409, "Este debate no admite votos.");
    await run(
      "INSERT INTO debate_votes (id,thread_id,profile_id,vote) VALUES (?,?,?,?) ON CONFLICT(thread_id,profile_id) DO UPDATE SET vote=excluded.vote",
      uid(),
      v.threadId,
      id,
      v.vote,
    );
    await participate(ctx);
    return { message: "Tu voto fue registrado." };
  }
  if (action === "like" || action === "bookmark" || action === "report") {
    const v = z
      .object({
        targetId: z.string(),
        targetType: z.enum(["thread", "comment"]),
        reason: z
          .enum([
            "Spam",
            "Lenguaje ofensivo",
            "Información personal",
            "Contenido inapropiado",
            "Otro",
          ])
          .optional(),
      })
      .parse(input);
    const table =
      v.targetType === "thread" ? "forum_threads" : "forum_comments";
    if (
      !(await one(
        `SELECT id FROM ${table} WHERE id=? AND status='approved'`,
        v.targetId,
      ))
    )
      throw new ApiError(404, "Este contenido no está disponible.");
    if (action === "bookmark") {
      if (ctx.profile.role === "guest")
        throw new ApiError(401, "Crea una cuenta para guardar debates.");
      if (v.targetType !== "thread")
        throw new ApiError(400, "Solo puedes guardar conversaciones.");
      const old = await one(
        "SELECT id FROM bookmarks WHERE thread_id=? AND profile_id=?",
        v.targetId,
        id,
      );
      if (old) await run("DELETE FROM bookmarks WHERE id=?", old.id);
      else
        await run(
          "INSERT INTO bookmarks (id,thread_id,profile_id) VALUES (?,?,?)",
          uid(),
          v.targetId,
          id,
        );
      return {
        message: old
          ? "Conversación eliminada de guardados."
          : "Conversación guardada.",
      };
    }
    if (action === "report") {
      if (!v.reason) throw new ApiError(400, "Selecciona un motivo.");
      await run(
        "INSERT INTO reports (id,profile_id,target_type,target_id,reason) VALUES (?,?,?,?,?) ON CONFLICT(profile_id,target_type,target_id) DO NOTHING",
        uid(),
        id,
        v.targetType,
        v.targetId,
        v.reason,
      );
      return { message: "El reporte fue enviado al equipo de moderación." };
    }
    const old = await one(
      "SELECT id FROM comment_likes WHERE target_type=? AND target_id=? AND profile_id=?",
      v.targetType,
      v.targetId,
      id,
    );
    if (old) await run("DELETE FROM comment_likes WHERE id=?", old.id);
    else
      await run(
        "INSERT INTO comment_likes (id,profile_id,target_type,target_id) VALUES (?,?,?,?)",
        uid(),
        id,
        v.targetType,
        v.targetId,
      );
    await participate(ctx);
    return { message: old ? "Reacción retirada." : "Reacción registrada." };
  }
  if (action === "edit") {
    const v = z
      .object({
        type: z.enum(["thread", "comment", "suggestion"]),
        id: z.string(),
        title: textField(8, 160).optional(),
        body: textField(3, 5000),
      })
      .parse(input);
    const table = {
      thread: "forum_threads",
      comment: "forum_comments",
      suggestion: "suggestions",
    }[v.type];
    if (
      !(await one(
        `SELECT id FROM ${table} WHERE id=? AND profile_id=?`,
        v.id,
        id,
      ))
    )
      throw new ApiError(403, "Solo puedes editar tu propio contenido.");
    if (v.type === "thread")
      await run(
        "UPDATE forum_threads SET title=?,body=?,status=? WHERE id=? AND profile_id=?",
        v.title,
        v.body,
        "pending",
        v.id,
        id,
      );
    else if (v.type === "comment")
      await run(
        "UPDATE forum_comments SET body=?,status=?,featured=0 WHERE id=? AND profile_id=?",
        v.body,
        "pending",
        v.id,
        id,
      );
    else
      await run(
        "UPDATE suggestions SET title=?,description=?,status=? WHERE id=? AND profile_id=?",
        v.title,
        v.body,
        "nueva",
        v.id,
        id,
      );
    return {
      message: "Cambios guardados. El contenido público volverá a revisión.",
    };
  }
  throw new ApiError(404, "Acción desconocida.");
}
