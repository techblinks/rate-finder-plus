import { Link } from "react-router-dom";
import { SeoHead } from "@/components/seo/SeoHead";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import Breadcrumb from "@/components/Breadcrumb";
import { GUIDES } from "@/data/guides";
import { CITIES, CITY_GUIDES } from "@/data/cityGuides";

const GuidesIndex = () => (
  <>
    <SeoHead
      title="Mortgage & Property Guides Australia 2026 | Calcy"
      description="Plain-English Australian guides on stamp duty, LMI, borrowing power, first home buyer grants, plus city-specific guides for Sydney, Melbourne, Brisbane, Perth and more."
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
        grants and rate strategy — plus city-specific guides for every Australian capital,
        updated for 2026.
      </p>

      <h2 className="mb-4 text-[20px] font-semibold">Core Australian guides</h2>
      <ul className="mb-12 grid grid-cols-1 gap-5 md:grid-cols-2">
        {GUIDES.map((g) => (
          <li key={g.slug}>
            <Link
              to={`/guides/${g.slug}`}
              className="block h-full rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-accent/50"
            >
              <p className="text-[12px] font-semibold uppercase tracking-wide text-accent">
                {g.category} · {g.readMins} min read
              </p>
              <h3 className="mt-2 text-[18px] font-semibold leading-snug text-foreground">
                {g.title}
              </h3>
              <p className="mt-3 text-[14px] text-muted-foreground">{g.intro}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-accent">
                Read guide →
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="mb-4 text-[20px] font-semibold">Guides by Australian capital city</h2>
      <p className="mb-6 text-[14px] text-muted-foreground">
        City-specific mortgage, LMI and stamp duty guides with local median prices,
        state rules and worked examples.
      </p>
      {CITIES.map((c) => {
        const cityGuides = CITY_GUIDES.filter((g) => g.slug.endsWith(`-${c.slug}`));
        return (
          <section key={c.slug} className="mb-8">
            <h3 className="mb-3 text-[16px] font-semibold text-foreground">
              {c.name} ({c.state})
            </h3>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {cityGuides.map((g) => (
                <li key={g.slug}>
                  <Link
                    to={`/guides/${g.slug}`}
                    className="block h-full rounded-xl border border-border bg-card p-4 transition hover:border-primary/40"
                  >
                    <p className="text-[12px] font-medium uppercase tracking-wide text-accent">
                      {g.category}
                    </p>
                    <p className="mt-1 text-[14px] font-semibold text-foreground">
                      {g.title}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  </>
);

export default GuidesIndex;
