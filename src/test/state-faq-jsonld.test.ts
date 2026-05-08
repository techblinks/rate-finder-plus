import { describe, it, expect } from "vitest";
import { STAMP_DUTY_STATE_CONTENT } from "@/data/stampDutyStateContent";

/**
 * Regression: every state stamp duty page must ship a FAQ block that satisfies
 * Google's Rich Results requirements — at least 2 Q/A pairs, every question
 * ending with "?", every answer plain text and ≥40 chars.
 */
describe("State stamp duty FAQ JSON-LD validity", () => {
  for (const [slug, cfg] of Object.entries(STAMP_DUTY_STATE_CONTENT)) {
    it(`${slug} has ≥2 FAQs and each is well-formed`, () => {
      expect(cfg.faqs.length).toBeGreaterThanOrEqual(2);
      for (const f of cfg.faqs) {
        expect(f.question.trim().endsWith("?")).toBe(true);
        expect(f.answer.trim().length).toBeGreaterThanOrEqual(40);
        expect(/<[^>]+>/.test(f.answer)).toBe(false);
      }
    });
  }
});
