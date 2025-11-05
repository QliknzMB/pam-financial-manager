'use client'

import { useFormState } from 'react-dom'
import { updatePassword } from '@/lib/auth/actions'
import { type FormState } from '@/lib/auth/schemas'
import { SubmitButton } from '@/components/auth/submit-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

const initialState: FormState = {
  message: '',
  success: false,
}

export default function ResetPasswordPage() {
  const [state, formAction] = useFormState(updatePassword, initialState)
  const { toast } = useToast()

  useEffect(() => {
    if (state.message && !state.success) {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      })
    }
  }, [state, toast])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Set new password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
              {state.errors?.password && (
                <p className="text-sm text-destructive">{state.errors.password[0]}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters with uppercase, lowercase, and numbers
              </p>
            </div>

            <SubmitButton pendingText="Updating password...">
              Update password
            </SubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
