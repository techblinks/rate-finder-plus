import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function pAndI(loan: number, annualRate: number, months = 360) {
  const r = annualRate / 100 / 12;
  if (r === 0) return loan / months;
  return (loan * (r * Math.pow(1 + r, months))) / (Math.pow(1 + r, months) - 1);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData, error: userErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: rateData } = await supabase
      .from("rate_data")
      .select("value")
      .eq("category", "rba_cash_rate")
      .eq("key", "cash_rate")
      .maybeSingle();

    const value = (rateData?.value ?? {}) as Record<string, any>;
    const currentRate = Number(value.rate ?? 4.35);
    const previousRate = Number(value.previous_rate ?? 4.1);
    const effectiveDate = value.effective_date ?? new Date().toISOString().split("T")[0];
    const rateChange = currentRate - previousRate;
    const direction = rateChange > 0 ? "raised" : rateChange < 0 ? "cut" : "held";
    const changeBps = Math.abs(Math.round(rateChange * 100));

    const loanAmounts = [500000, 650000, 800000];
    const impacts = loanAmounts.map((loan) => {
      const oldM = pAndI(loan, previousRate);
      const newM = pAndI(loan, currentRate);
      return {
        loan: loan.toLocaleString("en-AU"),
        oldMonthly: Math.round(oldM).toLocaleString("en-AU"),
        newMonthly: Math.round(newM).toLocaleString("en-AU"),
        difference: Math.round(newM - oldM),
      };
    });

    const today = new Date().toLocaleDateString("en-AU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const monthYear = new Date().toLocaleDateString("en-AU", {
      month: "long",
      year: "numeric",
    });

    const verb = direction === "raised" ? "Raises" : direction === "cut" ? "Cuts" : "Holds";

    // Avoid duplicate drafts in same day
    const slug = `rba-${direction === "raised" ? "rate-rise" : direction === "cut" ? "rate-cut" : "rate-hold"}-${monthYear.toLowerCase().replace(/\s+/g, "-")}`;
    const { data: dupe } = await supabase
      .from("content_drafts")
      .select("id")
      .eq("slug", slug)
      .in("status", ["draft", "approved", "published"])
      .maybeSingle();
    if (dupe) {
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: "Draft already exists for this RBA decision", id: dupe.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const system = `You are an expert Australian mortgage writer for calcy.com.au.
Write clear, factual, plain-English content about RBA rate decisions and their impact on Australian mortgage holders.
Use Australian spelling. Reference Australian lenders and the RBA specifically.
Respond ONLY with article markdown. No preamble.`;

    const userPrompt = `Write a 900-word article about today's RBA rate decision for calcy.com.au.

DECISION DETAILS:
- Date: ${today}
- Decision: RBA ${direction} the cash rate by ${changeBps} basis points
- New rate: ${currentRate}%
- Previous rate: ${previousRate}%
- Direction: ${direction}

MORTGAGE IMPACT (use these exact figures):
${impacts.map((i) => `- $${i.loan} loan: was $${i.oldMonthly}/month, now $${i.newMonthly}/month (${i.difference > 0 ? "+" : ""}$${i.difference}/month)`).join("\n")}

ARTICLE STRUCTURE:
## What the RBA decided
(2 paragraphs — what was decided and the key reason)

## How this affects your mortgage repayments
(Include the impact table above with the 3 loan amounts)

## Should you fix or stay variable?
(Balanced 2-paragraph analysis for ${direction === "raised" ? "a rising rate environment" : direction === "cut" ? "a falling rate environment" : "a stable rate environment"})

## What to do now
(3 specific actions: recalculate repayments, check if refinancing makes sense, consider offset account)

## Use Calcy's free calculators
(Short section linking to /mortgage-calculator, /refinance-calculator, /extra-repayments-calculator)

## Key takeaways
(4 bullet points)

## FAQ
Q: How much does the rate ${direction === "raised" ? "rise" : direction === "cut" ? "cut" : "hold"} add to my mortgage?
Q: When will lenders pass on the rate ${direction}?
Q: Should I fix my rate now?
Q: How do I calculate my new repayments?

Write the full article now in markdown. Do NOT include the H1 — it will be added separately.`;

    const aiResp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 4000,
        system,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("Anthropic error:", aiResp.status, errText);
      return new Response(
        JSON.stringify({ error: `Anthropic API error: ${aiResp.status}`, details: errText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const aiData = await aiResp.json();
    const articleContent: string = aiData?.content?.[0]?.text ?? "";
    const wordCount = articleContent.split(/\s+/).filter(Boolean).length;

    const title = `RBA ${verb} Cash Rate to ${currentRate}% — What It Means for Your Mortgage (${monthYear})`;
    const metaTitle = `RBA ${currentRate}% ${monthYear} — Mortgage Impact | Calcy`;
    const metaDesc = `RBA ${direction} cash rate to ${currentRate}% on ${today}. See how this affects your mortgage repayments. Calculate your new repayments instantly.`;

    const { data: inserted, error: insErr } = await supabase
      .from("content_drafts")
      .insert({
        title,
        slug,
        target_keyword: `rba rate ${direction} ${new Date().getFullYear()}`,
        category: "mortgage",
        status: "draft",
        content: articleContent,
        word_count: wordCount,
        meta_title: metaTitle,
        meta_description: metaDesc,
        brief: {
          trigger: "rba_event",
          rate: currentRate,
          previous_rate: previousRate,
          direction,
          change_bps: changeBps,
          effective_date: effectiveDate,
          impacts,
          generated_at: new Date().toISOString(),
        },
      })
      .select()
      .single();
    if (insErr) throw insErr;

    return new Response(
      JSON.stringify({ success: true, id: inserted.id, word_count: wordCount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("generate-rba-article error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
