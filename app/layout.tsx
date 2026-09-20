import type { Metadata } from "next";
import "./globals.css";
import { WebTools } from "@/components/web-tools";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      "https://alerta-rd-foro-ciudadano.dafanymejia.chatgpt.site",
  ),
  title: {
    default:
      "Foro Alerta RD | Tecnología y Emergencias en República Dominicana",
    template: "%s | Alerta RD",
  },
  description:
    "Participa en el Foro Ciudadano Alerta RD y comparte tu opinión sobre una propuesta tecnológica orientada a mejorar la forma de solicitar ayuda durante emergencias.",
  openGraph: {
    title: "Alerta RD — Diseñemos juntos el futuro de pedir ayuda",
    description:
      "Conoce la propuesta, prueba el simulador y comparte tu opinión en el foro ciudadano.",
    locale: "es_DO",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Alerta RD — Foro Ciudadano",
    description: "Una propuesta dominicana que se construye contigo.",
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};
export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <Providers>
          <WebTools />
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
