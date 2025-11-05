import { getCurrentUser } from '@/lib/auth/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Your personal details and account information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <p className="text-sm">{user.user_metadata?.full_name || 'Not set'}</p>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <p className="text-sm">{user.email}</p>
            {user.email_confirmed_at ? (
              <p className="text-xs text-green-600">✓ Email verified</p>
            ) : (
              <p className="text-xs text-yellow-600">⚠ Email not verified</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Account Created</Label>
            <p className="text-sm">
              {user.created_at
                ? new Date(user.created_at).toLocaleDateString('en-NZ', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'Unknown'}
            </p>
          </div>

          <div className="space-y-2">
            <Label>User ID</Label>
            <p className="text-sm font-mono text-xs">{user.id}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile Completeness</CardTitle>
          <CardDescription>
            Complete your profile to get the most out of PAM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Email verified</span>
              {user.email_confirmed_at ? (
                <span className="text-sm text-green-600">✓</span>
              ) : (
                <span className="text-sm text-muted-foreground">✗</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Full name set</span>
              {user.user_metadata?.full_name ? (
                <span className="text-sm text-green-600">✓</span>
              ) : (
                <span className="text-sm text-muted-foreground">✗</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Account connected</span>
              <span className="text-sm text-muted-foreground">✗</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Budget created</span>
              <span className="text-sm text-muted-foreground">✗</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
