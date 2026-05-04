import { SeoHead } from "@/components/seo/SeoHead";
import Breadcrumb from "@/components/Breadcrumb";

const PrivacyPolicy = () => (
  <>
    <SeoHead
      title="Privacy Policy | Zune Calculator"
      description="Zune Calculator privacy policy. Learn how we handle data on our Australian mortgage calculators."
      canonical="/privacy-policy"
    />
    <div className="page-shell py-8 md:py-10">
      <Breadcrumb current="Privacy Policy" />
      <h1 className="mb-6">Privacy Policy</h1>
      <div className="space-y-4 text-[15px] leading-relaxed text-muted-foreground">
        <p>
          Zune Calculator does not require an account, and all calculations are performed in your
          browser. We do not collect, store, or share the figures you enter into our calculators.
        </p>
        <p>
          We use minimal, privacy-respecting analytics to understand which calculators are most
          useful. We do not use third-party advertising trackers.
        </p>
        <p>
          If you have questions, email us via the contact details on our About page.
        </p>
      </div>
    </div>
  </>
);

export default PrivacyPolicy;
