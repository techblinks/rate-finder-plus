import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";

const year = new Date().getFullYear();

const PrivacyPolicy = () => (
  <>
    <SEOHead
      title="Privacy Policy — Zune Calculator | Zune Calculator"
      description="ZuneCalculator.com privacy policy. Learn how we handle your data, cookies, analytics, and advertising. GDPR and CCPA compliant."
      canonical="/privacy-policy"
      robots="noindex, follow"
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "Privacy Policy", url: "/privacy-policy" },
      ]}
    />
    <div className="container py-12 max-w-3xl prose prose-sm prose-zinc dark:prose-invert">
      <h1>Privacy Policy</h1>
      <p className="text-muted-foreground"><strong>Last updated:</strong> January 1, {year}</p>

      <p>ZuneCalculator.com ("we," "our," or "us") operates the website located at https://zunecalculator.com (the "Site"). This Privacy Policy explains how we collect, use, disclose, and protect your information when you visit our Site. By accessing or using the Site, you agree to this policy.</p>

      <h2>1. Information We Collect</h2>
      <h3>Automatically Collected Information</h3>
      <p>When you visit our Site, we may automatically collect certain information about your device and usage, including:</p>
      <ul>
        <li>Browser type and version</li>
        <li>Operating system</li>
        <li>IP address (anonymized where possible)</li>
        <li>Pages visited and time spent</li>
        <li>Referring website URL</li>
        <li>Device type (desktop, mobile, tablet)</li>
      </ul>

      <h3>Information You Provide</h3>
      <p>If you contact us through our contact form, we collect your name, email address, and message content. Calculator inputs are processed client-side in your browser and are never transmitted to our servers.</p>

      <h2>2. Cookies & Tracking Technologies</h2>
      <p>We use cookies and similar technologies for the following purposes:</p>
      <ul>
        <li><strong>Essential Cookies:</strong> Required for basic site functionality.</li>
        <li><strong>Analytics Cookies:</strong> We use Google Analytics to understand how visitors use our Site. Data is anonymized and aggregated.</li>
        <li><strong>Advertising Cookies:</strong> Third-party advertising partners, including Google AdSense, may set cookies to serve personalized ads based on your browsing history.</li>
      </ul>
      <p>You can manage cookie preferences through your browser settings. Disabling cookies may affect site functionality.</p>

      <h2>3. Google AdSense & Third-Party Advertising</h2>
      <p>We use Google AdSense to display advertisements on our Site. Google and its partners may use cookies to serve ads based on your prior visits to this and other websites. You can opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ads Settings</a> or the <a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer">Network Advertising Initiative opt-out page</a>.</p>

      <h2>4. How We Use Your Information</h2>
      <ul>
        <li>To provide and maintain the Site</li>
        <li>To analyze usage patterns and improve our calculators and content</li>
        <li>To display relevant advertisements</li>
        <li>To respond to your inquiries via the contact form</li>
        <li>To comply with legal obligations</li>
      </ul>

      <h2>5. Data Sharing & Disclosure</h2>
      <p>We do not sell your personal information. We may share anonymized data with:</p>
      <ul>
        <li>Analytics providers (Google Analytics)</li>
        <li>Advertising partners (Google AdSense)</li>
        <li>Legal authorities when required by law</li>
      </ul>

      <h2>6. GDPR Compliance (European Users)</h2>
      <p>If you are in the European Economic Area, you have the right to: access, correct, or delete your personal data; restrict or object to processing; data portability; and withdraw consent. Contact us at contact@zunecalculator.com to exercise these rights.</p>

      <h2>7. CCPA Compliance (California Residents)</h2>
      <p>California residents have the right to: know what personal information is collected; request deletion of personal information; opt out of the sale of personal information (we do not sell personal data); and non-discrimination for exercising rights.</p>

      <h2>8. Data Retention</h2>
      <p>We retain automatically collected data for up to 26 months. Contact form submissions are retained for up to 12 months. You may request deletion at any time.</p>

      <h2>9. Children's Privacy</h2>
      <p>Our Site is not directed to children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, contact us for removal.</p>

      <h2>10. Security</h2>
      <p>We implement reasonable security measures to protect your information. However, no internet transmission is 100% secure. We cannot guarantee absolute security.</p>

      <h2>11. Changes to This Policy</h2>
      <p>We may update this Privacy Policy periodically. Changes are effective upon posting to this page. We encourage you to review this policy regularly.</p>

      <h2>12. Contact Us</h2>
      <p>For questions about this Privacy Policy, contact us at:</p>
      <p>Email: contact@zunecalculator.com</p>

      <div className="mt-8 border-t pt-6">
        <p className="text-sm text-muted-foreground">
          Return to our <Link to="/" className="text-accent hover:underline">financial calculators</Link> or <Link to="/contact" className="text-accent hover:underline">contact us</Link> with questions.
        </p>
      </div>
    </div>
  </>
);

export default PrivacyPolicy;
