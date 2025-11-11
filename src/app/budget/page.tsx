import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function BudgetPage() {
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
        <h1 className="text-3xl font-bold">Budgets</h1>
        <p className="text-muted-foreground">Set and track your spending limits</p>
      </div>

      <div className="rounded-lg border bg-card p-12 text-center">
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="text-2xl font-semibold mb-2">No budgets yet</h2>
        <p className="text-muted-foreground mb-6">
          Create your first budget to start tracking your spending
        </p>
        <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          Create Budget
        </button>
      </div>
    </div>
  )
}
