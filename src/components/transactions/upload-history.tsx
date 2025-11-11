"use client"

interface Upload {
  id: string
  filename: string
  file_size: number
  row_count: number
  transactions_imported: number
  duplicates_found: number
  status: string
  uploaded_at: string
  imported_at: string | null
  error_message: string | null
}

interface UploadHistoryProps {
  uploads: Upload[]
}

export function UploadHistory({ uploads }: UploadHistoryProps) {
  if (uploads.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h2 className="text-2xl font-semibold mb-2">No upload history</h2>
        <p className="text-muted-foreground">
          Your CSV upload history will appear here
        </p>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      imported: "bg-green-100 text-green-800",
      staged: "bg-yellow-100 text-yellow-800",
      pending: "bg-blue-100 text-blue-800",
      failed: "bg-red-100 text-red-800",
    }
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <div className="p-4 border-b bg-slate-50">
          <h3 className="font-semibold">Upload History</h3>
          <p className="text-sm text-muted-foreground">Track your CSV file uploads and imports</p>
        </div>
        <div className="divide-y">
          {uploads.map((upload) => (
            <div key={upload.id} className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">📄</div>
                    <div>
                      <div className="font-medium">{upload.filename}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatFileSize(upload.file_size)} • {upload.row_count || 0} rows
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(upload.status)}`}>
                      {upload.status.toUpperCase()}
                    </span>

                    {upload.status === 'imported' && (
                      <>
                        <span className="text-green-600">
                          ✓ {upload.transactions_imported} imported
                        </span>
                        {upload.duplicates_found > 0 && (
                          <span className="text-yellow-600">
                            ⚠ {upload.duplicates_found} duplicates skipped
                          </span>
                        )}
                      </>
                    )}

                    {upload.status === 'failed' && upload.error_message && (
                      <span className="text-red-600">
                        ✗ {upload.error_message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right text-sm text-muted-foreground">
                  <div>Uploaded</div>
                  <div>{new Date(upload.uploaded_at).toLocaleString()}</div>
                  {upload.imported_at && (
                    <>
                      <div className="mt-2">Imported</div>
                      <div>{new Date(upload.imported_at).toLocaleString()}</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border bg-blue-50 p-4">
        <div className="flex gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <div className="font-semibold text-blue-900">Duplicate Protection</div>
            <p className="text-sm text-blue-700 mt-1">
              PAM automatically detects duplicate transactions based on date, amount, and payee.
              Duplicates are flagged during the staging review before import.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
