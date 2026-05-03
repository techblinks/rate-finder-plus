import { useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { seoPages, TYPE_LABELS } from "@/data/seo/seoPages";
import {
  loadAdminConfig,
  saveAdminConfig,
  ADMIN_KEY_PARAM,
  ADMIN_KEY_VALUE,
  type AdminConfig,
} from "@/data/seo/adminConfig";
import SEOHead from "@/components/SEOHead";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

const SeoAdmin = () => {
  const [params] = useSearchParams();
  const ok = params.get(ADMIN_KEY_PARAM) === ADMIN_KEY_VALUE;

  const [cfg, setCfg] = useState<AdminConfig>(() => loadAdminConfig());
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return seoPages;
    return seoPages.filter(
      (p) =>
        p.slug.toLowerCase().includes(q) ||
        (p.city ?? "").toLowerCase().includes(q) ||
        (p.topicLabel ?? "").toLowerCase().includes(q),
    );
  }, [filter]);

  const update = (slug: string, patch: Partial<AdminConfig[string]>) => {
    setCfg((prev) => ({ ...prev, [slug]: { ...(prev[slug] ?? {}), ...patch } }));
  };

  const persist = () => {
    saveAdminConfig(cfg);
    alert("Saved admin overrides locally.");
  };

  if (!ok) {
    return (
      <>
        <SEOHead
          title="SEO Admin — Zune Calculator"
          description="Restricted admin panel."
          canonical="/seo/admin"
          robots="noindex, nofollow"
        />
        <div className="container py-16 text-center">
          <h1 className="text-3xl font-bold mb-3">Restricted</h1>
          <p className="text-muted-foreground">Append <code>?key=...</code> to access this panel.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="SEO Admin Panel — Zune Calculator"
        description="Manage programmatic SEO pages."
        canonical="/seo/admin"
        robots="noindex, nofollow"
      />
      <div className="container py-8 max-w-5xl">
        <header className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-3xl text-foreground">SEO Admin</h1>
            <p className="text-sm text-muted-foreground">{seoPages.length} programmatic pages registered.</p>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Filter by slug, city or topic"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-64"
            />
            <Button onClick={persist}>Save changes</Button>
          </div>
        </header>

        <div className="space-y-3">
          {filtered.map((p) => {
            const o = cfg[p.slug] ?? {};
            const enabled = o.enabled ?? p.enabled;
            return (
              <div key={p.slug} className="premium-card p-4 md:p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                  <div>
                    <Link to={`/seo/${p.slug}`} className="font-semibold text-foreground hover:text-primary">
                      /seo/{p.slug}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1">
                      {p.country.toUpperCase()} · {TYPE_LABELS[p.type]} {p.city ? `· ${p.city}` : p.topicLabel ? `· ${p.topicLabel}` : ""}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <span>Enabled</span>
                    <Switch
                      checked={enabled}
                      onCheckedChange={(v) => update(p.slug, { enabled: v })}
                    />
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    placeholder="Override SEO title"
                    value={o.title ?? ""}
                    onChange={(e) => update(p.slug, { title: e.target.value })}
                  />
                  <Input
                    placeholder="Override affiliate URL"
                    value={o.affiliateUrl ?? ""}
                    onChange={(e) => update(p.slug, { affiliateUrl: e.target.value })}
                  />
                  <Textarea
                    placeholder="Override meta description"
                    value={o.description ?? ""}
                    onChange={(e) => update(p.slug, { description: e.target.value })}
                    className="md:col-span-2"
                  />
                  <Textarea
                    placeholder="AdSense / ad snippet HTML"
                    value={o.adSnippet ?? ""}
                    onChange={(e) => update(p.slug, { adSnippet: e.target.value })}
                    className="md:col-span-2 font-mono text-xs"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default SeoAdmin;
