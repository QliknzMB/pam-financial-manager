'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AccountFormDialog } from './account-form-dialog'
import { deleteAccount } from '@/lib/accounts/actions'
import { useTransition } from 'react'
import { useToast } from '@/hooks/use-toast'

interface AccountCardProps {
  account: {
    id: string
    name: string
    account_type: string
    institution: string
    current_balance: number
    created_at?: string
  }
}

const accountTypeLabels: Record<string, string> = {
  checking: 'Checking/Everyday',
  savings: 'Savings',
  credit_card: 'Credit Card',
  bucket: 'Bucket/Goal',
}

export function AccountCard({ account }: AccountCardProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleDelete = () => {
    if (!confirm(`Are you sure you want to delete "${account.name}"? This action cannot be undone.`)) {
      return
    }

    startTransition(async () => {
      try {
        await deleteAccount(account.id)
        toast({
          title: 'Success',
          description: 'Account deleted successfully',
        })
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to delete account',
          variant: 'destructive',
        })
      }
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-medium">{account.name}</CardTitle>
          <p className="text-xs text-muted-foreground">{account.institution}</p>
        </div>
        <div className="rounded-md bg-secondary px-2 py-1">
          <span className="text-xs font-medium">
            {accountTypeLabels[account.account_type] || account.account_type}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-2xl font-bold">
              {formatCurrency(account.current_balance)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Current Balance</p>
          </div>

          <div className="flex gap-2">
            <AccountFormDialog
              account={account}
              trigger={
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
              }
            />
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
