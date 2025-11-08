import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CsvUpload } from "@/components/transactions/csv-upload"

export default async function TransactionsPage() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transactions</h1>
        <p className="text-muted-foreground">View and manage your transactions</p>
      </div>

      <div className="rounded-lg border bg-card p-12 text-center">
        <div className="text-6xl mb-4">💳</div>
        <h2 className="text-2xl font-semibold mb-2">No transactions yet</h2>
        <p className="text-muted-foreground mb-6">
          Upload a CSV file from your bank to get started
        </p>
        <CsvUpload />
      </div>
    </div>
  )
}
