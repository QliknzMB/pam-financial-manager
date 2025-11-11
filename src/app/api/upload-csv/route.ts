import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'

interface BNZTransaction {
  Date: string
  Amount: string
  Payee: string
  Particulars?: string
  Code?: string
  Reference?: string
  'Transaction Type'?: string
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

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Read file content
    const text = await file.text()

    // Parse CSV
    const parseResult = Papa.parse<BNZTransaction>(text, {
      header: true,
      skipEmptyLines: true,
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

    // Get user's accounts to check against
    const { data: accounts } = await supabase
      .from('accounts')
      .select('id')
      .eq('user_id', user.id)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const accountIds = accounts?.map((a: any) => a.id) || []

    // Get existing transactions for duplicate checking
    const { data: existingTransactions } = await supabase
      .from('transactions')
      .select('id, date, amount, payee, account_id')
      .in('account_id', accountIds.length > 0 ? accountIds : ['00000000-0000-0000-0000-000000000000'])

    // Parse and stage transactions
    const stagingTransactions = []
    let duplicateCount = 0

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]

      // Parse BNZ format
      const amount = parseFloat(row.Amount?.replace(/[,$]/g, '') || '0')
      const date = parseDate(row.Date)

      if (!date || isNaN(amount)) {
        continue // Skip invalid rows
      }

      // Check for duplicates
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isDuplicate = existingTransactions?.some((txn: any) =>
        txn.date === date &&
        Math.abs(parseFloat(txn.amount.toString()) - amount) < 0.01 &&
        txn.payee.toLowerCase() === row.Payee.toLowerCase()
      )

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const duplicateOf: any = isDuplicate
        ? existingTransactions?.find((txn: any) =>
            txn.date === date &&
            Math.abs(parseFloat(txn.amount.toString()) - amount) < 0.01 &&
            txn.payee.toLowerCase() === row.Payee.toLowerCase()
          )
        : null

      if (isDuplicate) {
        duplicateCount++
      }

      stagingTransactions.push({
        upload_id: upload.id,
        row_number: i + 1,
        date,
        amount,
        payee: row.Payee || 'Unknown',
        particulars: row.Particulars,
        code: row.Code,
        reference: row.Reference,
        transaction_type: row['Transaction Type'],
        is_duplicate: isDuplicate,
        duplicate_of: duplicateOf?.id || null,
        duplicate_reason: isDuplicate ? 'Exact match: date, amount, and payee' : null,
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
    // Try BNZ format: DD/MM/YYYY
    const parts = dateString.split('/')
    if (parts.length === 3) {
      const [day, month, year] = parts
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0] // Return YYYY-MM-DD
      }
    }

    // Fallback to ISO format
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]
    }
  } catch (e) {
    console.error('Date parse error:', e)
  }

  return null
}
