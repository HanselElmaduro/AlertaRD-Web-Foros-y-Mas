"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Info,
  ClipboardCheck,
} from "lucide-react";
import { useApp } from "@/components/providers";
import {
  PageIntro,
  Button,
  LoadingCards,
  EmptyState,
  ErrorNotice,
  SelectField,
  LinkButton,
} from "@/components/ui-kit";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
function Survey({ poll }: { poll: any }) {
  const { act } = useApp();
  const { watch, setValue } = useForm<Record<string, string>>({
    defaultValues: {},
  });
  const answers = watch();
  const [step, setStep] = useState(0),
    [consent, setConsent] = useState(false),
    [minorPermission, setMinorPermission] = useState(false),
    [busy, setBusy] = useState(false),
    [done, setDone] = useState(!!poll.completed),
    [error, setError] = useState("");
  const questions = poll.questions;
  const pages = Math.ceil(questions.length / 4);
  const current = questions.slice(step * 4, (step + 1) * 4);
  const last = step === pages - 1;
  function next() {
    if (current.some((q: any) => q.required && !answers[q.id]?.trim())) {
      setError("Responde las preguntas obligatorias para continuar.");
      return;
    }
    setError("");
    setStep((s) => s + 1);
    document
      .getElementById("survey-start")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  async function submit() {
    if (questions.some((q: any) => q.required && !answers[q.id]?.trim())) {
      setError("Revisa las preguntas obligatorias.");
      return;
    }
    if (!consent) {
      setError("Acepta el consentimiento antes de enviar.");
      return;
    }
    if (answers.age === "Menos de 18" && !minorPermission) {
      setError("Confirma el acompañamiento de tu madre, padre o tutor.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await act("participation/survey", {
        pollId: poll.id,
        version: poll.version,
        answers,
        consent,
      });
      setDone(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (done)
    return (
      <div className="survey-card completed-survey">
        <CheckCircle2 size={50} />
        <h2>Tu voz ya forma parte.</h2>
        <p>
          Esta encuesta ya está completada. Gracias por contribuir a una
          propuesta que escucha a las personas.
        </p>
        <div className="button-row" style={{ justifyContent: "center" }}>
          <LinkButton href="/resultados">
            Explorar los resultados
            <ArrowRight size={17} />
          </LinkButton>
          <LinkButton href="/foro" variant="outline">
            Continuar en el foro
          </LinkButton>
        </div>
      </div>
    );
  return (
    <form
      className="survey-card"
      id="survey-start"
      onSubmit={(e) => {
        e.preventDefault();
        last ? submit() : next();
      }}
    >
      <div className="survey-top">
        <span className="badge red-badge">ENCUESTA ABIERTA</span>
        <h2 style={{ marginTop: 15 }}>{poll.title}</h2>
        <p>{poll.description}</p>
        <div className="survey-progress">
          <div className="survey-progress-label">
            <span>
              Paso {step + 1} de {pages}
            </span>
            <span>
              {Object.keys(answers).filter((k) => answers[k]).length} de{" "}
              {questions.length} respuestas
            </span>
          </div>
          <Progress
            value={(step / pages) * 100}
            aria-label="Progreso de la encuesta"
            className="h-1.5"
          />
        </div>
      </div>
      <div className="survey-body">
        {current.map((q: any, i: number) => (
          <fieldset className="question-block" key={q.id}>
            <legend>
              <span className="question-number">
                {String(step * 4 + i + 1).padStart(2, "0")}.
              </span>
              {q.title}
              {!q.required && (
                <small>
                  Opcional · No incluyas datos personales o sensibles.
                </small>
              )}
            </legend>
            {q.type === "text" ? (
              <div className="field">
                <textarea
                  maxLength={1500}
                  value={answers[q.id] || ""}
                  onChange={(e) => setValue(q.id, e.target.value)}
                  aria-label={q.title}
                  placeholder="Tu idea puede abrir una nueva posibilidad…"
                />
              </div>
            ) : q.options?.length > 10 ? (
              <SelectField
                id={q.id}
                value={answers[q.id] || ""}
                onChange={(v) => setValue(q.id, v)}
                options={q.options}
                placeholder={q.title}
              />
            ) : (
              <RadioGroup
                value={answers[q.id] || ""}
                onValueChange={(v) => setValue(q.id, v)}
                className="radio-options"
                aria-label={q.title}
              >
                {q.options?.map((option: string, j: number) => (
                  <label
                    className="radio-option"
                    key={option}
                    htmlFor={q.id + "-" + j}
                  >
                    <RadioGroupItem id={q.id + "-" + j} value={option} />
                    <span>{option}</span>
                  </label>
                ))}
              </RadioGroup>
            )}
          </fieldset>
        ))}
        {last && (
          <>
            <label className="consent-box">
              <Checkbox
                checked={consent}
                onCheckedChange={(v) => setConsent(v === true)}
                aria-label="Aceptar consentimiento de investigación"
              />
              <span>
                Entiendo que mis respuestas podrán utilizarse de forma anónima y
                agregada para fines de investigación y desarrollo del proyecto
                Alerta RD.{" "}
                <a
                  href="/privacidad"
                  target="_blank"
                  rel="noreferrer"
                  className="text-link"
                >
                  Leer privacidad
                </a>
              </span>
            </label>
            {answers.age === "Menos de 18" && (
              <label className="consent-box spaced">
                <Checkbox
                  checked={minorPermission}
                  onCheckedChange={(v) => setMinorPermission(v === true)}
                />
                <span>
                  Cuento con conocimiento y acompañamiento de mi madre, padre o
                  tutor para participar.
                </span>
              </label>
            )}
          </>
        )}
        {error && <ErrorNotice message={error} />}
      </div>
      <div className="survey-actions">
        <Button
          type="button"
          variant="outline"
          className="btn"
          disabled={step === 0 || busy}
          onClick={() => {
            setStep((s) => s - 1);
            setError("");
          }}
        >
          <ArrowLeft size={16} />
          Anterior
        </Button>
        <Button
          type="submit"
          className="btn"
          disabled={busy || (last && !consent)}
        >
          {busy
            ? "Guardando respuestas…"
            : last
              ? "Enviar mi opinión"
              : "Continuar"}
          <ArrowRight size={16} />
        </Button>
      </div>
    </form>
  );
}
export function SurveyPage() {
  const { state, loading, error, refresh } = useApp();
  const [selected, setSelected] = useState("");
  const polls = state?.polls || [];
  const poll = polls.find((p: any) => p.id === selected) || polls[0];
  return (
    <>
      <PageIntro
        tag="TU EXPERIENCIA ORIENTA EL DISEÑO"
        title="Queremos escuchar tu perspectiva."
        description="Una encuesta para entender qué sería útil, qué genera dudas y qué necesitamos investigar mejor. Puedes participar como invitado."
      />
      <section className="page-content container">
        {error ? (
          <ErrorNotice message={error} retry={refresh} />
        ) : loading ? (
          <LoadingCards />
        ) : !poll ? (
          <EmptyState
            title="No hay encuestas abiertas por ahora."
            description="Puedes seguir aportando en las conversaciones del foro."
          >
            <LinkButton href="/foro">Explorar el foro</LinkButton>
          </EmptyState>
        ) : (
          <>
            {polls.length > 1 && (
              <div style={{ maxWidth: 420, marginBottom: 23 }}>
                <SelectField
                  id="poll-choice"
                  label="Encuesta"
                  value={poll.title}
                  onChange={(t) =>
                    setSelected(polls.find((p: any) => p.title === t).id)
                  }
                  options={polls.map((p: any) => p.title)}
                />
              </div>
            )}
            <div className="poll-layout">
              <Survey key={poll.id} poll={poll} />
              <aside className="poll-aside">
                <ShieldCheck size={28} color="#335c81" />
                <h3 style={{ marginTop: 18 }}>Tu opinión, con confianza.</h3>
                <p>
                  No pedimos cédula, dirección ni datos médicos. El correo solo
                  es necesario si decides crear una cuenta.
                </p>
                <p>
                  Las respuestas se presentan de forma agregada. Los campos
                  abiertos son opcionales.
                </p>
                <p>
                  Una respuesta por sesión o cuenta. Las encuestas no
                  representan una muestra estadística de toda la población.
                </p>
                <a className="text-link" href="/privacidad">
                  Cómo usamos tus datos
                  <ArrowRight size={15} />
                </a>
              </aside>
            </div>
          </>
        )}
      </section>
    </>
  );
}
