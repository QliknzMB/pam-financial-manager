"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface StagingTransaction {
  id: string
  row_number: number
  date: string
  amount: number
  payee: string
  particulars?: string
  code?: string
  reference?: string
  transaction_type?: string
  is_duplicate: boolean
  duplicate_reason?: string
  will_import: boolean
}

interface Upload {
  id: string
  filename: string
  row_count: number
  duplicates_found: number
}

interface StagingReviewProps {
  upload: Upload
  stagingTransactions: StagingTransaction[]
  onComplete?: () => void
}

export function StagingReview({ upload, stagingTransactions, onComplete }: StagingReviewProps) {
  const [transactions, setTransactions] = useState<StagingTransaction[]>(stagingTransactions)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleteUploadConfirm, setDeleteUploadConfirm] = useState(false)
  const [deletingUpload, setDeletingUpload] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      const response = await fetch(`/api/staging-transactions/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete transaction')
      }

      // Remove from local state
      setTransactions(prev => prev.filter(t => t.id !== id))

      toast({
        title: "Transaction deleted",
        description: "The staged transaction has been removed.",
      })
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setDeleting(null)
      setDeleteConfirmId(null)
    }
  }

  const handleImport = async () => {
    setImporting(true)
    try {
      const response = await fetch(`/api/import-staging/${upload.id}`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import transactions')
      }

      toast({
        title: "Import successful!",
        description: `${data.imported} transactions imported successfully.`,
      })

      router.refresh()
      if (onComplete) {
        onComplete()
      }
    } catch (error: any) {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setImporting(false)
    }
  }

  const handleDeleteUpload = async () => {
    setDeletingUpload(true)
    try {
      const response = await fetch(`/api/csv-uploads/${upload.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete upload')
      }

      toast({
        title: "Upload deleted",
        description: "The CSV upload and all staged transactions have been removed.",
      })

      router.refresh()
      if (onComplete) {
        onComplete()
      }
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setDeletingUpload(false)
      setDeleteUploadConfirm(false)
    }
  }

  const toImportCount = transactions.filter(t => t.will_import && !t.is_duplicate).length
  const duplicateCount = transactions.filter(t => t.is_duplicate).length

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Review Staged Transactions</h2>
            <p className="text-muted-foreground mb-4">
              File: <span className="font-medium">{upload.filename}</span>
            </p>
            <div className="flex gap-4 text-sm">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                {toImportCount} to import
              </span>
              {duplicateCount > 0 && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium">
                  {duplicateCount} duplicates
                </span>
              )}
              <span className="text-muted-foreground">
                {transactions.length} total rows
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setDeleteUploadConfirm(true)}
              disabled={deletingUpload}
              size="lg"
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              {deletingUpload ? "Deleting..." : "Delete Upload"}
            </Button>
            <Button
              onClick={handleImport}
              disabled={importing || toImportCount === 0}
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              {importing ? "Importing..." : `Import ${toImportCount} Transactions`}
            </Button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="rounded-lg border">
        <div className="p-4 border-b bg-slate-50">
          <div className="grid grid-cols-12 gap-4 text-sm font-semibold">
            <div className="col-span-1">#</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-3">Payee</div>
            <div className="col-span-2">Amount</div>
            <div className="col-span-2">Details</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1"></div>
          </div>
        </div>
        <div className="divide-y max-h-[600px] overflow-y-auto">
          {transactions.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <div className="text-4xl mb-2">✓</div>
              <p>All transactions have been removed</p>
            </div>
          ) : (
            transactions.map((txn) => (
              <div
                key={txn.id}
                className={`p-4 transition-colors ${
                  txn.is_duplicate
                    ? "bg-yellow-50"
                    : txn.will_import
                    ? "hover:bg-slate-50"
                    : "bg-gray-50 opacity-60"
                }`}
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-1 text-sm text-muted-foreground">
                    {txn.row_number}
                  </div>
                  <div className="col-span-2 text-sm">
                    {new Date(txn.date).toLocaleDateString()}
                  </div>
                  <div className="col-span-3">
                    <div className="font-medium truncate">{txn.payee}</div>
                    {txn.transaction_type && (
                      <div className="text-xs text-muted-foreground">
                        {txn.transaction_type}
                      </div>
                    )}
                  </div>
                  <div className="col-span-2">
                    <div
                      className={`text-lg font-semibold ${
                        txn.amount > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      ${Math.abs(txn.amount).toFixed(2)}
                    </div>
                  </div>
                  <div className="col-span-2 text-xs text-muted-foreground">
                    {[txn.particulars, txn.code, txn.reference]
                      .filter(Boolean)
                      .join(" • ")}
                  </div>
                  <div className="col-span-1">
                    {txn.is_duplicate ? (
                      <span
                        className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded"
                        title={txn.duplicate_reason || "Duplicate transaction"}
                      >
                        Duplicate
                      </span>
                    ) : txn.will_import ? (
                      <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                        Ready
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                        Skip
                      </span>
                    )}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirmId(txn.id)}
                      disabled={deleting === txn.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {deleting === txn.id ? "..." : "🗑️"}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-lg border bg-blue-50 p-4">
        <div className="flex gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <div className="font-semibold text-blue-900">Review Before Import</div>
            <p className="text-sm text-blue-700 mt-1">
              Duplicates are automatically detected and won&apos;t be imported. You can delete any
              unwanted transactions before importing.
            </p>
          </div>
        </div>
      </div>

      {/* Delete Transaction Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the transaction from the staging area. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Upload Confirmation Dialog */}
      <AlertDialog open={deleteUploadConfirm} onOpenChange={setDeleteUploadConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete entire upload?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the CSV upload and all {transactions.length} staged transactions.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUpload}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Upload
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
