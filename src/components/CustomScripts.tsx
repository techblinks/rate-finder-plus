import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { isSafeHtmlUrl } from "@/lib/safeHtml";

/**
 * Injects admin-managed verification meta tags and custom head/body HTML
 * snippets at runtime. The site-wide "noindex" robots meta is also emitted
 * here when indexing is disabled — kept separate from per-page SeoHead so
 * we never strip a page's own canonical/og tags.
 *
 * Custom HTML is restricted to a strict tag allowlist (script/meta/link/
 * noscript/style) before insertion. RLS already restricts writes to admins,
 * but we still guard against accidental tag injection in unexpected places.
 */
const ALLOWED_TAGS = ["SCRIPT", "META", "LINK", "NOSCRIPT", "STYLE"];
const URL_ATTRS = new Set(["href", "src"]);

function appendSanitised(target: HTMLElement, html: string, marker: string) {
  // Remove any previously injected nodes from this marker so updates replace.
  target.querySelectorAll(`[data-injected="${marker}"]`).forEach((n) => n.remove());

  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  tpl.content.querySelectorAll("*").forEach((node) => {
    if (!ALLOWED_TAGS.includes(node.tagName)) {
      node.remove();
      return;
    }
    // Strip event handler attributes defensively.
    [...node.attributes].forEach((attr) => {
      if (attr.name.startsWith("on")) node.removeAttribute(attr.name);
      if (URL_ATTRS.has(attr.name.toLowerCase()) && !isSafeHtmlUrl(attr.value)) {
        node.removeAttribute(attr.name);
      }
    });
    (node as HTMLElement).setAttribute("data-injected", marker);
  });

  // Scripts injected via innerHTML don't execute — clone them.
  tpl.content.childNodes.forEach((node) => {
    if (node.nodeType !== 1) return;
    const el = node as HTMLElement;
    if (el.tagName === "SCRIPT") {
      const s = document.createElement("script");
      [...el.attributes].forEach((a) => s.setAttribute(a.name, a.value));
      s.text = el.textContent || "";
      target.appendChild(s);
    } else {
      target.appendChild(el);
    }
  });
}

const CustomScripts = () => {
  const settings = useSiteSettings();

  useEffect(() => {
    if (settings.head_html) appendSanitised(document.head, settings.head_html, "head-html");
    if (settings.body_html) appendSanitised(document.body, settings.body_html, "body-html");
  }, [settings.head_html, settings.body_html]);

  return (
    <Helmet>
      {settings.gsc_verification && (
        <meta name="google-site-verification" content={settings.gsc_verification} />
      )}
      {settings.bing_verification && (
        <meta name="msvalidate.01" content={settings.bing_verification} />
      )}
      {!settings.indexing_enabled && <meta name="robots" content="noindex,nofollow" />}
    </Helmet>
  );
};

export default CustomScripts;
