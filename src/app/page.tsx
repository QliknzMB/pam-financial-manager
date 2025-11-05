import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24">
      <div className="text-center max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          PAM - Personal Asset Manager
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8">
          Ensuring Liquidity Always 🏃‍♀️💰
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button asChild size="lg">
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>

        <div className="text-left max-w-md mx-auto space-y-4">
          <div className="p-6 border rounded-lg bg-card">
            <h2 className="font-semibold mb-4 text-lg">Features:</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <span className="mr-2">📊</span>
                <span><strong>CSV Transaction Upload</strong> - Import from NZ banks</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🤖</span>
                <span><strong>AI-Powered Categorization</strong> - Automatic transaction sorting</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">💰</span>
                <span><strong>Budget Tracking</strong> - Stay on top of spending</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📈</span>
                <span><strong>Financial Insights</strong> - Understand your money</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">💬</span>
                <span><strong>Conversational Interface</strong> - Chat with your finances</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
