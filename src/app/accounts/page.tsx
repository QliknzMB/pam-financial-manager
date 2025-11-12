import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AccountsClient } from "@/components/accounts/accounts-client"

export default async function AccountsPage() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Fetch existing accounts
  const { data: accounts } = await supabase
    .from('accounts')
    .select('*')
    .order('created_at', { ascending: true })

  return <AccountsClient accounts={accounts || []} />
}
