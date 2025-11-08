-- CSV Uploads tracking table
CREATE TABLE csv_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    filename TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    row_count INTEGER,
    transactions_imported INTEGER DEFAULT 0,
    duplicates_found INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, staged, imported, failed
    error_message TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    imported_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB
);

-- Staging transactions table (temporary holding before import)
CREATE TABLE staging_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    upload_id UUID NOT NULL REFERENCES csv_uploads(id) ON DELETE CASCADE,
    row_number INTEGER NOT NULL,
    date DATE NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    payee TEXT NOT NULL,
    particulars TEXT,
    code TEXT,
    reference TEXT,
    transaction_type TEXT,
    is_duplicate BOOLEAN DEFAULT FALSE,
    duplicate_of UUID REFERENCES transactions(id),
    duplicate_reason TEXT,
    suggested_category_id UUID REFERENCES categories(id),
    suggested_account_id UUID REFERENCES accounts(id),
    will_import BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_csv_uploads_user_id ON csv_uploads(user_id);
CREATE INDEX idx_csv_uploads_status ON csv_uploads(status);
CREATE INDEX idx_staging_transactions_upload_id ON staging_transactions(upload_id);
CREATE INDEX idx_staging_transactions_is_duplicate ON staging_transactions(is_duplicate);

-- Enable RLS
ALTER TABLE csv_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for csv_uploads
CREATE POLICY "Users can view own uploads" ON csv_uploads
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own uploads" ON csv_uploads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own uploads" ON csv_uploads
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own uploads" ON csv_uploads
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for staging_transactions
CREATE POLICY "Users can view own staging transactions" ON staging_transactions
    FOR SELECT USING (auth.uid() IN (SELECT user_id FROM csv_uploads WHERE id = upload_id));

CREATE POLICY "Users can insert own staging transactions" ON staging_transactions
    FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM csv_uploads WHERE id = upload_id));

CREATE POLICY "Users can update own staging transactions" ON staging_transactions
    FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM csv_uploads WHERE id = upload_id));

CREATE POLICY "Users can delete own staging transactions" ON staging_transactions
    FOR DELETE USING (auth.uid() IN (SELECT user_id FROM csv_uploads WHERE id = upload_id));

-- Add composite unique index to help detect duplicates
CREATE INDEX idx_transactions_duplicate_check ON transactions(account_id, date, amount, payee);
