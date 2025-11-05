'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export const AccountSchema = z.object({
  name: z.string().min(2, 'Account name must be at least 2 characters'),
  type: z.enum(['checking', 'savings', 'credit_card', 'investment', 'other']),
  institution: z.string().min(1, 'Bank/institution is required'),
  currency: z.string().default('NZD'),
  balance: z.number().optional(),
})

export type AccountFormState = {
  message: string
  success: boolean
  errors?: {
    name?: string[]
    type?: string[]
    institution?: string[]
    currency?: string[]
    balance?: string[]
  }
}

// Create account
export async function createAccount(
  prevState: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      message: 'You must be logged in to create an account',
      success: false,
    }
  }

  // Validate form data
  const validatedFields = AccountSchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type'),
    institution: formData.get('institution'),
    currency: formData.get('currency') || 'NZD',
    balance: formData.get('balance') ? parseFloat(formData.get('balance') as string) : 0,
  })

  if (!validatedFields.success) {
    return {
      message: 'Validation failed',
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name, type, institution, currency, balance } = validatedFields.data

  // Insert account
  const { error } = await supabase.from('accounts').insert({
    user_id: user.id,
    name,
    type,
    institution,
    currency,
    balance: balance || 0,
  })

  if (error) {
    return {
      message: error.message,
      success: false,
    }
  }

  revalidatePath('/accounts')

  return {
    message: 'Account created successfully',
    success: true,
  }
}

// Update account
export async function updateAccount(
  accountId: string,
  prevState: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      message: 'You must be logged in',
      success: false,
    }
  }

  // Validate form data
  const validatedFields = AccountSchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type'),
    institution: formData.get('institution'),
    currency: formData.get('currency') || 'NZD',
    balance: formData.get('balance') ? parseFloat(formData.get('balance') as string) : 0,
  })

  if (!validatedFields.success) {
    return {
      message: 'Validation failed',
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name, type, institution, currency, balance } = validatedFields.data

  // Update account
  const { error } = await supabase
    .from('accounts')
    .update({
      name,
      type,
      institution,
      currency,
      balance,
    })
    .eq('id', accountId)
    .eq('user_id', user.id)

  if (error) {
    return {
      message: error.message,
      success: false,
    }
  }

  revalidatePath('/accounts')

  return {
    message: 'Account updated successfully',
    success: true,
  }
}

// Delete account
export async function deleteAccount(accountId: string) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in')
  }

  // Delete account
  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', accountId)
    .eq('user_id', user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/accounts')
}

// Get user accounts
export async function getUserAccounts() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching accounts:', error)
    return []
  }

  return data
}

// Get single account
export async function getAccount(accountId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', accountId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('Error fetching account:', error)
    return null
  }

  return data
}
