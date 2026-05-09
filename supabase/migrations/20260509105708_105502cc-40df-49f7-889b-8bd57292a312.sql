
CREATE TABLE public.programmatic_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_type TEXT NOT NULL,
  url_path TEXT NOT NULL UNIQUE,
  params JSONB NOT NULL,
  target_keyword TEXT,
  meta_title TEXT,
  meta_description TEXT,
  h1 TEXT,
  intro_text TEXT,
  calculated_result JSONB,
  impressions_28d INTEGER NOT NULL DEFAULT 0,
  clicks_28d INTEGER NOT NULL DEFAULT 0,
  position NUMERIC(5,1),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX prog_pages_type_idx ON public.programmatic_pages(page_type);
CREATE INDEX prog_pages_path_idx ON public.programmatic_pages(url_path);
CREATE INDEX prog_pages_keyword_idx ON public.programmatic_pages(target_keyword);

ALTER TABLE public.programmatic_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prog_pages_public_read" ON public.programmatic_pages
  FOR SELECT USING (is_active = true);

CREATE POLICY "prog_pages_admin_all" ON public.programmatic_pages
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_programmatic_pages_updated_at
  BEFORE UPDATE ON public.programmatic_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed: STAMP DUTY
INSERT INTO public.programmatic_pages (page_type, url_path, params, target_keyword, meta_title, meta_description, h1) VALUES
('stamp_duty', '/calculate/stamp-duty/nsw/500000', '{"state":"NSW","propertyValue":500000,"buyerType":"owner-occupier"}', 'stamp duty nsw 500000', 'Stamp Duty on $500,000 Property in NSW 2026 | Calcy', 'Calculate exact stamp duty on a $500,000 property in NSW. Includes first home buyer exemptions and total upfront costs.', 'Stamp duty on a $500,000 property in NSW'),
('stamp_duty', '/calculate/stamp-duty/nsw/600000', '{"state":"NSW","propertyValue":600000,"buyerType":"owner-occupier"}', 'stamp duty nsw 600000', 'Stamp Duty on $600,000 Property in NSW 2026 | Calcy', 'Calculate exact stamp duty on a $600,000 property in NSW. First home buyers may be exempt.', 'Stamp duty on a $600,000 property in NSW'),
('stamp_duty', '/calculate/stamp-duty/nsw/700000', '{"state":"NSW","propertyValue":700000,"buyerType":"owner-occupier"}', 'stamp duty nsw 700000', 'Stamp Duty on $700,000 Property in NSW 2026 | Calcy', 'Calculate exact stamp duty on a $700,000 property in NSW. See first home buyer savings.', 'Stamp duty on a $700,000 property in NSW'),
('stamp_duty', '/calculate/stamp-duty/nsw/800000', '{"state":"NSW","propertyValue":800000,"buyerType":"owner-occupier"}', 'stamp duty nsw 800000', 'Stamp Duty on $800,000 Property in NSW 2026 | Calcy', 'Calculate stamp duty on $800,000 in NSW. First home buyers are fully exempt at this price.', 'Stamp duty on an $800,000 property in NSW'),
('stamp_duty', '/calculate/stamp-duty/nsw/1000000', '{"state":"NSW","propertyValue":1000000,"buyerType":"owner-occupier"}', 'stamp duty nsw 1000000', 'Stamp Duty on $1,000,000 Property in NSW 2026 | Calcy', 'Calculate stamp duty on a $1 million property in NSW 2026.', 'Stamp duty on a $1,000,000 property in NSW'),
('stamp_duty', '/calculate/stamp-duty/nsw/700000/first-home-buyer', '{"state":"NSW","propertyValue":700000,"buyerType":"first-home-buyer"}', 'stamp duty nsw 700000 first home buyer', 'Stamp Duty for First Home Buyers on $700k in NSW 2026 | Calcy', 'First home buyers pay $0 stamp duty on properties up to $800,000 in NSW. Calculate your saving.', 'Stamp duty for first home buyers on a $700,000 property in NSW'),
('stamp_duty', '/calculate/stamp-duty/qld/500000', '{"state":"QLD","propertyValue":500000,"buyerType":"owner-occupier"}', 'stamp duty qld 500000', 'Stamp Duty on $500,000 Property in QLD 2026 | Calcy', 'Calculate exact stamp duty on a $500,000 property in Queensland. First home buyers may be exempt.', 'Stamp duty on a $500,000 property in Queensland'),
('stamp_duty', '/calculate/stamp-duty/qld/600000', '{"state":"QLD","propertyValue":600000,"buyerType":"owner-occupier"}', 'stamp duty qld 600000', 'Stamp Duty on $600,000 Property in QLD 2026 | Calcy', 'Calculate stamp duty on $600,000 in Queensland 2026.', 'Stamp duty on a $600,000 property in Queensland'),
('stamp_duty', '/calculate/stamp-duty/qld/700000', '{"state":"QLD","propertyValue":700000,"buyerType":"owner-occupier"}', 'stamp duty qld 700000', 'Stamp Duty on $700,000 Property in QLD 2026 | Calcy', 'Calculate stamp duty on $700,000 in Queensland 2026.', 'Stamp duty on a $700,000 property in Queensland'),
('stamp_duty', '/calculate/stamp-duty/qld/500000/first-home-buyer', '{"state":"QLD","propertyValue":500000,"buyerType":"first-home-buyer"}', 'stamp duty qld 500000 first home buyer', 'Stamp Duty for First Home Buyers on $500k in QLD 2026 | Calcy', 'First home buyers pay $0 stamp duty on properties up to $500,000 in Queensland. Calculate your saving.', 'Stamp duty for first home buyers on a $500,000 property in QLD'),
('stamp_duty', '/calculate/stamp-duty/vic/500000', '{"state":"VIC","propertyValue":500000,"buyerType":"owner-occupier"}', 'stamp duty vic 500000', 'Stamp Duty on $500,000 Property in Victoria 2026 | Calcy', 'Calculate stamp duty on $500,000 in Victoria 2026. First home buyers exempt up to $600,000.', 'Stamp duty on a $500,000 property in Victoria'),
('stamp_duty', '/calculate/stamp-duty/vic/600000', '{"state":"VIC","propertyValue":600000,"buyerType":"owner-occupier"}', 'stamp duty vic 600000', 'Stamp Duty on $600,000 Property in Victoria 2026 | Calcy', 'Calculate stamp duty on $600,000 in Victoria. First home buyers are fully exempt at this price.', 'Stamp duty on a $600,000 property in Victoria'),
('stamp_duty', '/calculate/stamp-duty/vic/700000', '{"state":"VIC","propertyValue":700000,"buyerType":"owner-occupier"}', 'stamp duty vic 700000', 'Stamp Duty on $700,000 Property in Victoria 2026 | Calcy', 'Calculate stamp duty on $700,000 in Victoria 2026.', 'Stamp duty on a $700,000 property in Victoria'),
('stamp_duty', '/calculate/stamp-duty/vic/600000/first-home-buyer', '{"state":"VIC","propertyValue":600000,"buyerType":"first-home-buyer"}', 'stamp duty vic 600000 first home buyer', 'Stamp Duty for First Home Buyers on $600k in VIC 2026 | Calcy', 'First home buyers pay $0 stamp duty up to $600,000 in Victoria. Calculate your saving.', 'Stamp duty for first home buyers on a $600,000 property in Victoria'),
('stamp_duty', '/calculate/stamp-duty/wa/400000', '{"state":"WA","propertyValue":400000,"buyerType":"owner-occupier"}', 'stamp duty wa 400000', 'Stamp Duty on $400,000 Property in WA 2026 | Calcy', 'Calculate stamp duty on $400,000 in Western Australia. First home buyers may be exempt.', 'Stamp duty on a $400,000 property in Western Australia'),
('stamp_duty', '/calculate/stamp-duty/wa/500000', '{"state":"WA","propertyValue":500000,"buyerType":"owner-occupier"}', 'stamp duty wa 500000', 'Stamp Duty on $500,000 Property in WA 2026 | Calcy', 'Calculate stamp duty on $500,000 in Western Australia 2026.', 'Stamp duty on a $500,000 property in Western Australia'),
('stamp_duty', '/calculate/stamp-duty/wa/430000/first-home-buyer', '{"state":"WA","propertyValue":430000,"buyerType":"first-home-buyer"}', 'stamp duty wa first home buyer 430000', 'WA Stamp Duty First Home Buyer $430k — Exempt | Calcy', 'First home buyers in WA pay $0 stamp duty on properties up to $430,000. Calculate your saving.', 'Stamp duty for first home buyers on a $430,000 property in WA'),
('stamp_duty', '/calculate/stamp-duty/act/600000', '{"state":"ACT","propertyValue":600000,"buyerType":"owner-occupier"}', 'stamp duty act 600000', 'Stamp Duty on $600,000 Property in ACT 2026 | Calcy', 'Calculate stamp duty on $600,000 in the ACT. The Home Buyer Concession Scheme may eliminate your stamp duty.', 'Stamp duty on a $600,000 property in the ACT'),
('stamp_duty', '/calculate/stamp-duty/act/700000', '{"state":"ACT","propertyValue":700000,"buyerType":"owner-occupier"}', 'stamp duty act 700000', 'Stamp Duty on $700,000 Property in ACT 2026 | Calcy', 'Calculate stamp duty on $700,000 in the ACT 2026. Income-tested exemptions available.', 'Stamp duty on a $700,000 property in the ACT'),
('stamp_duty', '/calculate/stamp-duty/act/700000/first-home-buyer', '{"state":"ACT","propertyValue":700000,"buyerType":"first-home-buyer"}', 'act stamp duty calculator first home buyer', 'ACT Stamp Duty First Home Buyer Calculator 2026 | Calcy', 'ACT first home buyers may pay $0 stamp duty through the Home Buyer Concession Scheme. Calculate yours.', 'ACT stamp duty for first home buyers — Home Buyer Concession Scheme'),
('mortgage', '/calculate/mortgage/500000/6.39/30', '{"loanAmount":500000,"interestRate":6.39,"termYears":30}', 'mortgage repayments 500000 6.39%', 'Mortgage Repayments on $500,000 at 6.39% — 30 Years | Calcy', 'Calculate exact mortgage repayments on a $500,000 loan at 6.39% over 30 years. Weekly, fortnightly and monthly.', 'Mortgage repayments on a $500,000 loan at 6.39%'),
('mortgage', '/calculate/mortgage/600000/6.39/30', '{"loanAmount":600000,"interestRate":6.39,"termYears":30}', 'mortgage repayments 600000', 'Mortgage Repayments on $600,000 at 6.39% — 30 Years | Calcy', 'Calculate exact mortgage repayments on a $600,000 loan at 6.39% over 30 years.', 'Mortgage repayments on a $600,000 loan at 6.39%'),
('mortgage', '/calculate/mortgage/650000/6.39/30', '{"loanAmount":650000,"interestRate":6.39,"termYears":30}', 'mortgage repayments 650000', 'Mortgage Repayments on $650,000 at 6.39% — 30 Years | Calcy', 'Calculate exact mortgage repayments on a $650,000 loan at 6.39% over 30 years.', 'Mortgage repayments on a $650,000 loan at 6.39%'),
('mortgage', '/calculate/mortgage/700000/6.39/30', '{"loanAmount":700000,"interestRate":6.39,"termYears":30}', 'mortgage repayments 700000', 'Mortgage Repayments on $700,000 at 6.39% — 30 Years | Calcy', 'Calculate exact mortgage repayments on a $700,000 loan at 6.39% over 30 years.', 'Mortgage repayments on a $700,000 loan at 6.39%'),
('mortgage', '/calculate/mortgage/800000/6.39/30', '{"loanAmount":800000,"interestRate":6.39,"termYears":30}', 'mortgage repayments 800000', 'Mortgage Repayments on $800,000 at 6.39% — 30 Years | Calcy', 'Calculate exact mortgage repayments on an $800,000 loan at 6.39% over 30 years.', 'Mortgage repayments on an $800,000 loan at 6.39%'),
('mortgage', '/calculate/mortgage/1000000/6.39/30', '{"loanAmount":1000000,"interestRate":6.39,"termYears":30}', 'mortgage repayments 1 million', 'Mortgage Repayments on $1,000,000 at 6.39% — 30 Years | Calcy', 'Calculate exact mortgage repayments on a $1,000,000 loan at 6.39% over 30 years.', 'Mortgage repayments on a $1,000,000 loan at 6.39%'),
('lmi', '/calculate/lmi/700000/70000', '{"propertyValue":700000,"deposit":70000}', 'lmi calculator 700000 10% deposit', 'LMI on $700,000 Property with 10% Deposit | Calcy', 'Calculate LMI on a $700,000 property with a $70,000 (10%) deposit. See exact LMI cost and how to avoid it.', 'LMI on a $700,000 property with a 10% deposit'),
('lmi', '/calculate/lmi/600000/60000', '{"propertyValue":600000,"deposit":60000}', 'lmi calculator 600000', 'LMI on $600,000 Property with 10% Deposit | Calcy', 'Calculate LMI on a $600,000 property with a $60,000 deposit. See how much LMI costs and ways to avoid it.', 'LMI on a $600,000 property with a 10% deposit'),
('lmi', '/calculate/lmi/800000/80000', '{"propertyValue":800000,"deposit":80000}', 'lmi calculator 800000', 'LMI on $800,000 Property with 10% Deposit | Calcy', 'Calculate LMI on an $800,000 property with $80,000 deposit.', 'LMI on an $800,000 property with a 10% deposit'),
('borrowing_power', '/calculate/borrowing-power/80000', '{"annualIncome":80000,"monthlyExpenses":3000,"deposit":60000}', 'how much can i borrow on 80000 salary', 'How Much Can I Borrow on $80,000 Salary? | Calcy', 'Calculate borrowing power on an $80,000 salary in Australia. See your estimated maximum loan and purchase price.', 'How much can I borrow on an $80,000 salary?'),
('borrowing_power', '/calculate/borrowing-power/100000', '{"annualIncome":100000,"monthlyExpenses":3500,"deposit":80000}', 'how much can i borrow on 100000 salary', 'How Much Can I Borrow on $100,000 Salary? | Calcy', 'Calculate borrowing power on a $100,000 salary in Australia. See your maximum loan and purchase price.', 'How much can I borrow on a $100,000 salary?'),
('borrowing_power', '/calculate/borrowing-power/120000', '{"annualIncome":120000,"monthlyExpenses":4000,"deposit":100000}', 'how much can i borrow on 120000 salary', 'How Much Can I Borrow on $120,000 Salary? | Calcy', 'Calculate borrowing power on a $120,000 salary in Australia.', 'How much can I borrow on a $120,000 salary?'),
('borrowing_power', '/calculate/borrowing-power/150000', '{"annualIncome":150000,"monthlyExpenses":4500,"deposit":150000}', 'how much can i borrow on 150000 salary', 'How Much Can I Borrow on $150,000 Salary? | Calcy', 'Calculate borrowing power on a $150,000 salary in Australia.', 'How much can I borrow on a $150,000 salary?');
