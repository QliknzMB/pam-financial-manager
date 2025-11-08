"use client"

import { useState, useRef } from "react"
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
import { useToast } from "@/hooks/use-toast"

interface CsvUploadProps {
  onUploadComplete?: () => void
}

export function CsvUpload({ onUploadComplete }: CsvUploadProps = {}) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

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

    setUploading(true)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create upload record
      const { data: upload, error: uploadError } = await supabase
        .from('csv_uploads')
        .insert({
          user_id: user.id,
          filename: file.name,
          file_size: file.size,
          status: 'pending',
        })
        .select()
        .single()

      if (uploadError) throw uploadError

      // Read and parse CSV (simple version for now)
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      const rowCount = Math.max(0, lines.length - 1) // Subtract header row

      // Update upload record with row count
      await supabase
        .from('csv_uploads')
        .update({
          row_count: rowCount,
          status: 'staged'
        })
        .eq('id', upload.id)

      toast({
        title: "Upload successful!",
        description: `${file.name} staged with ${rowCount} transactions. Review before importing.`,
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
              disabled={!file || uploading}
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
