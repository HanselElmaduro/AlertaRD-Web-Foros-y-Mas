"use client";
import {
  ArrowRight,
  ArrowUpRight,
  Play,
  MessageSquare,
  ChartNoAxesCombined,
  ClipboardList,
  ShieldCheck,
  Lightbulb,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { useApp } from "./providers";
import {
  LinkButton,
  SectionHeading,
  TextLink,
  Icon,
  ErrorNotice,
} from "./ui-kit";
import { FEATURES, OFFICIAL_DEBATES } from "@/lib/content";
export function HomePage() {
  const { stats, error, refresh } = useApp();
  return (
    <>
      <section className="hero">
        <div className="hero-image">
          <img
            src="/images/hero.webp"
            alt="Representación conceptual de una persona consultando Alerta RD en una ciudad dominicana de noche"
            fetchPriority="high"
          />
        </div>
        <div className="hero-shade" />
        <div className="container hero-inner">
          <div className="hero-copy">
            <div className="hero-eyebrow">
              <span />
              TECNOLOGÍA CON PROPÓSITO. TU VOZ CUENTA.
            </div>
            <h1>
              Pedir ayuda podría
              <br />
              ser más simple.
              <br />
              <em>Hagámoslo juntos.</em>
            </h1>
            <p>
              ¿Y si pedir ayuda durante una emergencia requiriera menos
              acciones? Conoce Alerta RD y ayúdanos a diseñar el futuro de las
              emergencias en República Dominicana.
            </p>
            <div className="hero-buttons">
              <LinkButton href="/proyecto">
                Conocer Alerta RD
                <ArrowRight size={18} />
              </LinkButton>
              <LinkButton
                href="/participar"
                variant="outline"
                className="hero-secondary"
              >
                <MessageSquare size={18} />
                Dar mi opinión
              </LinkButton>
            </div>
            <div className="hero-footnote">
              <ShieldCheck size={17} />
              <span>
                Una propuesta en desarrollo. Construida con la sociedad.
              </span>
            </div>
          </div>
          <div className="hero-image-label">
            <span className="mini-flag" /> REPÚBLICA DOMINICANA{" "}
            <span>VISUAL CONCEPTUAL</span>
          </div>
          <a className="hero-floating" href="/simulador">
            <span className="play-circle">
              <Play size={20} fill="currentColor" />
            </span>
            <span>
              <small>CONOCE LA EXPERIENCIA</small>Una emergencia. Un botón.
            </span>
            <ArrowUpRight size={22} />
          </a>
        </div>
      </section>
      <div className="participation-strip">
        <div className="container strip-inner">
          <span className="strip-title">
            <span className="live-dot" />
            LA CONVERSACIÓN EMPIEZA CONTIGO
          </span>
          <div>
            <strong>{stats?.participants ?? "—"}</strong>
            <span>participantes</span>
          </div>
          <div>
            <strong>{stats?.surveys ?? "—"}</strong>
            <span>encuestas completadas</span>
          </div>
          <div>
            <strong>{stats?.provinces.length ?? "—"}</strong>
            <span>provincias representadas</span>
          </div>
          <a href="/resultados">
            Ver resultados
            <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
      <section className="section container">
        <SectionHeading
          eyebrow="DE LA IDEA A LA PARTICIPACIÓN"
          title="Esto también se diseña contigo."
          description="No necesitas saber de tecnología. Tu experiencia y tus preguntas son un buen comienzo."
        />
        <div className="journey-grid">
          <a href="/proyecto" className="journey-card">
            <span className="step-number">01 / CONOCE</span>
            <div className="journey-icon blue">
              <Lightbulb />
            </div>
            <h3>Una idea para pedir ayuda.</h3>
            <p>
              Explora qué propone Alerta RD y el problema que busca resolver.
            </p>
            <span className="text-link">
              Descubrir el proyecto
              <ArrowRight size={17} />
            </span>
          </a>
          <a href="/simulador" className="journey-card">
            <span className="step-number">02 / EXPERIMENTA</span>
            <div className="journey-icon red-bg">
              <Play />
            </div>
            <h3>Ponte en el escenario.</h3>
            <p>
              Prueba una simulación segura y descubre cómo podría funcionar.
            </p>
            <span className="text-link">
              Probar el simulador
              <ArrowRight size={17} />
            </span>
          </a>
          <a href="/foro" className="journey-card">
            <span className="step-number">03 / CONSTRUYE</span>
            <div className="journey-icon purple">
              <MessageSquare />
            </div>
            <h3>Tu opinión abre caminos.</h3>
            <p>
              Comparte una idea, plantea tus dudas o participa en el debate.
            </p>
            <span className="text-link">
              Participar en el foro
              <ArrowRight size={17} />
            </span>
          </a>
        </div>
      </section>
      <section className="section muted-section">
        <div className="container">
          <SectionHeading
            eyebrow="UN DIÁLOGO ABIERTO"
            title="Las preguntas importantes se hablan."
            description="Debates abiertos por Alerta RD. Todas las perspectivas tienen un lugar."
          >
            <TextLink href="/foro">Explorar el foro</TextLink>
          </SectionHeading>
          <div className="debate-grid">
            {OFFICIAL_DEBATES.slice(0, 3).map((t, i) => (
              <a href={"/foro/" + t.id} className="debate-card" key={t.id}>
                <div className="debate-card-top">
                  <span className={"category-badge cat-" + i}>
                    {t.category}
                  </span>
                  <ArrowUpRight size={19} />
                </div>
                <h3>{t.title}</h3>
                <p>
                  {
                    [
                      "Hablemos de los sensores, las falsas alarmas y el control que deberías tener.",
                      "Cuando abrir la app no es una opción, ¿qué alternativas necesitamos?",
                      "Entre la información útil y la privacidad, ¿dónde ponemos el límite?",
                    ][i]
                  }
                </p>
                <div className="debate-card-bottom">
                  <span className="official-avatar">A</span>
                  <span>
                    Alerta RD <small>Debate oficial</small>
                  </span>
                  <MessageSquare size={17} />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
      <section className="section container">
        <div className="survey-banner">
          <div>
            <span className="pill light-pill">
              <ClipboardList size={15} /> ENCUESTA CIUDADANA
            </span>
            <h2>
              Unos minutos de tu tiempo.
              <br />
              Una mejor idea para todos.
            </h2>
            <p>
              ¿La utilizarías? ¿Qué te preocupa? Ayúdanos a entender qué
              necesita la sociedad dominicana.
            </p>
            <LinkButton href="/encuestas">
              Responder encuesta
              <ArrowRight size={18} />
            </LinkButton>
            <span className="banner-note">
              13 preguntas · Participación anónima disponible
            </span>
          </div>
          <div className="survey-preview">
            <span className="survey-preview-count">TU PERSPECTIVA IMPORTA</span>
            <h3>
              ¿Qué función consideras
              <br />
              más importante?
            </h3>
            {[
              "Ubicación durante una emergencia",
              "Contactos de confianza",
              "Detección de accidentes",
            ].map((x, i) => (
              <a href="/encuestas" className="survey-option-preview" key={x}>
                <span className={i === 0 ? "checked-radio" : ""} />
                {x}
              </a>
            ))}
            <span className="muted">Tus respuestas orientarán el diseño.</span>
          </div>
        </div>
      </section>
      <section className="section container functions-home">
        <SectionHeading
          eyebrow="TECNOLOGÍA QUE PODRÍA HACER LA DIFERENCIA"
          title="Una propuesta. Muchas posibilidades."
          description="Estas funciones están en investigación. Tú puedes ayudarnos a priorizarlas."
        >
          <TextLink href="/funciones">Ver y votar las funciones</TextLink>
        </SectionHeading>
        <div className="feature-mini-grid">
          {FEATURES.slice(0, 3).map((f) => (
            <a className="feature-mini" href={"/funciones#" + f.id} key={f.id}>
              <div className="feature-icon">
                <Icon name={f.icon} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.short}</p>
              <span>
                Conocer y opinar
                <ChevronRight size={15} />
              </span>
            </a>
          ))}
        </div>
      </section>
      <section className="section community-section">
        <div className="container community-grid">
          <div className="community-image">
            <img
              src="/images/comunidad.webp"
              alt="Ilustración conceptual de jóvenes dominicanos dialogando sobre Alerta RD"
              loading="lazy"
            />
            <span>VISUAL CONCEPTUAL · NO ES UN EVENTO DOCUMENTADO</span>
          </div>
          <div>
            <p className="eyebrow">INNOVACIÓN JUVENIL DOMINICANA</p>
            <h2>
              La tecnología empieza
              <br />
              escuchando a las personas.
            </h2>
            <p>
              Alerta RD nace de una pregunta. Se construye con muchas voces: las
              de quienes viven, cuidan, se desplazan y sueñan con un país más
              seguro.
            </p>
            <p>
              Una iniciativa de Gabriel Robles para explorar cómo la tecnología
              puede ayudar a resolver problemas sociales.
            </p>
            <TextLink href="/acerca">Conoce la historia del proyecto</TextLink>
          </div>
        </div>
      </section>
      <section className="section container">
        <SectionHeading
          eyebrow="INVESTIGACIÓN ABIERTA"
          title="Cada opinión deja una huella."
        />
        <div className="impact-grid">
          <div className="impact-card">
            <div className="impact-icon">
              <ChartNoAxesCombined />
            </div>
            <h3>Resultados transparentes.</h3>
            <p>
              Votos y respuestas reales, sin estadísticas inventadas. Conoce qué
              piensa la comunidad.
            </p>
            <TextLink href="/resultados">Consultar la participación</TextLink>
          </div>
          <div className="impact-card">
            <div className="impact-icon">
              <MessageSquare />
            </div>
            <h3>La sociedad opina.</h3>
            <p>
              {stats?.opinions?.length
                ? "Lee las opiniones reales aprobadas por el equipo."
                : "Todavía estamos recopilando opiniones. La tuya puede ser una de las primeras."}
            </p>
            <TextLink href="/foro">Sumar mi perspectiva</TextLink>
          </div>
          <div className="impact-card">
            <div className="impact-icon">
              <Lightbulb />
            </div>
            <h3>De las ideas a las decisiones.</h3>
            <p>
              Consulta los cambios que surjan de la participación ciudadana y su
              estado.
            </p>
            <TextLink href="/resultados#cambios">Seguir la evolución</TextLink>
          </div>
        </div>
        {error && <ErrorNotice message={error} retry={refresh} />}
      </section>
      <section className="final-cta">
        <div className="container">
          <p className="eyebrow">EL FUTURO TAMBIÉN TE PERTENECE</p>
          <h2>
            No queremos crear tecnología
            <br />
            solo para la sociedad.
            <br />
            <span>Queremos diseñarla junto a ella.</span>
          </h2>
          <p>
            Conoce la propuesta. Comparte tus preocupaciones. Propón mejoras.
          </p>
          <div className="button-row">
            <LinkButton href="/participar">
              Quiero participar
              <ArrowRight size={18} />
            </LinkButton>
            <LinkButton href="/foro" variant="outline">
              Explorar el foro
            </LinkButton>
          </div>
        </div>
      </section>
    </>
  );
}
