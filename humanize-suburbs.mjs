// scripts/humanize-suburbs.mjs
// One-time script: generates unique human-written-style 
// content for all 600 suburb pages via Claude Haiku 4.5.

import Anthropic from "@anthropic-ai/sdk";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUTPUT_PATH = path.join(ROOT, "src/data/generated/suburb-content.json");

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const { suburbCatalogue } = await import(
  path.join(ROOT, "src/data/suburbCatalogue.ts")
).catch(async () => {
  console.error("Could not import .ts directly. Use tsx to run this script.");
  process.exit(1);
});

let existing = {};
try {
  existing = JSON.parse(await fs.readFile(OUTPUT_PATH, "utf8"));
  console.log(`Resuming. ${Object.keys(existing).length} suburbs already generated.`);
} catch {
  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  console.log("Starting fresh.");
}

const SYSTEM = `You are a senior Australian property journalist writing for first home buyers and investors. Your tone is plain-English, factual, slightly informal, specific to each suburb. Never write generic real-estate fluff. Every sentence must give the reader concrete, locally-relevant information. Don't use headings, markdown, or bullet points — return flowing prose only.`;

function buildPrompt(suburb) {
  return `Write a unique 350-450 word property snapshot for ${suburb.name}, ${suburb.state}, Australia.

Key data to weave in naturally:
- Median dwelling value: $${suburb.medianValue.toLocaleString()}
- Parent city: ${suburb.parentCity}
- State stamp duty regime: ${suburb.state}

The piece should cover:
1. Two sentences on what kind of buyer ${suburb.name} suits and the suburb's character.
2. Three to four sentences on the property market.
3. Two to three sentences on mortgage math: 20% deposit is $${Math.round(suburb.medianValue * 0.2).toLocaleString()}, 80% LVR loan of $${Math.round(suburb.medianValue * 0.8).toLocaleString()}, rough monthly repayment at 6.14% over 30 years.
4. Two sentences on ${suburb.state} stamp duty for first home buyers in this price range.
5. One sentence pointing to Calcy's mortgage and stamp duty calculators.

DO NOT use cliches like "nestled", "vibrant", "charming", "hidden gem". Return only the prose.`;
}

const BATCH_SIZE = 5;
const PAUSE_MS = 1000;

let processed = 0;
let failed = 0;
const total = suburbCatalogue.length;

for (let i = 0; i < suburbCatalogue.length; i += BATCH_SIZE) {
  const batch = suburbCatalogue.slice(i, i + BATCH_SIZE);

  await Promise.all(
    batch.map(async (suburb) => {
      const key = suburb.slug || suburb.name.toLowerCase().replace(/\s+/g, "-");
      
      if (existing[key]) {
        processed++;
        return;
      }

      try {
        const response = await client.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 800,
          system: SYSTEM,
          messages: [{ role: "user", content: buildPrompt(suburb) }],
        });

        const text = response.content
          .filter((b) => b.type === "text")
          .map((b) => b.text)
          .join("\n")
          .trim();

        existing[key] = {
          name: suburb.name,
          state: suburb.state,
          medianValue: suburb.medianValue,
          parentCity: suburb.parentCity,
          generatedAt: new Date().toISOString(),
          content: text,
        };

        processed++;
        console.log(`[${processed}/${total}] ${suburb.name}, ${suburb.state} ✓`);
      } catch (err) {
        failed++;
        console.error(`FAILED: ${suburb.name}, ${suburb.state} — ${err.message}`);
      }
    })
  );

  await fs.writeFile(OUTPUT_PATH, JSON.stringify(existing, null, 2), "utf8");

  if (i + BATCH_SIZE < suburbCatalogue.length) {
    await new Promise((r) => setTimeout(r, PAUSE_MS));
  }
}

console.log(`\nDONE. ${processed} suburbs generated, ${failed} failed.`);
console.log(`Output: ${OUTPUT_PATH}`);
