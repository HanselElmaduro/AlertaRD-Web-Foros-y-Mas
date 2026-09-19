// Run only in a separate copy of the exported source, not in a live Sites checkout.
import fs from "node:fs";
const dbPath = "lib/server/database.ts";
fs.writeFileSync(
  dbPath,
  fs
    .readFileSync(dbPath, "utf8")
    .replace(/from ["']\.\/runtime-cloudflare["']/, 'from "./runtime-node"'),
);
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
pkg.scripts = {
  ...pkg.scripts,
  dev: "next dev",
  build: "next build",
  start: "next start",
  typecheck: "tsc --noEmit",
};
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
fs.writeFileSync(
  "vercel.json",
  JSON.stringify(
    {
      framework: "nextjs",
      buildCommand: "pnpm build",
      installCommand: "pnpm install --frozen-lockfile",
    },
    null,
    2,
  ) + "\n",
);
console.log(
  "Next.js/Vercel scripts prepared. Set DATABASE_PROVIDER=supabase and the server environment variables before deploying.",
);
