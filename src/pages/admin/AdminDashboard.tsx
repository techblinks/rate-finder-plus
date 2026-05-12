import { useEffect, useRef, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSiteSettings, refreshSiteSettings } from "@/hooks/useSiteSettings";
import { toast } from "@/hooks/use-toast";
import LiveDataPanel from "./LiveDataPanel";
import SeoPanel from "./SeoPanel";
import ContentPanel from "./ContentPanel";
import CommandCentre from "./CommandCentre";

const BUCKET = "branding";

const uploadFile = async (file: File, prefix: string) => {
  const ext = file.name.split(".").pop() || "png";
  const path = `${prefix}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
};

type TabKey =
  | "dashboard"
  | "seo_intel"
  | "content"
  | "live_data"
  | "adsense"
  | "branding"
  | "analytics"
  | "seo";

type NavItem = { key: TabKey; label: string; icon: string };
type NavGroup = { label?: string; items: NavItem[] };

const NAV: NavGroup[] = [
  { items: [{ key: "dashboard", label: "Command Centre", icon: "⚡" }] },
  { label: "Growth", items: [
    { key: "seo_intel", label: "SEO Intelligence", icon: "📈" },
    { key: "content", label: "Content Engine", icon: "✍" },
  ]},
  { label: "Data", items: [
    { key: "live_data", label: "Live Rates", icon: "📡" },
    { key: "adsense", label: "AdSense", icon: "💰" },
  ]},
  { label: "Settings", items: [
    { key: "branding", label: "Branding", icon: "🎨" },
    { key: "analytics", label: "Analytics", icon: "📊" },
    { key: "seo", label: "SEO Settings", icon: "⚙" },
  ]},
];

const MOBILE_TABS: NavItem[] = [
  { key: "dashboard", label: "Home", icon: "⚡" },
  { key: "seo_intel", label: "SEO", icon: "📈" },
  { key: "content", label: "Content", icon: "✍" },
  { key: "live_data", label: "Rates", icon: "📡" },
  { key: "adsense", label: "AdSense", icon: "💰" },
];

const PAGE_META: Record<TabKey, { title: string; desc: string }> = {
  dashboard: { title: "Command Centre", desc: "" },
  seo_intel: { title: "SEO Intelligence", desc: "Track keyword rankings and find opportunities to reach page 1." },
  content: { title: "Content Engine", desc: "Generate SEO-optimised articles from your top keyword opportunities." },
  live_data: { title: "Live Rates", desc: "Manage rate data, FHOG amounts, LMI bands, and verify freshness." },
  adsense: { title: "AdSense", desc: "Configure ad slots and monitor revenue once approved." },
  branding: { title: "Branding", desc: "Logo, favicon, and OG image used across the site." },
  analytics: { title: "Analytics & Tracking", desc: "GA4, GTM, Facebook Pixel and custom HTML injection." },
  seo: { title: "SEO Settings", desc: "Sitewide indexing, meta defaults, and search-console verification." },
};

const fieldClass =
  "mt-1 w-full rounded-lg border border-[hsl(var(--admin-border))] bg-white px-3 py-2 text-sm text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-primary))]";

const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <div>
    <label className="text-sm font-medium text-[hsl(var(--admin-text))]">{label}</label>
    {hint && <p className="mt-0.5 text-xs text-[hsl(var(--admin-muted))]">{hint}</p>}
    {children}
  </div>
);

const Toggle = ({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) => (
  <label className="flex cursor-pointer items-start gap-3">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-4 w-4" />
    <span>
      <span className="text-sm font-medium text-[hsl(var(--admin-text))]">{label}</span>
      {hint && <span className="block text-xs text-[hsl(var(--admin-muted))]">{hint}</span>}
    </span>
  </label>
);

const AdminDashboard = () => {
  const { session, isAdmin, loading } = useAuth();
  const settings = useSiteSettings();
  const [tab, setTab] = useState<TabKey>("dashboard");
  const [logoHeight, setLogoHeight] = useState(settings.logo_height);
  const [logoHeightMobile, setLogoHeightMobile] = useState(settings.logo_height_mobile);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const logoRef = useRef<HTMLInputElement>(null);
  const faviconRef = useRef<HTMLInputElement>(null);
  const ogRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLogoHeight(settings.logo_height);
  }, [settings.logo_height]);

  useEffect(() => {
    setLogoHeightMobile(settings.logo_height_mobile);
  }, [settings.logo_height_mobile]);

  useEffect(() => { setDraft({}); }, [settings]);

  if (loading) return null;
  if (!session) return <Navigate to="/admin/login" replace />;

  const value = <K extends keyof typeof settings>(key: K) =>
    (draft[key as string] !== undefined ? draft[key as string] : settings[key]) as typeof settings[K];
  const setField = (key: string, v: unknown) => setDraft((d) => ({ ...d, [key]: v }));

  const persist = async (patch: Record<string, unknown>, label: string) => {
    setSaving(true);
    try {
      const { error } = await supabase.from("site_settings").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", 1);
      if (error) throw error;
      await refreshSiteSettings();
      toast({ title: `${label} saved` });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (patch: Record<string, unknown>) => persist(patch, "Settings");

  const onUpload = (kind: "logo" | "favicon" | "og") => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    try {
      const url = await uploadFile(file, kind);
      const patch = kind === "logo" ? { logo_url: url } : kind === "favicon" ? { favicon_url: url } : { default_og_image: url };
      await updateSetting(patch);
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
      const ref = kind === "logo" ? logoRef : kind === "favicon" ? faviconRef : ogRef;
      if (ref.current) ref.current.value = "";
    }
  };

  const saveSize = () => persist({ logo_height: logoHeight, logo_height_mobile: logoHeightMobile }, "Logo sizes");

  const saveSection = (keys: string[], label: string) => {
    const patch: Record<string, unknown> = {};
    for (const k of keys) if (k in draft) patch[k] = draft[k];
    if (Object.keys(patch).length === 0) { toast({ title: "No changes" }); return; }
    persist(patch, label);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  const adsenseStatus: "approved" | "review" | "off" =
    settings.adsense_enabled && settings.adsense_client ? "approved" :
    settings.adsense_client ? "review" : "off";

  const meta = PAGE_META[tab];

  return (
    <div className="admin-shell min-h-screen w-full">
      {/* Skip-to-content for a11y */}
      <a href="#admin-main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-sm">Skip to content</a>

      <div className="flex">
        {/* Sidebar — desktop only */}
        <aside
          className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-[hsl(var(--admin-sidebar))] text-[hsl(var(--admin-sidebar-text))] md:flex"
          aria-label="Admin navigation"
        >
          <div className="flex items-center gap-2 px-5 pt-5 pb-3">
            <span className="text-xl">🧮</span>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white">Calcy Admin</div>
              <div className="truncate text-[11px] text-[hsl(var(--admin-sidebar-muted))]">{session.user.email}</div>
            </div>
          </div>
          <div className="border-t border-white/10" />
          <nav className="flex-1 overflow-y-auto px-2 py-3">
            {NAV.map((group, gi) => (
              <div key={gi} className={gi === 0 ? "" : "mt-5"}>
                {group.label && (
                  <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--admin-sidebar-muted))]">
                    {group.label}
                  </div>
                )}
                {group.items.map((item) => {
                  const active = tab === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setTab(item.key)}
                      className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[13px] transition ${
                        active
                          ? "bg-[hsl(var(--admin-sidebar-active))] text-white font-medium"
                          : "text-[hsl(var(--admin-sidebar-text))] hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="w-4 text-center" aria-hidden>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Persistent goal tracker */}
          <div className="border-t border-white/10 px-4 py-4">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--admin-sidebar-muted))]">💰 Monthly goal</div>
            <div className="mt-1.5 flex items-baseline justify-between text-xs text-[hsl(var(--admin-sidebar-text))]">
              <span className="tnum">$0</span>
              <span className="tnum">/ $10,000</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-[hsl(var(--admin-green))]" style={{ width: "0%" }} />
            </div>
            <div className="mt-1.5 text-[10px] text-[hsl(var(--admin-sidebar-muted))]">
              AdSense: {adsenseStatus === "approved" ? "Active ✓" : adsenseStatus === "review" ? "Under review" : "Not connected"}
            </div>
          </div>

          <div className="border-t border-white/10 px-4 py-3 text-[12px]">
            <Link to="/" className="block py-1 text-[hsl(var(--admin-sidebar-text))] hover:text-white">🌐 View site ↗</Link>
            <button onClick={signOut} className="block py-1 text-[hsl(var(--admin-sidebar-muted))] hover:text-white">Sign out</button>
          </div>
        </aside>

        {/* Main */}
        <main id="admin-main" className="min-h-screen flex-1 md:ml-60 pb-24 md:pb-8">
          {/* Mobile top bar */}
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[hsl(var(--admin-border))] bg-white px-4 py-3 md:hidden">
            <div className="flex items-center gap-2">
              <span>🧮</span>
              <span className="text-sm font-semibold text-[hsl(var(--admin-text))]">Calcy Admin</span>
            </div>
            <button onClick={signOut} className="text-xs text-[hsl(var(--admin-muted))]">Sign out</button>
          </header>

          <div className="px-5 py-6 md:px-8 md:py-8">
            {!isAdmin && (
              <div className="mb-5 rounded-xl border-l-4 border-[hsl(var(--admin-amber))] bg-[hsl(var(--admin-amber-light))] p-4 text-sm text-[hsl(var(--admin-text))]">
                <strong>Awaiting admin access.</strong> Your account exists but doesn't have the admin role yet. Your user ID:
                <code className="ml-1 rounded bg-white px-1.5 py-0.5 text-xs">{session.user.id}</code>
              </div>
            )}

            {/* Page header (skip for command centre — has its own) */}
            {tab !== "dashboard" && (
              <header className="mb-6">
                <h1 className="admin-page-title">{meta.title}</h1>
                {meta.desc && <p className="mt-1 text-sm text-[hsl(var(--admin-muted))]">{meta.desc}</p>}
              </header>
            )}

            <fieldset disabled={!isAdmin || saving} className="space-y-6 disabled:opacity-60">
              {tab === "dashboard" && <CommandCentre onNavigate={(k) => setTab(k as TabKey)} />}
              {tab === "content" && <ContentPanel />}
              {tab === "seo_intel" && <SeoPanel />}
              {tab === "live_data" && <LiveDataPanel />}

              {tab === "adsense" && (
                <div className="space-y-5">
                  {/* Revenue status hero */}
                  <section className="admin-card p-6" style={{ borderLeft: "4px solid hsl(var(--admin-green))" }}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h2 className="text-base font-semibold text-[hsl(var(--admin-text))]">💰 AdSense Revenue</h2>
                      <span className={`text-xs font-semibold ${adsenseStatus === "approved" ? "text-[hsl(var(--admin-green))]" : adsenseStatus === "review" ? "text-[hsl(var(--admin-amber))]" : "text-[hsl(var(--admin-muted))]"}`}>
                        Status: {adsenseStatus === "approved" ? "ACTIVE ✓" : adsenseStatus === "review" ? "UNDER REVIEW ⏳" : "NOT CONFIGURED"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[hsl(var(--admin-muted))]">
                      Publisher ID: <code className="font-mono text-[hsl(var(--admin-text))]">{settings.adsense_client || "—"}</code>
                    </p>
                    {adsenseStatus !== "approved" && (
                      <div className="mt-3 rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] p-4 text-sm text-[hsl(var(--admin-muted))]">
                        📊 No earnings data yet. Once approved, daily and monthly earnings will appear here.
                        <br />Estimated RPM for finance/mortgage: $20–40 AUD.
                      </div>
                    )}
                  </section>

                  {/* Configuration */}
                  <section className="admin-card p-6 space-y-5">
                    <h3 className="text-sm font-semibold text-[hsl(var(--admin-text))]">Global settings</h3>
                    <Toggle label="Enable AdSense site-wide" checked={value("adsense_enabled") as boolean} onChange={(v) => setField("adsense_enabled", v)} hint="Loads adsbygoogle.js and renders configured slots." />
                    <Toggle label="Enable Auto Ads" checked={value("adsense_auto_ads") as boolean} onChange={(v) => setField("adsense_auto_ads", v)} hint="Lets Google auto-place ads in addition to your manual slots." />
                    <Field label="Publisher Client ID" hint="Format: ca-pub-XXXXXXXXXXXXXXXX">
                      <input className={fieldClass} placeholder="ca-pub-..." value={(value("adsense_client") as string) ?? ""} onChange={(e) => setField("adsense_client", e.target.value || null)} />
                    </Field>
                  </section>

                  <section className="admin-card p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-[hsl(var(--admin-text))]">Ad slots</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {([
                        ["adsense_slot_header", "slot_header_enabled", "Header slot"],
                        ["adsense_slot_inline", "slot_inline_enabled", "Inline slot"],
                        ["adsense_slot_sidebar", "slot_sidebar_enabled", "Sidebar slot"],
                        ["adsense_slot_sticky_mobile", "slot_sticky_mobile_enabled", "Sticky mobile"],
                      ] as const).map(([idKey, enabledKey, label]) => (
                        <div key={idKey} className="rounded-lg border border-[hsl(var(--admin-border))] p-3">
                          <Toggle label={label} checked={value(enabledKey) as boolean} onChange={(v) => setField(enabledKey, v)} />
                          <input className={`${fieldClass} mt-2`} placeholder="Slot ID" value={(value(idKey) as string) ?? ""} onChange={(e) => setField(idKey, e.target.value || null)} />
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="admin-card p-6 space-y-3">
                    <h3 className="text-sm font-semibold text-[hsl(var(--admin-text))]">Verification</h3>
                    <Field label="ads.txt content" hint="Served at /ads.txt. One line per record.">
                      <textarea className={`${fieldClass} font-mono text-xs`} rows={4} placeholder="google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0"
                        value={(value("ads_txt") as string) ?? ""} onChange={(e) => setField("ads_txt", e.target.value || null)} />
                    </Field>
                  </section>

                  <button
                    onClick={() => saveSection([
                      "adsense_enabled","adsense_auto_ads","adsense_client",
                      "adsense_slot_header","adsense_slot_inline","adsense_slot_sidebar","adsense_slot_sticky_mobile",
                      "slot_header_enabled","slot_inline_enabled","slot_sidebar_enabled","slot_sticky_mobile_enabled","ads_txt",
                    ], "AdSense")}
                    className="rounded-lg bg-[hsl(var(--admin-primary))] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                  >
                    Save AdSense
                  </button>
                </div>
              )}

              {tab === "branding" && (
                <div className="space-y-5">
                  <section className="admin-card p-6">
                    <h2 className="text-base font-semibold text-[hsl(var(--admin-text))]">Logo</h2>
                    <p className="mt-1 text-sm text-[hsl(var(--admin-muted))]">PNG or SVG. Transparent background recommended.</p>
                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex h-20 w-48 items-center justify-center rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] p-2">
                        {settings.logo_url ? <img src={settings.logo_url} alt="Current logo" className="max-h-full max-w-full" /> : <span className="text-xs text-[hsl(var(--admin-muted))]">Default logo</span>}
                      </div>
                      <div className="flex flex-col gap-2">
                        <input ref={logoRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" onChange={onUpload("logo")} className="text-sm" />
                        {settings.logo_url && (
                          <button onClick={() => updateSetting({ logo_url: null })} className="text-left text-xs text-[hsl(var(--admin-muted))] hover:text-[hsl(var(--admin-text))]">Reset to default</button>
                        )}
                      </div>
                    </div>
                    <div className="mt-6 space-y-4">
                      <div>
                        <label className="text-sm font-medium text-[hsl(var(--admin-text))]">Desktop logo height: <span className="tnum">{logoHeight}px</span></label>
                        <input type="range" min={20} max={72} step={1} value={logoHeight} onChange={(e) => setLogoHeight(Number(e.target.value))} className="mt-2 w-full" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-[hsl(var(--admin-text))]">Mobile logo height: <span className="tnum">{logoHeightMobile}px</span></label>
                        <input type="range" min={20} max={60} step={1} value={logoHeightMobile} onChange={(e) => setLogoHeightMobile(Number(e.target.value))} className="mt-2 w-full" />
                      </div>
                      <button onClick={saveSize} disabled={saving || (logoHeight === settings.logo_height && logoHeightMobile === settings.logo_height_mobile)}
                        className="rounded-lg bg-[hsl(var(--admin-primary))] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Save sizes</button>
                    </div>
                  </section>

                  <section className="admin-card p-6">
                    <h2 className="text-base font-semibold text-[hsl(var(--admin-text))]">Favicon</h2>
                    <p className="mt-1 text-sm text-[hsl(var(--admin-muted))]">Square image, ideally 512×512 PNG.</p>
                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] p-2">
                        {settings.favicon_url ? <img src={settings.favicon_url} alt="Current favicon" className="max-h-full max-w-full" /> : <span className="text-[10px] text-[hsl(var(--admin-muted))]">Default</span>}
                      </div>
                      <div className="flex flex-col gap-2">
                        <input ref={faviconRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp,image/x-icon" onChange={onUpload("favicon")} className="text-sm" />
                        {settings.favicon_url && (
                          <button onClick={() => updateSetting({ favicon_url: null })} className="text-left text-xs text-[hsl(var(--admin-muted))] hover:text-[hsl(var(--admin-text))]">Reset to default</button>
                        )}
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {tab === "analytics" && (
                <section className="admin-card p-6 space-y-5">
                  <Field label="Google Analytics 4 Measurement ID" hint="Format: G-XXXXXXX">
                    <input className={fieldClass} placeholder="G-XXXXXXX" value={(value("ga4_id") as string) ?? ""} onChange={(e) => setField("ga4_id", e.target.value || null)} />
                  </Field>
                  <Field label="Google Tag Manager ID" hint="Format: GTM-XXXXXX (optional)">
                    <input className={fieldClass} placeholder="GTM-XXXXXX" value={(value("gtm_id") as string) ?? ""} onChange={(e) => setField("gtm_id", e.target.value || null)} />
                  </Field>
                  <Field label="Facebook Pixel ID" hint="15–16 digit numeric ID (optional)">
                    <input className={fieldClass} placeholder="123456789012345" value={(value("fb_pixel_id") as string) ?? ""} onChange={(e) => setField("fb_pixel_id", e.target.value || null)} />
                  </Field>
                  <Field label="Custom <head> HTML" hint="Pasted into <head>. Allowed: <script>, <meta>, <link>, <style>, <noscript>.">
                    <textarea className={`${fieldClass} font-mono text-xs`} rows={5} placeholder='<meta name="example" content="value" />'
                      value={(value("head_html") as string) ?? ""} onChange={(e) => setField("head_html", e.target.value || null)} />
                  </Field>
                  <Field label="Custom <body> HTML" hint="Injected before </body>. Useful for Microsoft Clarity, Hotjar, etc.">
                    <textarea className={`${fieldClass} font-mono text-xs`} rows={5}
                      value={(value("body_html") as string) ?? ""} onChange={(e) => setField("body_html", e.target.value || null)} />
                  </Field>
                  <button onClick={() => saveSection(["ga4_id","gtm_id","fb_pixel_id","head_html","body_html"], "Analytics")}
                    className="rounded-lg bg-[hsl(var(--admin-primary))] px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
                    Save analytics
                  </button>
                </section>
              )}

              {tab === "seo" && (
                <section className="admin-card p-6 space-y-5">
                  <Toggle label="Allow search engines to index this site" checked={value("indexing_enabled") as boolean} onChange={(v) => setField("indexing_enabled", v)} hint="Disable to add a noindex,nofollow tag site-wide (e.g. for staging)." />
                  <Field label="Title template" hint="Use %s for the page title. Default: %s | Calcy">
                    <input className={fieldClass} placeholder="%s | Calcy" value={(value("title_template") as string) ?? ""} onChange={(e) => setField("title_template", e.target.value || "%s | Calcy")} />
                  </Field>
                  <Field label="Default meta description" hint="Used when a page does not provide one.">
                    <textarea className={fieldClass} rows={2} value={(value("default_meta_description") as string) ?? ""} onChange={(e) => setField("default_meta_description", e.target.value || null)} />
                  </Field>
                  <Field label="Default OG / social share image" hint="Recommended 1200×630 PNG/JPG.">
                    <div className="mt-2 flex items-center gap-4">
                      <div className="flex h-20 w-36 items-center justify-center overflow-hidden rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))]">
                        {settings.default_og_image ? <img src={settings.default_og_image} alt="OG preview" className="h-full w-full object-cover" /> : <span className="text-xs text-[hsl(var(--admin-muted))]">Default icon</span>}
                      </div>
                      <div className="flex flex-col gap-2">
                        <input ref={ogRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={onUpload("og")} className="text-sm" />
                        {settings.default_og_image && (
                          <button onClick={() => updateSetting({ default_og_image: null })} className="text-left text-xs text-[hsl(var(--admin-muted))] hover:text-[hsl(var(--admin-text))]">Remove</button>
                        )}
                      </div>
                    </div>
                  </Field>
                  <Field label="Google Search Console verification token" hint="content of google-site-verification meta">
                    <input className={fieldClass} value={(value("gsc_verification") as string) ?? ""} onChange={(e) => setField("gsc_verification", e.target.value || null)} />
                  </Field>
                  <Field label="Bing Webmaster verification token" hint="msvalidate.01 content">
                    <input className={fieldClass} value={(value("bing_verification") as string) ?? ""} onChange={(e) => setField("bing_verification", e.target.value || null)} />
                  </Field>
                  <Field label="robots.txt content" hint="Stored for reference. Static /robots.txt continues to be served from public/robots.txt at build time.">
                    <textarea className={`${fieldClass} font-mono text-xs`} rows={5} value={(value("robots_txt") as string) ?? ""} onChange={(e) => setField("robots_txt", e.target.value || null)} />
                  </Field>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => saveSection(["indexing_enabled","title_template","default_meta_description","gsc_verification","bing_verification","robots_txt"], "SEO")}
                      className="rounded-lg bg-[hsl(var(--admin-primary))] px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
                      Save SEO
                    </button>
                    <button
                      onClick={async () => {
                        const { runRuntimeSeoCheck } = await import("@/lib/seoCheck");
                        const r = runRuntimeSeoCheck();
                        const msg = r.ok
                          ? `✅ SEO check passed${r.warnings.length ? ` (${r.warnings.length} warning${r.warnings.length === 1 ? "" : "s"})` : ""}`
                          : `❌ ${r.errors.length} error${r.errors.length === 1 ? "" : "s"}:\n• ${r.errors.join("\n• ")}`;
                        alert(msg + (r.warnings.length ? `\n\nWarnings:\n• ${r.warnings.join("\n• ")}` : ""));
                      }}
                      className="rounded-lg border border-[hsl(var(--admin-border))] bg-white px-4 py-2 text-sm font-semibold text-[hsl(var(--admin-text))] hover:bg-[hsl(var(--admin-bg))]">
                      Run SEO check
                    </button>
                  </div>
                </section>
              )}
            </fieldset>
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-[hsl(var(--admin-border))] bg-white shadow-lg md:hidden safe-pb" aria-label="Admin sections">
        {MOBILE_TABS.map((item) => {
          const active = tab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium ${
                active ? "text-[hsl(var(--admin-primary))]" : "text-[hsl(var(--admin-muted))]"
              }`}
              style={{ minHeight: 56 }}
            >
              <span className="text-lg" aria-hidden>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminDashboard;
