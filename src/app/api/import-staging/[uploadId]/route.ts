import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(
  request: NextRequest,
  { params }: { params: { uploadId: string } }
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

    const uploadId = params.uploadId

    // Verify the user owns this upload
    const { data: upload, error: uploadError } = await supabase
      .from("csv_uploads")
      .select("id, account_id, status")
      .eq("id", uploadId)
      .eq("user_id", user.id)
      .single()

    if (uploadError || !upload) {
      return NextResponse.json(
        { error: "Unauthorized or upload not found" },
        { status: 403 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((upload as any).status === "imported") {
      return NextResponse.json(
        { error: "This upload has already been imported" },
        { status: 400 }
      )
    }

    // Get all staging transactions that will be imported (not duplicates)
    const { data: stagingTxns, error: fetchError } = await supabase
      .from("staging_transactions")
      .select("*")
      .eq("upload_id", uploadId)
      .eq("will_import", true)
      .eq("is_duplicate", false)

    if (fetchError) {
      console.error("Error fetching staging transactions:", fetchError)
      return NextResponse.json(
        { error: "Failed to fetch staging transactions" },
        { status: 500 }
      )
    }

    if (!stagingTxns || stagingTxns.length === 0) {
      return NextResponse.json(
        { error: "No transactions to import" },
        { status: 400 }
      )
    }

    // Determine account_id (from upload or user's first account)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let accountId = (upload as any).account_id

    if (!accountId) {
      // Get user's first account
      const { data: accounts } = await supabase
        .from("accounts")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .single()

      if (accounts) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        accountId = (accounts as any).id
      } else {
        // No account exists, create a default one
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: newAccount, error: createError } = await (supabase
          .from("accounts") as any)
          .insert({
            user_id: user.id,
            name: "Main Account",
            account_type: "checking",
          })
          .select()
          .single()

        if (createError || !newAccount) {
          console.error("Error creating default account:", createError)
          return NextResponse.json(
            { error: "Failed to create default account" },
            { status: 500 }
          )
        }

        accountId = newAccount.id
      }
    }

    // Insert transactions
    const transactionsToInsert = stagingTxns.map((txn: any) => ({
      account_id: accountId,
      date: txn.date,
      amount: txn.amount,
      payee: txn.payee,
      particulars: txn.particulars || null,
      code: txn.code || null,
      reference: txn.reference || null,
      transaction_type: txn.transaction_type || null,
      category_id: txn.suggested_category_id || null,
    }))

    const { data: insertedTxns, error: insertError } = await supabase
      .from("transactions")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(transactionsToInsert as any)
      .select()

    if (insertError) {
      console.error("Error inserting transactions:", insertError)
      return NextResponse.json(
        { error: "Failed to import transactions" },
        { status: 500 }
      )
    }

    // Update the upload record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase
      .from("csv_uploads") as any)
      .update({
        status: "imported",
        transactions_imported: insertedTxns.length,
        imported_at: new Date().toISOString(),
      })
      .eq("id", uploadId)

    // Delete staging transactions
    await supabase
      .from("staging_transactions")
      .delete()
      .eq("upload_id", uploadId)

    return NextResponse.json({
      success: true,
      imported: insertedTxns.length,
    })
  } catch (error) {
    console.error("Error in POST /api/import-staging/[uploadId]:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
