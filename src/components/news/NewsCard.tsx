import { Link } from "react-router-dom";

interface Props {
  slug: string;
  title: string;
  excerpt?: string | null;
  body?: string | null;
  publishedAt?: string | null;
}

const formatDate = (iso?: string | null) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

const buildExcerpt = (excerpt?: string | null, body?: string | null) => {
  const source = (excerpt && excerpt.trim()) || (body || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!source) return "";
  return source.length > 150 ? `${source.slice(0, 150).trimEnd()}…` : source;
};

const NewsCard = ({ slug, title, excerpt, body, publishedAt }: Props) => {
  const date = formatDate(publishedAt);
  const summary = buildExcerpt(excerpt, body);
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <h2 className="text-lg font-semibold leading-snug text-foreground">
        <Link to={`/news/${slug}`} className="hover:text-accent">
          {title}
        </Link>
      </h2>
      {date && (
        <p className="mt-1 text-xs text-muted-foreground">{date}</p>
      )}
      {summary && (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{summary}</p>
      )}
      <Link
        to={`/news/${slug}`}
        className="mt-4 inline-flex text-sm font-medium text-accent hover:underline"
      >
        Read more →
      </Link>
    </article>
  );
};

export default NewsCard;
