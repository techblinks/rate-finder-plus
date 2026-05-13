CREATE TABLE public.news_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  body text,
  published_at timestamptz,
  is_published boolean NOT NULL DEFAULT false,
  author text NOT NULL DEFAULT 'Calcy Team',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "news_public_read"
ON public.news_articles
FOR SELECT
TO public
USING (is_published = true);

CREATE POLICY "news_admin_all"
ON public.news_articles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_news_published ON public.news_articles (is_published, published_at DESC);