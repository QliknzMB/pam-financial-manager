"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Account {
  id: string
  name: string
  account_type: string
  account_number?: string
  institution?: string
  current_balance: number
  is_active: boolean
  created_at: string
}

interface Transaction {
  id: string
  date: string
  amount: number
  payee: string
  particulars?: string
  reference?: string
  category_id?: string
}

interface Upload {
  id: string
  filename: string
  row_count: number
  uploaded_at: string
  status: string
}

interface AccountDetailClientProps {
  account: Account
  transactions: Transaction[]
  pendingUpload: Upload | null
}

export function AccountDetailClient({ account, transactions, pendingUpload }: AccountDetailClientProps) {
  const [uploading, setUploading] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

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

  const getAccountTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      checking: "Checking",
      savings: "Savings",
      credit_card: "Credit Card",
      bucket: "Bucket",
    }
    return types[type] || type
  }

  const handleUploadClick = () => {
    setShowUploadDialog(true)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('account_id', account.id)

      const response = await fetch('/api/upload-csv', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      toast({
        title: "Upload successful",
        description: `${result.rowCount} rows uploaded. ${result.duplicateCount} duplicates found.`,
      })

      setShowUploadDialog(false)

      // Redirect to transactions page to review staging
      router.push('/transactions')
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/accounts">
              <Button variant="ghost" size="sm">← Back to Accounts</Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold">{account.name}</h1>
          <p className="text-muted-foreground">{getAccountTypeLabel(account.account_type)}</p>
        </div>
        <Button onClick={handleUploadClick} size="lg">
          📤 Upload Transactions
        </Button>
      </div>

      {/* Account Summary Card */}
      <div className="rounded-lg border bg-card p-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Current Balance</h3>
            <p className="text-3xl font-bold">{formatCurrency(account.current_balance)}</p>
          </div>
          {account.institution && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Institution</h3>
              <p className="text-lg">🏦 {account.institution}</p>
            </div>
          )}
          {account.account_number && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Account Number</h3>
              <p className="text-lg font-mono">{account.account_number}</p>
            </div>
          )}
        </div>
        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <div className={`px-2 py-1 rounded text-xs ${
              account.is_active
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}>
              {account.is_active ? "Active" : "Inactive"}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Pending Upload Alert */}
      {pendingUpload && (
        <div className="rounded-lg border border-yellow-500 bg-yellow-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-yellow-900">Pending Upload</h3>
              <p className="text-sm text-yellow-800">
                {pendingUpload.filename} ({pendingUpload.row_count} rows) is ready to import
              </p>
            </div>
            <Link href="/transactions">
              <Button variant="outline" size="sm">
                Review & Import →
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-2xl font-semibold mb-4">Transactions</h2>
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-lg font-medium mb-2">No transactions yet</p>
            <p className="text-sm mb-4">Upload a CSV file to import your bank transactions</p>
            <Button onClick={handleUploadClick}>
              Upload Transactions
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 py-2 border-b font-medium text-sm text-muted-foreground">
              <div className="col-span-2">Date</div>
              <div className="col-span-4">Payee</div>
              <div className="col-span-3">Details</div>
              <div className="col-span-3 text-right">Amount</div>
            </div>

            {/* Transaction Rows */}
            {transactions.map((txn) => (
              <div key={txn.id} className="grid grid-cols-12 gap-4 py-3 border-b hover:bg-accent transition-colors">
                <div className="col-span-2 text-sm">{formatDate(txn.date)}</div>
                <div className="col-span-4">
                  <p className="font-medium">{txn.payee}</p>
                </div>
                <div className="col-span-3 text-sm text-muted-foreground">
                  {txn.particulars && (
                    <p className="truncate">{txn.particulars}</p>
                  )}
                  {txn.reference && (
                    <p className="truncate text-xs">{txn.reference}</p>
                  )}
                </div>
                <div className={`col-span-3 text-right font-semibold ${
                  txn.amount >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(txn.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Transactions</DialogTitle>
            <DialogDescription>
              Upload a CSV file from your bank to import transactions to {account.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <input
                type="file"
                accept=".csv,.tsv"
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer"
              >
                <div className="text-4xl mb-2">📁</div>
                <p className="font-medium mb-1">
                  {uploading ? "Uploading..." : "Click to select file"}
                </p>
                <p className="text-sm text-muted-foreground">
                  CSV or TSV files only
                </p>
              </label>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>✓ Duplicate transactions will be automatically detected</p>
              <p>✓ You can review transactions before importing</p>
              <p>✓ Transactions will be added to: <strong>{account.name}</strong></p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
