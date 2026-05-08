import { useEffect, useRef, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSiteSettings, refreshSiteSettings } from "@/hooks/useSiteSettings";
import { toast } from "@/hooks/use-toast";

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

type TabKey = "branding" | "analytics" | "adsense" | "seo" | "live_data";

const TABS: { key: TabKey; label: string }[] = [
  { key: "branding", label: "Branding" },
  { key: "analytics", label: "Analytics & Tracking" },
  { key: "adsense", label: "AdSense" },
  { key: "seo", label: "SEO" },
  { key: "live_data", label: "Live Data" },
];

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent";

const Field = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className="text-sm font-medium text-foreground">{label}</label>
    {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    {children}
  </div>
);

const Toggle = ({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) => (
  <label className="flex cursor-pointer items-start gap-3">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="mt-1 h-4 w-4"
    />
    <span>
      <span className="text-sm font-medium text-foreground">{label}</span>
      {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
    </span>
  </label>
);

const AdminDashboard = () => {
  const { session, isAdmin, loading } = useAuth();
  const settings = useSiteSettings();
  const [tab, setTab] = useState<TabKey>("branding");
  const [logoHeight, setLogoHeight] = useState(settings.logo_height);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const logoRef = useRef<HTMLInputElement>(null);
  const faviconRef = useRef<HTMLInputElement>(null);
  const ogRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLogoHeight(settings.logo_height);
  }, [settings.logo_height]);

  // Reset draft whenever settings change from server (so we show latest values).
  useEffect(() => {
    setDraft({});
  }, [settings]);

  if (loading) return null;
  if (!session) return <Navigate to="/admin/login" replace />;

  const value = <K extends keyof typeof settings>(key: K) =>
    (draft[key as string] !== undefined ? draft[key as string] : settings[key]) as typeof settings[K];

  const setField = (key: string, v: unknown) => setDraft((d) => ({ ...d, [key]: v }));

  const persist = async (patch: Record<string, unknown>, label: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", 1);
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

  const onLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    try {
      const url = await uploadFile(file, "logo");
      await updateSetting({ logo_url: url });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
      if (logoRef.current) logoRef.current.value = "";
    }
  };

  const onFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    try {
      const url = await uploadFile(file, "favicon");
      await updateSetting({ favicon_url: url });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
      if (faviconRef.current) faviconRef.current.value = "";
    }
  };

  const onOgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    try {
      const url = await uploadFile(file, "og");
      await updateSetting({ default_og_image: url });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
      if (ogRef.current) ogRef.current.value = "";
    }
  };

  const saveSize = () => persist({ logo_height: logoHeight }, "Logo size");

  const saveSection = (keys: string[], label: string) => {
    const patch: Record<string, unknown> = {};
    for (const k of keys) if (k in draft) patch[k] = draft[k];
    if (Object.keys(patch).length === 0) {
      toast({ title: "No changes" });
      return;
    }
    persist(patch, label);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  return (
    <div className="page-shell max-w-4xl py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin</h1>
          <p className="text-sm text-muted-foreground">Signed in as {session.user.email}</p>
        </div>
        <button onClick={signOut} className="text-sm text-muted-foreground hover:text-foreground">
          Sign out
        </button>
      </div>

      {!isAdmin && (
        <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Awaiting admin access.</strong> Your account exists but doesn't have the admin
          role yet. The project owner needs to grant it. Your user ID:
          <code className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-xs">{session.user.id}</code>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? "border-accent text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <fieldset disabled={!isAdmin || saving} className="mt-6 space-y-8 disabled:opacity-60">
        {tab === "branding" && (
          <>
            <section className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="text-lg font-semibold text-foreground">Logo</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                PNG or SVG. Transparent background recommended.
              </p>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-20 w-48 items-center justify-center rounded-lg border border-border bg-background p-2">
                  {settings.logo_url ? (
                    <img src={settings.logo_url} alt="Current logo" className="max-h-full max-w-full" />
                  ) : (
                    <span className="text-xs text-muted-foreground">Default logo</span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    ref={logoRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    onChange={onLogoUpload}
                    className="text-sm"
                  />
                  {settings.logo_url && (
                    <button
                      onClick={() => updateSetting({ logo_url: null })}
                      className="text-left text-xs text-muted-foreground hover:text-foreground"
                    >
                      Reset to default
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label className="text-sm font-medium text-foreground">
                  Logo height: <span className="tnum">{logoHeight}px</span>
                </label>
                <input
                  type="range"
                  min={20}
                  max={72}
                  step={1}
                  value={logoHeight}
                  onChange={(e) => setLogoHeight(Number(e.target.value))}
                  className="mt-2 w-full"
                />
                <button
                  onClick={saveSize}
                  disabled={logoHeight === settings.logo_height}
                  className="mt-3 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-50"
                >
                  Save size
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="text-lg font-semibold text-foreground">Favicon</h2>
              <p className="mt-1 text-sm text-muted-foreground">Square image, ideally 512×512 PNG.</p>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-border bg-background p-2">
                  {settings.favicon_url ? (
                    <img src={settings.favicon_url} alt="Current favicon" className="max-h-full max-w-full" />
                  ) : (
                    <span className="text-[10px] text-muted-foreground">Default</span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    ref={faviconRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp,image/x-icon"
                    onChange={onFaviconUpload}
                    className="text-sm"
                  />
                  {settings.favicon_url && (
                    <button
                      onClick={() => updateSetting({ favicon_url: null })}
                      className="text-left text-xs text-muted-foreground hover:text-foreground"
                    >
                      Reset to default
                    </button>
                  )}
                </div>
              </div>
            </section>
          </>
        )}

        {tab === "analytics" && (
          <section className="rounded-2xl border border-border bg-surface p-6 space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Analytics & Tracking</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                IDs are loaded into the page at runtime. Updates take effect after a refresh.
              </p>
            </div>

            <Field label="Google Analytics 4 Measurement ID" hint="Format: G-XXXXXXX">
              <input
                className={fieldClass}
                placeholder="G-XXXXXXX"
                value={(value("ga4_id") as string) ?? ""}
                onChange={(e) => setField("ga4_id", e.target.value || null)}
              />
            </Field>

            <Field label="Google Tag Manager ID" hint="Format: GTM-XXXXXX (optional)">
              <input
                className={fieldClass}
                placeholder="GTM-XXXXXX"
                value={(value("gtm_id") as string) ?? ""}
                onChange={(e) => setField("gtm_id", e.target.value || null)}
              />
            </Field>

            <Field label="Facebook Pixel ID" hint="15–16 digit numeric ID (optional)">
              <input
                className={fieldClass}
                placeholder="123456789012345"
                value={(value("fb_pixel_id") as string) ?? ""}
                onChange={(e) => setField("fb_pixel_id", e.target.value || null)}
              />
            </Field>

            <Field
              label="Custom <head> HTML"
              hint="Pasted into <head>. Allowed: <script>, <meta>, <link>, <style>, <noscript>."
            >
              <textarea
                className={`${fieldClass} font-mono text-xs`}
                rows={5}
                placeholder='<meta name="example" content="value" />'
                value={(value("head_html") as string) ?? ""}
                onChange={(e) => setField("head_html", e.target.value || null)}
              />
            </Field>

            <Field
              label="Custom <body> HTML"
              hint="Injected before </body>. Useful for Microsoft Clarity, Hotjar, etc."
            >
              <textarea
                className={`${fieldClass} font-mono text-xs`}
                rows={5}
                value={(value("body_html") as string) ?? ""}
                onChange={(e) => setField("body_html", e.target.value || null)}
              />
            </Field>

            <button
              onClick={() =>
                saveSection(
                  ["ga4_id", "gtm_id", "fb_pixel_id", "head_html", "body_html"],
                  "Analytics",
                )
              }
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
            >
              Save analytics
            </button>
          </section>
        )}

        {tab === "adsense" && (
          <section className="rounded-2xl border border-border bg-surface p-6 space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Google AdSense</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Master switch and per-slot IDs. Disabled slots show the layout placeholder.
              </p>
            </div>

            <Toggle
              label="Enable AdSense site-wide"
              checked={value("adsense_enabled") as boolean}
              onChange={(v) => setField("adsense_enabled", v)}
              hint="Loads adsbygoogle.js and renders configured slots."
            />
            <Toggle
              label="Enable Auto Ads"
              checked={value("adsense_auto_ads") as boolean}
              onChange={(v) => setField("adsense_auto_ads", v)}
              hint="Lets Google auto-place ads in addition to your manual slots."
            />

            <Field label="Publisher Client ID" hint="Format: ca-pub-XXXXXXXXXXXXXXXX">
              <input
                className={fieldClass}
                placeholder="ca-pub-..."
                value={(value("adsense_client") as string) ?? ""}
                onChange={(e) => setField("adsense_client", e.target.value || null)}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["adsense_slot_header", "slot_header_enabled", "Header slot"],
                  ["adsense_slot_inline", "slot_inline_enabled", "Inline slot"],
                  ["adsense_slot_sidebar", "slot_sidebar_enabled", "Sidebar slot"],
                  ["adsense_slot_sticky_mobile", "slot_sticky_mobile_enabled", "Sticky mobile"],
                ] as const
              ).map(([idKey, enabledKey, label]) => (
                <div key={idKey} className="rounded-lg border border-border p-3">
                  <Toggle
                    label={label}
                    checked={value(enabledKey) as boolean}
                    onChange={(v) => setField(enabledKey, v)}
                  />
                  <input
                    className={`${fieldClass} mt-2`}
                    placeholder="Slot ID"
                    value={(value(idKey) as string) ?? ""}
                    onChange={(e) => setField(idKey, e.target.value || null)}
                  />
                </div>
              ))}
            </div>

            <Field
              label="ads.txt content"
              hint="Served at /ads.txt. One line per record (e.g. google.com, pub-..., DIRECT, ...)."
            >
              <textarea
                className={`${fieldClass} font-mono text-xs`}
                rows={4}
                placeholder="google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0"
                value={(value("ads_txt") as string) ?? ""}
                onChange={(e) => setField("ads_txt", e.target.value || null)}
              />
            </Field>

            <button
              onClick={() =>
                saveSection(
                  [
                    "adsense_enabled",
                    "adsense_auto_ads",
                    "adsense_client",
                    "adsense_slot_header",
                    "adsense_slot_inline",
                    "adsense_slot_sidebar",
                    "adsense_slot_sticky_mobile",
                    "slot_header_enabled",
                    "slot_inline_enabled",
                    "slot_sidebar_enabled",
                    "slot_sticky_mobile_enabled",
                    "ads_txt",
                  ],
                  "AdSense",
                )
              }
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
            >
              Save AdSense
            </button>
          </section>
        )}

        {tab === "seo" && (
          <section className="rounded-2xl border border-border bg-surface p-6 space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-foreground">SEO & Indexing</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Defaults applied across the site. Per-page metadata still wins.
              </p>
            </div>

            <Toggle
              label="Allow search engines to index this site"
              checked={value("indexing_enabled") as boolean}
              onChange={(v) => setField("indexing_enabled", v)}
              hint="Disable to add a noindex,nofollow tag site-wide (e.g. for staging)."
            />

            <Field label="Title template" hint="Use %s for the page title. Default: %s | Calcy">
              <input
                className={fieldClass}
                placeholder="%s | Calcy"
                value={(value("title_template") as string) ?? ""}
                onChange={(e) => setField("title_template", e.target.value || "%s | Calcy")}
              />
            </Field>

            <Field label="Default meta description" hint="Used when a page does not provide one.">
              <textarea
                className={fieldClass}
                rows={2}
                value={(value("default_meta_description") as string) ?? ""}
                onChange={(e) => setField("default_meta_description", e.target.value || null)}
              />
            </Field>

            <Field label="Default OG / social share image" hint="Recommended 1200×630 PNG/JPG.">
              <div className="mt-2 flex items-center gap-4">
                <div className="flex h-20 w-36 items-center justify-center overflow-hidden rounded-lg border border-border bg-background">
                  {settings.default_og_image ? (
                    <img src={settings.default_og_image} alt="OG preview" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs text-muted-foreground">Default icon</span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    ref={ogRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={onOgUpload}
                    className="text-sm"
                  />
                  {settings.default_og_image && (
                    <button
                      onClick={() => updateSetting({ default_og_image: null })}
                      className="text-left text-xs text-muted-foreground hover:text-foreground"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </Field>

            <Field label="Google Search Console verification token" hint="content of google-site-verification meta">
              <input
                className={fieldClass}
                value={(value("gsc_verification") as string) ?? ""}
                onChange={(e) => setField("gsc_verification", e.target.value || null)}
              />
            </Field>

            <Field label="Bing Webmaster verification token" hint="msvalidate.01 content">
              <input
                className={fieldClass}
                value={(value("bing_verification") as string) ?? ""}
                onChange={(e) => setField("bing_verification", e.target.value || null)}
              />
            </Field>

            <Field
              label="robots.txt content"
              hint="Stored for reference. Static /robots.txt continues to be served from public/robots.txt at build time."
            >
              <textarea
                className={`${fieldClass} font-mono text-xs`}
                rows={5}
                value={(value("robots_txt") as string) ?? ""}
                onChange={(e) => setField("robots_txt", e.target.value || null)}
              />
            </Field>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() =>
                  saveSection(
                    [
                      "indexing_enabled",
                      "title_template",
                      "default_meta_description",
                      "gsc_verification",
                      "bing_verification",
                      "robots_txt",
                    ],
                    "SEO",
                  )
                }
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
              >
                Save SEO
              </button>
              <button
                onClick={async () => {
                  const { runRuntimeSeoCheck } = await import("@/lib/seoCheck");
                  const r = runRuntimeSeoCheck();
                  const msg = r.ok
                    ? `✅ SEO check passed${r.warnings.length ? ` (${r.warnings.length} warning${r.warnings.length === 1 ? "" : "s"})` : ""}`
                    : `❌ ${r.errors.length} error${r.errors.length === 1 ? "" : "s"}:\n• ${r.errors.join("\n• ")}`;
                  alert(
                    msg +
                      (r.warnings.length ? `\n\nWarnings:\n• ${r.warnings.join("\n• ")}` : "") +
                      `\n\nFull regression suite: run \`npm run test:seo\` after build.`,
                  );
                }}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
              >
                Run SEO check
              </button>
            </div>
          </section>
        )}
      </fieldset>

      <div className="mt-8 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">← Back to site</Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
