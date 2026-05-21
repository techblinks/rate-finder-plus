import { useMemo } from "react";

type Draft = {
  id: string;
  draft_type: string;
  target_url: string | null;
  target_keyword: string | null;
  proposed_change: string;
  before_text: string | null;
  after_text: string | null;
  payload: any;
  expected_seo_impact: string | null;
};

const SITE_DOMAIN = "calcy.com.au";

function urlToDisplay(url: string | null): { host: string; path: string; full: string } {
  if (!url) return { host: SITE_DOMAIN, path: "/", full: `https://${SITE_DOMAIN}/` };
  try {
    const u = new URL(url);
    return { host: u.host, path: u.pathname + u.search, full: u.toString() };
  } catch {
    const path = url.startsWith("/") ? url : `/${url}`;
    return { host: SITE_DOMAIN, path, full: `https://${SITE_DOMAIN}${path}` };
  }
}

function fieldDiff(before: Record<string, any> = {}, after: Record<string, any> = {}) {
  const keys = Array.from(new Set([...Object.keys(before || {}), ...Object.keys(after || {})]));
  return keys
    .map((k) => {
      const b = JSON.stringify(before?.[k] ?? null);
      const a = JSON.stringify(after?.[k] ?? null);
      return { key: k, before: before?.[k], after: after?.[k], changed: b !== a };
    })
    .filter((d) => d.changed);
}

function truncate(s: string, n: number) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s;
}

