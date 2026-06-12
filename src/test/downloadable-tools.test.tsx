import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import DownloadableToolCard from "@/components/DownloadableToolCard";
import DownloadableToolsSection from "@/components/DownloadableToolsSection";
import {
  DOWNLOADABLE_TOOLS,
  getDownloadableToolCta,
  isDownloadAvailable,
} from "@/data/downloadableTools";
import { ROUTES } from "@/data/routes";
import { buildAmortisation } from "@/lib/calc/mortgageEngine";

const renderWithRouter = (ui: ReactNode) =>
  render(<BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>{ui}</BrowserRouter>);

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOWNLOAD_ASSET_PATH = join(
  __dirname,
  "..",
  "..",
  "public",
  "downloads",
  "calcy-mortgage-repayment-spreadsheet.csv",
);
const DOWNLOAD_NOTES_PATH = join(__dirname, "..", "..", "public", "downloads", "README.md");

describe("Phase 4A/4B downloadable tools system", () => {
  it("defines the five planned downloadable tools with safe draft/noindex metadata", () => {
    expect(DOWNLOADABLE_TOOLS.map((tool) => tool.title)).toEqual([
      "Mortgage Repayment Spreadsheet",
      "First Home Buyer Budget Template",
      "Extra Repayment Planner",
      "Refinance Comparison Spreadsheet",
      "Home Buying Checklist PDF",
    ]);

    for (const tool of DOWNLOADABLE_TOOLS) {
      expect(tool.id).toBeTruthy();
      expect(tool.shortDescription.length).toBeGreaterThan(40);
      expect(tool.audience.length).toBeGreaterThan(20);
      expect(tool.useCase.length).toBeGreaterThan(30);
      expect(["spreadsheet", "pdf", "checklist", "planner"]).toContain(tool.format);
      expect(["coming_soon", "draft", "available"]).toContain(tool.status);
      expect(tool.requiresEmail).toBe(false);
      expect(tool.relatedCalculatorLinks.length).toBeGreaterThanOrEqual(1);
      expect(tool.seoStatus).toBe("draft_noindex");
      expect(tool.updatedDate).toBe("2026-05-24");
      expect(tool.reviewedDate).toBe("2026-05-24");
    }
  });

  it("creates a real mortgage repayment spreadsheet CSV asset with safe template columns", () => {
    expect(existsSync(DOWNLOAD_ASSET_PATH)).toBe(true);
    expect(existsSync(DOWNLOAD_NOTES_PATH)).toBe(true);

    const csv = readFileSync(DOWNLOAD_ASSET_PATH, "utf8");
    const notes = readFileSync(DOWNLOAD_NOTES_PATH, "utf8");

    expect(csv.split(/\r?\n/)[0]).toBe(
      "Payment Number,Payment Period,Opening Balance,Scheduled Repayment,Extra Repayment,Total Payment,Interest Portion,Principal Portion,Closing Balance,Notes",
    );
    expect(csv).toContain("General information only");
    expect(csv).toContain("Example only");
    expect(csv).not.toMatch(/guaranteed|approved instantly|personalised advice/i);
    expect(notes).toContain("general information only");
    expect(notes).toContain("not financial advice");
  });

  it("enables only the real Mortgage Repayment Spreadsheet download", () => {
    const availableTools = DOWNLOADABLE_TOOLS.filter(isDownloadAvailable);
    const mortgageSpreadsheet = DOWNLOADABLE_TOOLS.find(
      (tool) => tool.id === "mortgage-repayment-spreadsheet",
    );

    expect(availableTools.map((tool) => tool.id)).toEqual(["mortgage-repayment-spreadsheet"]);
    expect(mortgageSpreadsheet).toMatchObject({
      status: "available",
      downloadUrl: "/downloads/calcy-mortgage-repayment-spreadsheet.csv",
      requiresEmail: false,
      seoStatus: "draft_noindex",
    });
  });

  it("keeps the other four tools disabled with no fake download URLs", () => {
    const unavailableTools = DOWNLOADABLE_TOOLS.filter(
      (tool) => tool.id !== "mortgage-repayment-spreadsheet",
    );

    expect(unavailableTools).toHaveLength(4);
    for (const tool of unavailableTools) {
      expect(tool.status).not.toBe("available");
      expect(tool.downloadUrl).toBeUndefined();
      expect(isDownloadAvailable(tool)).toBe(false);
    }
  });

  it("enables the download CTA only for the available spreadsheet", () => {
    for (const tool of DOWNLOADABLE_TOOLS) {
      const { unmount } = renderWithRouter(<DownloadableToolCard tool={tool} />);

      if (isDownloadAvailable(tool)) {
        const link = screen.getByRole("link", { name: "Download" });
        expect(link).toHaveAttribute("href", "/downloads/calcy-mortgage-repayment-spreadsheet.csv");
        expect(link).toHaveAttribute("download");
      } else {
        const cta = screen.getByRole("button", { name: getDownloadableToolCta(tool) });
        expect(cta).toBeDisabled();
        expect(screen.queryByRole("link", { name: "Download" })).not.toBeInTheDocument();
      }
      unmount();
    }
  });

  it("keeps the email capture shell disabled and local-only", () => {
    renderWithRouter(<DownloadableToolsSection />);

    const form = screen.getByRole("form", { name: "Download notification form shell" });
    const input = screen.getByLabelText("Email address");
    const button = screen.getByRole("button", { name: "Get notified soon" });

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
    const preventDefault = vi.spyOn(Event.prototype, "preventDefault");
    fireEvent.submit(form);
    expect(preventDefault).toHaveBeenCalled();
    preventDefault.mockRestore();
    expect(screen.getByText(/No email is stored/i)).toBeInTheDocument();
  });

  it("does not add a tools preview route or sitemap entry in Phase 4A", () => {
    expect(ROUTES.some((route) => route.canonical === "/downloadable-tools")).toBe(false);
    expect(ROUTES.some((route) => route.canonical.includes("/downloads/"))).toBe(false);
  });

  it("keeps all existing mortgage scenario pages indexed", () => {
    const scenarioPaths = [
      "/mortgage-calculator/with-offset",
      "/mortgage-calculator/extra-repayments",
      "/mortgage-calculator/first-home-buyer",
      "/mortgage-calculator/with-hecs",
      "/mortgage-calculator/700k-mortgage-repayments",
      "/mortgage-calculator/qld",
      "/mortgage-calculator/nsw",
      "/mortgage-calculator/vic",
      "/mortgage-calculator/brisbane",
      "/mortgage-calculator/sydney",
    ];

    for (const path of scenarioPaths) {
      expect(ROUTES.some((route) => route.canonical === path)).toBe(true);
    }
  });

  it("keeps existing mortgage calculator outputs unchanged", () => {
    const result = buildAmortisation(660000, 6.39, 30, "fortnightly", 0, 2026);

    expect(Math.round(result.weekly)).toBe(951);
    expect(Math.round(result.fortnightly)).toBe(1902);
    expect(Math.round(result.monthly)).toBe(4124);
    expect(Math.round(result.totalInterest)).toBe(823944);
    expect(Math.round(result.totalRepaid)).toBe(1483944);
    expect(result.payoffYear).toBe(2056);
  });
});
