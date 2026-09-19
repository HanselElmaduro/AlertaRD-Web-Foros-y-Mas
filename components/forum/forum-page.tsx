"use client";
import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  MessageSquare,
  ThumbsUp,
  Pin,
  LockKeyhole,
  ArrowUpRight,
} from "lucide-react";
import { CATEGORIES } from "@/lib/content";
import { dateLabel } from "@/lib/api";
import { useApp, useResource } from "@/components/providers";
import {
  PageIntro,
  Button,
  Modal,
  SelectField,
  Honeypot,
  EmptyState,
  LoadingCards,
  ErrorNotice,
  LinkButton,
} from "@/components/ui-kit";
export function ThreadComposer({
  open,
  onOpenChange,
  official = false,
  onDone,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  official?: boolean;
  onDone?: () => void;
}) {
  const { act } = useApp();
  const [category, setCategory] = useState(CATEGORIES[0]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      await act(official ? "admin/official-thread" : "forum/thread", {
        category,
        title: data.get("title"),
        body: data.get("body"),
        website: data.get("website") || "",
      });
      onOpenChange(false);
      onDone?.();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={official ? "Abrir un debate oficial" : "Inicia una conversación"}
      description="Una buena pregunta puede abrir nuevos caminos. Evita incluir datos personales o detalles de emergencias en curso."
    >
      <form onSubmit={submit} className="form-stack">
        <SelectField
          id="thread-category"
          label="Categoría"
          value={category}
          onChange={setCategory}
          options={CATEGORIES}
        />
        <div className="field">
          <label htmlFor="thread-title">Título</label>
          <input
            id="thread-title"
            name="title"
            minLength={8}
            maxLength={160}
            required
            placeholder="¿Sobre qué te gustaría conversar?"
          />
        </div>
        <div className="field">
          <label htmlFor="thread-body">Tu idea o pregunta</label>
          <textarea
            id="thread-body"
            name="body"
            minLength={20}
            maxLength={5000}
            required
            placeholder="Cuéntanos tu perspectiva y qué te gustaría conocer de los demás…"
            rows={5}
          />
        </div>
        <Honeypot />
        <p className="form-note">
          {official
            ? "Se publicará como debate oficial de Alerta RD."
            : "Tu conversación será visible después de la revisión del equipo."}
        </p>
        {error && <ErrorNotice message={error} />}
        <Button className="btn" disabled={busy} type="submit">
          {busy
            ? "Enviando…"
            : official
              ? "Publicar debate"
              : "Enviar a revisión"}
          <ArrowUpRight size={17} />
        </Button>
      </form>
    </Modal>
  );
}
export function ForumPage() {
  const [q, setQ] = useState(""),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState(""),
    [sort, setSort] = useState("Recientes"),
    [compose, setCompose] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setQuery(q), 250);
    return () => clearTimeout(t);
  }, [q]);
  const { data, loading, error, reload } = useResource<any[]>(
    "threads?" +
      new URLSearchParams({
        q: query,
        category,
        sort: sort === "Populares" ? "popular" : "recent",
      }),
  );
  return (
    <>
      <PageIntro
        tag="CONVERSACIONES QUE CONSTRUYEN"
        title="El futuro de Alerta RD se conversa aquí."
        description="Comparte tu perspectiva, plantea una pregunta o encuentra un debate que te importe. No necesitas una cuenta para comenzar."
      />
      <section className="page-content container forum-layout">
        <aside className="forum-sidebar">
          <h3>Explorar categorías</h3>
          <div className="category-filter">
            {["Todas las conversaciones", ...CATEGORIES].map((c, i) => (
              <button
                key={c}
                className={category === (i ? c : "") ? "active" : ""}
                onClick={() => setCategory(i ? c : "")}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="notice">
            <strong>Un espacio para escucharnos.</strong>Debatimos ideas con
            respeto. No compartas datos sensibles ni reportes emergencias reales
            aquí.
            <a
              className="text-link"
              href="/terminos"
              style={{ fontSize: 12, marginTop: 10 }}
            >
              Reglas de participación
            </a>
          </div>
        </aside>
        <div>
          <div className="forum-toolbar">
            <div className="search-input">
              <Search size={18} />
              <input
                aria-label="Buscar conversaciones"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar una conversación…"
              />
            </div>
            <SelectField
              id="forum-sort"
              value={sort}
              onChange={setSort}
              options={["Recientes", "Populares"]}
              placeholder="Ordenar conversaciones"
            />
            <Button className="btn" onClick={() => setCompose(true)}>
              <Plus size={16} />
              Nuevo tema
            </Button>
          </div>
          {loading ? (
            <LoadingCards />
          ) : error ? (
            <ErrorNotice message={error} retry={reload} />
          ) : !data?.length ? (
            <EmptyState
              title="La próxima conversación puede empezar contigo."
              description={
                q || category
                  ? "No encontramos temas con estos filtros. Prueba otra búsqueda o plantea una nueva pregunta."
                  : "Comparte una idea o pregunta con la comunidad."
              }
            >
              <Button className="btn" onClick={() => setCompose(true)}>
                Iniciar una conversación
              </Button>
            </EmptyState>
          ) : (
            <div className="thread-list">
              {data.map((t) => (
                <a className="thread-row" key={t.id} href={"/foro/" + t.id}>
                  <div className="row-between">
                    <span className="category-badge">{t.category}</span>
                    <span className="button-row" style={{ gap: 8 }}>
                      {t.official === 1 && (
                        <span className="badge red-badge">DEBATE OFICIAL</span>
                      )}
                      {!!t.featured && <Pin size={14} color="#6b829b" />}
                      {!!t.closed && <LockKeyhole size={14} color="#6b829b" />}
                    </span>
                  </div>
                  <h2>{t.title}</h2>
                  <p>{t.body}</p>
                  <div className="thread-meta">
                    <span>{t.official ? "Alerta RD" : t.alias}</span>
                    <span>{dateLabel(t.created_at)}</span>
                    <span>
                      <MessageSquare size={13} />
                      {t.comments} respuestas
                    </span>
                    <span>
                      <ThumbsUp size={13} />
                      {t.likes}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
      <ThreadComposer
        open={compose}
        onOpenChange={setCompose}
        onDone={reload}
      />
    </>
  );
}
