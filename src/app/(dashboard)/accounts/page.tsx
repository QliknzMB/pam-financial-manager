import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getUserAccounts, deleteAccount } from '@/lib/accounts/actions'
import { AccountFormDialog } from '@/components/accounts/account-form-dialog'
import { AccountCard } from '@/components/accounts/account-card'

export default async function AccountsPage() {
  const accounts = await getUserAccounts()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-muted-foreground mt-2">
            Manage your connected bank accounts
          </p>
        </div>
        <AccountFormDialog />
      </div>

      {accounts.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No accounts connected</CardTitle>
            <CardDescription>
              Add your first bank account to start tracking transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Click the "Add Account" button above to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      )}
    </div>
  )
}
