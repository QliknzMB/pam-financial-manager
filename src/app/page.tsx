import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center max-w-3xl">
        <div className="text-6xl mb-6">🏃‍♀️💰</div>
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          PAM - Personal Asset Manager
        </h1>
        <p className="text-2xl text-muted-foreground mb-8">
          Ensuring Liquidity Always
        </p>
        <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
          Take control of your finances with AI-powered transaction categorization,
          intelligent budgeting, and real-time insights into your spending habits.
        </p>

        <div className="flex gap-4 justify-center mb-16">
          <Link href="/signup">
            <Button size="lg" className="text-lg px-8">
              Get Started
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Sign In
            </Button>
          </Link>
        </div>

        <div className="text-left max-w-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 border rounded-lg bg-white/50 backdrop-blur">
              <h3 className="font-semibold text-lg mb-2">🤖 AI-Powered Categorization</h3>
              <p className="text-sm text-muted-foreground">
                Automatically categorize transactions with Claude AI
              </p>
            </div>
            <div className="p-6 border rounded-lg bg-white/50 backdrop-blur">
              <h3 className="font-semibold text-lg mb-2">📊 Smart Budgeting</h3>
              <p className="text-sm text-muted-foreground">
                Track spending and stay on top of your budget goals
              </p>
            </div>
            <div className="p-6 border rounded-lg bg-white/50 backdrop-blur">
              <h3 className="font-semibold text-lg mb-2">📈 Financial Insights</h3>
              <p className="text-sm text-muted-foreground">
                Visualize your finances with beautiful charts
              </p>
            </div>
            <div className="p-6 border rounded-lg bg-white/50 backdrop-blur">
              <h3 className="font-semibold text-lg mb-2">💬 PAM Chat</h3>
              <p className="text-sm text-muted-foreground">
                Ask questions about your spending in natural language
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
