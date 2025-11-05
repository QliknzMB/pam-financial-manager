import { getCurrentUser } from '@/lib/auth/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const userName = user.user_metadata?.full_name || 'there'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {userName}! 👋</h1>
        <p className="text-muted-foreground mt-2">
          Here&apos;s an overview of your financial status
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground mt-1">
              No accounts connected yet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground mt-1">
              No transactions yet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Not set</div>
            <p className="text-xs text-muted-foreground mt-1">
              Create your first budget
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Complete these steps to get the most out of PAM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-primary text-xs font-bold">
                1
              </div>
              <div>
                <h3 className="font-medium">Upload your first CSV</h3>
                <p className="text-sm text-muted-foreground">
                  Import transactions from your bank
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold">
                2
              </div>
              <div>
                <h3 className="font-medium">Set up budgets</h3>
                <p className="text-sm text-muted-foreground">
                  Track your spending by category
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold">
                3
              </div>
              <div>
                <h3 className="font-medium">Review AI categorization</h3>
                <p className="text-sm text-muted-foreground">
                  Let PAM learn from your habits
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
