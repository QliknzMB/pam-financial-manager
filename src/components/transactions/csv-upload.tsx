"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface CsvUploadProps {
  onUploadComplete?: () => void
}

interface Account {
  id: string
  name: string
  account_type: string
  current_balance: number
}

export function CsvUpload({ onUploadComplete }: CsvUploadProps = {}) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<string>("")
  const [loadingAccounts, setLoadingAccounts] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  // Load accounts when dialog opens
  useEffect(() => {
    if (open && accounts.length === 0) {
      loadAccounts()
    }
  }, [open])

  const loadAccounts = async () => {
    setLoadingAccounts(true)
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('id, name, account_type, current_balance')
        .order('created_at', { ascending: true })

      if (error) throw error

      setAccounts(data || [])

      // Auto-select first account if only one exists
      if (data && data.length === 1) {
        setSelectedAccountId(data[0].id)
      }
    } catch (error: any) {
      toast({
        title: "Error loading accounts",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoadingAccounts(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
    }).format(amount)
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Check if it's a CSV file
      if (!selectedFile.name.endsWith('.csv')) {
        toast({
          title: "Invalid file type",
          description: "Please select a CSV file.",
          variant: "destructive",
        })
        return
      }
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload.",
        variant: "destructive",
      })
      return
    }

    if (!selectedAccountId) {
      toast({
        title: "No account selected",
        description: "Please select an account to upload transactions to.",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      // Create form data
      const formData = new FormData()
      formData.append('file', file)
      formData.append('account_id', selectedAccountId)

      // Call API to parse and stage
      const response = await fetch('/api/upload-csv', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      const newTransactions = data.stagedCount - data.duplicateCount

      toast({
        title: "Upload successful!",
        description: `${file.name}: ${newTransactions} new transactions staged${
          data.duplicateCount > 0 ? `, ${data.duplicateCount} duplicates found` : ''
        }. Review before importing.`,
      })

      // Reset and close
      setFile(null)
      setOpen(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      // Refresh page to show staging
      router.refresh()

      // Call callback if provided
      if (onUploadComplete) {
        onUploadComplete()
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your file.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile)
    } else {
      toast({
        title: "Invalid file type",
        description: "Please drop a CSV file.",
        variant: "destructive",
      })
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="text-lg px-8">
          Upload CSV File
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Transactions</DialogTitle>
          <DialogDescription>
            Upload a CSV file from your bank to import transactions.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div
            className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="space-y-2">
              <div className="text-4xl">📄</div>
              {file ? (
                <>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium">
                    Click or drag file to upload
                  </p>
                  <p className="text-xs text-muted-foreground">
                    CSV files only
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Account Selection */}
          {loadingAccounts ? (
            <div className="text-center py-4 text-muted-foreground">
              Loading accounts...
            </div>
          ) : accounts.length === 0 ? (
            <div className="rounded-lg border border-yellow-500 bg-yellow-50 p-4">
              <p className="text-sm text-yellow-900 font-medium mb-2">
                No accounts found
              </p>
              <p className="text-xs text-yellow-800 mb-3">
                You need to create an account before uploading transactions.
              </p>
              <Button
                size="sm"
                onClick={() => {
                  setOpen(false)
                  router.push('/accounts')
                }}
              >
                Create Account
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="account-select">Upload to Account *</Label>
              <select
                id="account-select"
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
          )}

          <div className="bg-slate-50 rounded-lg p-4 text-xs space-y-2">
            <p className="font-semibold">Supported banks:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>BNZ</li>
              <li>ANZ (coming soon)</li>
              <li>ASB (coming soon)</li>
              <li>Westpac (coming soon)</li>
              <li>Kiwibank (coming soon)</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={!file || !selectedAccountId || uploading || accounts.length === 0}
              className="flex-1"
            >
              {uploading ? "Uploading..." : "Upload & Import"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setFile(null)
                setOpen(false)
                if (fileInputRef.current) {
                  fileInputRef.current.value = ""
                }
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
