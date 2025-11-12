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
    .order('created_at', { ascending: false })
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

  // Fetch staging transactions if there's pending staging (in batches for unlimited size)
  let stagingTransactions: any[] = []
  if (stagingData) {
    // Get count first
    const { count } = await supabase
      .from('staging_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('upload_id', stagingData.id)

    if (count && count > 0) {
      const BATCH_SIZE = 1000

      for (let offset = 0; offset < count; offset += BATCH_SIZE) {
        const { data: batch } = await supabase
          .from('staging_transactions')
          .select('*')
          .eq('upload_id', stagingData.id)
          .order('row_number', { ascending: true })
          .range(offset, offset + BATCH_SIZE - 1)

        if (batch) {
          stagingTransactions.push(...batch)
        }
      }
    }
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
