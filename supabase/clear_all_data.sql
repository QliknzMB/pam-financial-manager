-- ================================================
-- CLEAR ALL TRANSACTION DATA (FRESH START)
-- ================================================
-- WARNING: This will delete ALL transactions, uploads, and staging data!
-- Run STEP 1 first to see what will be deleted.
-- ================================================

-- STEP 1: See what you have before deletion
SELECT 'Transactions' as table_name, COUNT(*) as count FROM transactions
UNION ALL
SELECT 'CSV Uploads' as table_name, COUNT(*) as count FROM csv_uploads
UNION ALL
SELECT 'Staging Transactions' as table_name, COUNT(*) as count FROM staging_transactions
UNION ALL
SELECT 'Accounts' as table_name, COUNT(*) as count FROM accounts;

-- STEP 2: Delete all staging transactions
DELETE FROM staging_transactions;

-- STEP 3: Delete all CSV uploads
DELETE FROM csv_uploads;

-- STEP 4: Delete all transactions
DELETE FROM transactions;

-- STEP 5: (OPTIONAL) Delete all accounts if you want to start completely fresh
-- Uncomment the line below if you want to delete accounts too
-- DELETE FROM accounts;

-- STEP 6: Verify everything is clean
SELECT 'Transactions' as table_name, COUNT(*) as count FROM transactions
UNION ALL
SELECT 'CSV Uploads' as table_name, COUNT(*) as count FROM csv_uploads
UNION ALL
SELECT 'Staging Transactions' as table_name, COUNT(*) as count FROM staging_transactions
UNION ALL
SELECT 'Accounts' as table_name, COUNT(*) as count FROM accounts;

-- All should be 0 except Accounts (unless you deleted those too)
