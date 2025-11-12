-- Add transaction_hash column to transactions table for duplicate detection
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS transaction_hash TEXT;

-- Add transaction_hash column to staging_transactions table
ALTER TABLE staging_transactions ADD COLUMN IF NOT EXISTS transaction_hash TEXT;

-- Create index on transaction_hash for fast duplicate lookups
CREATE INDEX IF NOT EXISTS idx_transactions_hash ON transactions(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_staging_transactions_hash ON staging_transactions(transaction_hash);

-- Function to generate transaction hash
CREATE OR REPLACE FUNCTION generate_transaction_hash(
    p_date DATE,
    p_amount DECIMAL,
    p_payee TEXT
) RETURNS TEXT AS $$
BEGIN
    -- Create MD5 hash from date + amount + lowercase payee
    RETURN md5(
        p_date::text || '|' ||
        p_amount::text || '|' ||
        lower(trim(p_payee))
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Backfill existing transactions with hashes
UPDATE transactions
SET transaction_hash = generate_transaction_hash(date, amount, payee)
WHERE transaction_hash IS NULL;

-- Backfill existing staging transactions with hashes
UPDATE staging_transactions
SET transaction_hash = generate_transaction_hash(date, amount, payee)
WHERE transaction_hash IS NULL;
