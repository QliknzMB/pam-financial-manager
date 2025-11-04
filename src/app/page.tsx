export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          PAM - Personal Asset Manager
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Ensuring Liquidity Always 🏃‍♀️💰
        </p>
        <div className="text-left max-w-md mx-auto space-y-4">
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">Coming Soon:</h2>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>CSV Transaction Upload</li>
              <li>AI-Powered Categorization</li>
              <li>Budget Tracking</li>
              <li>Financial Insights</li>
              <li>Conversational Interface</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
