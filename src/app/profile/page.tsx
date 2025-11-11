import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const user = session.user

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Account Information</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Full Name</label>
              <p className="text-lg">{user.user_metadata?.full_name || "Not set"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-lg">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Account Created</label>
              <p className="text-lg">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Settings</h2>
          <div className="space-y-2">
            <button className="w-full text-left p-3 rounded-md hover:bg-accent transition-colors">
              Change Password
            </button>
            <button className="w-full text-left p-3 rounded-md hover:bg-accent transition-colors">
              Email Preferences
            </button>
            <button className="w-full text-left p-3 rounded-md hover:bg-accent transition-colors text-red-600">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
