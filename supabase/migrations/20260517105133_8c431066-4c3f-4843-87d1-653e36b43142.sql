CREATE TABLE public.calculation_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  calculator_type text NOT NULL,
  inputs jsonb NOT NULL DEFAULT '{}'::jsonb,
  result_summary text,
  suburb text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT calculation_leads_email_format CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND length(email) <= 254),
  CONSTRAINT calculation_leads_calculator_type CHECK (calculator_type IN ('mortgage','borrowing_power','stamp_duty','lmi','refinance'))
);

CREATE INDEX idx_calculation_leads_created_at ON public.calculation_leads (created_at DESC);
CREATE INDEX idx_calculation_leads_calculator_type ON public.calculation_leads (calculator_type);

ALTER TABLE public.calculation_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a lead"
  ON public.calculation_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read leads"
  ON public.calculation_leads
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update leads"
  ON public.calculation_leads
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete leads"
  ON public.calculation_leads
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));