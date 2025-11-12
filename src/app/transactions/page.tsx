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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: stagingData }: any = await supabase
    .from('csv_uploads')
    .select('id, filename, row_count, duplicates_found')
    .eq('status', 'staged')
    .limit(1)
    .single()

  // Fetch staging transactions if there's pending staging
  let stagingTransactions = null
  if (stagingData) {
    const { data: stagingTxns } = await supabase
      .from('staging_transactions')
      .select('*')
      .eq('upload_id', stagingData.id)
      .order('row_number', { ascending: true })

    stagingTransactions = stagingTxns
  }

  return (
    <TransactionsClient
      uploads={uploads || []}
      transactions={transactions || []}
      pendingStaging={stagingData}
      stagingTransactions={stagingTransactions || []}
    />
  )
}
