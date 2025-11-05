'use client'

import { useFormState } from 'react-dom'
import { resetPasswordRequest } from '@/lib/auth/actions'
import { type FormState } from '@/lib/auth/schemas'
import { SubmitButton } from '@/components/auth/submit-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

const initialState: FormState = {
  message: '',
  success: false,
}

export default function ForgotPasswordPage() {
  const [state, formAction] = useFormState(resetPasswordRequest, initialState)
  const { toast } = useToast()

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Success' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      })
    }
  }, [state, toast])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Reset password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email address and we&apos;ll send you a reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                required
                autoComplete="email"
              />
              {state.errors?.email && (
                <p className="text-sm text-destructive">{state.errors.email[0]}</p>
              )}
            </div>

            <SubmitButton pendingText="Sending reset link...">
              Send reset link
            </SubmitButton>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Remember your password?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
