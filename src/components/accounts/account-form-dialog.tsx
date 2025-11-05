'use client'

import { useFormState } from 'react-dom'
import { createAccount, updateAccount, type AccountFormState } from '@/lib/accounts/actions'
import { SubmitButton } from '@/components/auth/submit-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'

const initialState: AccountFormState = {
  message: '',
  success: false,
}

interface AccountFormDialogProps {
  account?: {
    id: string
    name: string
    account_type: string
    institution: string
    current_balance: number
  }
  trigger?: React.ReactNode
}

export function AccountFormDialog({ account, trigger }: AccountFormDialogProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const action = account
    ? updateAccount.bind(null, account.id)
    : createAccount

  const [state, formAction] = useFormState(action, initialState)

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Success' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      })
      if (state.success) {
        setOpen(false)
      }
    }
  }, [state, toast])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Add Account</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{account ? 'Edit Account' : 'Add New Account'}</DialogTitle>
          <DialogDescription>
            {account
              ? 'Update your account details'
              : 'Add a new bank account to track transactions'}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Account Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Main Checking, Savings, Credit Card"
              defaultValue={account?.name}
              required
            />
            {state.errors?.name && (
              <p className="text-sm text-destructive">{state.errors.name[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_type">Account Type</Label>
            <Select name="account_type" defaultValue={account?.account_type || 'checking'}>
              <SelectTrigger>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Checking/Everyday</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="bucket">Bucket/Goal</SelectItem>
              </SelectContent>
            </Select>
            {state.errors?.account_type && (
              <p className="text-sm text-destructive">{state.errors.account_type[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="institution">Bank/Institution</Label>
            <Input
              id="institution"
              name="institution"
              placeholder="e.g., ANZ, BNZ, ASB, Westpac"
              defaultValue={account?.institution}
              required
            />
            {state.errors?.institution && (
              <p className="text-sm text-destructive">{state.errors.institution[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="current_balance">Current Balance (Optional)</Label>
            <Input
              id="current_balance"
              name="current_balance"
              type="number"
              step="0.01"
              placeholder="0.00"
              defaultValue={account?.current_balance}
            />
            {state.errors?.current_balance && (
              <p className="text-sm text-destructive">{state.errors.current_balance[0]}</p>
            )}
            <p className="text-xs text-muted-foreground">
              This will be updated automatically as you import transactions
            </p>
          </div>

          <SubmitButton pendingText={account ? 'Updating...' : 'Creating...'}>
            {account ? 'Update Account' : 'Create Account'}
          </SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  )
}
