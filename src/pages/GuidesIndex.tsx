import { Link } from "react-router-dom";
import { SeoHead } from "@/components/seo/SeoHead";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import Breadcrumb from "@/components/Breadcrumb";
import { GUIDES } from "@/data/guides";

const GuidesIndex = () => (
  <>
    <SeoHead
      title="Mortgage & Property Guides Australia 2026 | Calcy"
      description="Plain-English Australian guides on stamp duty, LMI, borrowing power, first home buyer grants, and fixed vs variable rates. Updated 2026."
      canonical="/guides"
    />
    <BreadcrumbJsonLd
      items={[
        { name: "Home", path: "/" },
        { name: "Guides", path: "/guides" },
      ]}
    />
    <div className="page-shell py-8 md:py-10">
      <Breadcrumb current="Guides" />
      <h1 className="mb-3">Australian mortgage & property guides</h1>
      <p className="mb-10 max-w-2xl text-[15px] text-muted-foreground">
        Plain-English explainers covering stamp duty, LMI, borrowing power, first home buyer
        grants and rate strategy — written for Australian buyers, updated for 2026.
      </p>
      <ul className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {GUIDES.map((g) => (
          <li key={g.slug}>
            <Link
              to={`/guides/${g.slug}`}
              className="block h-full rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-accent/50"
            >
              <p className="text-[12px] font-semibold uppercase tracking-wide text-accent">
                {g.category} · {g.readMins} min read
              </p>
              <h2 className="mt-2 text-[20px] font-semibold leading-snug text-foreground">
                {g.title}
              </h2>
              <p className="mt-3 text-[14px] text-muted-foreground">{g.intro}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-accent">
                Read guide →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </>
);

export default GuidesIndex;
