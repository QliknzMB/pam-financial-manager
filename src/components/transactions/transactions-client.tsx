"use client"

import { useState } from "react"
import { CsvUpload } from "./csv-upload"
import { UploadHistory } from "./upload-history"
import { StagingReview } from "./staging-review"
import { Button } from "@/components/ui/button"

type Tab = "transactions" | "upload" | "history" | "staging"

interface TransactionsClientProps {
  uploads: any[]
  transactions: any[]
  pendingStaging: any
  stagingTransactions: any[]
}

export function TransactionsClient({ uploads, transactions, pendingStaging, stagingTransactions }: TransactionsClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>(pendingStaging ? "staging" : "transactions")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">View and manage your transactions</p>
        </div>
        {pendingStaging && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg">
            ⚠️ You have {pendingStaging.row_count} transactions awaiting review
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("transactions")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "transactions"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Transactions ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "upload"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            📤 Upload
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "history"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            📋 History ({uploads.length})
          </button>
          {pendingStaging && (
            <button
              onClick={() => setActiveTab("staging")}
              className={`px-4 py-2 font-medium border-b-2 transition-colors relative ${
                activeTab === "staging"
                  ? "border-yellow-500 text-yellow-700"
                  : "border-transparent text-yellow-600 hover:text-yellow-700"
              }`}
            >
              🔍 Review Staging
              <span className="ml-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                {pendingStaging.row_count}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "transactions" && (
          <div>
            {transactions.length === 0 ? (
              <div className="rounded-lg border bg-card p-12 text-center">
                <div className="text-6xl mb-4">💳</div>
                <h2 className="text-2xl font-semibold mb-2">No transactions yet</h2>
                <p className="text-muted-foreground mb-6">
                  Upload a CSV file from your bank to get started
                </p>
                <Button onClick={() => setActiveTab("upload")} size="lg">
                  Upload CSV File
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border">
                <div className="p-4 border-b bg-slate-50">
                  <h3 className="font-semibold">Recent Transactions</h3>
                </div>
                <div className="divide-y">
                  {transactions.map((txn: any) => (
                    <div key={txn.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{txn.payee}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(txn.date).toLocaleDateString()} • {txn.account?.name || 'Unknown Account'}
                          </div>
                        </div>
                        <div className={`text-lg font-semibold ${txn.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${Math.abs(txn.amount).toFixed(2)}
                        </div>
                      </div>
                      {txn.category && (
                        <div className="mt-2 inline-block bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded">
                          {txn.category.name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "upload" && (
          <div className="rounded-lg border bg-card p-12 text-center">
            <div className="text-6xl mb-4">📤</div>
            <h2 className="text-2xl font-semibold mb-2">Upload Transactions</h2>
            <p className="text-muted-foreground mb-6">
              Upload a CSV file from your bank. We'll check for duplicates before importing.
            </p>
            <CsvUpload onUploadComplete={() => setActiveTab("staging")} />
          </div>
        )}

        {activeTab === "history" && <UploadHistory uploads={uploads} />}

        {activeTab === "staging" && pendingStaging && (
          <StagingReview
            upload={pendingStaging}
            stagingTransactions={stagingTransactions}
            onComplete={() => setActiveTab("transactions")}
          />
        )}
      </div>
    </div>
  )
}
