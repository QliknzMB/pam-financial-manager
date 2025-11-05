import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function TransactionsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your financial transactions
          </p>
        </div>
        <Button>Upload CSV</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>No transactions yet</CardTitle>
          <CardDescription>
            Get started by uploading your first CSV file from your bank
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Supported banks: BNZ, ANZ, ASB, Westpac, Kiwibank
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
