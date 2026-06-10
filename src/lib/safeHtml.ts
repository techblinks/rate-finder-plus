type UrlAttribute = "href" | "src";

const ARTICLE_ALLOWED_TAGS = new Set([
  "A",
  "B",
  "BLOCKQUOTE",
  "BR",
  "CODE",
  "DIV",
  "EM",
  "H2",
  "H3",
  "H4",
  "HR",
  "I",
  "LI",
  "OL",
  "P",
  "STRONG",
  "TABLE",
  "TBODY",
  "TD",
  "TH",
  "THEAD",
  "TR",
  "UL",
]);

const ARTICLE_ALLOWED_ATTRS = new Set(["class", "href", "rel", "target"]);
const SAFE_URL_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

export function isSafeHtmlUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("#") || trimmed.startsWith("/") || trimmed.startsWith("./")) return true;
  try {
    return SAFE_URL_PROTOCOLS.has(new URL(trimmed, "https://calcy.com.au").protocol);
  } catch {
    return false;
  }
}

function sanitiseUrlAttribute(element: Element, attrName: UrlAttribute) {
  const value = element.getAttribute(attrName);
  if (!value) return;
  if (!isSafeHtmlUrl(value)) {
    element.removeAttribute(attrName);
    return;
  }
  if (element.tagName === "A" && attrName === "href") {
    element.setAttribute("rel", "noopener noreferrer");
  }
}

function fallbackSanitise(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(href|src)\s*=\s*(['"]?)\s*(javascript:|data:|vbscript:)[^'"\s>]*/gi, "");
}

export function sanitiseArticleHtml(html: string | null | undefined): string {
  if (!html) return "";
  if (typeof document === "undefined") return fallbackSanitise(html);

  const template = document.createElement("template");
  template.innerHTML = html;

  template.content.querySelectorAll("*").forEach((node) => {
    if (!ARTICLE_ALLOWED_TAGS.has(node.tagName)) {
      node.replaceWith(document.createTextNode(node.textContent || ""));
      return;
    }

    [...node.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      if (name.startsWith("on") || !ARTICLE_ALLOWED_ATTRS.has(name)) {
        node.removeAttribute(attr.name);
      }
    });

    sanitiseUrlAttribute(node, "href");
    sanitiseUrlAttribute(node, "src");
  });

  return template.innerHTML;
}

export function jsonLdTypeExists(type: string, matcher?: (data: unknown) => boolean): boolean {
  if (typeof document === "undefined") return false;
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (const script of Array.from(scripts)) {
    try {
      const data = JSON.parse(script.textContent || "null");
      const blocks = Array.isArray(data) ? data : [data];
      if (
        blocks.some((block) => {
          if (!block || typeof block !== "object") return false;
          const itemType = (block as { "@type"?: unknown })["@type"];
          const types = Array.isArray(itemType) ? itemType : [itemType];
          return types.includes(type) && (!matcher || matcher(block));
        })
      ) {
        return true;
      }
    } catch {
      // Ignore malformed third-party/admin JSON-LD; Calcy-owned blocks still render.
    }
  }
  return false;
}
