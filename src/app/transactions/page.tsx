import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TransactionsClient } from "@/components/transactions/transactions-client"

export default async function TransactionsPage() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Fetch upload history
  const { data: uploads } = await supabase
    .from('csv_uploads')
    .select('*')
    .order('uploaded_at', { ascending: false })
    .limit(10)

  // Fetch transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      *,
      account:accounts(name),
      category:categories(name)
    `)
    .order('date', { ascending: false })
    .limit(50)

  // Check for pending staging
  const { data: stagingData } = await supabase
    .from('csv_uploads')
    .select('id, filename, row_count')
    .eq('status', 'staged')
    .limit(1)
    .single()

  return (
    <TransactionsClient
      uploads={uploads || []}
      transactions={transactions || []}
      pendingStaging={stagingData}
    />
  )
}
