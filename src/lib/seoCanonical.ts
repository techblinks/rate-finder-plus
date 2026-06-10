export function removeDuplicateCanonicalLinks(currentUrl: string, doc: Document = document) {
  const canonicalLinks = Array.from(doc.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]'));
  let keptCurrentCanonical = false;

  canonicalLinks.forEach((link) => {
    if (link.href === currentUrl && !keptCurrentCanonical) {
      keptCurrentCanonical = true;
      return;
    }

    link.remove();
  });

  return canonicalLinks.length - doc.querySelectorAll('link[rel="canonical"]').length;
}
