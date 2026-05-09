import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    const { briefId } = await req.json();
    if (!briefId || typeof briefId !== "string") {
      return new Response(JSON.stringify({ error: "briefId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: row, error } = await supabase
      .from("content_drafts")
      .select("*")
      .eq("id", briefId)
      .single();
    if (error || !row) {
      return new Response(JSON.stringify({ error: "Brief not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const brief = row.brief ?? {};
    const target = brief.word_count_target || 1200;

    const system = `You are an expert Australian mortgage and property writer creating content for calcy.com.au.

WRITING RULES:
- Write for Australians. Use Australian spelling (colour, organisation, recognised).
- Always mention specific Australian states, RBA rates, and Australian government schemes.
- Current RBA cash rate: 4.35% (raised 5 May 2026 — third consecutive hike).
- Write in plain English. No jargon without explanation.
- Every article must include a section embedding the relevant Calcy calculator.
- Use proper H2, H3 hierarchy.
- Include a FAQ section at the end with 4-5 questions using FAQ schema markup.
- Target word count: ${target} words.
- Write the full article in markdown format.
- Do NOT include the H1 title in the body — it will be added separately.
- End with a "Key takeaways" bullet list.
- Internal links: naturally mention and link to ${(brief.internal_links ?? []).join(", ")}.

Respond ONLY with the article markdown. No preamble, no explanation.`;

    const userPrompt = `Write a complete ${target}-word article for calcy.com.au targeting the keyword "${row.target_keyword}".

Title: ${brief.titles?.[0] ?? row.title}
Meta description: ${row.meta_description ?? ""}

Article outline to follow:
${(brief.outline ?? []).join("\n")}

Key statistics and facts to include:
${(brief.key_stats_to_include ?? []).join("\n")}

Calculator to embed: ${brief.calculator_to_embed ?? ""}
(Include a section that says "Use Calcy's free calculator to calculate your exact figure" with a link to ${brief.calculator_to_embed ?? ""})

Write the complete article now in markdown format.`;

    const articleContent = await generateText(system, userPrompt, 8000);
    const wordCount = articleContent.split(/\s+/).filter(Boolean).length;

    const { error: updErr } = await supabase
      .from("content_drafts")
      .update({
        content: articleContent,
        word_count: wordCount,
        status: "draft",
      })
      .eq("id", briefId);
    if (updErr) throw updErr;

    return new Response(JSON.stringify({ success: true, word_count: wordCount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-draft error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
