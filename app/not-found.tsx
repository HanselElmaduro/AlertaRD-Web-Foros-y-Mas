import { LinkButton } from "@/components/ui-kit";
export default function NotFound() {
  return (
    <div className="not-found">
      <div className="code">404</div>
      <h1>Parece que esta alerta tomó otra ruta.</h1>
      <p>La página que buscas no está disponible.</p>
      <LinkButton href="/">Volver a Alerta RD</LinkButton>
    </div>
  );
}
