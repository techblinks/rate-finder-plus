import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";

const year = new Date().getFullYear();

const Terms = () => (
  <>
    <SEOHead
      title="Terms of Service — Zune Calculator | Zune Calculator"
      description="Terms of service for ZuneCalculator.com. Read our disclaimer, calculator accuracy information, and usage terms for US, Australia, and Canada."
      canonical="/terms"
      robots="noindex, follow"
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "Terms of Service", url: "/terms" },
      ]}
    />
    <div className="container py-12 max-w-3xl prose prose-sm prose-zinc dark:prose-invert">
      <h1>Terms of Service</h1>
      <p className="text-muted-foreground"><strong>Effective date:</strong> January 1, {year}</p>

      <p>These Terms of Service ("Terms") govern your access to and use of ZuneCalculator.com (the "Site"), operated by ZuneCalculator ("we," "our," or "us"). By accessing or using the Site, you agree to be bound by these Terms.</p>

      <h2>1. Acceptance of Terms</h2>
      <p>By using the Site, you confirm that you are at least 18 years old (or the age of majority in your jurisdiction) and agree to comply with these Terms. If you do not agree, do not use the Site.</p>

      <h2>2. Description of Service</h2>
      <p>ZuneCalculator.com provides free online financial calculators, including mortgage calculators, loan calculators, and interest calculators, tailored for users in the United States, Australia, and Canada. All tools are provided for informational and educational purposes only.</p>

      <h2>3. Financial Disclaimer</h2>
      <p><strong>IMPORTANT: ZuneCalculator.com does not provide financial, investment, tax, or legal advice.</strong></p>
      <p>The calculators and content on this Site are designed to provide general estimates and educational information. They should not be relied upon as the sole basis for any financial decision. Results are approximate and may not reflect actual loan terms, interest rates, fees, taxes, or other factors specific to your situation.</p>
      <p>We strongly recommend consulting with a qualified financial advisor, mortgage broker, or lending professional before making any financial commitments. We do not endorse any specific financial product, lender, or institution.</p>

      <h2>4. Calculator Accuracy Disclaimer</h2>
      <p>While we strive for accuracy, our calculators use standard mathematical formulas and simplified assumptions. Actual results from financial institutions may differ due to:</p>
      <ul>
        <li>Rounding differences in interest calculations</li>
        <li>Fees, charges, and costs not included in our calculations</li>
        <li>Taxes, insurance, and regulatory requirements</li>
        <li>Different compounding conventions (e.g., Canadian semi-annual vs US monthly)</li>
        <li>Changes in interest rates or market conditions</li>
        <li>Individual credit profiles and lender-specific criteria</li>
      </ul>
      <p>We make no warranty, express or implied, regarding the accuracy, completeness, or reliability of any calculation results.</p>

      <h2>5. Jurisdiction & Applicable Law</h2>
      <p>Our Site serves users in the United States, Australia, and Canada. The following applies by jurisdiction:</p>
      <ul>
        <li><strong>United States:</strong> This Site is not a licensed mortgage lender, broker, or financial advisor. Information does not constitute an offer to lend. Governed by applicable federal and state laws.</li>
        <li><strong>Australia:</strong> This Site does not hold an Australian Financial Services Licence (AFSL). Content is general information only and does not consider your objectives, financial situation, or needs. Governed by Australian Consumer Law.</li>
        <li><strong>Canada:</strong> This Site is not licensed under any provincial or federal financial regulation. Content does not constitute financial advice under the Bank Act or provincial securities legislation.</li>
      </ul>

      <h2>6. Intellectual Property</h2>
      <p>All content, design, code, and trademarks on the Site are the property of ZuneCalculator or its licensors. You may not reproduce, distribute, modify, or create derivative works without our written permission.</p>

      <h2>7. Third-Party Links & Advertising</h2>
      <p>The Site may contain links to third-party websites and display advertisements from advertising networks (including Google AdSense). We are not responsible for the content, privacy practices, or accuracy of third-party sites. Clicking an ad or affiliate link may result in compensation to ZuneCalculator.</p>

      <h2>8. Limitation of Liability</h2>
      <p>To the maximum extent permitted by law, ZuneCalculator shall not be liable for any direct, indirect, incidental, consequential, or special damages arising from your use of or inability to use the Site, including but not limited to financial losses resulting from reliance on calculator results.</p>

      <h2>9. User Conduct</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Site for any unlawful purpose</li>
        <li>Attempt to interfere with the Site's operation or security</li>
        <li>Scrape, crawl, or automated-access the Site beyond normal usage</li>
        <li>Impersonate another person or entity</li>
      </ul>

      <h2>10. Indemnification</h2>
      <p>You agree to indemnify and hold harmless ZuneCalculator, its affiliates, and their respective officers, directors, and employees from any claims, losses, or damages arising from your use of the Site or violation of these Terms.</p>

      <h2>11. Modifications</h2>
      <p>We reserve the right to modify these Terms at any time. Changes take effect upon posting. Continued use after changes constitutes acceptance of the revised Terms.</p>

      <h2>12. Termination</h2>
      <p>We may suspend or terminate your access to the Site at any time, without notice, for any reason, including violation of these Terms.</p>

      <h2>13. Contact</h2>
      <p>For questions about these Terms, contact us at:</p>
      <p>Email: contact@zunecalculator.com</p>

      <div className="mt-8 border-t pt-6">
        <p className="text-sm text-muted-foreground">
          Return to our <Link to="/" className="text-accent hover:underline">financial calculators</Link> · <Link to="/privacy-policy" className="text-accent hover:underline">Privacy Policy</Link> · <Link to="/contact" className="text-accent hover:underline">Contact Us</Link>
        </p>
      </div>
    </div>
  </>
);

export default Terms;
