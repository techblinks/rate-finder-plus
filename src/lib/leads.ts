import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";

export type CalculatorType =
  | "mortgage"
  | "borrowing_power"
  | "stamp_duty"
  | "lmi"
  | "refinance";

const emailSchema = z
  .string()
  .trim()
  .min(3, "Enter your email")
  .max(254, "Email is too long")
  .email("Enter a valid email address");

export interface SubmitLeadArgs {
  calculator_type: CalculatorType;
  email: string;
  inputs: Record<string, unknown>;
  result_summary?: string;
  suburb?: string;
}

export async function submitLead(args: SubmitLeadArgs): Promise<{ ok: boolean; error?: string }> {
  const parsed = emailSchema.safeParse(args.email);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid email" };
  }
  const { error } = await supabase.from("calculation_leads").insert({
    email: parsed.data.toLowerCase(),
    calculator_type: args.calculator_type,
    inputs: args.inputs as never,
    result_summary: args.result_summary ?? null,
    suburb: args.suburb ?? null,
  });
  if (error) {
    return { ok: false, error: error.message };
  }
  trackEvent("lead_capture_submit", { calculator: args.calculator_type });
  return { ok: true };
}
