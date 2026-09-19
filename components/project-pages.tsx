"use client";
import {
  Car,
  HeartPulse,
  ShieldAlert,
  Accessibility,
  ArrowRight,
  ShieldCheck,
  Mail,
  Code2,
  Link2,
  Lightbulb,
} from "lucide-react";
import {
  PageIntro,
  SectionHeading,
  LinkButton,
  TextLink,
  Icon,
} from "./ui-kit";
import { useApp } from "./providers";
export function ProjectPage() {
  return (
    <>
      <PageIntro
        tag="UNA PROPUESTA QUE SE CONSTRUYE CONTIGO"
        title="Una emergencia. Un botón. Ayuda en camino."
        description="Alerta RD es una propuesta de plataforma móvil para simplificar la forma de solicitar ayuda durante determinadas situaciones de emergencia."
      />
      <section className="section container split-grid">
        <div>
          <p className="eyebrow">¿QUÉ ES ALERTA RD?</p>
          <h2>
            Menos acciones.
            <br />
            Más información útil.
          </h2>
          <p>
            La idea es reunir una activación sencilla, ubicación y contactos
            configurados en una experiencia accesible. Su desarrollo parte de
            escuchar a quienes podrían utilizarla.
          </p>
          <p>
            La aplicación aún no está disponible. Las funciones y sus alcances
            se encuentran en investigación y deben validarse con pruebas
            técnicas y de seguridad.
          </p>
          <div className="feature-pills">
            {["SOS", "GPS", "Sensores", "Contactos", "Seguimiento"].map((x) => (
              <span className="pill" key={x}>
                {x}
              </span>
            ))}
          </div>
          <div className="spaced">
            <LinkButton href="/simulador">
              Explorar la simulación
              <ArrowRight size={17} />
            </LinkButton>
          </div>
        </div>
        <figure className="project-visual">
          <img
            src="/images/sos.webp"
            alt="Diseño conceptual de la pantalla SOS de Alerta RD"
          />
          <figcaption>
            Visual conceptual. La aplicación está en desarrollo.
          </figcaption>
        </figure>
      </section>
      <section className="section muted-section">
        <div className="container">
          <SectionHeading
            eyebrow="EL PROBLEMA QUE QUEREMOS EXPLORAR"
            title="En una emergencia, cada segundo cuenta."
            description="Hay situaciones en las que utilizar el teléfono de la forma habitual puede resultar difícil."
          />
          <div className="scenario-grid">
            {[
              [
                Car,
                "Accidente de tránsito",
                "Una persona podría estar herida o imposibilitada para utilizar normalmente el teléfono.",
              ],
              [
                HeartPulse,
                "Emergencia médica",
                "Podría resultar difícil explicar qué está ocurriendo o comunicar la ubicación.",
              ],
              [
                ShieldAlert,
                "Situación de peligro",
                "Sacar el teléfono y realizar una llamada podría aumentar el riesgo.",
              ],
              [
                Accessibility,
                "Persona vulnerable",
                "Un niño, un adulto mayor o una persona con limitaciones podría necesitar ayuda rápidamente.",
              ],
            ].map(([I, title, p]: any) => (
              <article className="scenario-card" key={title}>
                <I size={29} />
                <h3>{title}</h3>
                <p>{p}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section container" id="como">
        <SectionHeading
          eyebrow="UN MODELO CONCEPTUAL"
          title="¿Y si pedir ayuda necesitara menos pasos?"
          description="Comparamos recorridos posibles. No son tiempos medidos ni una garantía de respuesta."
        />
        <div className="comparison">
          <div>
            <h3>Un recorrido habitual</h3>
            <ol>
              {[
                "Acceder al teléfono",
                "Buscar un contacto o servicio",
                "Realizar una llamada",
                "Explicar la emergencia",
                "Comunicar la ubicación",
              ].map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ol>
            <p className="small-text">
              Los teléfonos también pueden ofrecer accesos de emergencia sin
              desbloqueo.
            </p>
          </div>
          <div>
            <h3>El concepto Alerta RD</h3>
            <ol>
              {[
                "Reconocer una emergencia",
                "Activar un protocolo configurado",
                "Adjuntar la ubicación disponible",
                "Consultar la información autorizada",
                "Notificar y mostrar el seguimiento",
              ].map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ol>
            <p className="small-text" style={{ color: "#bdcde0" }}>
              Algunos pasos podrían ejecutarse de forma automática, sujetos a
              permisos y conectividad.
            </p>
          </div>
        </div>
        <div className="notice spaced">
          <ShieldCheck size={21} />
          <p>
            No existe integración activa con el Sistema 9-1-1, Policía Nacional,
            DIGESETT, bomberos, hospitales u otras instituciones. Toda
            colaboración futura requeriría acuerdos y autorización.
          </p>
        </div>
      </section>
      <section className="final-cta">
        <div className="container">
          <h2>
            Primero lo entendemos.
            <br />
            Después lo diseñamos juntos.
          </h2>
          <p>Explora las funciones y comparte cuáles tienen sentido para ti.</p>
          <div className="button-row">
            <LinkButton href="/funciones">
              Conocer y votar funciones
              <ArrowRight size={17} />
            </LinkButton>
            <LinkButton href="/foro" variant="outline">
              Participar en el foro
            </LinkButton>
          </div>
        </div>
      </section>
    </>
  );
}
export function AboutPage() {
  const { state } = useApp();
  const c = state?.creator || {
    name: "Gabriel Robles",
    role: "Fundador / Creador de Alerta RD",
    bio: "Alerta RD surge como una iniciativa de innovación tecnológica dominicana orientada a explorar soluciones para problemas sociales. Mi propósito es construir una propuesta que escuche a las personas desde el inicio, con investigación, participación ciudadana y evaluación responsable de la tecnología.",
    github: "",
    linkedin: "",
    email: "",
  };
  return (
    <>
      <PageIntro
        tag="INNOVACIÓN JUVENIL DOMINICANA"
        title="Una idea con propósito. Un proyecto abierto."
        description="La tecnología debe estar al servicio de las personas. Por eso, Alerta RD empieza con una conversación."
      />
      <section className="section container">
        <div className="creator-card">
          <div>
            <div
              className="creator-avatar"
              aria-label="Espacio para la fotografía del creador"
            >
              GR
            </div>
            <p className="small-text">Fotografía próximamente.</p>
          </div>
          <div>
            <p className="eyebrow">SOBRE EL CREADOR</p>
            <h2>{c.name}</h2>
            <p className="creator-role">{c.role}</p>
            <p>{c.bio}</p>
            <div className="button-row spaced">
              {c.github && (
                <LinkButton href={c.github} variant="outline">
                  <Code2 size={17} />
                  GitHub
                </LinkButton>
              )}
              {c.linkedin && (
                <LinkButton href={c.linkedin} variant="outline">
                  <Link2 size={17} />
                  LinkedIn
                </LinkButton>
              )}
              {c.email && (
                <LinkButton href={"mailto:" + c.email} variant="outline">
                  <Mail size={17} />
                  Contacto
                </LinkButton>
              )}
            </div>
          </div>
        </div>
      </section>
      <section className="section muted-section">
        <div className="container community-grid">
          <div>
            <p className="eyebrow">INVESTIGAR, ESCUCHAR, CONSTRUIR</p>
            <h2>
              La evidencia se crea
              <br />
              participando de verdad.
            </h2>
            <p>
              Este foro permite recopilar respuestas, inquietudes y propuestas
              para orientar el diseño del proyecto. Sus resultados pueden apoyar
              investigaciones, un libro digital, exposiciones y documentación de
              una futura candidatura al Premio Nacional de la Juventud.
            </p>
            <p>
              Alerta RD no afirma haber obtenido premios ni contar con respaldo
              institucional. Las ilustraciones del sitio muestran conceptos, no
              eventos, testimonios o resultados documentados.
            </p>
            <TextLink href="/resultados">Ver la participación real</TextLink>
          </div>
          <div className="community-image">
            <img
              src="/images/comunidad.webp"
              alt="Representación conceptual de una conversación juvenil sobre tecnología"
              loading="lazy"
            />
            <span>ILUSTRACIÓN CONCEPTUAL</span>
          </div>
        </div>
      </section>
      <section className="section container" id="contacto">
        <SectionHeading
          eyebrow="HABLEMOS"
          title="¿Tienes algo que aportar?"
          description="Comparte una propuesta con el equipo o abre una conversación con la comunidad."
        />
        <div className="button-row">
          <LinkButton href="/participar#propuesta">
            Enviar una propuesta
            <ArrowRight size={17} />
          </LinkButton>
          <LinkButton href="/foro" variant="outline">
            Abrir el foro
          </LinkButton>
        </div>
        <p className="small-text spaced">
          Las propuestas se reciben de forma privada en el panel del proyecto.
          Evita incluir datos sensibles o información de terceros.
        </p>
      </section>
    </>
  );
}
export function PrivacyPage() {
  return (
    <article className="legal-page">
      <p className="eyebrow">TRANSPARENCIA DESDE EL PRINCIPIO</p>
      <h1>Privacidad y uso de datos</h1>
      <p className="legal-date">
        Versión 2026-09-v1 · 19 de septiembre de 2026
      </p>
      <p>
        El Foro Ciudadano Alerta RD recopila opiniones para investigar, validar
        el concepto, mejorar el proyecto y elaborar análisis estadísticos. La
        aplicación de emergencias todavía no está disponible.
      </p>
      <h2>Qué recopilamos</h2>
      <ul>
        <li>
          Votos, respuestas de encuestas, propuestas y el contenido que decidas
          publicar.
        </li>
        <li>
          Un identificador aleatorio de sesión para recordar tu participación y
          limitar duplicados. No representa una verificación de identidad.
        </li>
        <li>
          Si creas una cuenta: correo, alias y una contraseña almacenada
          mediante una función de derivación con sal. La provincia es opcional
          en el perfil.
        </li>
        <li>
          En las encuestas: rango de edad y provincia, con la opción de no
          responder. No solicitamos nombre completo, cédula, dirección ni datos
          médicos.
        </li>
      </ul>
      <h2>Qué se publica</h2>
      <p>
        Los comentarios y conversaciones aprobados se muestran con tu alias y
        provincia, si la indicas. Las estadísticas se publican de forma
        agregada. Las propuestas se comparten solamente con el equipo de
        administración, hasta que una decisión se documente sin datos
        identificativos.
      </p>
      <p>
        Tu correo, credenciales e identificadores de sesión no se muestran
        públicamente. El análisis no recoge ubicación exacta. No incluyas
        números de teléfono, diagnósticos, direcciones ni nombres de terceros en
        campos abiertos.
      </p>
      <h2>Consentimiento e investigación</h2>
      <p>
        Antes de enviar una encuesta debes aceptar que sus respuestas se
        utilicen de forma anónima y agregada para investigación y desarrollo.
        Registramos la versión del consentimiento y la fecha de respuesta.
        Participar es voluntario y puedes dejar de responder antes de enviar.
      </p>
      <p>
        Las encuestas son abiertas y no probabilísticas. Sus resultados
        describen a quienes participaron; no representan automáticamente a toda
        la población dominicana. Un identificador o una cuenta no garantizan que
        cada participación corresponda a una persona única.
      </p>
      <h2>Cookies y seguridad</h2>
      <p>
        Usamos una cookie esencial de sesión protegida con HttpOnly y SameSite.
        Tiene una duración máxima de 30 días. La conexión publicada utiliza
        HTTPS. No utilizamos cookies publicitarias ni herramientas externas de
        seguimiento.
      </p>
      <p>
        Para limitar abusos, el servidor puede procesar temporalmente una huella
        de red no publicada. Los registros del proveedor de alojamiento pueden
        incluir información técnica de las solicitudes. Los contadores de
        limitación se eliminan al expirar durante las siguientes solicitudes.
      </p>
      <h2>Simulaciones</h2>
      <p>
        Los simuladores no solicitan GPS ni micrófono y no realizan llamadas o
        envíos. Solo registran el tipo de simulación y su resultado. Las
        pantallas son demostraciones conceptuales.
      </p>
      <h2>Control y conservación</h2>
      <p>
        Desde <a href="/perfil">Mi participación</a> puedes editar o eliminar tu
        contenido. También puedes eliminar tu cuenta y las participaciones
        asociadas, salvo que debas transferir antes tu rol de administración.
        Los invitados conservan acceso a su participación mientras mantengan su
        sesión; borrar cookies puede impedir reconocerla.
      </p>
      <p>
        Las sesiones expiran después de 30 días. Las respuestas y publicaciones
        se conservan mientras sean necesarias para la investigación, hasta su
        eliminación o cierre del proyecto. Se revisará periódicamente la
        necesidad de conservarlas. Las copias de seguridad del proveedor pueden
        conservarse temporalmente según sus políticas.
      </p>
      <h2>Menores de edad</h2>
      <p>
        La participación de menores debe realizarse con conocimiento y
        acompañamiento de su madre, padre o tutor. No compartas experiencias con
        detalles identificativos. No crees una cuenta ni participes si no tienes
        la autorización requerida.
      </p>
      <h2>Contacto sobre tus datos</h2>
      <p>
        Usa el <a href="/acerca#contacto">canal de contacto del proyecto</a> o
        una propuesta de la categoría Privacidad y seguridad. No publiques tu
        solicitud con información privada en el foro.
      </p>
    </article>
  );
}
export function TermsPage() {
  return (
    <article className="legal-page">
      <p className="eyebrow">UNA CONVERSACIÓN CON RESPETO</p>
      <h1>Términos de participación</h1>
      <p className="legal-date">
        Versión 2026-09-v1 · 19 de septiembre de 2026
      </p>
      <h2>Propósito del foro</h2>
      <p>
        Alerta RD es una iniciativa en investigación y desarrollo. Este sitio
        ofrece información, debates, encuestas y simulaciones para recoger
        opiniones sobre el concepto. No recibe ni atiende emergencias.
      </p>
      <h2>Cómo participar</h2>
      <ul>
        <li>
          Comparte argumentos e ideas con respeto, incluso cuando no estés de
          acuerdo.
        </li>
        <li>
          No publiques spam, insultos, amenazas, datos personales de terceros ni
          contenido ilegal.
        </li>
        <li>
          No uses el foro para reportar una emergencia real. Utiliza los canales
          oficiales disponibles.
        </li>
        <li>
          No presentes rumores como hechos ni afirmes alianzas, premios o
          integraciones no confirmadas.
        </li>
        <li>
          No intentes manipular las encuestas mediante cuentas o sesiones
          múltiples.
        </li>
      </ul>
      <h2>Moderación</h2>
      <p>
        Los comentarios y conversaciones de participantes pasan por revisión
        antes de publicarse. El equipo puede aprobar, rechazar, ocultar, cerrar
        o destacar contenido. Puedes reportar una publicación indicando el
        motivo. Editar un contenido propio puede devolverlo a revisión.
      </p>
      <h2>Uso de las aportaciones</h2>
      <p>
        Conservas la autoría de tus aportaciones. Al enviarlas, autorizas su uso
        dentro del proceso de investigación y mejora de Alerta RD. Los
        resultados estadísticos se comparten de forma agregada. Las citas
        públicas se tomarán de comentarios aprobados y se mostrarán con el alias
        elegido, sin exponer datos privados.
      </p>
      <h2>Alcance de la propuesta</h2>
      <p>
        La viabilidad de cada función depende de permisos, dispositivos,
        conectividad, pruebas y acuerdos. El sitio no promete tiempos de
        respuesta ni asistencia garantizada. Cualquier integración institucional
        es únicamente una posibilidad futura sujeta a autorización.
      </p>
      <h2>Cuentas y cambios</h2>
      <p>
        Protege tu contraseña y utiliza un alias que no exponga información
        innecesaria. Puedes consultar y eliminar tu participación desde tu
        perfil. Si se modifica el propósito de tratamiento de datos, se deberá
        informar y actualizar el consentimiento aplicable.
      </p>
      <p>
        Consulta también la{" "}
        <a href="/privacidad">política de privacidad y uso de datos</a>.
      </p>
    </article>
  );
}
