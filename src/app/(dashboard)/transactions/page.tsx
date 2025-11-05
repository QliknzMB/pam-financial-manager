import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getUserAccounts } from '@/lib/accounts/actions'
import { getUserTransactions } from '@/lib/transactions/actions'
import { CSVUpload } from '@/components/transactions/csv-upload'
import { TransactionList } from '@/components/transactions/transaction-list'

export default async function TransactionsPage() {
  const accounts = await getUserAccounts()
  const transactions = await getUserTransactions()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Transactions</h1>
        <p className="text-muted-foreground mt-2">
          Import and manage your financial transactions
        </p>
      </div>

      {accounts.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No accounts found</CardTitle>
            <CardDescription>
              You need to create an account before importing transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Go to the Accounts page to add your first bank account
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <CSVUpload accounts={accounts} />
          </div>
          <div className="md:col-span-2">
            {transactions.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No transactions yet</CardTitle>
                  <CardDescription>
                    Upload a CSV file to import your transactions
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <TransactionList transactions={transactions} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
