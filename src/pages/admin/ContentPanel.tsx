import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import ProgrammaticPagesSection from "./ProgrammaticPagesSection";

type Status = "brief" | "draft" | "approved" | "published" | "rejected";

interface Draft {
  id: string;
  title: string;
  slug: string | null;
  target_keyword: string | null;
  category: string | null;
  status: Status;
  brief: any;
  content: string | null;
  word_count: number | null;
  keyword_position: number | null;
  keyword_impressions: number | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  published_at: string | null;
}

type SubTab = "briefs" | "drafts" | "published";

const StatusBadge = ({ status }: { status: Status }) => {
  const colors: Record<Status, string> = {
    brief: "bg-blue-100 text-blue-800",
    draft: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-800",
    published: "bg-emerald-600 text-white",
    rejected: "bg-rose-100 text-rose-800",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${colors[status]}`}>
      {status}
    </span>
  );
};

const ContentPanel = () => {
  const [subTab, setSubTab] = useState<SubTab>("briefs");
  const [items, setItems] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [draftGenerating, setDraftGenerating] = useState<string | null>(null);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [editForm, setEditForm] = useState<Partial<Draft>>({});

  const load = async () => {
    setLoading(true);
    const statuses =
      subTab === "briefs" ? ["brief"] : subTab === "drafts" ? ["draft", "approved"] : ["published"];
    const { data, error } = await supabase
      .from("content_drafts")
      .select("*")
      .in("status", statuses)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Failed to load", description: error.message, variant: "destructive" });
    } else {
      setItems((data ?? []) as Draft[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subTab]);

  const generateBriefs = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-brief");
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const count = (data as any)?.briefs?.length ?? 0;
      toast({ title: `Generated ${count} content briefs` });
      load();
    } catch (e: any) {
      toast({ title: "Brief generation failed", description: e.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const generateDraft = async (id: string) => {
    setDraftGenerating(id);
    try {
      const { data, error } = await supabase.functions.invoke("generate-draft", {
        body: { briefId: id },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast({ title: `Draft generated — ${(data as any).word_count} words` });
      load();
    } catch (e: any) {
      toast({ title: "Draft generation failed", description: e.message, variant: "destructive" });
    } finally {
      setDraftGenerating(null);
    }
  };

  const updateStatus = async (id: string, status: Status) => {
    const patch: any = { status };
    if (status === "published") patch.published_at = new Date().toISOString();
    const { error } = await supabase.from("content_drafts").update(patch).eq("id", id);
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
    else {
      toast({ title: `Marked as ${status}` });
      load();
    }
  };

  const removeDraft = async (id: string) => {
    if (!confirm("Discard this draft permanently?")) return;
    const { error } = await supabase.from("content_drafts").delete().eq("id", id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Discarded" });
      load();
    }
  };

  const openEditor = (d: Draft) => {
    setEditing(d);
    setEditForm({
      title: d.title,
      slug: d.slug,
      meta_title: d.meta_title,
      meta_description: d.meta_description,
      content: d.content,
    });
  };

  const saveEditor = async () => {
    if (!editing) return;
    const wc = (editForm.content ?? "").split(/\s+/).filter(Boolean).length;
    const { error } = await supabase
      .from("content_drafts")
      .update({ ...editForm, word_count: wc })
      .eq("id", editing.id);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Saved" });
    setEditing(null);
    load();
  };

  if (editing) {
    const wordCount = (editForm.content ?? "").split(/\s+/).filter(Boolean).length;
    return (
      <section className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setEditing(null)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to drafts
          </button>
          <div className="flex gap-2">
            <button
              onClick={saveEditor}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
            >
              Save
            </button>
            <button
              onClick={() => updateStatus(editing.id, "approved").then(() => setEditing(null))}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Approve
            </button>
            <button
              onClick={() => updateStatus(editing.id, "published").then(() => setEditing(null))}
              className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Publish
            </button>
            <button
              onClick={() => updateStatus(editing.id, "rejected").then(() => setEditing(null))}
              className="rounded-lg bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-800"
            >
              Reject
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Title</label>
            <input
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              value={editForm.title ?? ""}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Slug</label>
            <input
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono"
              value={editForm.slug ?? ""}
              onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Meta title</label>
            <input
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              value={editForm.meta_title ?? ""}
              onChange={(e) => setEditForm({ ...editForm, meta_title: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Meta description</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              rows={2}
              value={editForm.meta_description ?? ""}
              onChange={(e) => setEditForm({ ...editForm, meta_description: e.target.value })}
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Article (markdown)</label>
              <span className="text-xs text-muted-foreground tnum">Word count: {wordCount}</span>
            </div>
            <textarea
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono"
              rows={24}
              value={editForm.content ?? ""}
              onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
            />
          </div>

          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-xs font-semibold text-muted-foreground">SEO preview</p>
            <p className="mt-2 truncate text-base text-blue-700">{editForm.meta_title || editForm.title}</p>
            <p className="text-xs text-emerald-700">https://calcy.com.au/guides/{editForm.slug}</p>
            <p className="mt-1 text-sm text-muted-foreground">{editForm.meta_description}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-gradient-to-br from-accent/10 to-transparent p-6">
        <h2 className="text-lg font-semibold text-foreground">Content Engine</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate SEO-optimised articles for calcy.com.au, based on your top keyword opportunities.
        </p>
        <button
          onClick={generateBriefs}
          disabled={generating}
          className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-60"
        >
          {generating ? "Analysing your keyword data…" : "⚡ Generate this week's briefs"}
        </button>
      </section>

      <div className="flex gap-2 border-b border-border">
        {(["briefs", "drafts", "published"] as SubTab[]).map((s) => (
          <button
            key={s}
            onClick={() => setSubTab(s)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium capitalize ${
              subTab === s
                ? "border-accent text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing here yet.</p>
      ) : subTab === "published" ? (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-background text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Keyword</th>
                <th className="px-4 py-2">Published</th>
                <th className="px-4 py-2">Words</th>
              </tr>
            </thead>
            <tbody>
              {items.map((d) => (
                <tr key={d.id} className="border-t border-border">
                  <td className="px-4 py-2 font-medium">{d.title}</td>
                  <td className="px-4 py-2 text-muted-foreground">{d.target_keyword}</td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {d.published_at ? new Date(d.published_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-2 tnum">{d.word_count ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((d) => (
            <article
              key={d.id}
              className="rounded-2xl border border-border bg-surface p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-mono text-muted-foreground">📝 {d.target_keyword}</p>
                <StatusBadge status={d.status} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Position {d.keyword_position ?? "?"} · {d.keyword_impressions ?? 0} impressions ·{" "}
                {d.category}
              </p>
              <h3 className="mt-3 font-semibold text-foreground">{d.title}</h3>

              {d.status === "brief" && (
                <>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Outline: {d.brief?.outline?.length ?? 0} sections · ~
                    {d.brief?.word_count_target ?? 1200} words
                  </p>
                  {d.brief?.calculator_to_embed && (
                    <p className="text-xs text-muted-foreground">
                      Calculator: {d.brief.calculator_to_embed}
                    </p>
                  )}
                  {d.brief?.rationale && (
                    <p className="mt-2 rounded bg-background p-2 text-xs italic text-muted-foreground">
                      Why now: {d.brief.rationale}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => generateDraft(d.id)}
                      disabled={draftGenerating === d.id}
                      className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground disabled:opacity-60"
                    >
                      {draftGenerating === d.id ? "Generating…" : "✍ Generate full draft"}
                    </button>
                    <button
                      onClick={() => removeDraft(d.id)}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                    >
                      ✗ Discard
                    </button>
                  </div>
                </>
              )}

              {(d.status === "draft" || d.status === "approved") && (
                <>
                  {d.brief?.trigger === "rba_event" && (
                    <div className="mt-3 rounded-lg border-l-4 border-amber-500 bg-amber-50 p-2 text-xs text-amber-900">
                      <div className="font-semibold">⚡ RBA EVENT ARTICLE</div>
                      <div className="mt-0.5">
                        ⏰ Time-sensitive — publish within 2 hours of the RBA announcement for maximum traffic.
                      </div>
                    </div>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground tnum">
                    {d.word_count ?? 0} words · Generated {new Date(d.created_at).toLocaleString("en-AU")}
                  </p>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                    {(d.content ?? "").slice(0, 200)}…
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => openEditor(d)}
                      className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground"
                    >
                      Review & Edit
                    </button>
                    {d.status === "draft" && (
                      <button
                        onClick={() => updateStatus(d.id, "approved")}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Approve
                      </button>
                    )}
                    {d.status === "approved" && (
                      <button
                        onClick={() => updateStatus(d.id, "published")}
                        className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Publish
                      </button>
                    )}
                    <button
                      onClick={() => updateStatus(d.id, "rejected")}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs text-rose-700"
                    >
                      Reject
                    </button>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      )}

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h3 className="text-sm font-semibold text-foreground">
          Content schedule — 3 articles per week
        </h3>
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          <li><strong>Monday:</strong> Generate briefs (based on Sunday GSC sync)</li>
          <li><strong>Tuesday:</strong> Generate drafts from briefs</li>
          <li><strong>Wednesday:</strong> Review + approve + publish</li>
          <li><strong>Thursday:</strong> Generate briefs for next week</li>
          <li><strong>Friday:</strong> Review + publish second article</li>
          <li><strong>Sunday:</strong> GSC sync runs automatically (cron)</li>
        </ul>
      </section>
    </div>
  );
};

export default ContentPanel;
