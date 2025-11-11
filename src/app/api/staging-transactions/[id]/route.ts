import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const stagingId = params.id

    // First, get the staging transaction to find its upload_id
    const { data: stagingTxn, error: fetchError } = await supabase
      .from("staging_transactions")
      .select("upload_id, is_duplicate")
      .eq("id", stagingId)
      .single()

    if (fetchError || !stagingTxn) {
      return NextResponse.json(
        { error: "Staging transaction not found" },
        { status: 404 }
      )
    }

    // Verify the user owns this upload (RLS will handle this, but we need upload_id)
    const { data: upload, error: uploadError } = await supabase
      .from("csv_uploads")
      .select("id")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .eq("id", (stagingTxn as any).upload_id)
      .eq("user_id", user.id)
      .single()

    if (uploadError || !upload) {
      return NextResponse.json(
        { error: "Unauthorized or upload not found" },
        { status: 403 }
      )
    }

    // Delete the staging transaction
    const { error: deleteError } = await supabase
      .from("staging_transactions")
      .delete()
      .eq("id", stagingId)

    if (deleteError) {
      console.error("Error deleting staging transaction:", deleteError)
      return NextResponse.json(
        { error: "Failed to delete transaction" },
        { status: 500 }
      )
    }

    // Update the row_count and duplicates_found on the upload
    // Get current counts
    const { data: counts } = await supabase
      .from("staging_transactions")
      .select("id, is_duplicate")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .eq("upload_id", (stagingTxn as any).upload_id)

    const newRowCount = counts?.length || 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newDuplicatesFound = counts?.filter((t: any) => t.is_duplicate).length || 0

    await supabase
      .from("csv_uploads")
      .update({
        row_count: newRowCount,
        duplicates_found: newDuplicatesFound,
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .eq("id", (stagingTxn as any).upload_id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/staging-transactions/[id]:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
