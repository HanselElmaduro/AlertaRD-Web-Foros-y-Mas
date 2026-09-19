"use client";
import { useEffect } from "react";
import { api } from "@/lib/api";
export function WebTools() {
  useEffect(() => {
    const context = (
      document as Document & {
        modelContext?: {
          registerTool: (
            tool: unknown,
            options: { signal: AbortSignal },
          ) => unknown;
        };
      }
    ).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      Promise.resolve(
        context.registerTool(
          {
            name: "read_alerta_participation_results",
            title: "Consultar resultados de Alerta RD",
            description:
              "Obtiene únicamente las estadísticas agregadas reales de participación, sin datos personales.",
            inputSchema: {
              type: "object",
              properties: {},
              additionalProperties: false,
            },
            annotations: { readOnlyHint: true, untrustedContentHint: true },
            execute: async (input: unknown) => {
              if (
                !input ||
                typeof input !== "object" ||
                Object.keys(input).length
              )
                throw new Error("No se aceptan parámetros.");
              const s = await api("results");
              return {
                participants: s.participants,
                surveys: s.surveys,
                comments: s.comments,
                provinces: s.provinces,
                features: s.features,
                intent: s.intent,
                concerns: s.concerns,
              };
            },
          },
          { signal: lifecycle.signal },
        ),
      ).catch(() => {});
    } catch {}
    return () => lifecycle.abort();
  }, []);
  return null;
}
