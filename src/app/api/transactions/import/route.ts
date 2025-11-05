import { createClient } from '@/lib/supabase/server'
import { parseCSV } from '@/lib/transactions/csv-parser'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const accountId = formData.get('accountId') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!accountId) {
      return NextResponse.json({ error: 'No account ID provided' }, { status: 400 })
    }

    // Verify account belongs to user
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', accountId)
      .eq('user_id', user.id)
      .single()

    if (accountError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    // Parse CSV
    const parseResult = await parseCSV(file)

    if (parseResult.errors.length > 0 && parseResult.transactions.length === 0) {
      return NextResponse.json(
        {
          error: 'Failed to parse CSV',
          details: parseResult.errors,
        },
        { status: 400 }
      )
    }

    // Prepare transactions for database
    const transactionsToInsert = parseResult.transactions.map((transaction) => ({
      account_id: accountId,
      date: transaction.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      payee: transaction.description,
      amount: transaction.amount,
      transaction_type: transaction.type || (transaction.amount >= 0 ? 'credit' : 'debit'),
      needs_review: true, // Will be categorized later
      particulars: transaction.particulars || null,
      reference: transaction.reference || null,
      code: transaction.code || null,
    }))

    // Insert transactions (using upsert to avoid duplicates)
    const { data: inserted, error: insertError } = await supabase
      .from('transactions')
      .upsert(transactionsToInsert as any, {
        onConflict: 'account_id,date,payee,amount',
        ignoreDuplicates: true,
      })
      .select()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        {
          error: 'Failed to save transactions',
          details: insertError.message,
        },
        { status: 500 }
      )
    }

    // Update account balance to the latest transaction balance if available
    const latestTransaction = parseResult.transactions
      .filter((t) => t.balance !== undefined)
      .sort((a, b) => b.date.getTime() - a.date.getTime())[0]

    if (latestTransaction?.balance !== undefined) {
      await (supabase as any)
        .from('accounts')
        .update({ current_balance: latestTransaction.balance })
        .eq('id', accountId)
    }

    return NextResponse.json({
      success: true,
      count: inserted?.length || transactionsToInsert.length,
      bank: parseResult.bank,
      warnings: parseResult.errors,
    })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
