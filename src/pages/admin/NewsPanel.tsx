import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  is_published: boolean;
  published_at: string | null;
  author: string;
  created_at: string;
}

const truncate = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

const formatDate = (iso?: string | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

const NewsPanel = () => {
  const [items, setItems] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<NewsArticle | null>(null);
  const [form, setForm] = useState<{ title: string; excerpt: string; body: string }>({
    title: "",
    excerpt: "",
    body: "",
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("news_articles")
      .select("*")
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Failed to load articles", description: error.message, variant: "destructive" });
    } else {
      setItems((data || []) as NewsArticle[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openEdit = (a: NewsArticle) => {
    setEditing(a);
    setForm({
      title: a.title,
      excerpt: a.excerpt || "",
      body: a.body || "",
    });
  };

  const closeEdit = () => {
    setEditing(null);
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const { error } = await supabase
      .from("news_articles")
      .update({
        title: form.title,
        excerpt: form.excerpt || null,
        body: form.body || null,
      })
      .eq("id", editing.id);
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Article saved" });
    closeEdit();
    load();
  };

  const togglePublish = async (a: NewsArticle) => {
    const next = !a.is_published;
    const patch: { is_published: boolean; published_at?: string } = { is_published: next };
    if (next && !a.published_at) patch.published_at = new Date().toISOString();
    const { error } = await supabase.from("news_articles").update(patch).eq("id", a.id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: next ? "Published" : "Unpublished" });
    load();
  };

  return (
    <div className="space-y-4">
      <section className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[hsl(var(--admin-bg))] text-left text-xs uppercase tracking-wide text-[hsl(var(--admin-muted))]">
              <tr>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Published</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-[hsl(var(--admin-muted))]">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-[hsl(var(--admin-muted))]">
                    No articles yet.
                  </td>
                </tr>
              )}
              {items.map((a) => (
                <tr key={a.id} className="border-t border-[hsl(var(--admin-border))]">
                  <td className="px-4 py-3 text-[hsl(var(--admin-text))]">{truncate(a.title, 60)}</td>
                  <td className="px-4 py-3 text-[hsl(var(--admin-muted))]">{formatDate(a.published_at)}</td>
                  <td className="px-4 py-3">
                    {a.is_published ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                        Live
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(a)}
                        className="rounded-md bg-[hsl(var(--admin-primary))] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                      >
                        Edit
                      </button>
                      <a
                        href={`/news/${a.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md border border-[hsl(var(--admin-border))] bg-white px-3 py-1.5 text-xs font-semibold text-[hsl(var(--admin-text))] hover:bg-[hsl(var(--admin-bg))]"
                      >
                        View ↗
                      </a>
                      <button
                        onClick={() => togglePublish(a)}
                        className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                          a.is_published
                            ? "border border-[hsl(var(--admin-border))] bg-white text-[hsl(var(--admin-text))] hover:bg-[hsl(var(--admin-bg))]"
                            : "bg-emerald-600 text-white hover:opacity-90"
                        }`}
                      >
                        {a.is_published ? "Unpublish" : "Publish"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-8"
          onClick={closeEdit}
        >
          <div
            className="w-full max-w-3xl rounded-xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[hsl(var(--admin-border))] px-5 py-4">
              <h2 className="text-base font-semibold text-[hsl(var(--admin-text))]">Edit article</h2>
              <button
                onClick={closeEdit}
                className="text-sm text-[hsl(var(--admin-muted))] hover:text-[hsl(var(--admin-text))]"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 px-5 py-4">
              <div>
                <label className="text-sm font-medium text-[hsl(var(--admin-text))]">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-[hsl(var(--admin-border))] bg-white px-3 py-2 text-sm text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-primary))]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[hsl(var(--admin-text))]">Excerpt</label>
                <textarea
                  rows={3}
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-[hsl(var(--admin-border))] bg-white px-3 py-2 text-sm text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-primary))]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[hsl(var(--admin-text))]">Body (HTML)</label>
                <textarea
                  rows={20}
                  value={form.body}
                  onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-[hsl(var(--admin-border))] bg-white px-3 py-2 font-mono text-xs text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-primary))]"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-[hsl(var(--admin-border))] px-5 py-4">
              <button
                onClick={closeEdit}
                disabled={saving}
                className="rounded-lg border border-[hsl(var(--admin-border))] bg-white px-4 py-2 text-sm font-semibold text-[hsl(var(--admin-text))] hover:bg-[hsl(var(--admin-bg))] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="rounded-lg bg-[hsl(var(--admin-primary))] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsPanel;
