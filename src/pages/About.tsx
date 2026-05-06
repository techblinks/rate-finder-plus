import { SeoHead } from "@/components/seo/SeoHead";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import Breadcrumb from "@/components/Breadcrumb";

const About = () => (
  <>
    <SeoHead
      title="About Calcy | Free Australian Mortgage Calculators"
      description="Calcy provides free Australian mortgage and finance calculators with bank-grade accuracy and no sign-up."
      canonical="/about"
    />
    <BreadcrumbJsonLd
      items={[
        { name: "Home", path: "/" },
        { name: "About", path: "/about" },
      ]}
    />
    <div className="page-shell py-8 md:py-10">
      <Breadcrumb current="About" />
      <h1 className="mb-6">About Calcy</h1>
      <div className="space-y-4 text-[15px] leading-relaxed text-muted-foreground">
        <p>
          Calcy is a free Australian mortgage and finance calculator suite. We build tools that give
          clear, honest answers to common questions about home loans, stamp duty, borrowing power,
          extra repayments, lender's mortgage insurance, and loan comparisons.
        </p>
        <p>
          We don't sell loans, take referrals, or share your data. Every calculation runs in your
          browser. There's no sign-up, no account, and no advertising.
        </p>
        <p>
          Calculations are estimates only. Always confirm exact figures with a licensed Australian
          mortgage broker, lender, or financial adviser before making decisions.
        </p>
      </div>
    </div>
  </>
);

export default About;
