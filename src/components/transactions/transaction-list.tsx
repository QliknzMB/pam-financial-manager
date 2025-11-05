'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'

interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  balance?: number
  type: 'debit' | 'credit'
  status: string
  accounts?: {
    name: string
    institution: string
  }
}

interface TransactionListProps {
  transactions: Transaction[]
}

export function TransactionList({ transactions }: TransactionListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTransactions = transactions.filter((transaction) =>
    transaction.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
    }).format(Math.abs(amount))
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy')
    } catch {
      return dateString
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No transactions found
            </p>
          ) : (
            <div className="space-y-2">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{transaction.description}</p>
                      {transaction.status === 'pending' && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                          Uncategorized
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-muted-foreground">
                        {formatDate(transaction.date)}
                      </p>
                      {transaction.accounts && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <p className="text-sm text-muted-foreground">
                            {transaction.accounts.name}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p
                      className={`font-semibold ${
                        transaction.amount >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {transaction.amount >= 0 ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                    {transaction.balance !== undefined && transaction.balance !== null && (
                      <p className="text-sm text-muted-foreground">
                        Bal: {formatCurrency(transaction.balance)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {filteredTransactions.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Showing {filteredTransactions.length} of {transactions.length} transactions</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
