-- Update RBA cash rate to 4.35% (May 2026 hike)
UPDATE rate_data
SET
  previous_value = value,
  value = '{
    "rate": 4.35,
    "effective_date": "2026-05-05",
    "previous_rate": 4.10,
    "next_meeting": "2026-06-04",
    "change": "+0.25",
    "consecutive_hikes": 3,
    "note": "Third consecutive hike. Driven by Middle East conflict fuel price pressures and persistent inflation above target."
  }'::jsonb,
  last_verified_at = NOW(),
  last_changed_at = NOW(),
  updated_at = NOW()
WHERE category = 'rba_cash_rate'
  AND key = 'cash_rate';

INSERT INTO rate_audit_log (
  rate_data_id, category, key, old_value, new_value,
  changed_by, change_source, change_note
)
SELECT
  id, 'rba_cash_rate', 'cash_rate',
  '{"rate": 4.10, "effective_date": "2026-03-18", "previous_rate": 4.35}'::jsonb,
  '{"rate": 4.35, "effective_date": "2026-05-05", "previous_rate": 4.10, "next_meeting": "2026-06-04"}'::jsonb,
  'admin_manual',
  'https://www.rba.gov.au/media-releases/2026/mr-26-12.html',
  'RBA raised cash rate 25bps to 4.35% on 5 May 2026. Third consecutive hike this year.'
FROM rate_data
WHERE category = 'rba_cash_rate' AND key = 'cash_rate';