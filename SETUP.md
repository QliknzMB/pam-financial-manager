# PAM Setup Guide

This guide will walk you through setting up PAM (Personal Asset Manager) from scratch.

## Prerequisites

Before you begin, make sure you have:

- **Node.js 18.0+** installed ([download here](https://nodejs.org/))
- **npm** or **yarn** package manager
- A **Supabase account** ([sign up free](https://supabase.com))
- An **Anthropic API key** ([get one here](https://console.anthropic.com/settings/keys))

## Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd pam-financial-manager

# Install dependencies
npm install
```

## Step 2: Set Up Supabase

### 2.1 Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose an organization (or create one)
4. Fill in:
   - **Project name**: PAM Financial Manager
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to you
5. Wait for the project to be created (~2 minutes)

### 2.2 Run Database Migration

1. In your Supabase project, click on the "SQL Editor" tab in the left sidebar
2. Click "New Query"
3. Copy the contents of `supabase/migrations/20241104_initial_schema.sql`
4. Paste it into the SQL editor
5. Click "Run" (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned" - this is correct!

### 2.3 Get Your Supabase Credentials

1. Go to "Project Settings" (gear icon in sidebar)
2. Click "API" in the settings menu
3. You'll need two values:
   - **Project URL**: Copy from "Project URL" field
   - **anon public**: Copy the `anon` key from "Project API keys"
   - **service_role**: Copy the `service_role` key (keep this secret!)

## Step 3: Get Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign in or create an account
3. Navigate to "API Keys" in settings
4. Click "Create Key"
5. Give it a name like "PAM Development"
6. Copy the key (starts with `sk-ant-api03-...`)
7. **Important:** This key is only shown once - save it securely!

## Step 4: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` in your editor and fill in the values:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

   # Anthropic AI Configuration
   ANTHROPIC_API_KEY=sk-ant-api03-...

   # Application Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NODE_ENV=development
   ```

3. Save the file

## Step 5: Run the Development Server

```bash
npm run dev
```

The application should now be running at [http://localhost:3000](http://localhost:3000)

## Step 6: Create Your First User

1. Navigate to [http://localhost:3000](http://localhost:3000)
2. You should see the PAM landing page
3. Once authentication is implemented, you'll be able to sign up
4. After signup, default categories will be automatically created

## Step 7: Seed Default Categories (Manual - Optional)

If you want to manually add default categories for a user:

1. Create a user through the app (once auth is implemented)
2. Get the user's ID from Supabase:
   - Go to "Authentication" tab
   - Click on your user
   - Copy the UUID
3. Go to SQL Editor
4. Open `supabase/seed.sql`
5. Replace all instances of `USER_ID_HERE` with your actual UUID
6. Run the modified SQL

## Verify Setup

To verify everything is working:

1. **Check the homepage loads**: Should see PAM title and "Coming Soon" features
2. **Check console**: Should have no errors in browser console (F12)
3. **Check Supabase**:
   - Go to Table Editor
   - You should see all the tables (profiles, accounts, transactions, etc.)

## Troubleshooting

### "Failed to load Supabase"
- Check your `.env.local` file has the correct values
- Make sure you restarted the dev server after creating `.env.local`
- Verify the Supabase URL and keys are correct

### Database Connection Errors
- Ensure you ran the migration SQL in Supabase
- Check your Supabase project is active (not paused)

### TypeScript Errors
- Run `npm install` again to ensure all dependencies are installed
- Try `npm run type-check` to see specific type errors

### Port Already in Use
- Another process is using port 3000
- Either kill that process or run: `npm run dev -- -p 3001` (uses port 3001 instead)

## Next Steps

Now that PAM is set up, you can:

1. **Implement Authentication** - Build the login/signup pages
2. **Build CSV Upload** - Create the transaction import feature
3. **Test AI Categorization** - Ensure Anthropic API is working
4. **Create Dashboard** - Build the main dashboard view

## Need Help?

- Check the [README.md](./README.md) for general information
- Review the [PRD document](./docs/PRD.md) for feature specifications
- Open an issue in the repository

---

**Welcome to PAM!** 🏃‍♀️💰
