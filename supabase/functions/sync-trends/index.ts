import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-triggered-by',
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const body = await req.json().catch(() => ({}))
  const isRbaEvent = body.rba_event === true
  const jobId = crypto.randomUUID()

  await supabase.from('sync_jobs').insert({
    id: jobId,
    job_type: 'trends',
    triggered_by: isRbaEvent ? 'rba_event' : (req.headers.get('x-triggered-by') || 'manual'),
    status: 'running',
  })

  try {
    const keywordClusters = [
      { query: 'mortgage calculator australia', category: 'mortgage' },
      { query: 'stamp duty calculator', category: 'stamp_duty' },
      { query: 'first home buyer australia', category: 'general' },
      { query: 'refinance home loan australia', category: 'refinance' },
      { query: 'rba interest rate', category: 'general' },
      { query: 'rent vs buy australia', category: 'rent_vs_buy' },
      { query: 'lmi calculator australia', category: 'lmi' },
      { query: 'borrowing power calculator', category: 'borrowing_power' },
    ]

    if (isRbaEvent) {
      keywordClusters.push(
        { query: 'rba rate cut 2026', category: 'general' },
        { query: 'interest rate change mortgage', category: 'mortgage' },
        { query: 'how much do i save if rates drop', category: 'mortgage' },
        { query: 'fixed vs variable rate australia', category: 'general' },
        { query: 'refinance after rate cut', category: 'refinance' },
      )
    }

    const trendResults: Array<{ keyword: string; category: string; direction: string; score: number }> = []

    for (const cluster of keywordClusters) {
      try {
        const reqPayload = JSON.stringify({
          comparisonItem: [{ keyword: cluster.query, geo: 'AU', time: 'today 12-m' }],
          category: 0,
          property: '',
        })
        const exploreResp = await fetch(
          `https://trends.google.com/trends/api/explore?hl=en-AU&tz=-600&req=${encodeURIComponent(reqPayload)}`,
          { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Calcy/1.0)', Accept: 'application/json' } }
        )
        const rawText = await exploreResp.text()
        const trendsData = JSON.parse(rawText.replace(/^\)\]\}'?\n?/, ''))
        const widgets = trendsData?.widgets || []
        const timelineWidget = widgets.find((w: any) => w.type === 'TIMESERIES')

        let trendDirection = 'stable'
        let trendScore = 50

        if (timelineWidget?.request && timelineWidget?.token) {
          const timelineResp = await fetch(
            `https://trends.google.com/trends/api/widgetdata/multiline?hl=en-AU&tz=-600&req=${encodeURIComponent(JSON.stringify(timelineWidget.request))}&token=${timelineWidget.token}`,
            { headers: { 'User-Agent': 'Mozilla/5.0' } }
          )
          const timelineRaw = await timelineResp.text()
          const timelineJson = JSON.parse(timelineRaw.replace(/^\)\]\}'?\n?/, ''))
          const timelineValues = timelineJson?.default?.timelineData || []

          if (timelineValues.length >= 8) {
            const recent = timelineValues.slice(-4).map((d: any) => d.value[0])
            const older = timelineValues.slice(-8, -4).map((d: any) => d.value[0])
            const recentAvg = recent.reduce((a: number, b: number) => a + b, 0) / recent.length
            const olderAvg = older.reduce((a: number, b: number) => a + b, 0) / older.length
            trendScore = recentAvg
            if (recentAvg > olderAvg * 1.15) trendDirection = 'rising'
            else if (recentAvg < olderAvg * 0.85) trendDirection = 'falling'
          }
        }

        trendResults.push({ keyword: cluster.query, category: cluster.category, direction: trendDirection, score: trendScore })

        await supabase.from('seo_keywords').update({
          trend_direction: trendDirection,
          trend_data: { score: trendScore, updated: new Date().toISOString() },
          updated_at: new Date().toISOString(),
        }).eq('keyword', cluster.query)

        await new Promise((resolve) => setTimeout(resolve, 1000))
      } catch (clusterError: any) {
        console.error(`Trends error for ${cluster.query}:`, clusterError.message)
      }
    }

    if (isRbaEvent) {
      await supabase.from('seo_reports').insert({
        report_type: 'rba_event',
        period_start: new Date().toISOString().split('T')[0],
        period_end: new Date().toISOString().split('T')[0],
        rba_keywords: trendResults,
        content_recommendations: [
          { action: 'Update RBA rate badge on homepage immediately', priority: 'urgent', keyword: 'rba rate australia' },
          { action: "Publish rate change impact article: \"How today's RBA decision affects your mortgage\"", priority: 'urgent', keyword: 'rba rate change mortgage impact' },
          { action: 'Update all calculator default interest rate inputs to reflect new market rates', priority: 'high', keyword: 'mortgage calculator australia' },
        ],
      })
    }

    await supabase.from('sync_jobs').update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      records_checked: keywordClusters.length,
      records_updated: trendResults.length,
      summary: { trends: trendResults, rba_event: isRbaEvent },
    }).eq('id', jobId)

    return new Response(JSON.stringify({ success: true, trends: trendResults }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
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
