import { env } from "cloudflare:workers";
export function runtime(): Record<string, unknown> {
  return env as unknown as Record<string, unknown>;
}