export function DraftSandboxPreview({ draft }: { draft: Draft }) {
  const { type, beforeFields, afterFields, title, description, faqs, aiAnswer } = useMemo(() => {
    const p = draft.payload || {};
    const before = p.before || {};
    const after = p.after || p.proposed || {};
    const merged = { ...before, ...after };

    const titleAfter =
      after.meta_title || merged.meta_title || merged.title || (draft.draft_type === "title_meta" ? draft.after_text : null);
    const titleBefore = before.meta_title || draft.before_text;

    const descAfter =
      after.meta_description || merged.meta_description || merged.description ||
      (draft.draft_type === "title_meta" ? null : null);
    const descBefore = before.meta_description;

    const faqList: Array<{ question: string; answer: string }> =
      (Array.isArray(p.questions) && p.questions) ||
      (Array.isArray(after.questions) && after.questions) ||
      (Array.isArray(p.faqs) && p.faqs) ||
      [];

    const aiAns =
      p.ai_overview || p.answer || after.answer || (draft.draft_type === "aeo_answer" ? draft.after_text : null);

    const beforeFields: Record<string, any> = { ...before };
    const afterFields: Record<string, any> = { ...after };
    if (draft.draft_type === "title_meta") {
      if (titleBefore !== undefined) beforeFields.meta_title = titleBefore;
      if (titleAfter !== undefined) afterFields.meta_title = titleAfter;
      if (descBefore !== undefined) beforeFields.meta_description = descBefore;
      if (descAfter !== undefined) afterFields.meta_description = descAfter;
    }

    return {
      type: draft.draft_type,
      beforeFields,
      afterFields,
      title: titleAfter || titleBefore || draft.proposed_change,
      description: descAfter || descBefore || draft.expected_seo_impact || "",
      faqs: faqList,
      aiAnswer: aiAns,
    };
  }, [draft]);

  const url = urlToDisplay(draft.target_url);
  const diffs = fieldDiff(beforeFields, afterFields);

  const titleStr = String(title || "").trim() || "Untitled page";
  const descStr = String(description || "").trim();

  return (
    <div className="mt-3 rounded-lg border border-dashed border-accent/40 bg-accent/5 p-3">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">
          Sandbox preview · not applied
        </p>
        <span className="text-[10px] text-muted-foreground">
          {diffs.length} field{diffs.length === 1 ? "" : "s"} changed
        </span>
      </div>

      {/* Changed fields diff */}
      {diffs.length > 0 && (
        <div className="mb-3 rounded border border-border bg-background p-2">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Changed fields</p>
          <div className="mt-2 space-y-2">
            {diffs.map((d) => (
              <div key={d.key} className="grid gap-1 md:grid-cols-[140px_1fr]">
                <div className="text-[11px] font-semibold text-foreground">{d.key}</div>
                <div className="space-y-1 text-[11px]">
                  <div className="rounded bg-red-50 px-2 py-1 text-red-900 line-through">
                    {d.before === undefined || d.before === null || d.before === ""
                      ? <span className="italic opacity-60">empty</span>
                      : typeof d.before === "string" ? d.before : JSON.stringify(d.before)}
                  </div>
                  <div className="rounded bg-emerald-50 px-2 py-1 text-emerald-950">
                    {d.after === undefined || d.after === null || d.after === ""
                      ? <span className="italic opacity-60">empty</span>
                      : typeof d.after === "string" ? d.after : JSON.stringify(d.after)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        {/* Desktop SERP preview */}
        <div className="rounded border border-border bg-white p-3 shadow-sm">
          <p className="mb-2 text-[10px] uppercase tracking-wide text-muted-foreground">Desktop SERP preview</p>
          <div className="space-y-1 font-sans">
            <div className="text-[12px] text-[#202124]">{url.host} <span className="text-[#5f6368]">› {url.path.replace(/^\//, "")}</span></div>
            <div className="cursor-pointer text-[18px] leading-snug text-[#1a0dab] hover:underline">
              {truncate(titleStr, 60)}
            </div>
            <div className="text-[13px] leading-snug text-[#4d5156]">
              {truncate(descStr || "No meta description set.", 160)}
            </div>
          </div>
          <div className="mt-2 flex gap-3 text-[10px] text-muted-foreground">
            <span>Title: {titleStr.length}/60</span>
            <span>Desc: {descStr.length}/160</span>
          </div>
        </div>

        {/* Mobile snippet preview */}
        <div className="rounded border border-border bg-white p-3 shadow-sm">
          <p className="mb-2 text-[10px] uppercase tracking-wide text-muted-foreground">Mobile SERP preview</p>
          <div className="mx-auto max-w-[320px] space-y-1 rounded-lg border border-[#dadce0] p-3 font-sans">
            <div className="flex items-center gap-1 text-[11px] text-[#202124]">
              <span className="inline-block h-4 w-4 rounded-full bg-[#f1f3f4]" />
              <span>{url.host}</span>
            </div>
            <div className="text-[10px] text-[#5f6368]">{url.path}</div>
            <div className="text-[16px] leading-snug text-[#1a0dab]">{truncate(titleStr, 60)}</div>
            <div className="text-[12px] leading-snug text-[#4d5156]">{truncate(descStr || "No meta description set.", 130)}</div>
          </div>
        </div>

        {/* FAQ rich snippet preview */}
        {faqs.length > 0 && (
          <div className="rounded border border-border bg-white p-3 shadow-sm lg:col-span-2">
            <p className="mb-2 text-[10px] uppercase tracking-wide text-muted-foreground">FAQ rich snippet preview</p>
            <div className="space-y-2 font-sans">
              <div className="text-[14px] text-[#1a0dab]">{truncate(titleStr, 60)}</div>
              <div className="text-[12px] text-[#5f6368]">{url.host}{url.path}</div>
              <div className="mt-2 divide-y divide-[#dadce0] rounded border border-[#dadce0]">
                {faqs.slice(0, 5).map((f, i) => (
                  <details key={i} className="group p-2 open:bg-[#f8f9fa]">
                    <summary className="cursor-pointer list-none text-[13px] text-[#202124]">
                      <span className="mr-1 text-[#5f6368]">▸</span>
                      {f.question}
                    </summary>
                    <p className="mt-1 pl-4 text-[12px] text-[#4d5156]">{f.answer}</p>
                  </details>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">{faqs.length} question{faqs.length === 1 ? "" : "s"} proposed</p>
            </div>
          </div>
        )}

        {/* AI Overview preview */}
        {(aiAnswer || type === "aeo_answer") && (
          <div className="rounded border border-[#c2e7ff] bg-gradient-to-br from-[#e8f0fe] to-[#f3e8ff] p-3 lg:col-span-2">
            <p className="mb-2 flex items-center gap-1 text-[10px] uppercase tracking-wide text-[#1967d2]">
              <span className="inline-block h-2 w-2 rounded-full bg-[#1967d2]" />
              AI Overview preview
            </p>
            <div className="space-y-2 font-sans">
              <div className="text-[13px] leading-relaxed text-[#202124]">
                {aiAnswer || draft.after_text || "No AI Overview answer text in payload."}
              </div>
              <div className="text-[11px] text-[#5f6368]">
                Source · <span className="underline">{url.host}{url.path}</span>
                {draft.target_keyword && <> · query: <em>{draft.target_keyword}</em></>}
              </div>
            </div>
          </div>
        )}

        {/* Internal link preview */}
        {type === "internal_link" && (
          <div className="rounded border border-border bg-white p-3 shadow-sm lg:col-span-2">
            <p className="mb-2 text-[10px] uppercase tracking-wide text-muted-foreground">Internal link preview</p>
            <p className="text-[12px] text-foreground">
              On <span className="font-mono">{url.path}</span> insert link:{" "}
              <a className="text-[#1a0dab] underline" href={draft.payload?.link_to || "#"}>
                {draft.payload?.anchor_text || draft.target_keyword || "(anchor text)"}
              </a>
              {draft.payload?.link_to && <> → <span className="font-mono text-muted-foreground">{draft.payload.link_to}</span></>}
            </p>
          </div>
        )}
      </div>

      <p className="mt-3 text-[10px] italic text-muted-foreground">
        Previews are visual approximations from the draft payload. Nothing is applied until you click Apply approved draft.
      </p>
    </div>
  );
}
