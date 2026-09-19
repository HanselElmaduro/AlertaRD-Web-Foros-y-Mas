import { z } from "zod";
import { FEATURES, CATEGORIES, PROVINCES, CONSENT_VERSION } from "../content";
import { database, one, run, uid } from "./database";
import { ApiError, type Context, textField, participate } from "./security";
export async function participationAction(
  action: string,
  input: any,
  ctx: Context,
) {
  const id = ctx.profile.id;
  if (action === "vote") {
    const v = z
      .object({ featureId: z.string(), vote: z.enum(["yes", "no", "unsure"]) })
      .parse(input);
    if (!FEATURES.some((f) => f.id === v.featureId))
      throw new ApiError(400, "La función no existe.");
    await run(
      "INSERT INTO feature_votes (id,profile_id,feature_id,vote) VALUES (?,?,?,?) ON CONFLICT(profile_id,feature_id) DO UPDATE SET vote=excluded.vote",
      uid(),
      id,
      v.featureId,
      v.vote,
    );
  } else if (action === "configuration") {
    const v = z
      .object({
        features: z
          .array(z.string())
          .min(1, "Selecciona al menos una función.")
          .max(9),
      })
      .parse(input);
    if (v.features.some((f) => !FEATURES.some((x) => x.id === f)))
      throw new ApiError(400, "Revisa las funciones seleccionadas.");
    await run(
      "INSERT INTO configurations (profile_id,features) VALUES (?,?) ON CONFLICT(profile_id) DO UPDATE SET features=excluded.features",
      id,
      JSON.stringify([...new Set(v.features)]),
    );
  } else if (action === "survey") {
    const v = z
      .object({
        pollId: z.string(),
        version: z.number(),
        answers: z.record(z.string().max(1500)),
        consent: z.literal(true, {
          errorMap: () => ({
            message: "Debes aceptar el consentimiento para enviar la encuesta.",
          }),
        }),
      })
      .parse(input);
    const poll = await one(
      "SELECT * FROM polls WHERE id = ? AND active = 1",
      v.pollId,
    );
    if (!poll) throw new ApiError(409, "Esta encuesta ya no está abierta.");
    if (poll.version !== v.version)
      throw new ApiError(
        409,
        "La encuesta cambió. Recarga la página antes de enviarla.",
      );
    const questions = JSON.parse(poll.questions) as {
      id: string;
      required: boolean;
      options?: string[];
    }[];
    for (const q of questions) {
      const value = v.answers[q.id]?.trim();
      if (q.required && !value)
        throw new ApiError(400, "Responde todas las preguntas obligatorias.");
      if (value && q.options && !q.options.includes(value))
        throw new ApiError(400, "Una respuesta no coincide con las opciones.");
    }
    if (Object.keys(v.answers).some((k) => !questions.some((q) => q.id === k)))
      throw new ApiError(
        400,
        "Hay respuestas que no pertenecen a esta encuesta.",
      );
    const db = database();
    const inserted = await db
      .prepare(
        "INSERT INTO poll_responses (id,poll_id,profile_id,answers,consent_version,poll_version) VALUES (?,?,?,?,?,?) ON CONFLICT(poll_id,profile_id) DO NOTHING",
      )
      .bind(
        uid(),
        v.pollId,
        id,
        JSON.stringify(v.answers),
        CONSENT_VERSION,
        v.version,
      )
      .run();
    if (!inserted.meta.changes)
      throw new ApiError(409, "Ya participaste en esta encuesta.");
    if (PROVINCES.includes(v.answers.province))
      await run(
        "UPDATE profiles SET province = ? WHERE id = ?",
        v.answers.province,
        id,
      );
  } else if (action === "suggestion") {
    const v = z
      .object({
        category: z.enum(CATEGORIES as [string, ...string[]]),
        title: textField(8, 150),
        description: textField(15, 2500),
        problem: textField(10, 2000),
        solution: textField(10, 2000),
        website: z.string().max(0).optional(),
      })
      .parse(input);
    await run(
      "INSERT INTO suggestions (id,profile_id,category,title,description,problem,solution) VALUES (?,?,?,?,?,?,?)",
      uid(),
      id,
      v.category,
      v.title,
      v.description,
      v.problem,
      v.solution,
    );
  } else if (action === "simulation") {
    const v = z
      .object({
        type: z.enum(["sos", "accident"]),
        outcome: z.enum(["completed", "cancelled", "help", "timeout"]),
      })
      .parse(input);
    await run(
      "INSERT INTO simulations (id,profile_id,type,outcome) VALUES (?,?,?,?)",
      uid(),
      id,
      v.type,
      v.outcome,
    );
    return { message: "Simulación finalizada." };
  } else throw new ApiError(404, "Acción desconocida.");
  await participate(ctx);
  return {
    message:
      action === "suggestion"
        ? "Tu propuesta fue enviada."
        : action === "survey"
          ? "Gracias por participar. Tus respuestas fueron guardadas."
          : "Tu opinión fue registrada.",
  };
}
