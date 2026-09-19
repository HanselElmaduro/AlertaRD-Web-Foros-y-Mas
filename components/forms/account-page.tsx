"use client";
import { useState } from "react";
import { ArrowRight, LogIn, UserRoundPlus } from "lucide-react";
import { useApp } from "@/components/providers";
import { Button, ErrorNotice, LinkButton } from "@/components/ui-kit";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
export function AccountPage() {
  const { state, act } = useApp();
  const [mode, setMode] = useState("login"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [accepted, setAccepted] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (mode === "register" && !accepted) {
      setError("Acepta los términos y la privacidad para crear tu cuenta.");
      return;
    }
    setBusy(true);
    setError("");
    const d = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      await act("auth/" + mode, d);
      const next = new URLSearchParams(window.location.search).get("next");
      window.location.href =
        next && next.startsWith("/") && !next.startsWith("//")
          ? next
          : "/perfil";
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (state?.profile.role && state.profile.role !== "guest")
    return (
      <div className="auth-card">
        <h1>Tu sesión está abierta.</h1>
        <p>
          Participas como {state.profile.alias}. Puedes consultar tu historial o
          continuar en el foro.
        </p>
        <LinkButton href="/perfil">
          Abrir mi perfil
          <ArrowRight size={16} />
        </LinkButton>
      </div>
    );
  return (
    <div className="auth-card">
      <p className="eyebrow">BIENVENIDO A LA CONVERSACIÓN</p>
      <h1>Tu voz tiene un lugar.</h1>
      <p>
        Una cuenta te permite guardar debates y recuperar tu participación desde
        otros dispositivos.
      </p>
      <Tabs
        value={mode}
        onValueChange={(v) => {
          setMode(v);
          setError("");
        }}
      >
        <TabsList className="auth-tabs">
          <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
          <TabsTrigger value="register">Crear cuenta</TabsTrigger>
        </TabsList>
        <form className="form-stack" onSubmit={submit}>
          {mode === "register" && (
            <div className="field">
              <label htmlFor="account-alias">Alias público</label>
              <input
                id="account-alias"
                name="alias"
                required
                minLength={2}
                maxLength={40}
                autoComplete="nickname"
                placeholder="Cómo quieres aparecer en el foro"
              />
            </div>
          )}
          <div className="field">
            <label htmlFor="account-email">Correo electrónico</label>
            <input
              id="account-email"
              name="email"
              type="email"
              required
              maxLength={200}
              autoComplete="email"
              placeholder="tu@correo.com"
            />
          </div>
          <div className="field">
            <label htmlFor="account-password">Contraseña</label>
            <input
              id="account-password"
              name="password"
              type="password"
              required
              minLength={mode === "register" ? 12 : 1}
              maxLength={128}
              autoComplete={
                mode === "register" ? "new-password" : "current-password"
              }
              placeholder={
                mode === "register" ? "Al menos 12 caracteres" : "Tu contraseña"
              }
            />
          </div>
          {mode === "register" && (
            <label className="consent-box">
              <Checkbox
                checked={accepted}
                onCheckedChange={(v) => setAccepted(v === true)}
              />
              <span>
                Acepto los{" "}
                <a href="/terminos" target="_blank" rel="noreferrer">
                  términos de participación
                </a>{" "}
                y la{" "}
                <a href="/privacidad" target="_blank" rel="noreferrer">
                  privacidad
                </a>
                . Si soy menor, cuento con autorización de mi madre, padre o
                tutor.
              </span>
            </label>
          )}
          {error && <ErrorNotice message={error} />}
          <Button
            className="btn"
            disabled={busy || (mode === "register" && !accepted)}
            type="submit"
          >
            {busy
              ? "Procesando…"
              : mode === "register"
                ? "Crear mi cuenta"
                : "Iniciar sesión"}
            <ArrowRight size={17} />
          </Button>
        </form>
      </Tabs>
      <a href="/participar" className="guest-link">
        Continuar como invitado →
      </a>
    </div>
  );
}
