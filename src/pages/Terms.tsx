import { SeoHead } from "@/components/seo/SeoHead";
import Breadcrumb from "@/components/Breadcrumb";

const Terms = () => (
  <>
    <SeoHead
      title="Terms of Use | Calcy"
      description="Terms of use for Calcy's free Australian mortgage and finance calculators."
      canonical="/terms-of-use"
    />
    <div className="page-shell py-8 md:py-10">
      <Breadcrumb current="Terms of Use" />
      <h1 className="mb-6">Terms of Use</h1>
      <div className="space-y-4 text-[15px] leading-relaxed text-muted-foreground">
        <p>
          The information and calculators on Calcy are provided for general informational purposes
          only. They do not constitute financial product advice.
        </p>
        <p>
          Calculations are estimates based on the inputs you provide and standard formulas. They may
          not reflect your lender's actual figures, fees, or assessment criteria. Always confirm
          with a licensed Australian financial professional before making decisions.
        </p>
        <p>
          We make no warranties as to the accuracy, completeness, or suitability of any calculation.
          Use of this site is at your own risk.
        </p>
      </div>
    </div>
  </>
);

export default Terms;
