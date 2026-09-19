"use client";
import { useState } from "react";
import {
  Users,
  ClipboardList,
  MessageSquare,
  MapPin,
  BarChart3,
  Info,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useApp } from "@/components/providers";
import {
  PageIntro,
  SectionHeading,
  EmptyState,
  LinkButton,
  ErrorNotice,
  LoadingCards,
  Button,
} from "@/components/ui-kit";
import { PROVINCES } from "@/lib/content";
const COLORS = [
  "#153d65",
  "#e73b4d",
  "#95aec6",
  "#bbcbdc",
  "#827195",
  "#c9996a",
];
// Province cartogram: schematic geographic arrangement, never exact user locations.
const CARTOGRAM: [string, string, number, number][] = [
  ["Monte Cristi", "MC", 0, 0],
  ["Puerto Plata", "PP", 2, 0],
  ["Espaillat", "ES", 3, 0],
  ["María Trinidad Sánchez", "MT", 4, 0],
  ["Dajabón", "DA", 0, 1],
  ["Valverde", "VA", 1, 1],
  ["Santiago", "ST", 2, 1],
  ["Hermanas Mirabal", "HM", 3, 1],
  ["Duarte", "DU", 4, 1],
  ["Samaná", "SA", 5, 1],
  ["Santiago Rodríguez", "SR", 1, 2],
  ["Elías Piña", "EP", 0, 3],
  ["San Juan", "SJ", 1, 3],
  ["La Vega", "LV", 2, 2],
  ["Monseñor Nouel", "MN", 3, 2],
  ["Sánchez Ramírez", "SM", 4, 2],
  ["Monte Plata", "MP", 5, 2],
  ["Hato Mayor", "HA", 6, 2],
  ["El Seibo", "SE", 7, 2],
  ["La Altagracia", "AL", 8, 3],
  ["Independencia", "IN", 0, 4],
  ["Baoruco", "BA", 1, 4],
  ["Azua", "AZ", 2, 3],
  ["San José de Ocoa", "OC", 3, 3],
  ["San Cristóbal", "SC", 4, 3],
  ["Santo Domingo", "SD", 5, 3],
  ["San Pedro de Macorís", "SP", 6, 3],
  ["La Romana", "LR", 7, 3],
  ["Pedernales", "PE", 0, 5],
  ["Barahona", "BH", 1, 5],
  ["Peravia", "PV", 3, 4],
  ["Distrito Nacional", "DN", 5, 4],
];
function ProvinceMap({ data }: { data: any[] }) {
  const [selected, setSelected] = useState("");
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <>
      <div className="map-visual">
        <svg
          viewBox="0 0 570 380"
          role="group"
          aria-label="Mapa esquemático de participación por provincia"
        >
          <text x="10" y="18" fontSize="11" fill="#758fa8" letterSpacing="1.5">
            REPÚBLICA DOMINICANA
          </text>
          {CARTOGRAM.map(([name, short, x, y]) => {
            const count = data.find((d) => d.name === name)?.count || 0;
            return (
              <g
                key={name}
                role="button"
                tabIndex={0}
                aria-label={`${name}: ${count} participantes`}
                onClick={() => setSelected(name)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelected(name);
                  }
                }}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x={x * 60 + 8}
                  y={y * 52 + 37}
                  width="54"
                  height="44"
                  rx="7"
                  fill={
                    count
                      ? `rgba(29,72,115,${0.3 + (count / max) * 0.7})`
                      : "#dfe8f1"
                  }
                  stroke={selected === name ? "#e23748" : "#fff"}
                  strokeWidth="2"
                />
                <text
                  x={x * 60 + 35}
                  y={y * 52 + 64}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  fill={count ? "#fff" : "#496988"}
                >
                  {short}
                </text>
                <title>
                  {name}: {count}
                </title>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="map-note" aria-live="polite">
        {selected
          ? `${selected}: ${data.find((d) => d.name === selected)?.count || 0} participantes.`
          : "Selecciona una provincia para consultar su participación."}
      </p>
      <p className="map-note">
        Mapa esquemático: no representa límites ni escala geográfica. Solo
        mostramos provincia, nunca ubicación exacta.
      </p>
    </>
  );
}
function ChartEmpty({
  text = "Los resultados aparecerán con las primeras respuestas.",
}: {
  text?: string;
}) {
  return (
    <div className="chart-empty">
      <BarChart3 size={32} />
      <strong>Aún no hay respuestas.</strong>
      <p>{text}</p>
    </div>
  );
}
export function ResultsPage() {
  const { stats: s, loading, error, refresh } = useApp();
  return (
    <>
      <PageIntro
        tag="EVIDENCIA REAL. RESULTADOS ABIERTOS."
        title="La participación, a la vista de todos."
        description="Así toma forma la conversación ciudadana. Estos resultados provienen de las respuestas guardadas en la plataforma."
      />
      <section className="page-content container">
        {error ? (
          <ErrorNotice message={error} retry={refresh} />
        ) : loading || !s ? (
          <LoadingCards />
        ) : (
          <>
            <div className="row-between" style={{ marginBottom: 23 }}>
              <span className="badge green-badge">
                DATOS REALES DE PARTICIPACIÓN
              </span>
              <span className="small-text">
                Actualización cada 15 segundos{" "}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={refresh}
                  aria-label="Actualizar resultados"
                >
                  <RefreshCw size={15} />
                </Button>
              </span>
            </div>
            <div className="kpi-grid">
              {[
                [
                  Users,
                  s.participants,
                  "Participantes",
                  "Sesiones y cuentas con aportes",
                ],
                [
                  ClipboardList,
                  s.surveys,
                  "Encuestas completadas",
                  "Respuestas con consentimiento",
                ],
                [
                  MessageSquare,
                  s.comments,
                  "Comentarios aprobados",
                  "Aportes de la comunidad",
                ],
                [
                  MapPin,
                  s.provinces.length,
                  "Provincias participantes",
                  "Incluye el Distrito Nacional",
                ],
              ].map(([I, n, label, small]: any) => (
                <div className="kpi-card" key={label}>
                  <I size={21} />
                  <span>{label}</span>
                  <strong>{n}</strong>
                  <small>{small}</small>
                </div>
              ))}
            </div>
            <div className="charts-grid">
              <article className="chart-card">
                <h2>Las funciones más elegidas.</h2>
                <p>
                  Selecciones para la configuración ideal · Base:{" "}
                  {s.configurationCount} participantes.
                </p>
                {s.configurationCount ? (
                  <>
                    <div className="chart-area">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={s.features}
                          layout="vertical"
                          margin={{ left: 0, right: 20, top: 8, bottom: 0 }}
                        >
                          <CartesianGrid horizontal={false} stroke="#e8eef5" />
                          <XAxis
                            type="number"
                            allowDecimals={false}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            type="category"
                            dataKey="title"
                            width={135}
                            tick={{ fontSize: 10, fill: "#55718c" }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip cursor={{ fill: "#f2f6fa" }} />
                          <Bar
                            dataKey="selected"
                            name="Participantes"
                            fill="#244d75"
                            radius={[0, 5, 5, 0]}
                            barSize={14}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <ul className="sr-only">
                      {s.features.map((f: any) => (
                        <li key={f.id}>
                          {f.title}: {f.selected}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <ChartEmpty text="Elige tus funciones en “Construye tu Alerta RD ideal” para aportar." />
                )}
              </article>
              <article className="chart-card">
                <h2>¿La utilizarías?</h2>
                <p>
                  Intención de uso · Base: {s.surveyBase} respuestas a la
                  encuesta inicial.
                </p>
                {s.intent.length ? (
                  <>
                    <div className="chart-area">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={s.intent}
                            dataKey="count"
                            nameKey="name"
                            innerRadius={65}
                            outerRadius={100}
                            paddingAngle={4}
                          >
                            {s.intent.map((_: any, i: number) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div
                      className="button-row"
                      style={{ justifyContent: "center" }}
                    >
                      {s.intent.map((d: any, i: number) => (
                        <span key={d.name} className="small-text">
                          <span style={{ color: COLORS[i] }}>●</span> {d.name}:{" "}
                          {d.count} (
                          {Math.round((d.count / s.surveyBase) * 100)}%)
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <ChartEmpty />
                )}
              </article>
            </div>
            <div className="charts-grid">
              <article className="chart-card">
                <h2>Las preocupaciones que debemos escuchar.</h2>
                <p>Preocupación principal · Base: {s.surveyBase} respuestas.</p>
                {s.concerns.length ? (
                  <>
                    <div className="chart-area">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={s.concerns}
                          layout="vertical"
                          margin={{ left: 0, right: 20 }}
                        >
                          <CartesianGrid horizontal={false} stroke="#e9eef4" />
                          <XAxis
                            type="number"
                            allowDecimals={false}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            type="category"
                            dataKey="name"
                            width={128}
                            tick={{ fontSize: 11, fill: "#55718c" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip />
                          <Bar
                            dataKey="count"
                            name="Respuestas"
                            fill="#df3c50"
                            radius={[0, 5, 5, 0]}
                            barSize={18}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <ul className="sr-only">
                      {s.concerns.map((f: any) => (
                        <li key={f.name}>
                          {f.name}: {f.count}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <ChartEmpty />
                )}
              </article>
              <article className="chart-card">
                <h2>Prioridades de las funciones.</h2>
                <p>
                  Votos de importancia por función. Cada una tiene su propia
                  base.
                </p>
                <div className="province-list" style={{ marginTop: 20 }}>
                  {s.features.map((f: any) => {
                    const total = f.yes + f.no + f.unsure;
                    return (
                      <div className="province-line" key={f.id}>
                        <span>{f.title}</span>
                        <strong>
                          {total
                            ? Math.round((f.yes / total) * 100) + "%"
                            : "—"}{" "}
                          <small style={{ fontWeight: 400 }}>
                            ({total} votos)
                          </small>
                        </strong>
                      </div>
                    );
                  })}
                </div>
              </article>
            </div>
            <section className="section">
              <SectionHeading
                eyebrow="UNA CONVERSACIÓN EN TODO EL PAÍS"
                title="¿Desde dónde participamos?"
                description="Conteos por provincia declarada. Puedes participar sin indicar tu provincia."
              />
              <div className="provinces-layout">
                <div>
                  <ProvinceMap data={s.provinces} />
                </div>
                <div
                  className="province-list"
                  aria-label="Participación por provincia"
                >
                  {PROVINCES.map((name) => (
                    <div key={name} className="province-line">
                      <span>{name}</span>
                      <strong>
                        {s.provinces.find((p: any) => p.name === name)?.count ||
                          0}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            <div className="notice">
              <Info size={20} />
              <p>
                Esta es una consulta abierta, no una muestra representativa del
                país. “Participantes” cuenta sesiones y cuentas con aportes, no
                identidades verificadas. Borrar cookies o usar distintas cuentas
                puede producir duplicados. Las respuestas opcionales y las
                preguntas de selección múltiple tienen bases distintas.
              </p>
            </div>
            <section className="section" id="cambios">
              <SectionHeading
                eyebrow="DE LA CONVERSACIÓN A LAS DECISIONES"
                title="Tu opinión puede cambiar Alerta RD."
                description="Aquí documentaremos las inquietudes, decisiones y cambios que surjan de la participación."
              />
              {s.changes.length ? (
                <div className="change-list">
                  {s.changes.map((c: any) => (
                    <article className="change-card" key={c.id}>
                      <span className={"badge status-" + c.status}>
                        {c.status}
                      </span>
                      <h3>{c.concern}</h3>
                      <dl>
                        <dt>La propuesta</dt>
                        <dd>{c.suggestion}</dd>
                        <dt>Nuestra respuesta</dt>
                        <dd>{c.decision}</dd>
                        {c.change_made && (
                          <>
                            <dt>Cambio realizado</dt>
                            <dd>{c.change_made}</dd>
                          </>
                        )}
                      </dl>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Las primeras decisiones están por escribirse."
                  description="Aún no hay cambios documentados a partir del foro. Tu aportación puede iniciar el proceso."
                >
                  <LinkButton href="/participar#propuesta">
                    Proponer una idea
                    <ArrowRight size={16} />
                  </LinkButton>
                </EmptyState>
              )}
            </section>
            <SectionHeading eyebrow="VOCES REALES" title="La sociedad opina." />
            {s.opinions.length ? (
              <div className="opinion-grid">
                {s.opinions.map((o: any, i: number) => (
                  <blockquote className="opinion-card" key={i}>
                    <p>“{o.body}”</p>
                    <footer>
                      — {o.alias}
                      {o.province ? ", " + o.province : ""}
                    </footer>
                  </blockquote>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Todavía estamos recopilando opiniones."
                description="Aquí aparecerán comentarios reales aprobados y destacados por el equipo."
              >
                <LinkButton href="/foro">
                  Sé de los primeros en participar
                </LinkButton>
              </EmptyState>
            )}
          </>
        )}
      </section>
    </>
  );
}
