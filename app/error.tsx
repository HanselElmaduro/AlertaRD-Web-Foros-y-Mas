"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="not-found">
      <h1>No pudimos cargar esta página.</h1>
      <p>
        Inténtalo de nuevo. Si estabas escribiendo, revisa tu contenido antes de
        reenviarlo.
      </p>
      <Button className="btn" onClick={reset}>
        Reintentar
      </Button>
    </section>
  );
}
