"use client";
import { useState, useEffect, useRef } from "react";
import {
  Siren,
  MapPin,
  Users,
  HeartPulse,
  Play,
  RotateCcw,
  Check,
  Car,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import {
  PageIntro,
  Button,
  SectionHeading,
  LinkButton,
} from "@/components/ui-kit";
import { api } from "@/lib/api";
import { toast } from "sonner";
const steps = [
  "Alerta iniciada",
  "Obteniendo ubicación ficticia",
  "Consultando información de ejemplo",
  "Preparando una notificación simulada",
  "Contactos notificados · Simulación",
  "Seguimiento iniciado · Simulación",
];
export function SimulatorPage() {
  const [elapsed, setElapsed] = useState(-1),
    [running, setRunning] = useState(false),
    [accident, setAccident] = useState<
      "idle" | "running" | "cancelled" | "help" | "timeout"
    >("idle"),
    [count, setCount] = useState(15);
  const startAt = useRef(0);
  const endAt = useRef(0);
  async function record(type: string, outcome: string) {
    try {
      await api("participation/simulation", { type, outcome });
    } catch {
      toast.error(
        "La simulación terminó, pero no se pudo guardar su registro.",
      );
    }
  }
  function start() {
    startAt.current = Date.now();
    setElapsed(0);
    setRunning(true);
  }
  function reset() {
    setRunning(false);
    setElapsed(-1);
  }
  useEffect(() => {
    if (!running) return;
    const i = setInterval(() => {
      const t = Math.min(10, Math.floor((Date.now() - startAt.current) / 1000));
      setElapsed(t);
      if (t >= 10) {
        setRunning(false);
        record("sos", "completed");
      }
    }, 200);
    return () => clearInterval(i);
  }, [running]);
  useEffect(() => {
    if (accident !== "running") return;
    const i = setInterval(() => {
      const t = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000));
      setCount(t);
      if (t === 0) {
        setAccident("timeout");
        record("accident", "timeout");
      }
    }, 200);
    return () => clearInterval(i);
  }, [accident]);
  function accidentStart() {
    setCount(15);
    endAt.current = Date.now() + 15000;
    setAccident("running");
  }
  function accidentEnd(outcome: "cancelled" | "help") {
    setAccident(outcome);
    record("accident", outcome);
  }
  return (
    <>
      <PageIntro
        tag="EXPLORA UNA EXPERIENCIA CONCEPTUAL"
        title="Imagina cómo podría funcionar."
        description="Prueba un recorrido seguro. Todos los eventos, ubicaciones y notificaciones de esta página son ficticios."
      />
      <section className="page-content container">
        <div className="simulation-banner">
          <ShieldCheck size={19} />
          SIMULACIÓN — NO GENERA UNA EMERGENCIA REAL
        </div>
        <div className="simulator-layout">
          <div className="simulator-stage">
            <span className="demo-tag">DEMOSTRACIÓN</span>
            <div className="phone">
              <div className="phone-notch" />
              <div className="phone-status">
                <span>9:41</span>
                <span>●●● ▰</span>
              </div>
              <div className="phone-brand">
                ALERTA <span>RD</span>
              </div>
              <p className="phone-subtitle">Tecnología que protege vidas.</p>
              <button
                className={"phone-sos " + (running ? "running" : "")}
                onClick={start}
                disabled={running}
                aria-label="Activar simulación SOS"
              >
                {elapsed >= 10 ? <Check size={47} /> : "SOS"}
              </button>
              <p className="phone-small" aria-live="polite">
                {elapsed < 0
                  ? "Toca para explorar una simulación."
                  : steps[Math.min(5, Math.floor(elapsed / 2))]}
              </p>
              <div className="phone-tiles">
                <div>
                  <MapPin size={18} />
                  <span>GPS ficticio</span>
                </div>
                <div>
                  <Users size={18} />
                  <span>Contactos demo</span>
                </div>
                <div>
                  <HeartPulse size={18} />
                  <span>Info. de ejemplo</span>
                </div>
              </div>
              <div className="phone-home" />
            </div>
          </div>
          <div className="simulator-info">
            <p className="eyebrow">DEL BOTÓN AL SEGUIMIENTO</p>
            <h2>Un recorrido de 10 segundos.</h2>
            <p>
              Una secuencia ilustrativa para conversar sobre el diseño. Los
              tiempos no representan mediciones ni promesas de respuesta real.
            </p>
            <ol className="simulation-timeline" aria-live="polite">
              {steps.map((s, i) => (
                <li key={s} className={elapsed >= i * 2 ? "done" : ""}>
                  <span className="timeline-dot">
                    {elapsed >= i * 2 ? (
                      <Check size={13} />
                    ) : (
                      <span style={{ fontSize: 10 }}>{i + 1}</span>
                    )}
                  </span>
                  <time>00:{String(i * 2).padStart(2, "0")}</time>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
            <div className="simulator-controls">
              <Button className="btn" disabled={running} onClick={start}>
                <Play size={17} />
                {running ? "Simulando…" : "Activar simulación"}
              </Button>
              <Button className="btn" variant="outline" onClick={reset}>
                <RotateCcw size={16} />
                Reiniciar
              </Button>
            </div>
            <p className="small-text" style={{ fontSize: 12 }}>
              No se accede a tu ubicación, micrófono ni contactos.
            </p>
          </div>
        </div>
      </section>
      <section className="section muted-section">
        <div className="container accident-layout">
          <div>
            <p className="eyebrow">SENSORES Y DECISIONES</p>
            <h2>¿Y si el teléfono detectara un posible accidente?</h2>
            <p>
              El concepto incluye una cuenta regresiva para preguntar si estás
              bien. Un impacto detectado puede ser una falsa alarma; por eso, el
              control de la persona es una prioridad.
            </p>
            <p>
              Si no se selecciona nada, se muestra cómo podría comenzar un
              protocolo previamente configurado. En esta demostración no se
              activa ninguna acción real.
            </p>
          </div>
          <div className="accident-card">
            <Car size={34} />
            {accident === "idle" ? (
              <>
                <h3>Prueba el escenario.</h3>
                <p>Se simulará un impacto y una cuenta regresiva.</p>
                <Button className="btn" onClick={accidentStart}>
                  Simular posible accidente
                </Button>
              </>
            ) : accident === "running" ? (
              <>
                <h3>Impacto simulado. ¿Estás bien?</h3>
                <div
                  className="countdown"
                  role="timer"
                  aria-label={count + " segundos"}
                >
                  {count}
                  <span style={{ fontSize: 19, marginLeft: 5 }}>s</span>
                </div>
                <div className="button-row">
                  <Button
                    variant="secondary"
                    className="btn"
                    onClick={() => accidentEnd("cancelled")}
                  >
                    Estoy bien
                  </Button>
                  <Button className="btn" onClick={() => accidentEnd("help")}>
                    Necesito ayuda
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h3>
                  {accident === "cancelled"
                    ? "Simulación cancelada."
                    : accident === "help"
                      ? "Solicitud simulada."
                      : "Cuenta regresiva terminada."}
                </h3>
                <p role="status">
                  {accident === "cancelled"
                    ? "Confirmaste que estás bien. No se ejecutó ninguna acción."
                    : "En un escenario futuro, aquí podría iniciarse un protocolo previamente configurado por el usuario. No se envió ninguna alerta real."}
                </p>
                <Button
                  variant="secondary"
                  className="btn"
                  onClick={() => setAccident("idle")}
                >
                  <RotateCcw size={16} />
                  Probar de nuevo
                </Button>
              </>
            )}
          </div>
        </div>
      </section>
      <section className="section container">
        <SectionHeading
          eyebrow="AHORA, TU PERSPECTIVA"
          title="¿Qué cambiarías de esta experiencia?"
          description="Los simuladores sirven para abrir preguntas. Comparte lo que te resultó útil y lo que te genera dudas."
        />
        <div className="button-row">
          <LinkButton href="/foro/debate-accidentes">
            Debatir la detección de accidentes
          </LinkButton>
          <LinkButton href="/funciones" variant="outline">
            Votar por las funciones
          </LinkButton>
        </div>
      </section>
    </>
  );
}
