import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'
import crypto from 'crypto'

interface BNZTransaction {
  Date: string
  Amount: string
  Payee: string
  Particulars?: string
  Code?: string
  Reference?: string
  'Transaction Type'?: string
}

// Generate transaction hash for duplicate detection
function generateTransactionHash(date: string, amount: number, payee: string): string {
  const hashString = `${date}|${amount}|${payee.toLowerCase().trim()}`
  return crypto.createHash('md5').update(hashString).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const accountId = formData.get('account_id') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 })
    }

    // Verify the account exists and belongs to the user
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('id', accountId)
      .eq('user_id', user.id)
      .single()

    if (accountError || !account) {
      return NextResponse.json({ error: 'Invalid account' }, { status: 400 })
    }

    // Read file content
    const text = await file.text()

    // Parse CSV/TSV (tab-separated values)
    const parseResult = Papa.parse<BNZTransaction>(text, {
      header: true,
      skipEmptyLines: true,
      delimiter: text.includes('\t') ? '\t' : ',', // Auto-detect tab or comma
      transformHeader: (header) => header.trim(),
    })

    if (parseResult.errors.length > 0) {
      return NextResponse.json({
        error: 'CSV parsing failed',
        details: parseResult.errors
      }, { status: 400 })
    }

    const rows = parseResult.data

    // Create upload record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: upload, error: uploadError } = await (supabase
      .from('csv_uploads') as any)
      .insert({
        user_id: user.id,
        account_id: accountId,
        filename: file.name,
        file_size: file.size,
        row_count: rows.length,
        status: 'pending',
      })
      .select()
      .single()

    if (uploadError) {
      console.error('Upload creation error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Get existing transaction hashes for duplicate checking (in batches to handle unlimited transactions)
    // Only check for duplicates within the same account
    const { count: existingCount } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', accountId)

    // Fetch all existing transactions in batches
    const FETCH_BATCH_SIZE = 1000
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingTransactions: any[] = []

    if (existingCount && existingCount > 0) {
      for (let offset = 0; offset < existingCount; offset += FETCH_BATCH_SIZE) {
        const { data: batch } = await supabase
          .from('transactions')
          .select('id, transaction_hash')
          .eq('account_id', accountId)
          .range(offset, offset + FETCH_BATCH_SIZE - 1)

        if (batch) {
          existingTransactions.push(...batch)
        }
      }
    }

    // Create a Map of existing hashes for fast lookup
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingHashes = new Map(existingTransactions.map((t: any) => [t.transaction_hash, t.id]))

    // Parse and stage transactions
    const stagingTransactions = []
    let duplicateCount = 0

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]

      // Parse BNZ format
      const amount = parseFloat(row.Amount?.replace(/[,$]/g, '') || '0')
      const date = parseDate(row.Date)
      const payee = row.Payee || 'Unknown'

      if (!date || isNaN(amount)) {
        continue // Skip invalid rows
      }

      // Generate transaction hash
      const transactionHash = generateTransactionHash(date, amount, payee)

      // Check for duplicates using hash
      const isDuplicate = existingHashes.has(transactionHash)
      const duplicateOf = isDuplicate ? existingHashes.get(transactionHash) : null

      if (isDuplicate) {
        duplicateCount++
      }

      stagingTransactions.push({
        upload_id: upload.id,
        row_number: i + 1,
        date,
        amount,
        payee,
        particulars: row.Particulars,
        code: row.Code,
        reference: row.Reference,
        transaction_type: row['Transaction Type'],
        transaction_hash: transactionHash,
        is_duplicate: isDuplicate,
        duplicate_of: duplicateOf,
        duplicate_reason: isDuplicate ? 'Duplicate transaction detected' : null,
        will_import: !isDuplicate,
      })
    }

    // Insert staging transactions
    if (stagingTransactions.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: stagingError } = await (supabase
        .from('staging_transactions') as any)
        .insert(stagingTransactions)

      if (stagingError) {
        console.error('Staging insert error:', stagingError)
        // Update upload as failed
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase
          .from('csv_uploads') as any)
          .update({
            status: 'failed',
            error_message: stagingError.message
          })
          .eq('id', upload.id)

        return NextResponse.json({ error: stagingError.message }, { status: 500 })
      }
    }

    // Update upload record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase
      .from('csv_uploads') as any)
      .update({
        status: 'staged',
        duplicates_found: duplicateCount,
      })
      .eq('id', upload.id)

    return NextResponse.json({
      success: true,
      uploadId: upload.id,
      rowCount: rows.length,
      stagedCount: stagingTransactions.length,
      duplicateCount,
    })

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({
      error: error.message || 'Upload failed'
    }, { status: 500 })
  }
}

function parseDate(dateString: string): string | null {
  if (!dateString) return null

  try {
    // Clean the input
    const cleaned = dateString.trim()

    // Try BNZ format: D/M/YYYY or DD/MM/YYYY
    const parts = cleaned.split('/')
    if (parts.length === 3) {
      const day = parseInt(parts[0].trim(), 10)
      const month = parseInt(parts[1].trim(), 10)
      let year = parseInt(parts[2].trim(), 10)

      // Handle 2-digit years: 24 -> 2024, 99 -> 1999
      if (year < 100) {
        year = year >= 50 ? 1900 + year : 2000 + year
      }

      // Validate ranges
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
        // Create date string directly to avoid timezone issues
        const isoDate = `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
        const date = new Date(isoDate)

        if (!isNaN(date.getTime())) {
          return isoDate
        }
      }
    }
  } catch (e) {
    console.error('Date parse error:', e, 'Input:', dateString)
  }

  return null
}
