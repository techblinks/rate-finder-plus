import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { submitLead, type CalculatorType } from "@/lib/leads";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calculator: CalculatorType;
  inputs: Record<string, unknown>;
  resultSummary?: string;
  suburb?: string;
}

const EmailResultsDialog = ({ open, onOpenChange, calculator, inputs, resultSummary, suburb }: Props) => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setEmail("");
      setError(null);
      setSuccess(false);
      setSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await submitLead({
      calculator_type: calculator,
      email,
      inputs,
      result_summary: resultSummary,
      suburb,
    });
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error ?? "Something went wrong. Please try again.");
      return;
    }
    setSuccess(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {success ? (
          <>
            <DialogHeader>
              <DialogTitle>You're all set ✓</DialogTitle>
              <DialogDescription>
                We've saved your results. A copy will be sent to your inbox shortly.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" onClick={() => onOpenChange(false)}>Done</Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Email me these results</DialogTitle>
              <DialogDescription>
                Enter your email and we'll send a copy of this calculation. No spam — just your results.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-3">
              {resultSummary && (
                <p className="rounded-md bg-muted/50 p-3 text-[13px] text-muted-foreground">
                  {resultSummary}
                </p>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="lead-email">Your email</Label>
                <Input
                  id="lead-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              {error && <p className="text-[13px] text-destructive">{error}</p>}
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Sending…" : "Email my results"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EmailResultsDialog;
