import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const user = session.user

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user.user_metadata?.full_name || user.email}!</h1>
        <p className="text-muted-foreground">Here's your financial overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Summary cards will go here */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Balance</h3>
          <p className="text-3xl font-bold mt-2">$0.00</p>
          <p className="text-xs text-muted-foreground mt-2">No accounts yet</p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">This Month's Income</h3>
          <p className="text-3xl font-bold mt-2 text-green-600">$0.00</p>
          <p className="text-xs text-muted-foreground mt-2">No transactions yet</p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">This Month's Expenses</h3>
          <p className="text-3xl font-bold mt-2 text-red-600">$0.00</p>
          <p className="text-xs text-muted-foreground mt-2">No transactions yet</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
          <div className="text-center py-8 text-muted-foreground">
            <p>No transactions yet</p>
            <p className="text-sm mt-2">Upload a CSV file to get started</p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full text-left p-3 rounded-md hover:bg-accent transition-colors">
              📤 Upload Transactions
            </button>
            <button className="w-full text-left p-3 rounded-md hover:bg-accent transition-colors">
              💰 Add Account
            </button>
            <button className="w-full text-left p-3 rounded-md hover:bg-accent transition-colors">
              📊 View Reports
            </button>
            <button className="w-full text-left p-3 rounded-md hover:bg-accent transition-colors">
              🎯 Set Budget
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
