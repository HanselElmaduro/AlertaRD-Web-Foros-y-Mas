"use client";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Menu, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useApp } from "@/components/providers";
const links = [
  ["/", "Inicio"],
  ["/proyecto", "Conoce Alerta RD"],
  ["/funciones", "Funciones"],
  ["/simulador", "Simulador"],
  ["/foro", "Foro"],
  ["/encuestas", "Encuestas"],
  ["/resultados", "Resultados"],
];
export function Header() {
  const path = usePathname();
  const { state } = useApp();
  const [open, setOpen] = useState(false);
  return (
    <>
      <a href="#main" className="skip-link">
        Saltar al contenido
      </a>
      <div className="top-note">
        <span className="flag-rd" />
        Una iniciativa dominicana. Una conversación de todos.
        <span className="stage-label">PROYECTO EN DESARROLLO</span>
      </div>
      <header className="site-header">
        <div className="header-inner">
          <a href="/" className="brand" aria-label="Alerta RD, inicio">
            <img src="/images/marca.webp" alt="" width="42" height="42" />
            <span>
              ALERTA<span className="red">RD</span>
              <small>FORO CIUDADANO</small>
            </span>
          </a>
          <nav className="desktop-nav" aria-label="Navegación principal">
            {links.map(([href, label]) => (
              <a
                href={href}
                key={href}
                className={path === href ? "active" : ""}
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <a
              href={
                state?.profile.role !== "guest" && state?.profile.role
                  ? "/perfil"
                  : "/cuenta"
              }
              className="account-button"
              aria-label="Mi cuenta"
            >
              <UserRound size={20} />
            </a>
            <Button asChild className="btn header-cta">
              <a href="/participar">
                Dar mi opinión
                <ArrowUpRight size={16} />
              </a>
            </Button>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mobile-menu"
                  aria-label="Abrir menú"
                >
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Alerta RD</SheetTitle>
                </SheetHeader>
                <nav className="mobile-nav" aria-label="Menú móvil">
                  {[
                    ...links,
                    ["/proyecto#como", "Cómo funcionaría"],
                    ["/participar", "Participar"],
                    ["/acerca", "Acerca del proyecto"],
                    ["/perfil", "Mi participación"],
                  ].map(([href, label]) => (
                    <a key={href} href={href} onClick={() => setOpen(false)}>
                      {label}
                    </a>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
