import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { uploadId: string } }
) {
  const supabase = createClient()
  const uploadId = params.uploadId

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify the upload belongs to the user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: upload }: any = await supabase
    .from('csv_uploads')
    .select('id, user_id')
    .eq('id', uploadId)
    .single()

  if (!upload) {
    return NextResponse.json({ error: 'Upload not found' }, { status: 404 })
  }

  if (upload.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Delete all staging transactions for this upload
  await supabase
    .from('staging_transactions')
    .delete()
    .eq('upload_id', uploadId)

  // Delete the upload record
  await supabase
    .from('csv_uploads')
    .delete()
    .eq('id', uploadId)

  return NextResponse.json({ success: true })
}
