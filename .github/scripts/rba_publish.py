import json, urllib.request, os, sys, math

rate = os.environ["RBA_RATE"]
month = os.environ["RBA_MONTH"]
year = os.environ["RBA_YEAR"]
today = os.environ["RBA_TODAY"]
api_key = os.environ["ANTHROPIC_API_KEY"]
secret = os.environ["PUBLISH_SECRET"]

# Calculate repayments
def monthly_repayment(principal, annual_rate, years=30):
    r = float(annual_rate) / 100 / 12
    n = years * 12
    if r == 0:
        return principal / n
    return principal * (r * (1 + r)**n) / ((1 + r)**n - 1)

rep_500k = round(monthly_repayment(500000, rate))
rep_600k = round(monthly_repayment(600000, rate))
rep_750k = round(monthly_repayment(750000, rate))
rep_1m   = round(monthly_repayment(1000000, rate))

prompt = (
    f"You are an expert Australian mortgage journalist writing for calcy.com.au. "
    f"Write a comprehensive SEO-optimised news article about the RBA cash rate decision for {month} {year}. "
    f"The RBA cash rate is {rate}%. "
    f"USE THESE EXACT REPAYMENT FIGURES (30-year P&I at {rate}%): "
    f"$500,000 loan: ${rep_500k:,}/month, "
    f"$600,000 loan: ${rep_600k:,}/month, "
    f"$750,000 loan: ${rep_750k:,}/month, "
    f"$1,000,000 loan: ${rep_1m:,}/month. "
    f"REQUIREMENTS: 650-800 words, helpful tone for Australian homeowners and first home buyers, "
    f"include specific dollar figures, cover variable vs fixed rate impact, "
    f"practical advice for: current variable rate holders, those considering fixing, first home buyers. "
    f"End with a FAQ section with exactly 4 questions and answers. "
    f"IMPORTANT - Use ONLY these exact URLs when linking to calculators (no other URLs): "
    f"Mortgage calculator: https://calcy.com.au/mortgage-calculator/ "
    f"Borrowing power calculator: https://calcy.com.au/borrowing-power-calculator "
    f"Stamp duty calculator: https://calcy.com.au/stamp-duty-calculator "
    f"Refinance calculator: https://calcy.com.au/refinance-calculator "
    f"Extra repayments calculator: https://calcy.com.au/extra-repayments-calculator "
    f"Rent vs buy calculator: https://calcy.com.au/rent-vs-buy-calculator "
    f"LMI calculator: https://calcy.com.au/lmi-calculator "
    f"Naturally mention at least 2 of these calculators with correct links in the article body. "
    f"HTML STRUCTURE: use h2 for headings, p for paragraphs, ul/li for repayment list. "
    f"Wrap FAQ in <div class='faq-section'><h2>Frequently asked questions</h2> "
    f"with each Q&A as <div class='faq-item'><h3>question</h3><p>answer</p></div></div>. "
    f"Return ONLY a valid JSON object with these exact keys: "
    f"title (format: 'RBA [holds/cuts/raises] cash rate at {rate}% - {month} {year}: What it means for your mortgage', max 90 chars), "
    f"excerpt (150-160 chars meta description including the rate and month), "
    f"body (full HTML article string). "
    f"Pure JSON only. No markdown. No backticks. No explanation."
)

payload = json.dumps({
    "model": "claude-haiku-4-5-20251001",
    "max_tokens": 3000,
    "messages": [{"role": "user", "content": prompt}]
}).encode()

print("Calling Claude API...")
req = urllib.request.Request(
    "https://api.anthropic.com/v1/messages",
    data=payload,
    headers={
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }
)

try:
    with urllib.request.urlopen(req) as r:
        data = json.loads(r.read())
except urllib.error.HTTPError as e:
    print("Claude API Error:", e.read().decode())
    sys.exit(1)

text = data["content"][0]["text"].strip()
if "```" in text:
    lines = text.split("\n")
    text = "\n".join(l for l in lines if not l.strip().startswith("```"))

try:
    article = json.loads(text)
except json.JSONDecodeError as e:
    print("JSON parse error:", e)
    print("Raw:", text[:300])
    sys.exit(1)

print("Generated:", article["title"])

# Publish
rate_slug = rate.replace(".", "-")
month_slug = month.lower()
slug = f"rba-cash-rate-{rate_slug}-{month_slug}-{year}"

payload = json.dumps({
    "title": article["title"],
    "slug": slug,
    "excerpt": article["excerpt"],
    "body": article["body"],
    "published_at": f"{today}T04:30:00Z",
    "secret": secret
}).encode()

print("Publishing to Calcy...")
req = urllib.request.Request(
    "https://newvydpcchjbuhcldckf.supabase.co/functions/v1/publish-news",
    data=payload,
    headers={"Content-Type": "application/json"}
)

try:
    with urllib.request.urlopen(req) as r:
        result = json.loads(r.read())
except urllib.error.HTTPError as e:
    body = e.read().decode()
    if "Slug already exists" in body:
        print("Article already exists for this month — skipping")
        sys.exit(0)
    print("Publish error:", body)
    sys.exit(1)

if result.get("success"):
    print("Published! Live at: https://calcy.com.au/news/" + slug)
else:
    print("Failed:", result)
    sys.exit(1)
