"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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

interface AccountsClientProps {
  accounts: Account[]
}

export function AccountsClient({ accounts }: AccountsClientProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    account_type: "checking",
    account_number: "",
    institution: "",
  })
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const handleCreateAccount = async () => {
    if (!formData.name) {
      toast({
        title: "Error",
        description: "Account name is required",
        variant: "destructive",
      })
      return
    }

    setCreating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from("accounts") as any).insert({
        user_id: user.id,
        name: formData.name,
        account_type: formData.account_type,
        account_number: formData.account_number || null,
        institution: formData.institution || null,
      })

      if (error) throw error

      toast({
        title: "Account created",
        description: "Your account has been created successfully.",
      })

      setShowAddDialog(false)
      setFormData({
        name: "",
        account_type: "checking",
        account_number: "",
        institution: "",
      })
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error creating account",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setCreating(false)
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-muted-foreground">Manage your bank accounts and cards</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} size="lg">
          + Add Account
        </Button>
      </div>

      {accounts.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <div className="text-6xl mb-4">💰</div>
          <h2 className="text-2xl font-semibold mb-2">No accounts yet</h2>
          <p className="text-muted-foreground mb-6">
            Add your first bank account to start tracking your finances
          </p>
          <Button onClick={() => setShowAddDialog(true)} size="lg">
            Add Account
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow"
            >
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
                {account.account_number && (
                  <p className="text-sm text-muted-foreground font-mono">
                    {account.account_number}
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
          ))}
        </div>
      )}

      {/* Add Account Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Account</DialogTitle>
            <DialogDescription>
              Create a new account to track your finances.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Account Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Main Checking"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Account Type</Label>
              <select
                id="type"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={formData.account_type}
                onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
                <option value="credit_card">Credit Card</option>
                <option value="bucket">Bucket</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="institution">Bank / Institution</Label>
              <Input
                id="institution"
                placeholder="e.g., BNZ"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account_number">Account Number</Label>
              <Input
                id="account_number"
                placeholder="e.g., 02-1234-5678901-00"
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAccount} disabled={creating}>
              {creating ? "Creating..." : "Create Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
