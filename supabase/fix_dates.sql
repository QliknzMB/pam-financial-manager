-- ================================================
-- FIX INCORRECT DATES IN TRANSACTIONS
-- ================================================
-- This fixes dates that were parsed incorrectly (showing 1925 instead of 2024/2025)
-- Assumes dates in 1900-1949 should be 2000-2049
-- ================================================

-- STEP 1: Preview what will be changed
SELECT
  id,
  date as old_date,
  CASE
    WHEN EXTRACT(YEAR FROM date) < 1950 THEN
      (date + INTERVAL '100 years')::DATE
    ELSE
      date
  END as new_date,
  payee,
  amount
FROM transactions
WHERE EXTRACT(YEAR FROM date) < 1950
ORDER BY date DESC
LIMIT 20;

-- STEP 2: Fix the dates (add 100 years to dates before 1950)
UPDATE transactions
SET date = (date + INTERVAL '100 years')::DATE
WHERE EXTRACT(YEAR FROM date) < 1950;

-- STEP 3: Regenerate transaction hashes with correct dates
UPDATE transactions
SET transaction_hash = generate_transaction_hash(date, amount, payee)
WHERE transaction_hash IS NOT NULL;

-- STEP 4: Do the same for staging_transactions
UPDATE staging_transactions
SET date = (date + INTERVAL '100 years')::DATE
WHERE EXTRACT(YEAR FROM date) < 1950;

UPDATE staging_transactions
SET transaction_hash = generate_transaction_hash(date, amount, payee)
WHERE transaction_hash IS NOT NULL;

-- STEP 5: Verify the fix
SELECT
  MIN(date) as earliest_date,
  MAX(date) as latest_date,
  COUNT(*) as total_transactions
FROM transactions;

-- Should show dates in 2024-2025 range, not 1925
