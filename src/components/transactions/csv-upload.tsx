'use client'

import { useState, useCallback } from 'react'
import { Upload, FileText, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

interface CSVUploadProps {
  accounts: Array<{
    id: string
    name: string
    institution: string
  }>
  onUploadComplete?: () => void
}

export function CSVUpload({ accounts, onUploadComplete }: CSVUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [accountId, setAccountId] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile)
    } else {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a CSV file',
        variant: 'destructive',
      })
    }
  }, [toast])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile)
      } else {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a CSV file',
          variant: 'destructive',
        })
      }
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a CSV file to upload',
        variant: 'destructive',
      })
      return
    }

    if (!accountId) {
      toast({
        title: 'No account selected',
        description: 'Please select an account for these transactions',
        variant: 'destructive',
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('accountId', accountId)

      const response = await fetch('/api/transactions/import', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to import transactions')
      }

      toast({
        title: 'Success!',
        description: `Imported ${result.count} transactions successfully`,
      })

      setFile(null)
      setAccountId('')
      onUploadComplete?.()
    } catch (error) {
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload CSV</CardTitle>
        <CardDescription>
          Import transactions from your bank&apos;s CSV export
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Account Selection */}
        <div className="space-y-2">
          <Label htmlFor="account">Select Account</Label>
          <Select value={accountId} onValueChange={setAccountId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} - {account.institution}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* File Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
            ${file ? 'bg-muted/50' : ''}
          `}
        >
          {file ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <FileText className="h-8 w-8 text-primary" />
                <div className="text-left">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFile(null)}
                  className="ml-auto"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Upload className="h-12 w-12 text-muted-foreground" />
              </div>
              <div>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-primary hover:underline">Click to upload</span>
                  <span className="text-muted-foreground"> or drag and drop</span>
                </label>
                <p className="text-sm text-muted-foreground mt-1">CSV files only</p>
              </div>
              <input
                id="file-upload"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Supported Banks */}
        <div className="text-sm text-muted-foreground">
          <p className="font-medium mb-2">Supported NZ Banks:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>ANZ</li>
            <li>BNZ</li>
            <li>ASB</li>
            <li>Westpac</li>
            <li>Kiwibank</li>
          </ul>
        </div>

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!file || !accountId || isUploading}
          className="w-full"
        >
          {isUploading ? 'Importing...' : 'Import Transactions'}
        </Button>
      </CardContent>
    </Card>
  )
}
