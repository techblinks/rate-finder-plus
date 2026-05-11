/**
 * Compiles src/data/routes.ts and src/data/howTos.ts into ESM bundles under
 * scripts/ so prerender.mjs can import them without tsx/ts-node at runtime.
 */
import { build } from "esbuild";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const targets = [
  ["src/data/routes.ts", "routes.generated.mjs"],
  ["src/data/howTos.ts", "howTos.generated.mjs"],
  ["src/data/cityGuides.ts", "cityGuides.generated.mjs"],
  ["src/data/suburbCatalogue.ts", "suburbCatalogue.generated.mjs"],
];

await Promise.all(
  targets.map(([src, out]) =>
    build({
      entryPoints: [join(ROOT, src)],
      bundle: true,
      format: "esm",
      platform: "node",
      target: "node18",
      outfile: join(__dirname, out),
      logLevel: "warning",
    }),
  ),
);

console.log("[prerender] Compiled route + howTo + cityGuides + suburbCatalogue manifests");
