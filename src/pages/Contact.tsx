import { SeoHead } from "@/components/seo/SeoHead";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import Breadcrumb from "@/components/Breadcrumb";

const Contact = () => (
  <>
    <SeoHead
      title="Contact Calcy | Australian Mortgage Calculators"
      description="Get in touch with Calcy. Send feedback, suggestions, or report an issue with our free Australian mortgage and property calculators."
      canonical="/contact"
    />
    <BreadcrumbJsonLd
      items={[
        { name: "Home", path: "/" },
        { name: "Contact", path: "/contact" },
      ]}
    />
    <div className="page-shell py-8 md:py-10">
      <Breadcrumb current="Contact" />
      <h1 className="mb-6">Contact Calcy</h1>
      <div className="space-y-4 text-[15px] leading-relaxed text-muted-foreground">
        <p>
          We'd love to hear from you. Send feedback, suggestions, corrections, or report an issue
          with any of our calculators.
        </p>
        <p>
          Email: <a href="mailto:hello@calcy.com.au" className="link-accent">hello@calcy.com.au</a>
        </p>
        <p>
          Calcy is run by a small Australian team. We don't sell loans, take referrals, or share
          your data — read more on our <a href="/about" className="link-accent">about page</a>.
        </p>
      </div>
    </div>
  </>
);

export default Contact;
