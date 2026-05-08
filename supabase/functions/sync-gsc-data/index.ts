import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-triggered-by',
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const GSC_CLIENT_ID = Deno.env.get('GSC_CLIENT_ID')!
const GSC_CLIENT_SECRET = Deno.env.get('GSC_CLIENT_SECRET')!
const SITE_URL_PROP = 'https://calcy.com.au'

async function getValidAccessToken(): Promise<string> {
  const { data: tokenData } = await supabase
    .from('gsc_oauth_tokens')
    .select('*')
    .eq('is_active', true)
    .eq('site_url', SITE_URL_PROP)
    .maybeSingle()

  if (!tokenData) throw new Error('No GSC token found. Please connect Google Search Console in admin.')

  const expiresAt = new Date(tokenData.expires_at)
  if (expiresAt > new Date(Date.now() + 60000)) return tokenData.access_token

  const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GSC_CLIENT_ID,
      client_secret: GSC_CLIENT_SECRET,
      refresh_token: tokenData.refresh_token,
      grant_type: 'refresh_token',
    }),
  })

  const refreshed = await refreshResponse.json()
  if (refreshed.error) throw new Error(`Token refresh failed: ${refreshed.error}`)

  await supabase.from('gsc_oauth_tokens').update({
    access_token: refreshed.access_token,
    expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
  }).eq('site_url', SITE_URL_PROP)

  return refreshed.access_token
}

function categoriseKeyword(keyword: string): string {
  if (/stamp duty|transfer duty/.test(keyword)) return 'stamp_duty'
  if (/lmi|lenders mortgage|mortgage insurance/.test(keyword)) return 'lmi'
  if (/borrow|borrowing|borrowing power|how much can i/.test(keyword)) return 'borrowing_power'
  if (/refinanc/.test(keyword)) return 'refinance'
  if (/rent vs buy|rent or buy|renting vs buying/.test(keyword)) return 'rent_vs_buy'
  if (/extra repayment|pay off loan faster/.test(keyword)) return 'extra_repayments'
  if (/compare loan|loan comparison/.test(keyword)) return 'loan_comparison'
  if (/first home|fhog|fhb|fhg/.test(keyword)) return 'general'
  if (/mortgage|home loan|repayment/.test(keyword)) return 'mortgage'
  return 'general'
}

function getTargetPage(keyword: string): string {
  const cat = categoriseKeyword(keyword)
  const pageMap: Record<string, string> = {
    stamp_duty: '/stamp-duty-calculator',
    lmi: '/lmi-calculator',
    borrowing_power: '/borrowing-power-calculator',
    refinance: '/refinance-calculator',
    rent_vs_buy: '/rent-vs-buy-calculator',
    extra_repayments: '/extra-repayments-calculator',
    loan_comparison: '/loan-comparison-calculator',
    mortgage: '/mortgage-calculator',
    general: '/guides',
  }
  return pageMap[cat] || '/'
}

function generateRecommendation(keyword: string, position: number, targetPage: string): string {
  if (position <= 15) return `Position ${position} — near page 1. Add "${keyword}" to H1 or H2 heading on ${targetPage} and update meta description.`
  if (position <= 20) return `Position ${position} — improve content depth on ${targetPage}. Add a dedicated section addressing "${keyword}" with 200+ words.`
  if (position <= 30) return `Position ${position} — consider creating a dedicated article or landing page specifically targeting "${keyword}".`
  return `Position ${position} — keyword needs a dedicated content strategy. Start with an article targeting "${keyword}".`
}

