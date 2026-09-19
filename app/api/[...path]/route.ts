import { ensureCatalog } from "@/lib/server/seed";
import { config, one, rows } from "@/lib/server/database";
import {
  session,
  body,
  checkOrigin,
  throttle,
  response,
  fail,
  publicProfile,
  ApiError,
  type Context,
} from "@/lib/server/security";
import {
  authAction,
  profileAction,
  profileData,
  deleteOwn,
} from "@/lib/server/auth";
import { participationAction } from "@/lib/server/participation";
import { listThreads, getThread, forumAction } from "@/lib/server/forum";
import { adminAction, adminData, exportCSV } from "@/lib/server/admin";
import { results } from "@/lib/server/results";
export const dynamic = "force-dynamic";
async function handle(request: Request) {
  let ctx: Context | undefined;
  try {
    checkOrigin(request);
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/api\//, "");
    await ensureCatalog();
    if (request.method !== "GET") await throttle(request, "write", 50, 60);
    ctx = await session(request);
    if (request.method === "GET") {
      if (path === "state") {
        const [votes, polls, configuration, creator] = await Promise.all([
          rows(
            "SELECT feature_id,vote FROM feature_votes WHERE profile_id=?",
            ctx.profile.id,
          ),
          rows(
            "SELECT p.*, (SELECT COUNT(*) FROM poll_responses r WHERE r.poll_id=p.id AND r.profile_id=?) as completed FROM polls p WHERE p.active=1 ORDER BY p.created_at DESC",
            ctx.profile.id,
          ),
          one(
            "SELECT features FROM configurations WHERE profile_id=?",
            ctx.profile.id,
          ),
          one("SELECT value FROM settings WHERE key='creator'"),
        ]);
        return response(
          {
            profile: publicProfile(ctx.profile),
            votes,
            polls: polls.map((p) => ({
              ...p,
              questions: JSON.parse(p.questions),
            })),
            configuration: configuration
              ? JSON.parse(configuration.features)
              : [],
            creator: creator ? JSON.parse(creator.value) : null,
            demo: true,
            backend:
              config("DATABASE_PROVIDER") === "supabase" ? "supabase" : "d1",
          },
          ctx,
        );
      }
      if (path === "results") return response(await results(), ctx);
      if (path === "threads")
        return response(await listThreads(url.searchParams, ctx), ctx);
      if (path.startsWith("threads/"))
        return response(await getThread(path.slice(8), ctx), ctx);
      if (path === "profile") return response(await profileData(ctx), ctx);
      if (path === "admin") return response(await adminData(ctx), ctx);
      if (path === "admin/export") return await exportCSV(ctx);
      throw new ApiError(404, "No encontramos este recurso.");
    }
    const input = await body(request);
    if (input.website)
      throw new ApiError(400, "No se pudo enviar el formulario.");
    let data;
    if (path.startsWith("auth/"))
      data = await authAction(path.slice(5), input, ctx);
    else if (path === "profile") data = await profileAction(input, ctx);
    else if (path === "profile/delete") data = await deleteOwn(input, ctx);
    else if (path.startsWith("participation/"))
      data = await participationAction(path.slice(14), input, ctx);
    else if (path.startsWith("forum/"))
      data = await forumAction(path.slice(6), input, ctx);
    else if (path.startsWith("admin/"))
      data = await adminAction(path.slice(6), input, ctx);
    else throw new ApiError(404, "No encontramos esta acción.");
    return response(data, ctx);
  } catch (error) {
    return fail(error, ctx);
  }
}
export const GET = handle;
export const POST = handle;
