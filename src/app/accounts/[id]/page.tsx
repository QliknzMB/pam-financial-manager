import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AccountDetailClient } from "@/components/accounts/account-detail-client"
import { notFound } from "next/navigation"

export default async function AccountDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Fetch the account
  const { data: account, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !account) {
    notFound()
  }

  // Fetch transactions for this account
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('account_id', params.id)
    .order('date', { ascending: false })
    .limit(100)

  // Check for pending staging data for this account
  const { data: pendingUploads } = await supabase
    .from('csv_uploads')
    .select('*')
    .eq('account_id', params.id)
    .eq('status', 'staged')
    .order('uploaded_at', { ascending: false })
    .limit(1)

  return (
    <AccountDetailClient
      account={account}
      transactions={transactions || []}
      pendingUpload={pendingUploads?.[0] || null}
    />
  )
}
