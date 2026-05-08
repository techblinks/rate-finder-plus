import { SeoHead } from "@/components/seo/SeoHead";
import Breadcrumb from "@/components/Breadcrumb";

const PrivacyPolicy = () => (
  <>
    <SeoHead
      title="Privacy Policy | Calcy"
      description="Calcy privacy policy. Learn how we handle data, cookies and advertising on our Australian mortgage calculators."
      canonical="/privacy-policy"
    />
    <div className="page-shell py-8 md:py-10">
      <Breadcrumb current="Privacy Policy" />
      <h1 className="mb-6">Privacy Policy</h1>
      <div className="space-y-6 text-[15px] leading-relaxed text-muted-foreground">
        <section className="space-y-3">
          <p>
            Calcy does not require an account, and all calculations are performed in your browser. We
            do not collect, store, or share the figures you enter into our calculators.
          </p>
          <p>
            We use minimal, privacy-respecting analytics to understand which calculators are most
            useful so we can improve them.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-h3 text-foreground">Cookies</h2>
          <p>
            Calcy uses cookies — small text files stored on your device — to improve your experience
            on the site. Cookies we use include:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Essential cookies:</strong> Required for the site to function correctly. These
              include remembering your calculator inputs and preferences between sessions.
            </li>
            <li>
              <strong>Analytics cookies:</strong> We may use analytics services to understand how
              visitors use the site. This helps us improve the calculators and content.
            </li>
            <li>
              <strong>Advertising cookies:</strong> Used by Google AdSense to serve relevant
              advertisements. See the "Advertising and cookies" section below for details.
            </li>
          </ul>
          <p>
            You can control cookies through your browser settings. Note that disabling cookies may
            affect the functionality of some features, including saved calculator scenarios.
          </p>
          <p>By continuing to use Calcy, you consent to our use of cookies as described in this policy.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-h3 text-foreground">Advertising and cookies</h2>
          <p>
            Calcy uses Google AdSense to display advertisements on some pages. Google AdSense is an
            advertising service provided by Google LLC.
          </p>
          <p>
            Google AdSense uses cookies and similar tracking technologies to serve ads based on your
            prior visits to this website and other websites across the internet. These advertising
            cookies allow Google and its partners to serve ads to you based on your visit to our site
            and/or other sites.
          </p>
          <p>What this means for you:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Google may use cookies to personalise the ads you see on Calcy</li>
            <li>These cookies track browsing behaviour across websites to show relevant ads</li>
            <li>Your data is processed in accordance with Google's Privacy Policy</li>
          </ul>
          <p>
            You may opt out of personalised advertising at any time by visiting{" "}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Google's Ad Settings
            </a>
            .
          </p>
          <p>
            For more information on how Google uses data when you visit sites that use Google
            services, visit{" "}
            <a
              href="https://policies.google.com/technologies/partner-sites"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              policies.google.com/technologies/partner-sites
            </a>
            .
          </p>
          <p>
            You can also opt out of interest-based advertising from Google and other participating
            companies through the{" "}
            <a
              href="https://www.aboutads.info"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Digital Advertising Alliance
            </a>
            .
          </p>
          <p>
            Calcy does not control the cookies placed by Google AdSense and is not responsible for
            the content of advertisements served. Advertisements are clearly labelled on the site.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-h3 text-foreground">Contact us</h2>
          <p>If you have questions, email us via the contact details on our About page.</p>
        </section>
      </div>
    </div>
  </>
);

export default PrivacyPolicy;
