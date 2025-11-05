'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  SignUpSchema,
  SignInSchema,
  ResetPasswordSchema,
  UpdatePasswordSchema,
  type FormState,
} from './schemas'

// Sign up action
export async function signUp(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()

  // Validate form data
  const validatedFields = SignUpSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    fullName: formData.get('fullName'),
  })

  if (!validatedFields.success) {
    return {
      message: 'Validation failed',
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password, fullName } = validatedFields.data

  // Sign up the user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    return {
      message: error.message,
      success: false,
    }
  }

  if (data.user && !data.user.identities?.length) {
    return {
      message: 'An account with this email already exists',
      success: false,
    }
  }

  return {
    message: 'Check your email to confirm your account',
    success: true,
  }
}

// Sign in action
export async function signIn(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()

  // Validate form data
  const validatedFields = SignInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      message: 'Validation failed',
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  // Sign in the user
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      message: 'Invalid email or password',
      success: false,
    }
  }

  redirect('/dashboard')
}

// Sign out action
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// Reset password request action
export async function resetPasswordRequest(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()

  // Validate form data
  const validatedFields = ResetPasswordSchema.safeParse({
    email: formData.get('email'),
  })

  if (!validatedFields.success) {
    return {
      message: 'Validation failed',
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email } = validatedFields.data

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  })

  if (error) {
    return {
      message: error.message,
      success: false,
    }
  }

  return {
    message: 'Check your email for a password reset link',
    success: true,
  }
}

// Update password action
export async function updatePassword(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()

  // Validate form data
  const validatedFields = UpdatePasswordSchema.safeParse({
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      message: 'Validation failed',
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { password } = validatedFields.data

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return {
      message: error.message,
      success: false,
    }
  }

  redirect('/dashboard')
}

// Get current user
export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}
