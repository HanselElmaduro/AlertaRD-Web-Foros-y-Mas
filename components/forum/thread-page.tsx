"use client";
import { useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  Flag,
  ThumbsUp,
  Reply,
  MessageSquare,
  CheckCircle2,
  LockKeyhole,
  X,
} from "lucide-react";
import { useApp, useResource } from "@/components/providers";
import { dateLabel } from "@/lib/api";
import {
  Button,
  Modal,
  SelectField,
  LoadingCards,
  ErrorNotice,
  EmptyState,
  Honeypot,
} from "@/components/ui-kit";
import { VoteOptions } from "@/components/features-page";
export function ThreadPage({ id }: { id: string }) {
  const { state, act } = useApp();
  const { data, loading, error, reload } = useResource(
    "threads/" + encodeURIComponent(id),
  );
  const [reply, setReply] = useState<any>(null),
    [report, setReport] = useState<{ id: string; type: string } | null>(null),
    [reason, setReason] = useState("Spam"),
    [busy, setBusy] = useState(""),
    [body, setBody] = useState(""),
    [formError, setFormError] = useState("");
  async function action(path: string, input: any, key: string) {
    setBusy(key);
    try {
      await act(path, input);
      await reload();
      return true;
    } catch {
      return false;
    } finally {
      setBusy("");
    }
  }
  async function comment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    const ok = await action(
      "forum/comment",
      {
        threadId: id,
        parentId: reply?.id || null,
        body,
        website: new FormData(e.currentTarget).get("website") || "",
      },
      "comment",
    );
    if (ok) {
      setBody("");
      setReply(null);
    } else
      setFormError(
        "El comentario no se guardó. Revisa el mensaje y vuelve a intentarlo.",
      );
  }
  if (loading)
    return (
      <div className="container page-content">
        <LoadingCards />
      </div>
    );
  if (error)
    return (
      <div className="container page-content">
        <ErrorNotice message={error} retry={reload} />
      </div>
    );
  if (!data) return null;
  const t = data.thread;
  const total = data.votes.reduce((s: number, v: any) => s + v.count, 0);
  return (
    <section className="thread-detail">
      <a className="text-link" href="/foro">
        <ArrowLeft size={16} />
        Volver al foro
      </a>
      <article className="thread-main" style={{ marginTop: 23 }}>
        <div className="button-row">
          <span className="category-badge">{t.category}</span>
          {!!t.official && (
            <span className="badge red-badge">DEBATE OFICIAL</span>
          )}
          {t.status !== "approved" && (
            <span className="badge">Pendiente de moderación</span>
          )}
          {!!t.closed && (
            <span className="badge">
              <LockKeyhole size={12} />
              Cerrado
            </span>
          )}
        </div>
        <h1>{t.title}</h1>
        <div className="thread-meta">
          <span>{t.official ? "Alerta RD" : t.alias}</span>
          {t.province && <span>{t.province}</span>}
          <span>{dateLabel(t.created_at)}</span>
        </div>
        <p className="thread-body">{t.body}</p>
        {t.status === "approved" && (
          <div className="thread-tools">
            <Button
              variant={t.liked ? "secondary" : "outline"}
              disabled={busy === "like"}
              onClick={() =>
                action(
                  "forum/like",
                  { targetType: "thread", targetId: id },
                  "like",
                )
              }
            >
              <ThumbsUp size={15} />
              {t.likes} · Me interesa
            </Button>
            <Button
              variant={t.saved ? "secondary" : "outline"}
              disabled={busy === "bookmark"}
              onClick={() =>
                action(
                  "forum/bookmark",
                  { targetType: "thread", targetId: id },
                  "bookmark",
                )
              }
            >
              <Bookmark size={15} />
              {t.saved ? "Guardado" : "Guardar debate"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setReport({ type: "thread", id })}
            >
              <Flag size={14} />
              Reportar
            </Button>
          </div>
        )}
        {!!t.official && (
          <div className="debate-voting">
            <h2>¿Qué piensas de esta propuesta?</h2>
            <VoteOptions
              value={data.myVote}
              onVote={(vote) =>
                action("forum/debate-vote", { threadId: id, vote }, "vote")
              }
              disabled={busy === "vote" || !!t.closed}
              labels={["A favor", "En contra", "Tengo dudas"]}
            />
            {total > 0 ? (
              <div className="vote-counts">
                {[
                  ["yes", "A favor"],
                  ["no", "En contra"],
                  ["unsure", "Dudas"],
                ].map(([key, label]) => (
                  <span key={key}>
                    {label}:{" "}
                    {Math.round(
                      ((data.votes.find((v: any) => v.vote === key)?.count ||
                        0) /
                        total) *
                        100,
                    )}
                    %
                  </span>
                ))}
              </div>
            ) : (
              <p className="small-text" style={{ marginTop: 15 }}>
                Sé una de las primeras personas en participar.
              </p>
            )}
            <p className="small-text" style={{ fontSize: 11, marginTop: 12 }}>
              {total} votos · Puedes actualizar tu opinión.
            </p>
          </div>
        )}
      </article>
      <div className="comments-section">
        <h2>
          La conversación{" "}
          <span className="muted" style={{ fontSize: 18, fontWeight: 400 }}>
            ({data.comments.filter((c: any) => c.status === "approved").length})
          </span>
        </h2>
        {!data.comments.length ? (
          <EmptyState
            title="Todavía no hay respuestas."
            description="Sé la primera persona en compartir tu opinión."
          />
        ) : (
          data.comments.map((c: any) => (
            <article
              className={"comment " + (c.parent_id ? "reply" : "")}
              key={c.id}
            >
              <header>
                <span>
                  <strong>{c.official ? "Alerta RD · Equipo" : c.alias}</strong>
                  {c.province && (
                    <span className="small-text" style={{ fontSize: 11 }}>
                      {c.province}
                    </span>
                  )}
                  {c.status !== "approved" && (
                    <span className={"badge status-" + c.status}>
                      En revisión · Solo tú puedes verlo
                    </span>
                  )}
                  {!!c.official && <CheckCircle2 size={15} color="#376690" />}
                </span>
                <time>{dateLabel(c.created_at)}</time>
              </header>
              {c.parent_id && (
                <span className="small-text" style={{ fontSize: 11 }}>
                  Respuesta a{" "}
                  {data.comments.find((x: any) => x.id === c.parent_id)
                    ?.alias || "un comentario anterior"}
                </span>
              )}
              <p>{c.body}</p>
              {c.status === "approved" && (
                <div className="comment-actions">
                  <Button
                    variant={c.liked ? "secondary" : "ghost"}
                    disabled={busy === c.id}
                    onClick={() =>
                      action(
                        "forum/like",
                        { targetType: "comment", targetId: c.id },
                        c.id,
                      )
                    }
                  >
                    <ThumbsUp size={13} />
                    {c.likes}
                  </Button>
                  {!t.closed && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setReply(c);
                        document.getElementById("comment-body")?.focus();
                      }}
                    >
                      <Reply size={14} />
                      Responder
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => setReport({ type: "comment", id: c.id })}
                  >
                    <Flag size={13} />
                    Reportar
                  </Button>
                </div>
              )}
            </article>
          ))
        )}
      </div>
      {!t.closed && t.status === "approved" ? (
        <form className="comment-form" onSubmit={comment}>
          <h3>Tu perspectiva importa.</h3>
          {reply && (
            <div className="reply-context">
              <span>Respondiendo a {reply.alias}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setReply(null)}
                aria-label="Cancelar respuesta"
              >
                <X size={15} />
              </Button>
            </div>
          )}
          <div className="field">
            <label htmlFor="comment-body">
              Comparte un argumento o una pregunta
            </label>
            <textarea
              id="comment-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              minLength={3}
              maxLength={3000}
              required
              placeholder="Me gustaría que…"
              rows={4}
            />
          </div>
          <Honeypot />
          <p className="form-note" style={{ marginTop: 12 }}>
            Participas como {state?.profile.alias || "invitado"}. Tu comentario
            estará sujeto a moderación. No incluyas datos privados.
          </p>
          {formError && <ErrorNotice message={formError} />}
          <Button
            className="btn spaced"
            type="submit"
            disabled={busy === "comment"}
          >
            <MessageSquare size={16} />
            {busy === "comment" ? "Enviando…" : "Enviar comentario"}
          </Button>
        </form>
      ) : (
        !!t.closed && (
          <div className="notice spaced">
            <LockKeyhole size={19} />
            Este debate está cerrado para nuevas participaciones.
          </div>
        )
      )}
      <Modal
        open={!!report}
        onOpenChange={(v) => !v && setReport(null)}
        title="Reportar contenido"
        description="El equipo revisará el reporte. La publicación no se elimina automáticamente."
      >
        <SelectField
          id="report-reason"
          label="Motivo"
          value={reason}
          onChange={setReason}
          options={[
            "Spam",
            "Lenguaje ofensivo",
            "Información personal",
            "Contenido inapropiado",
            "Otro",
          ]}
        />
        <Button
          className="btn"
          disabled={busy === "report"}
          onClick={async () => {
            if (
              await action(
                "forum/report",
                { targetType: report?.type, targetId: report?.id, reason },
                "report",
              )
            )
              setReport(null);
          }}
        >
          Enviar reporte
        </Button>
      </Modal>
    </section>
  );
}
