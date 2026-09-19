"use client";
import { useState, useEffect } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  ArrowRight,
  Info,
} from "lucide-react";
import { FEATURES } from "@/lib/content";
import { useApp } from "./providers";
import {
  PageIntro,
  Icon,
  Button,
  Modal,
  SectionHeading,
  ErrorNotice,
} from "./ui-kit";
import { Checkbox } from "@/components/ui/checkbox";
export function VoteOptions({
  value,
  onVote,
  disabled = false,
  labels = ["Importante", "No necesaria", "Tengo dudas"],
}: {
  value?: string;
  onVote: (v: string) => void;
  disabled?: boolean;
  labels?: string[];
}) {
  return (
    <div className="vote-options">
      {[
        ["yes", ThumbsUp],
        ["no", ThumbsDown],
        ["unsure", HelpCircle],
      ].map(([v, I]: any, i) => (
        <Button
          key={v}
          variant="outline"
          type="button"
          disabled={disabled}
          aria-pressed={value === v}
          className={value === v ? "selected" : ""}
          onClick={() => onVote(v)}
        >
          <I size={13} />
          {labels[i]}
        </Button>
      ))}
    </div>
  );
}
export function FeaturesPage() {
  const { state, stats, act, error, refresh } = useApp();
  const [detail, setDetail] = useState<(typeof FEATURES)[number] | null>(null),
    [busy, setBusy] = useState(""),
    [selected, setSelected] = useState<string[]>([]);
  useEffect(() => {
    if (state?.configuration) setSelected(state.configuration);
  }, [state?.configuration?.join(",")]);
  const vote = async (id: string, v: string) => {
    setBusy(id);
    try {
      await act("participation/vote", { featureId: id, vote: v });
    } catch {
    } finally {
      setBusy("");
    }
  };
  const submit = async () => {
    setBusy("config");
    try {
      await act("participation/configuration", { features: selected });
    } catch {
    } finally {
      setBusy("");
    }
  };
  return (
    <>
      <PageIntro
        tag="PRIORIZAMOS CONTIGO"
        title="¿Qué funciones debería tener Alerta RD?"
        description="Explora las posibilidades, plantea tus dudas y vota. Todas estas funciones son propuestas en investigación."
      />
      <section className="page-content container">
        {error && <ErrorNotice message={error} retry={refresh} />}
        <div className="features-grid">
          {FEATURES.map((f) => {
            const r = stats?.features?.find((x: any) => x.id === f.id);
            const total = r ? r.yes + r.no + r.unsure : 0;
            const mine = state?.votes?.find(
              (x: any) => x.feature_id === f.id,
            )?.vote;
            return (
              <article className="feature-card" id={f.id} key={f.id}>
                <div className="feature-icon">
                  <Icon name={f.icon} />
                </div>
                <h2>{f.title}</h2>
                <p className="description">{f.short}</p>
                <Button
                  className="more-button"
                  variant="link"
                  onClick={() => setDetail(f)}
                >
                  Explorar la propuesta
                  <ArrowRight size={13} />
                </Button>
                <div className="feature-votes">
                  <VoteOptions
                    value={mine}
                    onVote={(v) => vote(f.id, v)}
                    disabled={busy === f.id || !state}
                  />
                  {total > 0 ? (
                    <>
                      <div className="vote-bar" aria-hidden="true">
                        <span style={{ width: (r.yes / total) * 100 + "%" }} />
                        <span style={{ width: (r.no / total) * 100 + "%" }} />
                        <span
                          style={{ width: (r.unsure / total) * 100 + "%" }}
                        />
                      </div>
                      <div className="vote-counts">
                        <span>
                          {Math.round((r.yes / total) * 100)}% importante
                        </span>
                        <span>
                          {total}{" "}
                          {total === 1 ? "participante" : "participantes"}
                        </span>
                      </div>
                      <p
                        className="small-text"
                        style={{ fontSize: 11, marginTop: 6 }}
                      >
                        No necesaria: {Math.round((r.no / total) * 100)}% ·
                        Dudas: {Math.round((r.unsure / total) * 100)}%
                      </p>
                    </>
                  ) : (
                    <p
                      className="small-text"
                      style={{ fontSize: 11, marginTop: 14 }}
                    >
                      Sé una de las primeras personas en participar.
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
        <div className="section" id="ideal">
          <div className="builder">
            <div>
              <p className="eyebrow">TÚ ELIGES LAS PRIORIDADES</p>
              <h2>
                Construye tu
                <br />
                Alerta RD ideal.
              </h2>
              <p>
                Selecciona las funciones que incluirías. Puedes actualizar tu
                configuración; contaremos una sola por participante.
              </p>
              <p>Tu opinión contribuirá al proceso de diseño de Alerta RD.</p>
            </div>
            <div className="builder-options">
              {FEATURES.map((f) => (
                <label key={f.id} className="checkbox-option">
                  <Checkbox
                    checked={selected.includes(f.id)}
                    onCheckedChange={(v) =>
                      setSelected((s) =>
                        v ? [...s, f.id] : s.filter((x) => x !== f.id),
                      )
                    }
                  />
                  <span>{f.title}</span>
                </label>
              ))}
              <Button
                className="btn"
                onClick={submit}
                disabled={busy === "config" || !selected.length || !state}
              >
                {busy === "config" ? "Guardando…" : "Enviar mi configuración"}
                <ArrowRight size={17} />
              </Button>
            </div>
          </div>
        </div>
        <div className="notice">
          <Info size={20} />
          <p>
            Los votos expresan prioridades; no garantizan que una función se
            incorpore. Las capacidades reales dependerán de pruebas, permisos,
            privacidad y acuerdos autorizados.
          </p>
        </div>
      </section>
      <Modal
        open={!!detail}
        onOpenChange={(v) => !v && setDetail(null)}
        title={detail?.title || "Función propuesta"}
        description="Una posibilidad que estamos investigando."
      >
        {detail && (
          <>
            <img
              className="feature-modal-image"
              src={"/images/" + detail.image + ".webp"}
              alt={"Visual conceptual: " + detail.title}
            />
            <p className="small-text">
              Imagen conceptual. No representa una función disponible ni una
              integración activa.
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.85, color: "#526c85" }}>
              {detail.detail}
            </p>
            <a className="text-link" href="/foro">
              Debatir esta función
              <ArrowRight size={17} />
            </a>
          </>
        )}
      </Modal>
    </>
  );
}
