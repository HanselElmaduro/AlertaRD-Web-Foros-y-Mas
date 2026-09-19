"use client";
import { useState } from "react";
import {
  Plus,
  Download,
  Check,
  X,
  EyeOff,
  Star,
  LockKeyhole,
  UnlockKeyhole,
  ShieldCheck,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { useApp, useResource } from "@/components/providers";
import {
  PageIntro,
  Button,
  ErrorNotice,
  LoadingCards,
  EmptyState,
  SelectField,
  LinkButton,
} from "@/components/ui-kit";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ThreadComposer } from "@/components/forum/forum-page";
import { PollEditor, ChangeEditor, CreatorEditor } from "./editors";
import { dateLabel } from "@/lib/api";
const labels: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
  reported: "Reportado",
  resolved: "Resuelto",
};
export function AdminPage() {
  const { state, loading, error } = useApp();
  return (
    <>
      <PageIntro
        tag="ÁREA DE ADMINISTRACIÓN"
        title="Escuchar. Revisar. Dar seguimiento."
        description="Modera las conversaciones, administra las encuestas y documenta las decisiones del proyecto."
      />
      <section className="page-content container">
        {loading ? (
          <LoadingCards />
        ) : error ? (
          <ErrorNotice message={error} />
        ) : ["admin", "moderator"].includes(state?.profile.role) ? (
          <AdminDashboard />
        ) : (
          <AdminSetup />
        )}
      </section>
    </>
  );
}
function AdminSetup() {
  const { state, act } = useApp();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <div className="auth-card" style={{ marginTop: 0 }}>
      <ShieldCheck size={32} color="#3b6086" />
      <h2 style={{ fontSize: 26, marginTop: 19 }}>Acceso autorizado.</h2>
      <p>
        Esta área requiere una cuenta con permisos de administración o
        moderación.
      </p>
      {state?.profile.role === "guest" ? (
        <>
          <LinkButton href="/cuenta?next=/admin">
            Iniciar sesión o crear cuenta
            <ArrowRight size={16} />
          </LinkButton>
          <p className="form-note spaced">
            El creador puede configurar el primer administrador después de
            iniciar sesión, usando su clave privada.
          </p>
        </>
      ) : (
        <form
          className="form-stack"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            try {
              await act("auth/setup", {
                token: new FormData(e.currentTarget).get("token"),
              });
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="field">
            <label htmlFor="setup-token">
              Clave privada de configuración inicial
            </label>
            <input
              id="setup-token"
              type="password"
              name="token"
              required
              autoComplete="off"
            />
          </div>
          <p className="form-note">
            Solo el creador debe usar la clave entregada con el proyecto. No
            sirve para conceder permisos una vez configurado el administrador
            inicial.
          </p>
          {error && <ErrorNotice message={error} />}
          <Button className="btn" type="submit" disabled={busy}>
            Configurar primer administrador
          </Button>
        </form>
      )}
    </div>
  );
}
function AdminDashboard() {
  const { act } = useApp();
  const { data: d, loading, error, reload } = useResource("admin");
  const [busy, setBusy] = useState(""),
    [filter, setFilter] = useState("Pendientes"),
    [poll, setPoll] = useState<any>(null),
    [change, setChange] = useState<any>(null),
    [thread, setThread] = useState(false),
    [role, setRole] = useState("moderator");
  async function action(path: string, input: any, id = "all") {
    setBusy(id);
    try {
      await act(path, input);
      await reload();
    } catch {
    } finally {
      setBusy("");
    }
  }
  if (loading) return <LoadingCards />;
  if (error) return <ErrorNotice message={error} retry={reload} />;
  if (!d) return null;
  const admin = d.role === "admin";
  const list = d.comments.filter(
    (c: any) =>
      filter === "Todos" ||
      c.status ===
        (
          {
            Pendientes: "pending",
            Aprobados: "approved",
            Reportados: "reported",
            Rechazados: "rejected",
          } as any
        )[filter],
  );
  return (
    <>
      <div className="admin-action-row">
        <span className="badge green-badge">
          <ShieldCheck size={14} />
          {admin ? "Administrador" : "Moderador"}
        </span>
        <div className="button-row">
          <Button variant="outline" onClick={reload}>
            Actualizar
          </Button>
          <Button asChild variant="outline" className="btn">
            <a href="/api/admin/export" download>
              <Download size={16} />
              Exportar resultados CSV
            </a>
          </Button>
        </div>
      </div>
      <Tabs defaultValue="overview" className="admin-tabs">
        <TabsList>
          {[
            ["overview", "Resumen"],
            ["moderation", "Comentarios"],
            ["forum", "Foro"],
            ["reports", "Reportes"],
            ["suggestions", "Propuestas"],
            ...(admin
              ? [
                  ["polls", "Encuestas"],
                  ["changes", "Decisiones"],
                  ["settings", "Configuración"],
                ]
              : []),
          ].map(([key, title]) => (
            <TabsTrigger key={key} value={key}>
              {title}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="overview">
          <div className="kpi-grid">
            {[
              [d.stats.participants, "Participantes"],
              [d.stats.surveys, "Encuestas"],
              [d.stats.comments, "Comentarios públicos"],
              [d.stats.provinces.length, "Provincias"],
            ].map(([n, t]) => (
              <div className="kpi-card" key={t}>
                <span>{t}</span>
                <strong>{n}</strong>
              </div>
            ))}
          </div>
          <div className="card-grid spaced">
            {[
              [
                d.comments.filter((c: any) => c.status === "pending").length,
                "Comentarios por revisar",
              ],
              [
                d.threads.filter((c: any) => c.status === "pending").length,
                "Conversaciones por revisar",
              ],
              [
                d.suggestions.filter((c: any) => c.status === "nueva").length,
                "Nuevas propuestas",
              ],
            ].map(([n, t]) => (
              <div className="card" key={t}>
                <h3>{t}</h3>
                <p style={{ fontSize: 36, fontWeight: 700, marginTop: 15 }}>
                  {n}
                </p>
              </div>
            ))}
          </div>
          <div className="notice spaced">
            Los resultados públicos excluyen contenido pendiente o rechazado. No
            uses datos de pruebas en una investigación real.
          </div>
        </TabsContent>
        <TabsContent value="moderation">
          <div className="admin-action-row">
            <h2 style={{ fontSize: 25 }}>Comentarios de la comunidad</h2>
            <SelectField
              id="moderation-filter"
              value={filter}
              onChange={setFilter}
              options={[
                "Pendientes",
                "Aprobados",
                "Reportados",
                "Rechazados",
                "Todos",
              ]}
            />
          </div>
          {!list.length ? (
            <EmptyState
              title="No hay comentarios en este estado."
              description="Las nuevas participaciones aparecerán aquí para revisión."
            />
          ) : (
            <div className="admin-list">
              {list.map((c: any) => (
                <article className="admin-item" key={c.id}>
                  <div className="admin-item-meta">
                    <strong>{c.alias || "Participante"}</strong>
                    <span className={"badge status-" + c.status}>
                      {labels[c.status]}
                    </span>
                    <span>{dateLabel(c.created_at)}</span>
                  </div>
                  <p>{c.body}</p>
                  <div className="button-row">
                    <Button
                      variant="outline"
                      disabled={busy === c.id}
                      onClick={() =>
                        action(
                          "admin/moderate",
                          { type: "comment", id: c.id, status: "approved" },
                          c.id,
                        )
                      }
                    >
                      <Check size={14} />
                      Aprobar
                    </Button>
                    <Button
                      variant="outline"
                      disabled={busy === c.id}
                      onClick={() =>
                        action(
                          "admin/moderate",
                          { type: "comment", id: c.id, status: "rejected" },
                          c.id,
                        )
                      }
                    >
                      <X size={14} />
                      Rechazar
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={busy === c.id}
                      onClick={() =>
                        action(
                          "admin/moderate",
                          { type: "comment", id: c.id, status: "pending" },
                          c.id,
                        )
                      }
                    >
                      <EyeOff size={14} />
                      Ocultar
                    </Button>
                    {c.status === "approved" && (
                      <Button
                        variant="ghost"
                        onClick={() =>
                          action(
                            "admin/feature-comment",
                            { id: c.id, featured: !c.featured },
                            c.id,
                          )
                        }
                      >
                        <Star size={14} />
                        {c.featured ? "Quitar destacado" : "Destacar opinión"}
                      </Button>
                    )}
                    <a
                      className="text-link"
                      style={{ fontSize: 12 }}
                      href={"/foro/" + c.thread_id}
                    >
                      <MessageSquare size={14} />
                      Responder oficialmente
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="forum">
          <div className="admin-action-row">
            <h2 style={{ fontSize: 25 }}>Conversaciones y debates</h2>
            {admin && (
              <Button className="btn" onClick={() => setThread(true)}>
                <Plus size={15} />
                Nuevo debate oficial
              </Button>
            )}
          </div>
          <div className="admin-list">
            {d.threads.map((t: any) => (
              <article className="admin-item" key={t.id}>
                <div className="admin-item-meta">
                  <span className={"badge status-" + t.status}>
                    {labels[t.status]}
                  </span>
                  {!!t.official && <span>Debate oficial</span>}
                  <span>{t.category}</span>
                </div>
                <h3>{t.title}</h3>
                <p>{t.body}</p>
                <div className="button-row">
                  {t.status !== "approved" && (
                    <Button
                      variant="outline"
                      disabled={busy === t.id}
                      onClick={() =>
                        action(
                          "admin/moderate",
                          { type: "thread", id: t.id, status: "approved" },
                          t.id,
                        )
                      }
                    >
                      <Check size={14} />
                      Aprobar
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    disabled={busy === t.id}
                    onClick={() =>
                      action(
                        "admin/moderate",
                        {
                          type: "thread",
                          id: t.id,
                          status:
                            t.status === "approved" ? "pending" : "rejected",
                        },
                        t.id,
                      )
                    }
                  >
                    <EyeOff size={14} />
                    {t.status === "approved" ? "Ocultar" : "Rechazar"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      action(
                        "admin/thread",
                        { id: t.id, closed: !t.closed },
                        t.id,
                      )
                    }
                  >
                    {t.closed ? (
                      <UnlockKeyhole size={14} />
                    ) : (
                      <LockKeyhole size={14} />
                    )}{" "}
                    {t.closed ? "Reabrir" : "Cerrar hilo"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      action(
                        "admin/thread",
                        { id: t.id, featured: !t.featured },
                        t.id,
                      )
                    }
                  >
                    <Star size={14} />
                    {t.featured ? "Quitar destacado" : "Destacar"}
                  </Button>
                  {t.status === "approved" && (
                    <a
                      href={"/foro/" + t.id}
                      className="text-link"
                      style={{ fontSize: 12 }}
                    >
                      Abrir conversación
                      <ArrowRight size={14} />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="reports">
          <h2 style={{ fontSize: 25, marginBottom: 24 }}>Reportes recibidos</h2>
          {!d.reports.length ? (
            <EmptyState
              title="No hay reportes pendientes."
              description="Los reportes de la comunidad aparecerán aquí."
            />
          ) : (
            d.reports.map((r: any) => (
              <article className="admin-item spaced" key={r.id}>
                <span className="badge">{labels[r.status]}</span>
                <h3>{r.reason}</h3>
                <p>{r.content || "El contenido ya no está disponible."}</p>
                <div className="button-row">
                  <Button
                    disabled={busy === r.id}
                    variant="outline"
                    onClick={() =>
                      action(
                        "admin/moderate",
                        {
                          type: r.target_type,
                          id: r.target_id,
                          status: "reported",
                        },
                        r.id,
                      )
                    }
                  >
                    <EyeOff size={14} />
                    Ocultar contenido
                  </Button>
                  <Button
                    disabled={busy === r.id}
                    variant="outline"
                    onClick={() =>
                      action("admin/resolve-report", { id: r.id }, r.id)
                    }
                  >
                    <Check size={14} />
                    Marcar resuelto
                  </Button>
                </div>
              </article>
            ))
          )}
        </TabsContent>
        <TabsContent value="suggestions">
          <h2 style={{ fontSize: 25, marginBottom: 24 }}>
            Ideas de la comunidad
          </h2>
          {!d.suggestions.length ? (
            <EmptyState
              title="Las próximas ideas aparecerán aquí."
              description="Cada propuesta recibida puede orientar una decisión del proyecto."
            />
          ) : (
            d.suggestions.map((s: any) => (
              <article className="admin-item spaced" key={s.id}>
                <span className="badge">{s.category}</span>
                <h3>{s.title}</h3>
                <p>{s.description}</p>
                <p>
                  <strong>Problema:</strong> {s.problem}
                </p>
                <p>
                  <strong>Cómo funcionaría:</strong> {s.solution}
                </p>
                <div className="button-row">
                  <SelectField
                    id={"suggestion-" + s.id}
                    value={s.status}
                    onChange={(status) =>
                      action("admin/suggestion", { id: s.id, status }, s.id)
                    }
                    options={[
                      "nueva",
                      "revisando",
                      "interesante",
                      "implementable",
                      "archivada",
                    ]}
                  />
                  {admin && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        setChange({
                          concern: s.problem,
                          suggestion: s.description,
                          decision: "",
                          change_made: "",
                          status: "En evaluación",
                        })
                      }
                    >
                      Documentar decisión
                    </Button>
                  )}
                </div>
              </article>
            ))
          )}
        </TabsContent>
        {admin && (
          <>
            <TabsContent value="polls">
              <div className="admin-action-row">
                <h2 style={{ fontSize: 25 }}>Encuestas</h2>
                <Button className="btn" onClick={() => setPoll({})}>
                  <Plus size={15} />
                  Crear encuesta
                </Button>
              </div>
              {d.polls.map((p: any) => (
                <article className="admin-item spaced" key={p.id}>
                  <span className="badge">
                    {p.active ? "Abierta" : "Cerrada"}
                  </span>
                  <h3>{p.title}</h3>
                  <p>
                    {p.questions.length} preguntas · {p.responses} respuestas ·
                    Versión {p.version}
                  </p>
                  <div className="button-row">
                    <Button variant="outline" onClick={() => setPoll(p)}>
                      Editar encuesta
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        action(
                          "admin/poll-toggle",
                          { id: p.id, active: !p.active },
                          p.id,
                        )
                      }
                    >
                      {p.active ? "Cerrar respuestas" : "Abrir respuestas"}
                    </Button>
                  </div>
                </article>
              ))}
            </TabsContent>
            <TabsContent value="changes">
              <div className="admin-action-row">
                <h2 style={{ fontSize: 25 }}>Decisiones del proyecto</h2>
                <Button className="btn" onClick={() => setChange({})}>
                  <Plus size={15} />
                  Registrar decisión
                </Button>
              </div>
              {!d.changes.length ? (
                <EmptyState
                  title="Todavía no hay decisiones documentadas."
                  description="Registra los cambios que provengan de aportaciones reales."
                />
              ) : (
                d.changes.map((c: any) => (
                  <article className="admin-item spaced" key={c.id}>
                    <span className="badge">{c.status}</span>
                    <h3>{c.concern}</h3>
                    <p>{c.decision}</p>
                    <Button
                      variant="outline"
                      className="spaced"
                      onClick={() => setChange(c)}
                    >
                      Actualizar decisión
                    </Button>
                  </article>
                ))
              )}
            </TabsContent>
            <TabsContent value="settings">
              <div className="split-grid" style={{ alignItems: "start" }}>
                <CreatorEditor />
                <form
                  className="card form-stack"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await action(
                      "admin/role",
                      {
                        email: new FormData(e.currentTarget).get("email"),
                        role,
                      },
                      "role",
                    );
                  }}
                >
                  <h3>Permisos del equipo</h3>
                  <p className="form-note">
                    La persona debe haber creado su cuenta. Los permisos se
                    comprueban en el servidor en cada acción.
                  </p>
                  <div className="field">
                    <label htmlFor="role-email">Correo de la cuenta</label>
                    <input id="role-email" name="email" type="email" required />
                  </div>
                  <SelectField
                    id="role-choice"
                    label="Rol"
                    value={role}
                    onChange={setRole}
                    options={["user", "moderator", "admin"]}
                  />
                  <Button
                    className="btn"
                    type="submit"
                    disabled={busy === "role"}
                  >
                    Actualizar permisos
                  </Button>
                </form>
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
      <ThreadComposer
        open={thread}
        onOpenChange={setThread}
        official
        onDone={reload}
      />
      {poll && (
        <PollEditor poll={poll} onClose={() => setPoll(null)} onDone={reload} />
      )}
      {change && (
        <ChangeEditor
          change={change}
          onClose={() => setChange(null)}
          onDone={reload}
        />
      )}
    </>
  );
}
