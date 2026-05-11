import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const SUBURBS: { suburb: string; slug: string; state: string }[] = [
  { suburb: "Sydney", slug: "sydney", state: "NSW" },
  { suburb: "Melbourne", slug: "melbourne", state: "VIC" },
  { suburb: "Brisbane", slug: "brisbane", state: "QLD" },
  { suburb: "Perth", slug: "perth", state: "WA" },
  { suburb: "Adelaide", slug: "adelaide", state: "SA" },
  { suburb: "Canberra", slug: "canberra", state: "ACT" },
  { suburb: "Gold Coast", slug: "gold-coast", state: "QLD" },
  { suburb: "Newcastle", slug: "newcastle", state: "NSW" },
];
const PRICE_POINTS = [500_000, 600_000, 700_000, 800_000, 1_000_000];

const fmtPriceLabel = (n: number) =>
  n >= 1_000_000 ? `${n / 1_000_000}M` : `${Math.round(n / 1000)}k`;

const buildSuburbRows = () =>
  SUBURBS.flatMap(({ suburb, slug, state }) =>
    PRICE_POINTS.map((price) => {
      const priceLabel = fmtPriceLabel(price);
      const priceFmt = new Intl.NumberFormat("en-AU", {
        style: "currency",
        currency: "AUD",
        maximumFractionDigits: 0,
      }).format(price);
      return {
        page_type: "stamp_duty",
        url_path: `/calculate/stamp-duty/${state.toLowerCase()}/${slug}/${price}`,
        params: { state, suburb, propertyValue: price, buyerType: "owner-occupier" },
        target_keyword: `stamp duty ${suburb} ${priceLabel}`,
        meta_title: `Stamp Duty on a ${priceFmt} Property in ${suburb} (${state}) — 2026 Calculator`,
        meta_description: `Calculate the exact stamp duty on a ${priceFmt} property in ${suburb}, ${state}. See first-home-buyer concessions, total upfront costs, and a full breakdown for 2026.`,
        h1: `Stamp duty on a ${priceFmt} ${suburb} property`,
        intro_text: `Buying a ${priceFmt} home in ${suburb}, ${state}? See the exact 2026 stamp duty, eligible concessions, and total upfront costs below.`,
        is_active: true,
      };
    }),
  );

interface ProgPage {
  id: string;
  page_type: string;
  url_path: string;
  target_keyword: string | null;
  impressions_28d: number;
  clicks_28d: number;
  position: number | null;
  is_active: boolean;
}

const ProgrammaticPagesSection = () => {
  const [pages, setPages] = useState<ProgPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("programmatic_pages")
        .select("id,page_type,url_path,target_keyword,impressions_28d,clicks_28d,position,is_active")
        .order("impressions_28d", { ascending: false });
      if (cancel) return;
      setPages((data as ProgPage[] | null) ?? []);
      setLoading(false);
    }
    load();
    return () => {
      cancel = true;
    };
  }, []);

  const total = pages.length;
  const active = pages.filter((p) => p.is_active).length;
  const indexed = pages.filter((p) => (p.impressions_28d ?? 0) > 0).length;
  const top = pages.filter((p) => (p.impressions_28d ?? 0) > 0).slice(0, 10);

  return (
    <section className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-foreground">Programmatic pages</h2>
        <p className="text-xs text-muted-foreground">
          Auto-generated calculator scenario pages at <code className="text-[11px]">/calculate/*</code>
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-6 text-sm">
        <div>
          <span className="text-muted-foreground">Total pages:</span>{" "}
          <span className="font-semibold tnum">{total}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Active:</span>{" "}
          <span className="font-semibold tnum">{active}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Indexed (with impressions):</span>{" "}
          <span className="font-semibold tnum">{indexed}</span>
        </div>
      </div>

      <div className="mt-5">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Top performing pages
        </h3>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : top.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No GSC impressions yet. After deploying, submit{" "}
            <code className="text-[11px]">sitemap-programmatic</code> to Google Search Console.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {top.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{p.target_keyword ?? p.url_path}</div>
                  <div className="truncate text-xs text-muted-foreground">{p.url_path}</div>
                </div>
                <div className="shrink-0 text-right text-xs tabular-nums">
                  <div>Pos {p.position ?? "—"}</div>
                  <div className="text-muted-foreground">
                    {p.impressions_28d} impr · {p.clicks_28d} clicks
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Pages and content templates live in code; metadata is stored in the{" "}
        <code className="text-[11px]">programmatic_pages</code> table. Add new combinations by
        inserting rows — they go live immediately.
      </p>
    </section>
  );
};

export default ProgrammaticPagesSection;
