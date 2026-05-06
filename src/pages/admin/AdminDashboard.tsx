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

const AdminDashboard = () => {
  const { session, isAdmin, loading } = useAuth();
  const settings = useSiteSettings();
  const [logoHeight, setLogoHeight] = useState(settings.logo_height);
  const [saving, setSaving] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const faviconRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLogoHeight(settings.logo_height);
  }, [settings.logo_height]);

  if (loading) return null;
  if (!session) return <Navigate to="/admin/login" replace />;

  const updateSetting = async (patch: Record<string, any>) => {
    const { error } = await supabase
      .from("site_settings")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", 1);
    if (error) throw error;
    await refreshSiteSettings();
  };

  const onLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    try {
      const url = await uploadFile(file, "logo");
      await updateSetting({ logo_url: url });
      toast({ title: "Logo updated" });
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
      toast({ title: "Favicon updated" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
      if (faviconRef.current) faviconRef.current.value = "";
    }
  };

  const saveSize = async () => {
    setSaving(true);
    try {
      await updateSetting({ logo_height: logoHeight });
      toast({ title: "Logo size saved" });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const resetLogo = async () => {
    setSaving(true);
    try {
      await updateSetting({ logo_url: null });
      toast({ title: "Reverted to default logo" });
    } finally {
      setSaving(false);
    }
  };

  const resetFavicon = async () => {
    setSaving(true);
    try {
      await updateSetting({ favicon_url: null });
      toast({ title: "Reverted to default favicon" });
    } finally {
      setSaving(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  return (
    <div className="page-shell max-w-3xl py-10">
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

      <fieldset disabled={!isAdmin || saving} className="mt-8 space-y-8 disabled:opacity-60">
        {/* Logo */}
        <section className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-foreground">Logo</h2>
          <p className="mt-1 text-sm text-muted-foreground">PNG or SVG. Transparent background recommended.</p>
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
                <button onClick={resetLogo} className="text-left text-xs text-muted-foreground hover:text-foreground">
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
            <div className="mt-3 flex items-end gap-3">
              <div className="flex h-20 items-center rounded-lg border border-border bg-background px-4">
                <img
                  src={settings.logo_url || "/calcy-preview-fallback"}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                  alt="Preview"
                  style={{ height: `${logoHeight}px`, width: "auto" }}
                />
              </div>
              <button
                onClick={saveSize}
                disabled={logoHeight === settings.logo_height}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-50"
              >
                Save size
              </button>
            </div>
          </div>
        </section>

        {/* Favicon */}
        <section className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-foreground">Favicon</h2>
          <p className="mt-1 text-sm text-muted-foreground">Square image, ideally 512x512 PNG.</p>
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
                <button onClick={resetFavicon} className="text-left text-xs text-muted-foreground hover:text-foreground">
                  Reset to default
                </button>
              )}
            </div>
          </div>
        </section>
      </fieldset>

      <div className="mt-8 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">← Back to site</Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
