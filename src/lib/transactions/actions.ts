'use server'

import { createClient } from '@/lib/supabase/server'

export async function getUserTransactions(limit = 100) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      accounts!inner (
        user_id,
        name,
        institution
      )
    `)
    .eq('accounts.user_id', user.id)
    .order('date', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching transactions:', error)
    return []
  }

  return data
}

export async function updateTransactionCategory(
  transactionId: string,
  categoryId: string | null
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // Verify the transaction belongs to the user through the account
  const { data: transaction } = await supabase
    .from('transactions')
    .select('account_id, accounts!inner(user_id)')
    .eq('id', transactionId)
    .single()

  if (!transaction || (transaction as any).accounts.user_id !== user.id) {
    throw new Error('Transaction not found')
  }

  const { error } = await (supabase as any)
    .from('transactions')
    .update({
      category_id: categoryId,
      needs_review: !categoryId,
    })
    .eq('id', transactionId)

  if (error) {
    throw new Error(error.message)
  }
}
