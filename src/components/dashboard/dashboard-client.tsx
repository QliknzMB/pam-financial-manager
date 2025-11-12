"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface Account {
  id: string
  name: string
  account_type: string
  account_number?: string
  institution?: string
  current_balance: number
  is_active: boolean
}

interface Transaction {
  id: string
  date: string
  amount: number
  payee: string
  account_id: string
}

interface DashboardClientProps {
  user: any
  accounts: Account[]
  totalBalance: number
  recentTransactions: Transaction[]
}

export function DashboardClient({ user, accounts, totalBalance, recentTransactions }: DashboardClientProps) {
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [selectedAccountId, setSelectedAccountId] = useState<string>("")
  const router = useRouter()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-NZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleUploadClick = () => {
    if (accounts.length === 0) {
      // Redirect to accounts page if no accounts
      router.push('/accounts')
    } else if (accounts.length === 1) {
      // Go directly to upload if only one account
      router.push(`/accounts/${accounts[0].id}`)
    } else {
      // Show account selection dialog
      setShowUploadDialog(true)
    }
  }

  const handleAccountSelect = () => {
    if (selectedAccountId) {
      router.push(`/accounts/${selectedAccountId}`)
    }
  }

  const getAccountTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      checking: "Checking",
      savings: "Savings",
      credit_card: "Credit Card",
      bucket: "Bucket",
    }
    return types[type] || type
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user.user_metadata?.full_name || user.email}!</h1>
          <p className="text-muted-foreground">Here&apos;s your financial overview</p>
        </div>
        <Button onClick={handleUploadClick} size="lg">
          📤 Upload Transactions
        </Button>
      </div>

      {accounts.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <div className="text-6xl mb-4">💰</div>
          <h2 className="text-2xl font-semibold mb-2">No accounts yet</h2>
          <p className="text-muted-foreground mb-6">
            Create your first account to start tracking your finances and uploading transactions
          </p>
          <Button onClick={() => router.push('/accounts')} size="lg">
            Create Account
          </Button>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-sm font-medium text-muted-foreground">Total Balance</h3>
              <p className="text-3xl font-bold mt-2">{formatCurrency(totalBalance)}</p>
              <p className="text-xs text-muted-foreground mt-2">{accounts.length} account{accounts.length > 1 ? 's' : ''}</p>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-sm font-medium text-muted-foreground">Total Transactions</h3>
              <p className="text-3xl font-bold mt-2">{recentTransactions.length > 0 ? '...' : '0'}</p>
              <p className="text-xs text-muted-foreground mt-2">Across all accounts</p>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-sm font-medium text-muted-foreground">Quick Upload</h3>
              <Button onClick={handleUploadClick} className="mt-2 w-full">
                Upload CSV File
              </Button>
              <p className="text-xs text-muted-foreground mt-2">Import bank transactions</p>
            </div>
          </div>

          {/* Accounts Overview */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Your Accounts</h2>
              <Link href="/accounts">
                <Button variant="outline">Manage Accounts</Button>
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {accounts.map((account) => (
                <Link href={`/accounts/${account.id}`} key={account.id}>
                  <div className="rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{account.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {getAccountTypeLabel(account.account_type)}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        account.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {account.is_active ? "Active" : "Inactive"}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {account.institution && (
                        <p className="text-sm text-muted-foreground">
                          🏦 {account.institution}
                        </p>
                      )}
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-2xl font-bold">
                          {formatCurrency(account.current_balance)}
                        </p>
                        <p className="text-xs text-muted-foreground">Current Balance</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-2xl font-semibold mb-4">Recent Transactions</h2>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No transactions yet</p>
                <p className="text-sm mt-2">Upload a CSV file to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentTransactions.map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div>
                      <p className="font-medium">{txn.payee}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(txn.date)}</p>
                    </div>
                    <p className={`font-semibold ${txn.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(txn.amount)}
                    </p>
                  </div>
                ))}
                <div className="pt-4">
                  <Link href="/transactions">
                    <Button variant="outline" className="w-full">View All Transactions</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Account Selection Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Account</DialogTitle>
            <DialogDescription>
              Choose which account to upload transactions to
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select an account</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
              >
                <option value="">-- Select Account --</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({getAccountTypeLabel(account.account_type)}) - {formatCurrency(account.current_balance)}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={handleAccountSelect}
              disabled={!selectedAccountId}
              className="w-full"
            >
              Continue to Upload
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
