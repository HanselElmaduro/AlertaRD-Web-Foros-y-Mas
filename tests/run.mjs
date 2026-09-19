import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const name = fs
  .readdirSync("node_modules/.pnpm")
  .find((n) => n.startsWith("esbuild@0.28."));
if (!name)
  throw new Error("esbuild is expected through the locked Vite dependency.");
const { build } = await import(
  pathToFileURL(
    path.resolve(
      "node_modules/.pnpm",
      name,
      "node_modules/esbuild/lib/main.js",
    ),
  ).href
);
fs.mkdirSync(".sites-runtime", { recursive: true });
await build({
  entryPoints: ["tests/api.spec.ts"],
  outfile: ".sites-runtime/api-tests.mjs",
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  plugins: [
    {
      name: "isolated-database",
      setup(b) {
        b.onResolve({ filter: /runtime-cloudflare$/ }, () => ({
          path: path.resolve("tests/runtime.ts"),
        }));
      },
    },
  ],
});
await import(pathToFileURL(path.resolve(".sites-runtime/api-tests.mjs")).href);
