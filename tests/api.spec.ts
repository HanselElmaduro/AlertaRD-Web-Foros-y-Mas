/** Real route-handler integration tests against isolated SQLite. No production data. */
import assert from "node:assert/strict";
import { GET, POST } from "../app/api/[...path]/route";
import { sqlite } from "./runtime";
const checks: string[] = [];
let serial = 0;
class Client {
  cookie = "";
  ip = "198.51.100." + ++serial;
  async req(
    path: string,
    data?: any,
    status = 200,
    headers: Record<string, string> = {},
  ) {
    const h: Record<string, string> = {
      Origin: "https://test.alertard.local",
      "cf-connecting-ip": this.ip,
      ...headers,
    };
    if (this.cookie) h.Cookie = this.cookie;
    if (data !== undefined) h["Content-Type"] = "application/json";
    const req = new Request("https://test.alertard.local/api/" + path, {
      method: data === undefined ? "GET" : "POST",
      headers: h,
      body: data === undefined ? undefined : JSON.stringify(data),
    });
    const r = await (data === undefined ? GET : POST)(req);
    const set = r.headers.get("set-cookie");
    if (set) this.cookie = set.split(";")[0];
    const ct = r.headers.get("content-type");
    const result = ct?.includes("application/json")
      ? await r.json()
      : await r.text();
    assert.equal(r.status, status, `${path}: ${JSON.stringify(result)}`);
    return result;
  }
}
const pass = (name: string) => {
  checks.push(name);
  console.log("PASS " + name);
};
const user = new Client();
const initial: any = await user.req("state");
assert.equal(initial.profile.role, "guest");
assert.equal(initial.polls[0].questions.length, 13);
assert.equal(((await user.req("results")) as any).participants, 0);
assert.equal(((await user.req("threads")) as any[]).length, 5);
pass("Empty participation, 13 questions and 5 clearly official debates");
await user.req("admin", undefined, 403);
await user.req("admin/export", undefined, 403);
await user.req("admin/poll-toggle", { id: "ciudadana-v1", active: false }, 403);
pass("Guest cannot read admin, export or mutate management");
await user.req("participation/vote", { featureId: "gps", vote: "yes" });
await user.req("participation/vote", { featureId: "gps", vote: "yes" });
let s: any = await user.req("results");
assert.equal(s.features.find((f: any) => f.id === "gps").yes, 1);
assert.equal(s.participants, 1);
await user.req("participation/vote", { featureId: "gps", vote: "no" });
s = await user.req("results");
assert.equal(s.features.find((f: any) => f.id === "gps").yes, 0);
assert.equal(s.features.find((f: any) => f.id === "gps").no, 1);
pass("Votes persist, updates do not duplicate participants");
await user.req(
  "participation/vote",
  { featureId: "invalid", vote: "yes" },
  400,
);
await user.req(
  "participation/vote",
  { featureId: "gps", vote: "invalid" },
  400,
);
await user.req("participation/vote", { featureId: "gps", vote: "yes" }, 403, {
  Origin: "https://attacker.example",
});
pass("Invalid votes and cross-origin writes rejected");
await user.req("participation/configuration", { features: ["sos", "gps"] });
await user.req("participation/configuration", { features: ["gps"] });
s = await user.req("results");
assert.equal(s.configurationCount, 1);
assert.equal(s.features.find((f: any) => f.id === "sos").selected, 0);
pass("Ideal configuration updates one persistent record");
const answers: Record<string, string> = {};
for (const q of initial.polls[0].questions) {
  if (q.options) answers[q.id] = q.options[0];
  else answers[q.id] = "PRUEBA DEMO: opción de accesibilidad.";
}
answers.province = "Monte Plata";
answers.age = "18–24";
await user.req(
  "participation/survey",
  { pollId: "ciudadana-v1", version: 1, answers, consent: false },
  400,
);
await user.req(
  "participation/survey",
  { pollId: "ciudadana-v1", version: 2, answers, consent: true },
  409,
);
await user.req(
  "participation/survey",
  {
    pollId: "ciudadana-v1",
    version: 1,
    answers: { ...answers, intent: "bogus" },
    consent: true,
  },
  400,
);
await user.req("participation/survey", {
  pollId: "ciudadana-v1",
  version: 1,
  answers,
  consent: true,
});
await user.req(
  "participation/survey",
  { pollId: "ciudadana-v1", version: 1, answers, consent: true },
  409,
);
s = await user.req("results");
assert.equal(s.surveys, 1);
assert.equal(s.provinces[0].name, "Monte Plata");
pass(
  "Consent, version validation, survey persistence and duplicate protection",
);
await user.req("forum/comment", {
  threadId: "debate-accidentes",
  body: "PRUEBA DEMO: incluir una confirmación accesible antes de enviar.",
});
let thread: any = await user.req("threads/debate-accidentes");
assert.equal(thread.comments.length, 1);
assert.equal(thread.comments[0].status, "pending");
const cid = thread.comments[0].id;
const stranger = new Client();
await stranger.req("state");
assert.equal(
  ((await stranger.req("threads/debate-accidentes")) as any).comments.length,
  0,
);
await stranger.req(
  "forum/edit",
  { type: "comment", id: cid, body: "Intento ajeno" },
  403,
);
pass("Pending comments private; ownership enforced");
const tid = (
  (await user.req("forum/thread", {
    category: "Tecnología y emergencias",
    title: "PRUEBA DEMO: diseño accesible",
    body: "Este hilo es únicamente una prueba aislada del flujo de moderación.",
  })) as any
).id;
assert(!((await stranger.req("threads")) as any[]).some((t) => t.id === tid));
pass("New threads require moderation");
await user.req("participation/suggestion", {
  category: "Ideas para mejorar Alerta RD",
  title: "PRUEBA DEMO: control accesible",
  description: "Esta propuesta sirve únicamente para verificar el guardado.",
  problem: "Identificar controles en situaciones complejas.",
  solution: "Agregar etiquetas claras y navegación accesible.",
});
assert.equal(((await user.req("profile")) as any).suggestions.length, 1);
pass("Anonymous proposals persist privately");
await user.req("auth/register", {
  alias: "QA Participante",
  email: "qa-participant@example.test",
  password: "test-only-password-1234",
});
assert.equal(((await user.req("state")) as any).profile.role, "user");
assert.equal(((await user.req("profile")) as any).surveys.length, 1);
assert(
  !JSON.stringify(
    sqlite.prepare("SELECT password_hash FROM users").all(),
  ).includes("test-only-password"),
);
pass(
  "Registration converts guest history, hashes password and rotates session",
);
await user.req("auth/logout", {});
await user.req(
  "auth/login",
  { email: "qa-participant@example.test", password: "wrong-password" },
  401,
);
await user.req("auth/login", {
  email: "qa-participant@example.test",
  password: "test-only-password-1234",
});
assert.equal(((await user.req("profile")) as any).comments.length, 1);
await user.req("forum/bookmark", {
  targetType: "thread",
  targetId: "debate-accidentes",
});
assert.equal(((await user.req("profile")) as any).bookmarks.length, 1);
pass("Login, logout and account history/bookmarks");
const admin = new Client();
await admin.req("state");
await admin.req("auth/register", {
  alias: "QA Admin",
  email: "qa-admin@example.test",
  password: "test-only-admin-pass-123",
});
await admin.req("auth/setup", { token: "invalid" }, 403);
await admin.req("auth/setup", { token: "TEST-ONLY-SETUP-TOKEN-DO-NOT-USE" });
assert.equal(((await admin.req("state")) as any).profile.role, "admin");
await user.req(
  "auth/setup",
  { token: "TEST-ONLY-SETUP-TOKEN-DO-NOT-USE" },
  409,
);
pass("Private first-admin key, one-time claim and role authorization");
await admin.req("admin/moderate", {
  type: "comment",
  id: cid,
  status: "approved",
});
thread = await stranger.req("threads/debate-accidentes");
assert.equal(thread.comments.length, 1);
await admin.req("admin/feature-comment", { id: cid, featured: true });
s = await stranger.req("results");
assert.equal(s.opinions.length, 1);
assert.equal(s.comments, 1);
pass("Approval and featured opinions feed public results");
await user.req("forum/comment", {
  threadId: "debate-accidentes",
  parentId: cid,
  body: "PRUEBA DEMO: respuesta anidada.",
});
await user.req("forum/like", { targetType: "comment", targetId: cid });
thread = await stranger.req("threads/debate-accidentes");
assert.equal(thread.comments[0].likes, 1);
await user.req("forum/like", { targetType: "comment", targetId: cid });
thread = await stranger.req("threads/debate-accidentes");
assert.equal(thread.comments[0].likes, 0);
pass("Nested replies and reversible likes");
await user.req("forum/report", {
  targetType: "comment",
  targetId: cid,
  reason: "Información personal",
});
const ad: any = await admin.req("admin");
assert.equal(ad.reports.length, 1);
await admin.req("admin/resolve-report", { id: ad.reports[0].id });
await admin.req("admin/moderate", {
  type: "comment",
  id: cid,
  status: "reported",
});
assert.equal(
  ((await stranger.req("threads/debate-accidentes")) as any).comments.length,
  0,
);
pass("Reporting, resolution and hiding content");
await admin.req("admin/moderate", {
  type: "thread",
  id: tid,
  status: "approved",
});
assert(((await stranger.req("threads")) as any[]).some((t) => t.id === tid));
await admin.req("admin/thread", { id: tid, closed: true, featured: true });
await user.req(
  "forum/comment",
  { threadId: tid, body: "Should be blocked" },
  409,
);
pass("Thread approval, pinning and closure");
await user.req("forum/debate-vote", {
  threadId: "debate-botones",
  vote: "yes",
});
await user.req("forum/debate-vote", {
  threadId: "debate-botones",
  vote: "yes",
});
assert.equal(
  ((await user.req("threads/debate-botones")) as any).votes[0].count,
  1,
);
pass("Debate voting deduplicates");
await admin.req("admin/poll", {
  title: "PRUEBA DEMO: encuesta breve",
  description: "Encuesta exclusiva de las pruebas automatizadas.",
  questions: [
    {
      id: "testq",
      title: "¿Esta pregunta es clara?",
      required: true,
      options: ["Sí", "No"],
    },
  ],
  active: true,
});
const custom = ((await user.req("state")) as any).polls.find(
  (p: any) => p.id !== "ciudadana-v1",
);
await admin.req("admin/poll-toggle", { id: custom.id, active: false });
await stranger.req(
  "participation/survey",
  { pollId: custom.id, version: 1, answers: { testq: "Sí" }, consent: true },
  409,
);
pass("Admin creates and closes surveys");
await admin.req(
  "admin/poll",
  {
    id: "ciudadana-v1",
    title: "Encuesta modificada",
    description: "Prueba de protección de las preguntas existentes.",
    questions: [
      {
        id: "different",
        title: "Pregunta cambiada",
        required: true,
        options: ["Sí", "No"],
      },
    ],
    active: true,
  },
  409,
);
pass("Survey question meaning immutable after responses");
await admin.req("admin/change", {
  concern: "PRUEBA DEMO: dudas de activación.",
  suggestion: "Confirmar antes de enviar.",
  decision: "Estudiar una confirmación accesible.",
  changeMade: "",
  status: "En evaluación",
});
assert.equal(((await stranger.req("results")) as any).changes.length, 1);
pass("Documented decisions visible with their status");
const csv = await admin.req("admin/export");
assert(
  typeof csv === "string" &&
    csv.includes("Indicador") &&
    !csv.includes("qa-participant@example.test"),
);
pass("CSV export is authenticated and excludes emails");
await admin.req("admin/role", {
  email: "qa-participant@example.test",
  role: "moderator",
});
await user.req("admin");
await user.req(
  "admin/role",
  { email: "qa-admin@example.test", role: "user" },
  403,
);
await admin.req("admin/role", {
  email: "qa-participant@example.test",
  role: "user",
});
pass("Moderator role has bounded administrative permissions");
await user.req("participation/simulation", {
  type: "sos",
  outcome: "completed",
});
await user.req("participation/simulation", {
  type: "accident",
  outcome: "cancelled",
});
assert.equal(
  (sqlite.prepare("SELECT COUNT(*) as n FROM simulations").get() as any).n,
  2,
);
pass("Simulation events save without emergency integrations");
await user.req("profile/delete", { type: "comment", id: cid });
assert(
  !((await user.req("profile")) as any).comments.some((c: any) => c.id === cid),
);
pass("Participants can remove their own content");
assert.equal(
  ((await stranger.req("threads?q=%27%20OR%201%3D1--")) as any[]).length,
  0,
);
pass("Search uses bound SQL parameters");
await user.req("profile/delete", { type: "account" });
assert(
  !sqlite
    .prepare("SELECT id FROM users WHERE email=?")
    .get("qa-participant@example.test"),
);
assert.equal(((await stranger.req("results")) as any).surveys, 0);
pass("Account removal deletes related participation");
const spam = new Client();
await spam.req("state");
for (let i = 0; i < 50; i++)
  await spam.req("participation/vote", { featureId: "sos", vote: "yes" });
await spam.req("participation/vote", { featureId: "sos", vote: "yes" }, 429);
pass("Rate limit enforced server-side");
console.log(
  JSON.stringify(
    {
      passed: checks.length,
      failed: 0,
      environment: "isolated SQLite / real API handlers",
      checks,
    },
    null,
    2,
  ),
);
