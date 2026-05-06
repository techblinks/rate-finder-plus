/**
 * Compiles src/data/routes.ts and src/data/howTos.ts into ESM bundles under
 * scripts/ so prerender.mjs can import them without tsx/ts-node at runtime.
 */
import { build } from "esbuild";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

await Promise.all([
  build({
    entryPoints: [join(ROOT, "src/data/routes.ts")],
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node18",
    outfile: join(__dirname, "routes.generated.mjs"),
    logLevel: "warning",
  }),
  build({
    entryPoints: [join(ROOT, "src/data/howTos.ts")],
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node18",
    outfile: join(__dirname, "howTos.generated.mjs"),
    logLevel: "warning",
  }),
]);

console.log("[prerender] Compiled route + howTo manifests");
