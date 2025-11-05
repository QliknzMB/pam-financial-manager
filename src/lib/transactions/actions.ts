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
      accounts (
        name,
        institution
      )
    `)
    .eq('user_id', user.id)
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

  const { error } = await supabase
    .from('transactions')
    .update({
      category_id: categoryId,
      status: categoryId ? 'categorized' : 'pending',
    })
    .eq('id', transactionId)
    .eq('user_id', user.id)

  if (error) {
    throw new Error(error.message)
  }
}
