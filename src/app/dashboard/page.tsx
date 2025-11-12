import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardClient } from "@/components/dashboard/dashboard-client"

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const user = session.user

  // Fetch user's accounts with transaction counts
  const { data: accounts } = await supabase
    .from('accounts')
    .select('*')
    .order('created_at', { ascending: true })

  // Calculate total balance and fetch recent transactions if accounts exist
  let totalBalance = 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let recentTransactions: any[] = []

  if (accounts && accounts.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    totalBalance = accounts.reduce((sum: number, account: any) => sum + (account.current_balance || 0), 0)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const accountIds = accounts.map((a: any) => a.id)

    // Fetch recent 5 transactions
    const { data: txns } = await supabase
      .from('transactions')
      .select('*')
      .in('account_id', accountIds)
      .order('date', { ascending: false })
      .limit(5)

    recentTransactions = txns || []
  }

  return (
    <DashboardClient
      user={user}
      accounts={accounts || []}
      totalBalance={totalBalance}
      recentTransactions={recentTransactions}
    />
  )
}
