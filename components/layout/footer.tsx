import { ArrowUpRight, ShieldCheck } from "lucide-react";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <a href="/" className="footer-brand">
              ALERTA<span>RD</span>
            </a>
            <p>Tecnología que protege vidas.</p>
            <p className="footer-small">
              Una propuesta que se construye
              <br />
              escuchando a las personas.
            </p>
          </div>
          <div>
            <h3>El proyecto</h3>
            <a href="/proyecto">Conoce Alerta RD</a>
            <a href="/proyecto#como">Cómo funcionaría</a>
            <a href="/funciones">Funciones propuestas</a>
            <a href="/acerca">Acerca del creador</a>
          </div>
          <div>
            <h3>Participa</h3>
            <a href="/foro">Foro ciudadano</a>
            <a href="/encuestas">Encuesta ciudadana</a>
            <a href="/participar#propuesta">Propón una idea</a>
            <a href="/resultados">Resultados</a>
          </div>
          <div>
            <h3>Transparencia</h3>
            <a href="/privacidad">Privacidad y uso de datos</a>
            <a href="/terminos">Términos de participación</a>
            <a href="/acerca#contacto">
              Contacto <ArrowUpRight size={13} />
            </a>
            <a href="/admin">Administración</a>
          </div>
        </div>
        <div className="footer-notice">
          <ShieldCheck size={19} />
          <p>
            Alerta RD no sustituye los servicios oficiales de emergencia. En una
            emergencia real, utiliza los canales oficiales disponibles. No
            existe una integración institucional activa.
          </p>
        </div>
        <div className="footer-bottom">
          <span>
            © 2026 Alerta RD. Proyecto en investigación y desarrollo.
          </span>
          <span>Desde República Dominicana, para las personas.</span>
        </div>
      </div>
    </footer>
  );
}
