import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AccountsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-muted-foreground mt-2">
            Manage your connected bank accounts
          </p>
        </div>
        <Button>Add Account</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>No accounts connected</CardTitle>
          <CardDescription>
            Add your first bank account to start tracking transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Connect your bank accounts to automatically import and categorize transactions
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
