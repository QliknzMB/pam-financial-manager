-- ================================================
-- CLEANUP SCRIPT FOR DUPLICATE TRANSACTIONS
-- ================================================
-- WARNING: This will delete duplicate transactions!
-- Run the SELECT queries first to review what will be deleted.
-- ================================================

-- STEP 1: Review duplicates before deleting
-- This shows all duplicate transactions grouped by their hash
SELECT
  transaction_hash,
  COUNT(*) as count,
  MIN(date) as date,
  MIN(payee) as payee,
  MIN(amount) as amount,
  array_agg(id ORDER BY created_at) as transaction_ids
FROM transactions
WHERE transaction_hash IS NOT NULL
GROUP BY transaction_hash
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- STEP 2: Delete duplicates, keeping only the oldest transaction
-- This uses a CTE to identify which transactions to keep (rn = 1) vs delete (rn > 1)
WITH duplicates AS (
  SELECT
    id,
    transaction_hash,
    ROW_NUMBER() OVER (
      PARTITION BY transaction_hash
      ORDER BY created_at ASC
    ) as rn
  FROM transactions
  WHERE transaction_hash IS NOT NULL
)
DELETE FROM transactions
WHERE id IN (
  SELECT id
  FROM duplicates
  WHERE rn > 1
);

-- STEP 3: Verify cleanup
-- This should return 0 rows if cleanup was successful
SELECT
  transaction_hash,
  COUNT(*) as count
FROM transactions
WHERE transaction_hash IS NOT NULL
GROUP BY transaction_hash
HAVING COUNT(*) > 1;

-- STEP 4: Clean up any staging transactions that might be duplicates
WITH duplicates AS (
  SELECT
    id,
    transaction_hash,
    ROW_NUMBER() OVER (
      PARTITION BY transaction_hash, upload_id
      ORDER BY row_number ASC
    ) as rn
  FROM staging_transactions
  WHERE transaction_hash IS NOT NULL
)
DELETE FROM staging_transactions
WHERE id IN (
  SELECT id
  FROM duplicates
  WHERE rn > 1
);
