/**
 * Compiles src/data/routes.ts (and its dep src/data/faqs.ts) into a single
 * ESM bundle at scripts/routes.generated.mjs so prerender.mjs can import it
 * without needing tsx/ts-node at runtime.
 */
import { build } from "esbuild";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

await build({
  entryPoints: [join(ROOT, "src/data/routes.ts")],
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node18",
  outfile: join(__dirname, "routes.generated.mjs"),
  logLevel: "warning",
});

console.log("[prerender] Compiled route manifest");
