"use client";
import { useState } from "react";
import {
  MessageSquare,
  ClipboardList,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  UserRound,
} from "lucide-react";
import {
  PageIntro,
  SectionHeading,
  SelectField,
  Button,
  LinkButton,
  Honeypot,
  ErrorNotice,
} from "@/components/ui-kit";
import { CATEGORIES } from "@/lib/content";
import { useApp } from "@/components/providers";
export function ParticipatePage() {
  const { state, act } = useApp();
  const [category, setCategory] = useState(CATEGORIES[6]),
    [busy, setBusy] = useState(false),
    [done, setDone] = useState(false),
    [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      await act("participation/suggestion", {
        category,
        ...Object.fromEntries(form.entries()),
      });
      setDone(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageIntro
        tag="HAZ QUE TU VOZ CUENTE"
        title="El futuro también se construye contigo."
        description="Elige cómo aportar. Una pregunta, un voto o una propuesta pueden ayudarnos a tomar mejores decisiones."
      />
      <section className="page-content container">
        <div className="participate-grid">
          {[
            [
              MessageSquare,
              "Comparte tu perspectiva.",
              "Conversa sobre tecnología, privacidad y emergencias.",
              "/foro",
              "Participar en el foro",
            ],
            [
              ClipboardList,
              "Responde la encuesta.",
              "Ayúdanos a entender qué necesitas y qué te preocupa.",
              "/encuestas",
              "Dar mi opinión",
            ],
            [
              Lightbulb,
              "Define las prioridades.",
              "Vota las funciones y construye tu Alerta RD ideal.",
              "/funciones",
              "Elegir mis funciones",
            ],
          ].map(([I, title, desc, href, cta]: any) => (
            <article className="participate-option" key={href}>
              <I size={28} />
              <h2 style={{ fontSize: 24 }}>{title}</h2>
              <p>{desc}</p>
              <LinkButton href={href} variant="outline">
                {cta}
                <ArrowRight size={15} />
              </LinkButton>
            </article>
          ))}
        </div>
        <div className="notice spaced">
          <UserRound size={20} />
          <p>
            Puedes participar como invitado. Con una{" "}
            <a
              href="/cuenta"
              className="text-link"
              style={{ minHeight: 0, fontSize: 14 }}
            >
              cuenta
            </a>{" "}
            puedes recuperar tu historial y guardar debates desde otros
            dispositivos. No pedimos tu nombre completo.
          </p>
        </div>
      </section>
      <section className="section muted-section" id="propuesta">
        <div className="container proposal-layout">
          <div>
            <p className="eyebrow">LAS BUENAS IDEAS MERECEN UN ESPACIO</p>
            <h2>Propón una idea.</h2>
            <p>
              No necesitas tener todos los detalles resueltos. Cuéntanos qué
              problema ves y cómo imaginas una solución.
            </p>
            <p>
              Las propuestas se reciben de forma privada y se revisan por el
              equipo. Puedes seguir su estado en tu perfil.
            </p>
            <p>
              No incluyas información sensible ni datos de terceros. Este
              formulario no atiende emergencias.
            </p>
            <div className="spaced">
              <a className="text-link" href="/perfil">
                Ver mis propuestas
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
          {done ? (
            <div className="proposal-form completed-survey">
              <CheckCircle2 size={45} />
              <h2>Tu idea ya tiene un lugar.</h2>
              <p>
                El equipo podrá revisarla y clasificarla. Gracias por contribuir
                a Alerta RD.
              </p>
              <Button className="btn" onClick={() => setDone(false)}>
                Proponer otra idea
              </Button>
            </div>
          ) : (
            <form className="proposal-form form-stack" onSubmit={submit}>
              <SelectField
                id="proposal-category"
                label="Categoría"
                value={category}
                onChange={setCategory}
                options={CATEGORIES}
              />
              <div className="field">
                <label htmlFor="idea-title">Título de tu idea</label>
                <input
                  id="idea-title"
                  name="title"
                  required
                  minLength={8}
                  maxLength={150}
                  placeholder="Una idea que podría mejorar Alerta RD…"
                />
              </div>
              <div className="field">
                <label htmlFor="idea-description">Descripción</label>
                <textarea
                  id="idea-description"
                  name="description"
                  required
                  minLength={15}
                  maxLength={2500}
                  placeholder="Cuéntanos en qué consiste."
                />
              </div>
              <div className="field">
                <label htmlFor="idea-problem">¿Qué problema resolvería?</label>
                <textarea
                  id="idea-problem"
                  name="problem"
                  required
                  minLength={10}
                  maxLength={2000}
                  placeholder="Piensa en una necesidad concreta."
                />
              </div>
              <div className="field">
                <label htmlFor="idea-solution">
                  ¿Cómo imaginas que funcionaría?
                </label>
                <textarea
                  id="idea-solution"
                  name="solution"
                  required
                  minLength={10}
                  maxLength={2000}
                  placeholder="Describe el recorrido o la solución que propones."
                />
              </div>
              <Honeypot />
              {error && <ErrorNotice message={error} />}
              <Button className="btn" disabled={busy} type="submit">
                {busy ? "Enviando propuesta…" : "Enviar propuesta"}
                <ArrowRight size={17} />
              </Button>
              <p className="form-note">
                Se guardará bajo tu alias:{" "}
                {state?.profile.alias || "Participante"}.{" "}
                <a href="/privacidad">Privacidad y uso de datos</a>.
              </p>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
