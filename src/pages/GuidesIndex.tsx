import { Link } from "react-router-dom";
import { SeoHead } from "@/components/seo/SeoHead";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import Breadcrumb from "@/components/Breadcrumb";
import PageHeader from "@/components/layout/PageHeader";
import { GUIDES } from "@/data/guides";
import { CITY_GUIDES } from "@/data/cityGuides";
import { COUNTRIES } from "@/data/countryCatalogue";

const GuidesIndex = () => (
  <>
    <SeoHead
      title="Mortgage & Property Guides Australia 2026 | Calcy"
      description="Plain-English Australian guides on stamp duty, LMI, borrowing power, first home buyer grants, plus city-specific guides for 50 Australian markets."
      canonical="/guides"
    />
    <BreadcrumbJsonLd
      items={[
        { name: "Home", path: "/" },
        { name: "Guides", path: "/guides" },
      ]}
    />

    <PageHeader
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Guides" },
      ]}
      title="Mortgage & property guides"
      subtitle="Plain-English explainers covering stamp duty, LMI, borrowing power, and first home buyer grants — plus city-specific guides for 50 Australian markets."
    />

    <div className="page-shell py-8 md:py-10">
      <div className="md:hidden">
        <Breadcrumb current="Guides" />
        <h1 className="mb-3">Mortgage & property guides</h1>
        <p className="mb-6 max-w-2xl text-[15px] text-muted-foreground">
          Plain-English explainers covering stamp duty, LMI, borrowing power, first home buyer
          grants and rate strategy — plus city-specific guides for 50 Australian markets,
          updated for 2026.
        </p>
      </div>

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

      {COUNTRIES.map((country) => {
        const grouped = country.cities.reduce<Record<string, typeof country.cities>>(
          (acc, c) => {
            (acc[c.state] ||= []).push(c);
            return acc;
          },
          {},
        );
        return (
          <section key={country.code} className="mb-10">
            <h2 className="mb-2 text-[20px] font-semibold">
              City guides — {country.name} ({country.cities.length} markets)
            </h2>
            <p className="mb-6 text-[14px] text-muted-foreground">
              Mortgage, LMI and stamp duty guides with local median prices,
              state rules and worked examples.
            </p>
            {Object.entries(grouped).map(([stateCode, cities]) => (
              <div key={stateCode} className="mb-8">
                <h3 className="mb-3 text-[15px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {cities[0].stateName} ({stateCode})
                </h3>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {cities.map((c) => {
                    const cityGuides = CITY_GUIDES.filter((g) =>
                      g.slug.endsWith(`-${c.slug}`),
                    );
                    return (
                      <li
                        key={c.slug}
                        className="rounded-xl border border-border bg-card p-3"
                      >
                        <p className="mb-2 text-[14px] font-semibold text-foreground">
                          {c.name}
                        </p>
                        <ul className="space-y-1 text-[13px]">
                          {cityGuides.map((g) => (
                            <li key={g.slug}>
                              <Link
                                to={`/guides/${g.slug}`}
                                className="link-accent"
                              >
                                {g.category.replace(`${c.name} `, "")}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </section>
        );
      })}
    </div>
  </>
);

export default GuidesIndex;
