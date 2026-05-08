-- Helper function for updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ---------- TABLE 1: rate_data ----------
CREATE TABLE public.rate_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  state TEXT,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  display_label TEXT,
  source_url TEXT,
  source_name TEXT,
  last_verified_at TIMESTAMPTZ DEFAULT NOW(),
  last_changed_at TIMESTAMPTZ DEFAULT NOW(),
  previous_value JSONB,
  auto_sync BOOLEAN DEFAULT false,
  sync_source TEXT,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX rate_data_unique_idx ON public.rate_data(category, COALESCE(state, 'national'), key);
CREATE INDEX rate_data_category_idx ON public.rate_data(category);
CREATE INDEX rate_data_state_idx ON public.rate_data(state);
CREATE INDEX rate_data_verified_idx ON public.rate_data(last_verified_at);

-- ---------- TABLE 2: rate_audit_log ----------
CREATE TABLE public.rate_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rate_data_id UUID REFERENCES public.rate_data(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  state TEXT,
  key TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB NOT NULL,
  changed_by TEXT NOT NULL,
  change_source TEXT,
  change_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX rate_audit_rate_data_idx ON public.rate_audit_log(rate_data_id);
CREATE INDEX rate_audit_created_idx ON public.rate_audit_log(created_at DESC);
CREATE INDEX rate_audit_category_idx ON public.rate_audit_log(category);

-- ---------- TABLE 3: sync_jobs ----------
CREATE TABLE public.sync_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_type TEXT NOT NULL,
  triggered_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  records_checked INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  summary JSONB,
  error_log JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX sync_jobs_type_idx ON public.sync_jobs(job_type);
CREATE INDEX sync_jobs_status_idx ON public.sync_jobs(status);
CREATE INDEX sync_jobs_created_idx ON public.sync_jobs(created_at DESC);

-- ---------- TABLE 4: seo_keywords ----------
CREATE TABLE public.seo_keywords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  target_page TEXT,
  priority INTEGER DEFAULT 5,
  monthly_search_volume INTEGER,
  adsense_cpc_estimate DECIMAL(6,2),
  intent TEXT,
  calcy_position DECIMAL(5,1),
  calcy_position_previous DECIMAL(5,1),
  calcy_clicks_28d INTEGER DEFAULT 0,
  calcy_impressions_28d INTEGER DEFAULT 0,
  calcy_ctr_28d DECIMAL(5,4),
  top_competitor_url TEXT,
  top_competitor_domain TEXT,
  top_competitor_position INTEGER,
  calcy_vs_competitor_gap INTEGER,
  opportunity_score DECIMAL(5,2),
  trend_direction TEXT,
  trend_data JSONB,
  content_gap_notes TEXT,
  recommended_action TEXT,
  last_synced_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX seo_keywords_category_idx ON public.seo_keywords(category);
CREATE INDEX seo_keywords_position_idx ON public.seo_keywords(calcy_position);
CREATE INDEX seo_keywords_opportunity_idx ON public.seo_keywords(opportunity_score DESC);
CREATE INDEX seo_keywords_priority_idx ON public.seo_keywords(priority);

-- ---------- TABLE 5: seo_reports ----------
CREATE TABLE public.seo_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_type TEXT NOT NULL,
  period_start DATE,
  period_end DATE,
  total_keywords_tracked INTEGER DEFAULT 0,
  keywords_improved INTEGER DEFAULT 0,
  keywords_declined INTEGER DEFAULT 0,
  keywords_new_page1 INTEGER DEFAULT 0,
  total_clicks_period INTEGER DEFAULT 0,
  total_impressions_period INTEGER DEFAULT 0,
  avg_ctr DECIMAL(5,4),
  avg_position DECIMAL(5,1),
  top_opportunities JSONB,
  biggest_wins JSONB,
  biggest_drops JSONB,
  content_recommendations JSONB,
  competitor_alerts JSONB,
  trending_keywords JSONB,
  rba_keywords JSONB,
  full_report_data JSONB,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX seo_reports_type_idx ON public.seo_reports(report_type);
CREATE INDEX seo_reports_generated_idx ON public.seo_reports(generated_at DESC);

-- ---------- TABLE 6: competitor_pages ----------
CREATE TABLE public.competitor_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  page_title TEXT,
  page_description TEXT,
  category TEXT,
  keywords_ranking_for JSONB,
  estimated_monthly_traffic INTEGER,
  domain_authority_estimate INTEGER,
  last_crawled_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX competitor_pages_domain_idx ON public.competitor_pages(domain);
CREATE INDEX competitor_pages_category_idx ON public.competitor_pages(category);

-- ---------- TABLE 7: gsc_oauth_tokens ----------
CREATE TABLE public.gsc_oauth_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  access_token TEXT,
  refresh_token TEXT NOT NULL,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMPTZ,
  scope TEXT,
  site_url TEXT NOT NULL DEFAULT 'https://calcy.com.au',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE public.rate_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gsc_oauth_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rate_data_public_read" ON public.rate_data FOR SELECT USING (true);
CREATE POLICY "rate_data_admin_write" ON public.rate_data FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "audit_log_admin" ON public.rate_audit_log FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "sync_jobs_admin" ON public.sync_jobs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "seo_keywords_admin" ON public.seo_keywords FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "seo_reports_admin" ON public.seo_reports FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "competitor_pages_admin" ON public.competitor_pages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "gsc_tokens_admin" ON public.gsc_oauth_tokens FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- updated_at triggers
-- ============================================================
CREATE TRIGGER rate_data_updated_at BEFORE UPDATE ON public.rate_data
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER seo_keywords_updated_at BEFORE UPDATE ON public.seo_keywords
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER competitor_pages_updated_at BEFORE UPDATE ON public.competitor_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER gsc_tokens_updated_at BEFORE UPDATE ON public.gsc_oauth_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- SEED: rate_data
-- ============================================================
INSERT INTO public.rate_data (category, state, key, value, display_label, source_url, source_name, auto_sync, sync_source) VALUES
('rba_cash_rate', NULL, 'cash_rate',
  '{"rate": 4.10, "effective_date": "2026-03-18", "previous_rate": 4.35, "next_meeting": "2026-05-19"}'::jsonb,
  'RBA Cash Rate', 'https://www.rba.gov.au/statistics/cash-rate/', 'Reserve Bank of Australia', true, 'rba_api'),
('fhb_threshold', 'NSW', 'stamp_duty',
  '{"full_exemption_to": 800000, "concession_to": 1000000, "effective_date": "2023-07-01"}'::jsonb,
  'NSW First Home Buyer Stamp Duty Threshold',
  'https://www.revenue.nsw.gov.au/taxes-duties-levies-royalties/transfer-duty/first-home-buyer',
  'Revenue NSW', false, 'manual'),
('fhb_threshold', 'VIC', 'stamp_duty',
  '{"full_exemption_to": 600000, "concession_to": 750000, "effective_date": "2021-07-01"}'::jsonb,
  'VIC First Home Buyer Stamp Duty Threshold',
  'https://www.sro.vic.gov.au/first-home-buyer', 'State Revenue Office Victoria', false, 'manual'),
('fhb_threshold', 'QLD', 'stamp_duty',
  '{"full_exemption_to": 500000, "concession_to": 550000, "effective_date": "2012-01-01"}'::jsonb,
  'QLD First Home Buyer Stamp Duty Threshold',
  'https://qro.qld.gov.au/duties/transfer-duty/calculate-transfer-duty/first-home-concession/',
  'Queensland Revenue Office', false, 'manual'),
('fhb_threshold', 'WA', 'stamp_duty',
  '{"full_exemption_to": 430000, "concession_to": 530000, "effective_date": "2024-07-01"}'::jsonb,
  'WA First Home Buyer Stamp Duty Threshold',
  'https://www.finance.wa.gov.au/cms/State_Revenue/Transfer_Duty/Transfer_Duty_Assessment/First_Home_Owner_Rate_of_Duty.aspx',
  'Department of Finance WA', false, 'manual'),
('fhog', 'NSW', 'grant',
  '{"amount": 10000, "max_property_value": 600000, "new_homes_only": true, "effective_date": "2023-01-01"}'::jsonb,
  'NSW First Home Owner Grant',
  'https://www.revenue.nsw.gov.au/grants-schemes/first-home-buyer/first-home-owners-grant',
  'Revenue NSW', false, 'manual'),
('fhog', 'VIC', 'grant',
  '{"amount": 10000, "max_property_value": 750000, "new_homes_only": true, "effective_date": "2021-01-01"}'::jsonb,
  'VIC First Home Owner Grant',
  'https://www.sro.vic.gov.au/first-home-owner-grant', 'State Revenue Office Victoria', false, 'manual'),
('fhog', 'QLD', 'grant',
  '{"amount": 30000, "max_property_value": 750000, "new_homes_only": true, "effective_date": "2023-11-20"}'::jsonb,
  'QLD First Home Owner Grant',
  'https://qro.qld.gov.au/grants-property-concessions/first-home-owner-grant/',
  'Queensland Revenue Office', false, 'manual'),
('fhog', 'SA', 'grant',
  '{"amount": 15000, "max_property_value": null, "new_homes_only": true, "effective_date": "2023-07-01"}'::jsonb,
  'SA First Home Owner Grant',
  'https://www.revenuesa.sa.gov.au/grants-and-concessions/first-home-owners-grant', 'Revenue SA', false, 'manual'),
('fhog', 'WA', 'grant',
  '{"amount": 10000, "max_property_value": 750000, "new_homes_only": true, "effective_date": "2021-01-01"}'::jsonb,
  'WA First Home Owner Grant',
  'https://www.finance.wa.gov.au/cms/State_Revenue/FHOG/First_Home_Owner_Grant.aspx',
  'Department of Finance WA', false, 'manual'),
('fhog', 'TAS', 'grant',
  '{"amount": 30000, "max_property_value": null, "new_homes_only": true, "effective_date": "2023-07-01"}'::jsonb,
  'TAS First Home Owner Grant',
  'https://www.sro.tas.gov.au/first-home-owner', 'State Revenue Office Tasmania', false, 'manual'),
('fhog', 'NT', 'grant',
  '{"amount": 10000, "max_property_value": null, "new_homes_only": true, "effective_date": "2021-01-01"}'::jsonb,
  'NT First Home Owner Grant',
  'https://ntrevenue.nt.gov.au/home-owner-grants/first-home-owner-grant', 'NT Revenue Office', false, 'manual'),
('hia_scheme', NULL, 'first_home_guarantee',
  '{"places_per_year": 35000, "min_deposit_pct": 5, "individual_income_cap": 125000, "couple_income_cap": 200000, "price_caps": {"NSW_metro": 900000, "NSW_regional": 750000, "VIC_metro": 800000, "VIC_regional": 650000, "QLD_metro": 700000, "QLD_regional": 550000, "WA_metro": 600000, "WA_regional": 450000, "SA_metro": 600000, "SA_regional": 450000, "TAS_metro": 600000, "TAS_regional": 450000, "ACT": 750000, "NT": 600000}, "effective_date": "2024-07-01"}'::jsonb,
  'First Home Guarantee (Housing Australia)',
  'https://www.housingaustralia.gov.au/support-buy-home/first-home-guarantee', 'Housing Australia', false, 'manual'),
('lmi_bands', NULL, 'owner_occupier',
  '{"bands": [{"lvr_from": 80.01, "lvr_to": 85.00, "rate": 0.0066}, {"lvr_from": 85.01, "lvr_to": 90.00, "rate": 0.0119}, {"lvr_from": 90.01, "lvr_to": 95.00, "rate": 0.0196}, {"lvr_from": 95.01, "lvr_to": 100.00, "rate": 0.0310}], "stamp_duty_surcharge": 0.10, "effective_date": "2026-01-01", "note": "Indicative rates — actual premiums vary by lender insurer (Helia or QBE)"}'::jsonb,
  'LMI Rate Bands — Owner Occupier', 'https://www.helia.com.au/', 'Helia (indicative)', false, 'manual'),
('lmi_bands', NULL, 'investor',
  '{"bands": [{"lvr_from": 80.01, "lvr_to": 85.00, "rate": 0.0080}, {"lvr_from": 85.01, "lvr_to": 90.00, "rate": 0.0145}, {"lvr_from": 90.01, "lvr_to": 95.00, "rate": 0.0230}, {"lvr_from": 95.01, "lvr_to": 100.00, "rate": 0.0360}], "stamp_duty_surcharge": 0.10, "effective_date": "2026-01-01", "note": "Indicative rates — actual premiums vary by lender insurer (Helia or QBE)"}'::jsonb,
  'LMI Rate Bands — Investor', 'https://www.helia.com.au/', 'Helia (indicative)', false, 'manual');

-- ============================================================
-- SEED: seo_keywords
-- ============================================================
INSERT INTO public.seo_keywords (keyword, category, target_page, priority, intent, adsense_cpc_estimate) VALUES
('mortgage calculator australia', 'mortgage', '/mortgage-calculator', 1, 'transactional', 8.50),
('home loan calculator australia', 'mortgage', '/mortgage-calculator', 1, 'transactional', 8.00),
('mortgage repayment calculator', 'mortgage', '/mortgage-calculator', 1, 'transactional', 7.50),
('mortgage calculator', 'mortgage', '/mortgage-calculator', 2, 'transactional', 6.00),
('home loan repayment calculator', 'mortgage', '/mortgage-calculator', 2, 'transactional', 7.00),
('fortnightly mortgage calculator', 'mortgage', '/mortgage-calculator', 3, 'transactional', 5.50),
('mortgage calculator with amortisation', 'mortgage', '/mortgage-calculator', 3, 'transactional', 6.00),
('stamp duty calculator australia', 'stamp_duty', '/stamp-duty-calculator', 1, 'transactional', 6.00),
('stamp duty calculator nsw', 'stamp_duty', '/stamp-duty-calculator', 1, 'transactional', 6.50),
('stamp duty calculator qld', 'stamp_duty', '/stamp-duty-calculator', 1, 'transactional', 6.00),
('stamp duty calculator vic', 'stamp_duty', '/stamp-duty-calculator', 1, 'transactional', 6.00),
('stamp duty calculator wa', 'stamp_duty', '/stamp-duty-calculator', 2, 'transactional', 5.50),
('first home buyer stamp duty nsw', 'stamp_duty', '/stamp-duty-calculator', 1, 'informational', 7.00),
('stamp duty exemption first home buyer', 'stamp_duty', '/stamp-duty-calculator', 2, 'informational', 6.50),
('how much stamp duty australia', 'stamp_duty', '/stamp-duty-calculator', 2, 'informational', 5.50),
('borrowing power calculator australia', 'borrowing_power', '/borrowing-power-calculator', 1, 'transactional', 9.00),
('how much can i borrow calculator', 'borrowing_power', '/borrowing-power-calculator', 1, 'transactional', 8.50),
('home loan borrowing capacity', 'borrowing_power', '/borrowing-power-calculator', 2, 'transactional', 8.00),
('borrowing calculator australia', 'borrowing_power', '/borrowing-power-calculator', 2, 'transactional', 7.50),
('how much can i borrow for a house australia', 'borrowing_power', '/borrowing-power-calculator', 1, 'informational', 8.00),
('lmi calculator australia', 'lmi', '/lmi-calculator', 1, 'transactional', 7.00),
('lenders mortgage insurance calculator', 'lmi', '/lmi-calculator', 1, 'transactional', 7.50),
('lmi calculator', 'lmi', '/lmi-calculator', 2, 'transactional', 6.00),
('how much is lmi australia', 'lmi', '/lmi-calculator', 2, 'informational', 6.50),
('avoid lmi australia', 'lmi', '/lmi-calculator', 2, 'informational', 7.00),
('rent vs buy calculator australia', 'rent_vs_buy', '/rent-vs-buy-calculator', 1, 'transactional', 8.00),
('should i rent or buy australia 2026', 'rent_vs_buy', '/rent-vs-buy-calculator', 1, 'informational', 7.50),
('renting vs buying australia', 'rent_vs_buy', '/rent-vs-buy-calculator', 2, 'informational', 7.00),
('is it better to rent or buy australia', 'rent_vs_buy', '/rent-vs-buy-calculator', 1, 'informational', 7.00),
('refinance calculator australia', 'refinance', '/refinance-calculator', 1, 'transactional', 12.00),
('refinance home loan calculator', 'refinance', '/refinance-calculator', 1, 'transactional', 11.00),
('is it worth refinancing calculator', 'refinance', '/refinance-calculator', 1, 'transactional', 10.00),
('refinance savings calculator', 'refinance', '/refinance-calculator', 2, 'transactional', 9.00),
('home loan refinance australia', 'refinance', '/refinance-calculator', 2, 'informational', 11.00),
('first home buyer grants australia 2026', 'general', '/guides/first-home-buyer-grants-2026', 1, 'informational', 8.00),
('first home owner grant', 'general', '/guides/first-home-buyer-grants-2026', 1, 'informational', 7.50),
('what is lmi', 'general', '/guides/what-is-lmi', 2, 'informational', 5.00),
('fixed vs variable rate home loan', 'general', '/guides/fixed-vs-variable-rate', 2, 'informational', 7.00),
('rba cash rate australia', 'general', '/mortgage-calculator', 2, 'informational', 4.00);

-- ============================================================
-- SEED: competitor_pages
-- ============================================================
INSERT INTO public.competitor_pages (domain, url, page_title, category, domain_authority_estimate) VALUES
('moneysmart.gov.au', 'https://moneysmart.gov.au/home-loans/mortgage-calculator', 'Mortgage calculator | MoneySmart', 'mortgage', 72),
('canstar.com.au', 'https://www.canstar.com.au/home-loans/mortgage-repayment-calculator/', 'Mortgage Repayment Calculator | Canstar', 'mortgage', 68),
('finder.com.au', 'https://www.finder.com.au/home-loan-calculator', 'Home Loan Calculator | Finder', 'mortgage', 70),
('westpac.com.au', 'https://www.westpac.com.au/personal-banking/home-loans/calculator/repayment-calculator/', 'Repayment Calculator | Westpac', 'mortgage', 80),
('commbank.com.au', 'https://www.commbank.com.au/home-loans/calculators-and-tools/repayments-calculator.html', 'Repayments Calculator | CommBank', 'mortgage', 82),
('ratecity.com.au', 'https://www.ratecity.com.au/home-loans/mortgage-calculator', 'Mortgage Calculator | RateCity', 'mortgage', 62),
('domain.com.au', 'https://www.domain.com.au/calculators/stamp-duty-calculator/', 'Stamp Duty Calculator | Domain', 'stamp_duty', 72),
('realestate.com.au', 'https://www.realestate.com.au/buy/stamp-duty-calculator/', 'Stamp Duty Calculator | realestate.com.au', 'stamp_duty', 75),
('moneysmart.gov.au', 'https://moneysmart.gov.au/home-loans/borrowing-power-calculator', 'Borrowing power calculator | MoneySmart', 'borrowing_power', 72),
('canstar.com.au', 'https://www.canstar.com.au/home-loans/borrowing-power-calculator/', 'Borrowing Power Calculator | Canstar', 'borrowing_power', 68);
