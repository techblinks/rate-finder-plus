import { useState } from "react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import { Mail, Clock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Message sent!", description: "We'll respond within 1–2 business days." });
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <>
      <SEOHead
        title="Contact Us — Zune Calculator | Zune Calculator"
        description="Get in touch with the ZuneCalculator.com team. Questions, feedback, or partnership inquiries about our free financial calculators."
        canonical="/contact"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Contact", url: "/contact" },
        ]}
      />
      <div className="container py-12 max-w-3xl">
        <h1 className="text-4xl font-bold text-foreground mb-6">Contact Us</h1>

        <p className="text-base text-muted-foreground leading-relaxed mb-8">
          Have a question about our calculators, feedback on the site, or interested in a partnership? We'd love to hear from you. Fill out the form below or reach out via email, and our team will respond within 1–2 business days.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-accent mt-0.5" />
            <div>
              <p className="font-semibold text-foreground text-sm">Email</p>
              <p className="text-sm text-muted-foreground">contact@zunecalculator.com</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-accent mt-0.5" />
            <div>
              <p className="font-semibold text-foreground text-sm">Response Time</p>
              <p className="text-sm text-muted-foreground">1–2 business days</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MessageSquare className="h-5 w-5 text-accent mt-0.5" />
            <div>
              <p className="font-semibold text-foreground text-sm">Topics</p>
              <p className="text-sm text-muted-foreground">Feedback, bugs, partnerships</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mb-10">
          <div>
            <Label htmlFor="name">Your Name</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Jane Smith" />
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="jane@example.com" />
          </div>
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required placeholder="How can we help you?" rows={5} />
          </div>
          <Button type="submit" className="w-full sm:w-auto">Send Message</Button>
        </form>

        <section className="border-t pt-8">
          <h2 className="text-xl font-bold text-foreground mb-3">Explore Our Calculators</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Looking for a financial calculator? Try one of our free tools:
          </p>
          <div className="flex flex-wrap gap-2">
            <Link to="/us/mortgage-calculator" className="text-sm text-accent hover:underline">US Mortgage Calculator</Link>
            <span className="text-muted-foreground">·</span>
            <Link to="/au/mortgage-calculator" className="text-sm text-accent hover:underline">AU Mortgage Calculator</Link>
            <span className="text-muted-foreground">·</span>
            <Link to="/ca/mortgage-calculator" className="text-sm text-accent hover:underline">CA Mortgage Calculator</Link>
            <span className="text-muted-foreground">·</span>
            <Link to="/us/loan-calculator" className="text-sm text-accent hover:underline">US Loan Calculator</Link>
            <span className="text-muted-foreground">·</span>
            <Link to="/us/interest-calculator" className="text-sm text-accent hover:underline">US Interest Calculator</Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default Contact;
