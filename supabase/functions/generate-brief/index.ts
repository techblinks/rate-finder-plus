import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an expert Australian mortgage and property SEO content strategist.
You create content briefs for calcy.com.au — a free Australian mortgage calculator website.
The site has these calculators: mortgage, stamp duty, borrowing power, LMI, extra repayments, loan comparison, rent vs buy, refinance.
The site has these guide articles already published: stamp duty guide, LMI guide, borrowing power guide, first home buyer grants guide, fixed vs variable rate guide.
Target audience: Australians buying their first home, existing homeowners, property investors.
All content must be Australian-specific, reference Australian lenders, RBA rates, state-based rules.
Current RBA cash rate: 4.35% (raised May 2026).
Respond ONLY with valid JSON. No markdown, no preamble.`;

async function generateText(system: string, userPrompt: string, maxTokens: number) {
  const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

  if (ANTHROPIC_API_KEY) {
    const anthropicResp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (anthropicResp.ok) {
      const aiData = await anthropicResp.json();
      return aiData?.content?.[0]?.text ?? "";
    }

    const errText = await anthropicResp.text();
    console.error("Anthropic error:", anthropicResp.status, errText);
    if (anthropicResp.status !== 404 || !LOVABLE_API_KEY) {
      throw new Error(`Anthropic API error: ${anthropicResp.status}. ${errText}`);
    }
  }

  if (!LOVABLE_API_KEY) throw new Error("No AI provider configured");

  const gatewayResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: system },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!gatewayResp.ok) {
    const errText = await gatewayResp.text();
    console.error("AI gateway error:", gatewayResp.status, errText);
    throw new Error(`AI gateway error: ${gatewayResp.status}. ${errText}`);
  }

  const gatewayData = await gatewayResp.json();
  return gatewayData?.choices?.[0]?.message?.content ?? "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
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

    // Pull keyword data
    const { data: keywords } = await supabase
      .from("seo_keywords")
      .select(
        "keyword, category, calcy_position, calcy_impressions_28d, opportunity_score, target_page",
      )
      .gt("calcy_impressions_28d", 0)
      .gt("calcy_position", 10)
      .lte("calcy_position", 60)
      .order("calcy_impressions_28d", { ascending: false })
      .limit(20);

    const { data: trending } = await supabase
      .from("seo_keywords")
      .select("keyword, category, trend_direction")
      .eq("trend_direction", "rising")
      .limit(10);

    const { data: existing } = await supabase
      .from("content_drafts")
      .select("target_keyword")
      .in("status", ["brief", "draft", "approved", "published"]);

    const existingKeywords = new Set((existing ?? []).map((d: any) => d.target_keyword));
    let filtered = (keywords ?? []).filter((k: any) => !existingKeywords.has(k.keyword));

    // Fallback to seeded keywords if none available
    if (filtered.length === 0) {
      const { data: anyKeywords } = await supabase
        .from("seo_keywords")
        .select("keyword, category, calcy_position, calcy_impressions_28d, target_page")
        .order("priority", { ascending: false })
        .limit(20);
      filtered = (anyKeywords ?? []).filter((k: any) => !existingKeywords.has(k.keyword));
    }

    if (filtered.length === 0) {
      return new Response(
        JSON.stringify({ error: "No keyword opportunities available. Sync GSC or seed keywords first." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const userPrompt = `Based on these keyword opportunities from Google Search Console for calcy.com.au, generate exactly 3 content briefs.

TOP KEYWORD OPPORTUNITIES (ranked by impressions):
${filtered
  .slice(0, 10)
  .map(
    (k: any) =>
      `- "${k.keyword}" | position ${k.calcy_position ?? "?"} | ${k.calcy_impressions_28d ?? 0} impressions | category: ${k.category}`,
  )
  .join("\n")}

TRENDING KEYWORDS:
${(trending ?? []).map((k: any) => `- "${k.keyword}" (${k.category})`).join("\n") || "None"}

Generate 3 content briefs. For each brief, choose the keyword with the highest opportunity (low position number + high impressions = best opportunity for page 1 ranking).

Respond with this exact JSON structure:
{
  "briefs": [
    {
      "target_keyword": "exact keyword from the list",
      "category": "mortgage|stamp_duty|borrowing_power|lmi|refinance|rent_vs_buy|general",
      "intent": "informational|transactional",
      "titles": ["Title option 1", "Title option 2", "Title option 3"],
      "meta_title": "SEO title tag under 60 chars",
      "meta_description": "Meta description under 155 chars",
      "slug": "url-friendly-slug",
      "outline": ["## H2 heading 1", "### H3 subheading", "## H2 heading 2"],
      "calculator_to_embed": "/stamp-duty-calculator",
      "internal_links": ["/guides/stamp-duty-australia-2026", "/lmi-calculator"],
      "key_stats_to_include": ["RBA rate 4.35%", "NSW exemption up to $800k"],
      "word_count_target": 1200,
      "rationale": "Why this keyword is the right focus right now in one sentence"
    }
  ]
}`;

    const text = await generateText(SYSTEM_PROMPT, userPrompt, 4000);
    const cleaned = text.replace(/```json|```/g, "").trim();
    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error("JSON parse failed. Raw:", text);
      return new Response(
        JSON.stringify({ error: "Claude returned invalid JSON", raw: text }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const inserted: any[] = [];
    for (const brief of parsed.briefs ?? []) {
      const kw = filtered.find((k: any) => k.keyword === brief.target_keyword);
      const { data, error } = await supabase
        .from("content_drafts")
        .insert({
          title: brief.titles?.[0] ?? brief.target_keyword,
          slug: brief.slug,
          target_keyword: brief.target_keyword,
          category: brief.category,
          status: "brief",
          brief,
          meta_title: brief.meta_title,
          meta_description: brief.meta_description,
          keyword_position: kw?.calcy_position ?? null,
          keyword_impressions: kw?.calcy_impressions_28d ?? null,
        })
        .select()
        .single();
      if (error) console.error("Insert brief error:", error);
      else inserted.push(data);
    }

    return new Response(JSON.stringify({ success: true, briefs: inserted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-brief error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