async function generateWeeklyReport(
  opportunities: Array<{ keyword: string; position: number; impressions: number; clicks: number }>,
  allRows: Array<{ keys: string[]; position: number; clicks: number; impressions: number }>
) {
  const today = new Date()
  const periodStart = new Date(today.getTime() - 28 * 86400000)
  const totalClicks = allRows.reduce((s, r) => s + r.clicks, 0)
  const totalImpressions = allRows.reduce((s, r) => s + r.impressions, 0)
  const avgPosition = allRows.length > 0 ? allRows.reduce((s, r) => s + r.position, 0) / allRows.length : 0

  const { data: prevReport } = await supabase
    .from('seo_reports')
    .select('total_clicks_period, avg_position')
    .eq('report_type', 'weekly_summary')
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const contentRecommendations = opportunities.slice(0, 10).map((opp) => ({
    keyword: opp.keyword,
    current_position: opp.position,
    impressions_28d: opp.impressions,
    target_page: getTargetPage(opp.keyword),
    action: generateRecommendation(opp.keyword, opp.position, getTargetPage(opp.keyword)),
    priority: opp.position <= 15 ? 'high' : 'medium',
    estimated_monthly_clicks_if_page1: Math.round(opp.impressions * 0.3),
  }))

  await supabase.from('seo_reports').insert({
    report_type: 'weekly_summary',
    period_start: periodStart.toISOString().split('T')[0],
    period_end: today.toISOString().split('T')[0],
    total_keywords_tracked: allRows.length,
    total_clicks_period: totalClicks,
    total_impressions_period: totalImpressions,
    avg_position: Math.round(avgPosition * 10) / 10,
    top_opportunities: opportunities.slice(0, 10),
    content_recommendations: contentRecommendations,
    full_report_data: {
      previous_clicks: prevReport?.total_clicks_period,
      previous_avg_position: prevReport?.avg_position,
      clicks_change: prevReport ? totalClicks - (prevReport.total_clicks_period ?? 0) : null,
      position_change: prevReport ? avgPosition - (prevReport.avg_position ?? 0) : null,
    },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const jobId = crypto.randomUUID()
  const startedAt = new Date()

  await supabase.from('sync_jobs').insert({
    id: jobId,
    job_type: 'gsc_data',
    triggered_by: req.headers.get('x-triggered-by') || 'manual',
    status: 'running',
  })

  try {
    const accessToken = await getValidAccessToken()

    const gscResponse = await fetch(
      'https://www.googleapis.com/webmasters/v3/sites/https%3A%2F%2Fcalcy.com.au%2F/searchAnalytics/query',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: new Date(Date.now() - 28 * 86400000).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          dimensions: ['query'],
          rowLimit: 1000,
          startRow: 0,
        }),
      }
    )

    const gscData = await gscResponse.json()
    if (gscData.error) throw new Error(`GSC API error: ${JSON.stringify(gscData.error)}`)

    const rows = gscData.rows || []
    let updated = 0
    let newKeywords = 0
    const opportunities: Array<{ keyword: string; position: number; impressions: number; clicks: number }> = []

    for (const row of rows) {
      const keyword = row.keys[0].toLowerCase()
      const position = Math.round(row.position * 10) / 10
      const clicks = row.clicks
      const impressions = row.impressions
      const ctr = row.ctr
      const opportunityScore = position > 10 && position <= 30 ? (impressions * (1 / (position - 10))) / 100 : 0

      const { data: existing } = await supabase
        .from('seo_keywords')
        .select('id, calcy_position, category')
        .eq('keyword', keyword)
        .maybeSingle()

      if (existing) {
        await supabase.from('seo_keywords').update({
          calcy_position_previous: existing.calcy_position,
          calcy_position: position,
          calcy_clicks_28d: clicks,
          calcy_impressions_28d: impressions,
          calcy_ctr_28d: ctr,
          monthly_search_volume: Math.round((impressions * 30) / 28),
          opportunity_score: opportunityScore,
          last_synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq('id', existing.id)
        updated++
      } else {
        const category = categoriseKeyword(keyword)
        await supabase.from('seo_keywords').insert({
          keyword,
          category,
          target_page: getTargetPage(keyword),
          priority: impressions > 1000 ? 2 : impressions > 100 ? 4 : 6,
          calcy_position: position,
          calcy_clicks_28d: clicks,
          calcy_impressions_28d: impressions,
          calcy_ctr_28d: ctr,
          monthly_search_volume: Math.round((impressions * 30) / 28),
          opportunity_score: opportunityScore,
          intent: position > 1 ? 'informational' : 'transactional',
          last_synced_at: new Date().toISOString(),
        })
        newKeywords++
      }

      if (position > 10 && position <= 30 && impressions > 50) {
        opportunities.push({ keyword, position, impressions, clicks })
      }
    }

    opportunities.sort((a, b) => b.impressions / b.position - a.impressions / a.position)
    await generateWeeklyReport(opportunities, rows)

    const duration = Date.now() - startedAt.getTime()
    await supabase.from('sync_jobs').update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      duration_ms: duration,
      records_checked: rows.length,
      records_updated: updated,
      summary: {
        total_queries: rows.length,
        existing_updated: updated,
        new_keywords: newKeywords,
        top_opportunities: opportunities.slice(0, 5),
      },
    }).eq('id', jobId)

    return new Response(
      JSON.stringify({ success: true, total: rows.length, updated, newKeywords, opportunities: opportunities.slice(0, 10) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    await supabase.from('sync_jobs').update({
      status: 'failed',
      completed_at: new Date().toISOString(),
      error_log: { message: error.message },
    }).eq('id', jobId)

    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
